import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart } from 'angular-highcharts';
import { ContractService } from '../../../../shared/services/contract.service';
import { ContractDutiesModel } from '../../../../shared/models/contractModels/contractDuties.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedService } from '../../../../shared/services/shared.service';
import { DeliverablesList } from '../../../../shared/models/Deliverables.model';
import { MatDialogRef } from '@angular/material';
import { AlertsService } from '../../../../shared/services/alerts.service';
import { ContractModel } from '../../../../shared/models/contractModels/contract.model';
import { OperationTypesList } from '../../../../shared/models/operationTypes.model';
import * as moment from 'jalali-moment';
import { TempTransferService } from '../../../../shared/services/temp-transfer.service';

@Component({
  selector: 'app-deliverable-duty',
  templateUrl: './deliverable-duty.component.html',
  styleUrls: ['./deliverable-duty.component.scss']
})
export class DeliverableDutyComponent implements OnInit {
  chart;
  chartOptions;
  @Input() duties: ContractDutiesModel[] = [];
  @Input() duty: ContractDutiesModel;
  @Input() contractID: number;
  @Input() typeID: number;
  @Input() filteredDutyCalenders: { ID, Title, StartDate, DutyType: { ID, Title }, DataEntryStartDate, DataEntryFinishDate, IsDefualt }[];
  @Input() isReadOnly: boolean;
  @Input() today;
  @Input() currentDutyCalender: { ID, Title, StartDate, FinishDate, DutyType: { ID, Title }, DataEntryStartDate, DataEntryFinishDate, IsDefualt };
  @Input() contract: ContractModel;
  @Input() isPM;
  selectedDate = [];
  selectedForecastFinishDate = null;
  formGp: FormGroup[] = [];
  serviceCosts: { ID, CostCode, DDate, Service, Cost }[] = [];
  lastDuty: { Date, DelItem, Zone, Value };
  delItems: { ID, Deliverable: { ID, Title }, OperationType: { ID, Title } }[] = [];
  zones = [];
  finish = false;
  mainDuty: { Date: string[], DelItem: number[], Zone: {ID, Title}[], Value: number[] };
  deliverables: DeliverablesList[] = [];
  operations: OperationTypesList[] = [];
  isChecked = false;
  isAppChecked = false;
  delProps: { ID, DelItem, Kind }[] = [];
  delPropsRevs: { ID, DelProp, RevNumber, DDate }[] = [];
  c = 0;
  lasts: {
    costAssignedReses: { ResID: number, Cost: number }[],
    serviceCost: { Service: number, Cost: number }[],
    pc: { Service: number, Date: string, ActPC: number, PlanPC: number }[],
    del: { Del: number, Op: number, TotalVal: number, Date: string, ActSum: number, PlanSum: number }[],
    financial?: { TotalGrossPayment: number, TotalNetPayment: number, TotalGrossRequest: number, TotalNetRequest: number, TotalInvoice: number, FinancialProgress: number, PaymentDeviation: number, Date: string, LastPaymentDate, LastRequestDate },
    calcs?: { Service: number, Date: string, ProgressDeviation: number, Speed30D: number, TimeDeviation: number, Speed4Ontime: number, FinishTimeForecast: number }[],
  };

  constructor(private router: Router,
              private contractService: ContractService,
              private route: ActivatedRoute,
              private _formBuilder: FormBuilder,
              private sharedService: SharedService,
              private dialogRef: MatDialogRef<DeliverableDutyComponent>,
              private alertsService: AlertsService,
              private tempTransfer: TempTransferService) {
  }

  ngOnInit() {
    this.lasts = {
      costAssignedReses: [],
      calcs: [],
      serviceCost: [],
      pc: [],
      del: [],
      financial: {
        TotalGrossPayment: 0,
        TotalNetPayment: 0,
        TotalGrossRequest: 0,
        TotalNetRequest: 0,
        TotalInvoice: 0,
        FinancialProgress: 0,
        PaymentDeviation: 0,
        Date: null,
        LastPaymentDate: null,
        LastRequestDate: null
      }
    };
    if ((this.duty.DutyApprovementStatus === 3 ||  this.duty.DutyApprovementStatus === 1) && !this.duty.Json) {
      this.isChecked = true;
    }
    if (this.duty.DutyApprovementStatus === 1) {
      this.isAppChecked = true;
    }
    if (this.isChecked) {
      this.formGp.map(v => {
        v.disable();
      });
    }
    console.log(this.duty);
    // if (!this.duty.Json) {
    //   this.selectedDate[0] = moment(this.currentDutyCalender.StartDate, 'jYYYY/jM/jD').format('YYYY/M/D');
    // }

    console.log(this.isPM);
    this.zones = this.contract.Zone;
    console.log(this.contract);

    this.contractService.getAllDelProps(this.contractID).subscribe(
      (data) => {
        this.delProps = data;
        console.log(this.delProps, 'delProps');
      }
    );

    this.contractService.getAllDelPropsRevs(this.contractID).subscribe(
      (data) => {
        this.delPropsRevs = data;
        console.log(this.delPropsRevs, 'delPropsRevs');
      }
    );
    this.sharedService.getDeliverables(null, null).subscribe(
      (data) => {
        this.deliverables = data;
      }
    );
    this.sharedService.getOperationTypes().subscribe(
      (data) => {
        this.operations = data;
      }
    );
    this.sharedService.getDeliverables(null, null).subscribe(
      (deliverables) => {
        console.log(deliverables, 'deliverables');
        this.sharedService.getOperationTypes().subscribe(
          (operationTypes) => {
            this.contractService.getAllDelItems(this.contractID).subscribe(
              (delItems) => {
                this.delItems = delItems;
                this.mainDuty = this.duty.Json;
                if (this.mainDuty) {
                  for (let i = 0; i < this.mainDuty.Date.length; i++) {
                    this.selectedDate[i] = moment(this.mainDuty.Date[i], 'jYYYY/jM/jD').format('YYYY/M/D');
                    this.onAddForm(this.mainDuty.Date[i], this.mainDuty.Value[i], this.mainDuty.DelItem[i], this.mainDuty.Zone[i]);
                  }
                } else {
                  this.onAddForm(null, null, null, null);
                }
                for (let i = 0; i < this.delItems.length; i++) {
                  this.delItems[i].Deliverable.Title = deliverables.filter(v => v.Id === this.delItems[i].Deliverable.ID)[0].Name;
                  this.delItems[i].OperationType.Title = operationTypes.filter(v => v.Id === this.delItems[i].OperationType.ID)[0].Name;
                }
                this.finish = true;
              }
            );
          }
        );
        console.log(deliverables);
      }
    );

    const pcDutyCalenders = this.filteredDutyCalenders.filter(v => +v.DutyType.ID === +this.typeID);
    const currentDutyCalenderIndex = pcDutyCalenders.findIndex(v => +v.ID === +this.duty.DutyCalenderId);
    console.log(currentDutyCalenderIndex);
    if (currentDutyCalenderIndex > 0) {
      // this.lastDuty = <any>this.duties.filter(v => v.Id === pcDutyCalenders[currentDutyCalenderIndex - 1].ID)[0].Json;
    }
    this.buildChart();
  }

  onChangeDelItem(e, formID) {
    if (this.deliverables.filter(v => v.Id === e.value.Deliverable.ID)[0].DeliverableType === 1) {
      this.formGp[formID].get('Zone').disable();
    } else {
      this.formGp[formID].get('Zone').enable();
    }
  }

  writeDel(data: {Date, DelItem, Value, Zone}) {
       const foundedDelPropID = this.delProps.filter(v => v.DelItem === data.DelItem && v.Kind === 'A')[0].ID;
       const foundedDelPropsRevID = this.delPropsRevs.filter(v => v.DelProp === foundedDelPropID)[0].ID;
       this.createDels(data, foundedDelPropsRevID);
  }

  createDels(data: {Date, DelItem, Value, Zone}, foundedDelPropsRevID: number) {
    // const data: { Date, Zone, Value, DelPropsRev }[] = [];
    const data2: { Date, Zone, Value, DelPropsRev } = {
      Date: moment(data.Date, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
      Zone: data.Zone,
      Value: data.Value,
      DelPropsRev: foundedDelPropsRevID,
    };
    this.tempTransfer.getDataFromContextInfo().subscribe(
      (digestValue) => {
        this.tempTransfer.createDels(digestValue, this.contractID, data2).subscribe(
          (rData: any) => {
          }
        );
      }
    );
  }

  getDelItemName(id: number) {
    const selectedDelItem = this.delItems.filter(v => +v.ID === +id)[0];
    return selectedDelItem.Deliverable.Title + ' - ' + selectedDelItem.OperationType.Title;
  }

  getZoneName(id: number) {
    return this.zones.filter(v => +v.Id === +id)[0].Title;
  }

  getDeliverableName(id: number) {
    if (this.deliverables.filter(v => +v.Id === +id)[0]) {
      return this.deliverables.filter(v => +v.Id === +id)[0].Name;
    } else {
      return null;
    }
  }

  getMeasureUnitName(id: number) {
    if (this.deliverables.filter(v => +v.Id === +id)[0]) {
      return this.deliverables.filter(v => +v.Id === +id)[0].MeasureUnit;
    } else {
      return null;
    }
  }

  onChangeAppChecked() {
    this.isAppChecked = !this.isAppChecked;
  }

  onChangeChecked() {
    this.isChecked = !this.isChecked;
    if (this.isChecked) {
      this.formGp.map(v => {
        v.disable();
      });
    } else {
      this.formGp.map(v => {
        v.enable();
      });
    }
  }

  getOperationTypeName(id: number) {
    if (this.operations.filter(v => +v.Id === +id)[0]) {
      return this.operations.filter(v => +v.Id === +id)[0].Name;
    } else {
      return null;
    }
  }

  onSubmitClick() {
    let dutyDoneStatus = 2;
    let dutyApprovementStatus = 3;
    const finalDate = [];
    let isFormsValid = true;
    let isDatesValid = true;
    let isDup = false;
    const delItems = [];
    const deliverables = [];
    const zones = [];
    const values = [];
    try {
      let data: { Date, DelItem, Zone, Value } = null;
      if (!this.isChecked) {
        for (let i = 0; i < this.selectedDate.length; i++) {
          if (this.selectedDate[i].calSystem || this.selectedDate[i]._l) {
            finalDate.push(this.selectedDate[i].format('jYYYY/jM/jD'));
          } else {
            finalDate.push(moment(this.selectedDate[i]).format('jYYYY/jMM/jDD'));
          }
          console.log(finalDate);
        }
        console.log(finalDate);
        // try {
        //   if (+this.selectedDate[0].split('/')[0] > 1500 && !this.duty.Json) {
        //     console.log(finalDate);
        //     finalDate[0] = moment(this.selectedDate[0], 'YYYY/M/D').format('jYYYY/jMM/jDD');
        //   }
        // }


        console.log(finalDate);
        console.log(this.formGp);


        for (let i = 0; i < this.formGp.length; i++) {
          delItems.push(this.formGp[i].value.DelItem.ID);
          deliverables.push(this.formGp[i].value.DelItem.Deliverable.ID);
          console.log(this.formGp[i].get('Zone').enabled);
          if (this.formGp[i].get('Zone').enabled) {
            zones.push(this.formGp[i].value.Zone.ID);
          } else {
            zones.push(null);
          }
          values.push(this.formGp[i].value.Value);
          if (this.formGp[i].invalid) {
            isFormsValid = false;
          }

          if (+new Date(finalDate[i]) < +new Date(this.currentDutyCalender.StartDate)) {
            isDatesValid = false;
            console.log(1);
          }

          if (+new Date(finalDate[i]) < +new Date(this.contract.DelLast[0].Date)) {
            isDatesValid = false;
            console.log(2);
          }

          if (+new Date(finalDate[i]) > +new Date(this.currentDutyCalender.FinishDate)) {
            isDatesValid = false;
            console.log(3);
          }

          if (+new Date(finalDate[i]) > +new Date(this.today)) {
            isDatesValid = false;
            console.log(4);
          }
        }

        data = {
          Date: finalDate,
          DelItem: delItems,
          Zone: zones,
          Value: values,
        };

        console.log(isDatesValid, 'isDate valid');
        const dupDelDates = [];
        for (let i = 0; i < data.DelItem.length; i++) {
          dupDelDates.push(data.DelItem[i] + ' ' + +new Date(data.Date[i]) + ' ' + data.Zone[i]);
        }
        console.log(this.isDuplicate(dupDelDates));
        isDup = this.isDuplicate(dupDelDates);

        if (isFormsValid && !isDup && isDatesValid) {
          const uniqDelItems = Array.from(new Set(deliverables));
          const sums = [];
          const sumDel: {Del, Op, Sum}[] = [];
          console.log(uniqDelItems);
          console.log(this.contract.DelLast);
          this.lasts.del = this.contract.DelLast;
          for (let i = 0; i < uniqDelItems.length; i++) {
            sums.push(this.formGp.filter(v => +v.value.DelItem.Deliverable.ID === +uniqDelItems[i]).map(v2 => v2.value.Value).reduce(this.getSum));
            let maxDate: any = this.formGp.filter(v => +v.value.DelItem.Deliverable.ID === +uniqDelItems[i]).map(v2 => v2.value.Date).sort((a, b) => +new Date(b) - +new Date(a))[0];
            if (maxDate.calSystem || maxDate._l) {
              maxDate = maxDate.format('jYYYY/jM/jD');
            } else {
              maxDate = moment(maxDate).format('jYYYY/jMM/jDD');
            }
            console.log(this.formGp.filter(v => +v.value.DelItem.Deliverable.ID === +uniqDelItems[i]).map(v2 => v2.value.Date));
            const currentDelLast: any = this.contract.DelLast.filter(v => +v.Del === +uniqDelItems[i])[0];
            console.log('dfffd', maxDate, currentDelLast);
            console.log(this.delItems);
            const selectedDelItem = this.delItems.filter(v => +v.Deliverable.ID === +uniqDelItems[i])[0];
            console.log('nbjhjh', selectedDelItem);
            sumDel.push({Del: selectedDelItem.Deliverable, Op: selectedDelItem.OperationType , Sum: sums[i]});
            console.log(sums);
            console.log(currentDelLast);
            if (+currentDelLast.ActSum + +sums[i] > +currentDelLast.TotalVal) {
              isFormsValid = false;
            }
            if (isFormsValid) {
              const foundedIndexOfDelLast = this.lasts.del.findIndex(v => +v.Del === +sumDel[i].Del.ID && +v.Op === +sumDel[i].Op.ID);
              this.lasts.del[foundedIndexOfDelLast].ActSum = this.lasts.del[foundedIndexOfDelLast].ActSum + sumDel[i].Sum;
              this.lasts.del[foundedIndexOfDelLast].Date = maxDate;
            }
          }

          console.log(this.lasts.del);
          console.log(sumDel);

          console.log(isFormsValid);
          console.log(sums);

          console.log(delItems);
        }

        console.log(data);
        if (+new Date(this.today) < +new Date(this.currentDutyCalender.FinishDate)) {
          dutyDoneStatus = 1;
        }
      }

      if (this.isPM) {
          dutyApprovementStatus = 1;
      }

      console.log(isFormsValid);
      console.log(!isDup);
      console.log(isDatesValid);
      if (isFormsValid && !isDup && isDatesValid) {
        if (this.isAppChecked && this.isPM && !this.isChecked) {
          for (let i = 0; i < data.DelItem.length; i++) {
            this.writeDel({Date: data.Date[i], DelItem: data.DelItem[i], Value: data.Value[i], Zone: data.Zone[i]});
          }
          this.tempTransfer.getDataFromContextInfo().subscribe(
            (digestValue) => {
              this.tempTransfer.updateContract(digestValue, this.contractID, this.lasts, 'del').subscribe();
            }
          );
        }

          this.sharedService.getDataFromContextInfo().subscribe(
            (digestValue) => {
              this.sharedService.getTodayDateFromContextInfo().subscribe(
                () => {
                  console.log(this.sharedService.todayData);
                  this.contractService.updateContractDuties(digestValue, 'Duties', this.contractID, this.duty.Id, data, this.sharedService.todayData, dutyApprovementStatus, dutyDoneStatus, this.isPM, this.duty.ImporterDoneDate).subscribe(
                    () => {
                      this.dialogRef.close();
                    });
                  // this.contractService.updateContractDutiesDel(digestValue, 'Duties' , this.contractID, this.duty.Id, data, this.sharedService.todayData).subscribe(
                  //   () => {
                  //     this.dialogRef.close();
                  //   }
                  // );
                }
              );
            }
          );
        } else {
          let text = '';
          if (!isFormsValid) {
            text = text + '<p style="direction: rtl;text-align: justify;"> - مقادیر ورودی را بررسی نمایید!</p>';
          }
          if (!isDatesValid) {
            text = text + '<p style="direction: rtl;text-align: justify;"> - تاریخ های  ورودی معتبر نیستند!</p>';
          }
          if (isDup) {
            text = text + '<p style="direction: rtl;text-align: justify;"> - رکورد تکراری وجود دارد !</p>';
          }
          this.alertsService.alertsWrongContractForm(text).then((result) => {
            if (result.value) {
            }
          });
        }
    } catch {
      if (this.isChecked) {
        this.duty.Json = null;
        this.sharedService.getDataFromContextInfo().subscribe(
          (digestValue) => {
            this.sharedService.getTodayDateFromContextInfo().subscribe(
              () => {
                console.log(this.sharedService.todayData);
                this.contractService.updateContractDuties(digestValue, 'Duties', this.contractID, this.duty.Id, null, this.sharedService.todayData, dutyApprovementStatus, dutyDoneStatus, this.isPM, this.duty.ImporterDoneDate).subscribe(
                  () => {
                    this.dialogRef.close();
                  });
                // this.contractService.updateContractDutiesDel(digestValue, 'Duties' , this.contractID, this.duty.Id, data, this.sharedService.todayData).subscribe(
                //   () => {
                //     this.dialogRef.close();
                //   }
                // );
              }
            );
          }
        );
      } else {
        let text = '';
        if (!isFormsValid) {
          text = text + '<p style="direction: rtl;text-align: justify;"> - اطلاعات ناقص است!</p>';
        }
        if (!isDatesValid) {
          text = text + '<p style="direction: rtl;text-align: justify;"> - تاریخ های  ورودی معتبر نیستند!</p>';
        }
        if (isDup) {
          text = text + '<p style="direction: rtl;text-align: justify;"> - رکورد تکراری وجود دارد !</p>';
        }
        this.alertsService.alertsWrongContractForm(text).then((result) => {
          if (result.value) {
          }
        });
      }
    }
  }

  isDuplicate(arr) {
    return arr.filter((item, index) => arr.indexOf(item) !== index).length !== 0;
  }

  getSum(total, num) {
    return total + num;
  }

  updateLast() {
    // this.l.calcs.push({
    //   Service: this.mainActPCProps.filter(v => v.ID === actPCProp)[0].Service.results[0],
    //   Date: moment(mainPC.Date, 'YYYY/M/D').format('jYYYY/jMM/jDD'),
    //   ProgressDeviation: calcs.ProgressDeviation,
    //   Speed30D: calcs.Speed30D,
    //   Speed90D: calcs.Speed90D,
    //   TimeDeviation: calcs.TimeDeviation,
    //   Speed4Ontime: calcs.Speed4Ontime,
    //   FinishTimeForecast: calcs.FinishTimeForecast,
    //   FinishTimeForecast90: calcs.FinishTimeForecast90,
    // });
    // if (this.lasts.calcs.length === this.formGp.value.ServicesValue.length) {
    //   this.tempTransfer.getDataFromContextInfo().subscribe(
    //     (digestValue) => {
    //       this.tempTransfer.updateContract(digestValue, this.contractID, this.lasts, 'pc').subscribe();
    //     }
    //   );
    // }
  }

  onAddForm(date, value, delItem, zone) {
    this.formGp.push(this._formBuilder.group({
        Date: new FormControl(date, [Validators.required]),
        DelItem: new FormControl(delItem, [Validators.required]),
        Zone: new FormControl(zone, [Validators.required]),
        Value: new FormControl(value, [Validators.required]),
      })
    );
    if (zone) {
      this.formGp[this.formGp.length - 1].get('Zone').setValue(this.zones.filter(v => v.ID === zone)[0]);
    } else {
      this.formGp[this.formGp.length - 1].get('Zone').disable();
    }
    this.formGp[this.formGp.length - 1].get('DelItem').setValue(this.delItems.filter(v => +v.ID ===  +delItem)[0]);
    if (this.isReadOnly) {
      this.formGp[this.formGp.length - 1].disable();
    }
  }

  buildChart() {
    const percent = 50;
    const text = 'chart';
    const color = '#8300ffb8';
    this.chartOptions = {
      chart: {
        renderTo: 'container',
        type: 'pie',
        height: 200
      },
      title: {
        text: ''
      },
      plotOptions: {
        pie: {
          colors: [color],
          shadow: false
        }
      },
      series: [{
        name: text,
        data: [
          ['پیشرفت | درصد', percent],
          {
            'name': 'Incomplete',
            'y': 100 - percent,
            'color': 'rgba(0,0,0,0)'
          }
        ],
        size: '100%',
        innerSize: '90%',
        showInLegend: false,
        dataLabels: {
          enabled: false
        }
      }]
    };
    this.chart = new Chart(this.chartOptions);
  }
}
