import { Component, Inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as Highcharts from 'highcharts';
import { Chart } from 'angular-highcharts';
import { ContractService } from '../../../../shared/services/contract.service';
import { ContractDutiesModel } from '../../../../shared/models/contractModels/contractDuties.model';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedService } from '../../../../shared/services/shared.service';
import { MatDialogRef } from '@angular/material';
import * as moment from 'jalali-moment';
import { AlertsService } from '../../../../shared/services/alerts.service';
import { main } from '@angular/compiler-cli/src/main';
import { ContractModel } from '../../../../shared/models/contractModels/contract.model';
import { CalculationsService } from '../../../../shared/services/calculations.service';
import { Subject } from 'rxjs/index';
import { TempTransferService } from '../../../../shared/services/temp-transfer.service';

@Component({
  selector: 'app-pc-duty',
  templateUrl: './pc-duty.component.html',
  styleUrls: ['./pc-duty.component.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class PcDutyComponent implements OnInit {
  chart;
  chartOptions;
  @Input() duties: ContractDutiesModel[] = [];
  @Input() duty: ContractDutiesModel;
  @Input() contractID: number;
  @Input() isReadOnly: boolean;
  @Input() typeID: number;
  @Input() today;
  @Input() isPM;
  @Input() currentDutyCalender: { ID, Title, StartDate, FinishDate, DutyType: { ID, Title }, DataEntryStartDate, DataEntryFinishDate, IsDefualt };
  @Input() filteredDutyCalenders: { ID, Title, StartDate, DutyType: { ID, Title }, DataEntryStartDate, DataEntryFinishDate, IsDefualt }[];
  @Input() contract: ContractModel;
  selectedDate = null;
  formGp: FormGroup;
  lastDuty: { Date, Services: { Names, Values }, Forecast, Description };
  mainDuty: { Date, Services: { Names, Values }, Forecast, Description };
  services;
  mainServices = [];
  isChecked = false;
  mainActPCProps: { ID, Service }[] = [];
  actPCPropWithService: { ID, Service }[] = [];
  allPCRelations: { ID, ActPCProp, PlanPCProps, PlanDDate }[] = [];
  pcRelations = [];
  actPCPropReadyCounter = 0;
  plansTimeDeviation = [];
  minPlanDates = [];
  loopSubject = new Subject();
  currentPlanID: number;
  startIntervalPCDate: number;
  mainSpeed: { Speed, Interval }[] = [];
  totalInterval = 30;
  isSpeedCalculationFinished = false;
  suitablePlans = [];
  lasts: {
    costAssignedReses: { ResID: number, Cost: number }[],
    serviceCost: { Service: number, Cost: number }[],
    pc: { Service: number, Date: string, ActPC: number, PlanPC: number }[],
    del: { Del: number, Op: number, TotalVal: number, Date: string, ActSum: number, PlanSum: number }[],
    financial?: { TotalGrossPayment: number, TotalNetPayment: number, TotalGrossRequest: number, TotalNetRequest: number, TotalInvoice: number, FinancialProgress: number, PaymentDeviation: number, Date: string },
    calcs?: { Service: number, Date: string, ProgressDeviation: number, Speed30D: number, Speed90D: number, TimeDeviation: number, Speed4Ontime: number, FinishTimeForecast: number, FinishTimeForecast90: number }[],
  };
  finalCounterForWritngDuty = 0;

  constructor(private router: Router,
              private contractService: ContractService,
              private route: ActivatedRoute,
              private _formBuilder: FormBuilder,
              private sharedService: SharedService,
              private calculationsService: CalculationsService,
              private tempTransfer: TempTransferService,
              private dialogRef: MatDialogRef<PcDutyComponent>,
              private alertsService: AlertsService) {
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
        Date: null
      }
    };
    if (this.duty.DutyApprovementStatus === 1) {
      this.isChecked = true;
    }
    this.contractService.getAllPCProps(this.contractID).subscribe(
      (mainActPCProps) => {
        this.mainActPCProps = mainActPCProps;
        this.getWriteReady();
      }
    );

    this.loopSubject.subscribe(
      (data: { mainPC, uniqRelations, plans, i, floatPC, floatPC90, startIntervalPCDate, startIntervalPCDate90, floatInterval, floatInterval90, isSpeedCalculationFinished, isSpeedCalculationFinished90, filteredActs, suitablePlan, suitablePlan90, mainSpeed: { Speed, Interval }[], mainSpeed90: { Speed, Interval }[], pcID, calcs: { PCRelation, PCCode, ProgressDeviation, Speed30D, Speed90D, TimeDeviation, Speed4Ontime, FinishTimeForecast, FinishTimeForecast90 } }) => {
        this.contractService.getAllPCsByPCProp(this.contractID, data.plans[data.i].PlanPCProps).subscribe(
          (filteredPlans) => {
            this.minPlanDates.push(filteredPlans[0].Date);

            // Start Speed Calculations
            this.currentPlanID = data.plans[data.i].PlanPCProps;
            if ((+new Date(data.floatPC.Date) > +new Date(filteredPlans[0].Date) && !data.isSpeedCalculationFinished) || ((data.mainSpeed.length === 0) && data.i === data.plans.length - 1)) {
              if (data.startIntervalPCDate > +new Date(filteredPlans[0].Date)) {

                console.log('shit1', data.i);
                data.floatInterval = (((+new Date(data.floatPC.Date)) / 3600000) / 24) - (((+new Date(data.startIntervalPCDate)) / 3600000) / 24);
                data.mainSpeed.push({
                  Speed: this.getSpeed(data.floatPC, filteredPlans, data.filteredActs, this.currentPlanID, data.floatInterval),
                  Interval: data.floatInterval
                });
                data.isSpeedCalculationFinished = true;
              } else {

                data.floatInterval = (((+new Date(data.floatPC.Date)) / 3600000) / 24) - (((+new Date(filteredPlans[0].Date)) / 3600000) / 24);
                console.log('shit2', data.i);
                data.mainSpeed.push({
                  Speed: this.getSpeed(data.floatPC, filteredPlans, data.filteredActs, this.currentPlanID, data.floatInterval),
                  Interval: data.floatInterval
                });
                data.floatPC = {
                  Date: filteredPlans[0].Date,
                  PC: this.calculationsService.getPC(filteredPlans[0].Date, data.filteredActs),
                };

              }
            }
            if ((+new Date(data.floatPC90.Date) > +new Date(filteredPlans[0].Date) && !data.isSpeedCalculationFinished90) || ((data.mainSpeed90.length === 0) && data.i === data.plans.length - 1)) {
              if (data.startIntervalPCDate90 > +new Date(filteredPlans[0].Date)) {

                console.log('shit1', data.i);
                data.floatInterval90 = (((+new Date(data.floatPC90.Date)) / 3600000) / 24) - (((+new Date(data.startIntervalPCDate90)) / 3600000) / 24);
                data.mainSpeed90.push({
                  Speed: this.getSpeed(data.floatPC, filteredPlans, data.filteredActs, this.currentPlanID, data.floatInterval90),
                  Interval: data.floatInterval90
                });
                data.isSpeedCalculationFinished90 = true;
              } else {

                data.floatInterval90 = (((+new Date(data.floatPC90.Date)) / 3600000) / 24) - (((+new Date(filteredPlans[0].Date)) / 3600000) / 24);
                console.log('shit2', data.i);
                data.mainSpeed90.push({
                  Speed: this.getSpeed(data.floatPC90, filteredPlans, data.filteredActs, this.currentPlanID, data.floatInterval90),
                  Interval: data.floatInterval90
                });
                data.floatPC90 = {
                  Date: filteredPlans[0].Date,
                  PC: this.calculationsService.getPC(filteredPlans[0].Date, data.filteredActs),
                };

              }
            }


            // Start TimeDeviation Calculations
            let isFirstPlan = false;
            if (data.i === data.plans.length - 1) {
              isFirstPlan = true;
            }
            let actEqPC = data.mainPC;
            if (data.i !== 0) {
              actEqPC = {
                PC: this.calculationsService.getPC(this.minPlanDates[data.i - 1], data.filteredActs),
                Date: this.minPlanDates[data.i - 1]
              };
            }
            this.plansTimeDeviation.push(this.getTimeDeviation(actEqPC, data.filteredActs, filteredPlans, isFirstPlan));
            if (data.mainSpeed.length === 1) {
              data.calcs.PCRelation = +this.allPCRelations.filter(v => +v.ActPCProp === +data.filteredActs[0].PCProp && +v.PlanPCProps === +filteredPlans[0].PCProp)[0].ID;
              data.suitablePlan = filteredPlans;
              data.calcs.PCCode = data.pcID;
              data.calcs.ProgressDeviation = this.getProgressDeviation(data.mainPC, filteredPlans);
              data.calcs.Speed30D = null;
              data.calcs.TimeDeviation = this.getTimeDeviation(data.mainPC, data.filteredActs, filteredPlans, true).timeDeviation;
              data.calcs.Speed4Ontime = this.getSpeed4OnTime(data.mainPC, filteredPlans, data.filteredActs);
              data.calcs.FinishTimeForecast = null;
              this.suitablePlans.push(filteredPlans);
              this.finalCounterForWritngDuty++;
            }
            if (data.mainSpeed90.length === 1) {
              data.suitablePlan90 = filteredPlans;
              data.calcs.Speed90D = null;
              data.calcs.FinishTimeForecast90 = null;
            }
            if (data.i === data.plans.length - 1) {
              console.log(data.i, data.plans.length - 1);
              console.log(data, 'mainSpeed');
              data.calcs.Speed30D = this.weightedTotalSpeed(data.mainSpeed);
              data.calcs.Speed90D = this.weightedTotalSpeed(data.mainSpeed90);
              data.calcs.FinishTimeForecast = this.getFinishTimeForecast(data.mainPC, data.suitablePlan, data.filteredActs, data.calcs.Speed30D);
              data.calcs.FinishTimeForecast90 = this.getFinishTimeForecast(data.mainPC, data.suitablePlan90, data.filteredActs, data.calcs.Speed90D);
              this.createActPCCalcs(data.calcs, data.filteredActs[0].PCProp, data.mainPC, data.suitablePlan);
            } else {
              // console.log(data.i++);
              this.loopSubject.next({
                mainPC: data.mainPC,
                uniqRelations: data.uniqRelations,
                plans: data.plans,
                i: data.i++,
                floatPC: data.floatPC,
                floatPC90: data.floatPC90,
                startIntervalPCDate: data.startIntervalPCDate,
                startIntervalPCDate90: data.startIntervalPCDate90,
                floatInterval: data.floatInterval,
                floatInterval90: data.floatInterval90,
                isSpeedCalculationFinished: data.isSpeedCalculationFinished,
                isSpeedCalculationFinished90: data.isSpeedCalculationFinished90,
                filteredActs: data.filteredActs,
                suitablePlan: data.suitablePlan,
                suitablePlan90: data.suitablePlan90,
                mainSpeed: data.mainSpeed,
                mainSpeed90: data.mainSpeed90,
                pcID: data.pcID,
                calcs: data.calcs
              });
            }
          }
        );
      }
    );


    this.contractService.getAllPCRelations(this.contractID).subscribe(
      (allPCRelations) => {
        this.allPCRelations = allPCRelations;
        // console.log(this.allPCRelations);
        this.getWriteReady();
      }
    );
    this.contractService.getPCRelationsFromVersion(this.contractID, this.contract.VersionCode).subscribe(
      (pcRelations) => {
        this.pcRelations = pcRelations;
        // console.log(this.pcRelations);
        this.getWriteReady();
      }
    );
    this.formGp = this._formBuilder.group({
      ServicesValue: new FormArray([], [Validators.required, Validators.min(0), Validators.max(100)]),
      Date: new FormControl(null, [Validators.required]),
    });
    if (this.isReadOnly) {
      this.formGp.disable();
    }
    const pcDutyCalenders = this.filteredDutyCalenders.filter(v => +v.DutyType.ID === +this.typeID);
    const currentDutyCalenderIndex = pcDutyCalenders.findIndex(v => +v.ID === +this.duty.DutyCalenderId);
    if (currentDutyCalenderIndex > 0) {
      this.lastDuty = <any>this.duties.filter(v => v.DutyCalenderId === pcDutyCalenders[currentDutyCalenderIndex - 1].ID)[0].Json;
    }
    this.mainDuty = <any>this.duties.filter(v => v.DutyCalenderId === pcDutyCalenders[currentDutyCalenderIndex].ID)[0].Json;
    if (this.duty.Json) {
      console.log(this.mainDuty.Date);
      this.selectedDate = this.mainDuty.Date;
      // this.selectedForecastFinishDate = moment(this.mainDuty.Forecast, 'jYYYY/jM/jD').format('YYYY/M/D');
      // this.formGp.get('Description').setValue(this.mainDuty.Description);
    } else {
      // this.selectedDate = moment(this.currentDutyCalender.StartDate, 'jYYYY/jM/jD').format('YYYY/M/D');
    }
    // this.buildChart();
    this.sharedService.getContractServices().subscribe(
      (services) => {
        this.services = services;
        if (this.mainDuty) {
          let control2;
          if (this.lastDuty) {
            control2 = new FormControl(this.mainDuty.Services.Values[0], [Validators.required, Validators.min(0), Validators.max(100)]);
          } else {
            control2 = new FormControl(this.mainDuty.Services.Values[0], [Validators.required, Validators.min(0), Validators.max(100)]);
          }
          if (this.contract.PCCalcsLast.length > 1) {
            (<FormArray>this.formGp.get('ServicesValue')).push(control2);
            const mainService2 = services.filter(v => v.ServiceID === 7)[0];
            this.mainServices.push(mainService2);
          }
        } else {
          if (this.contract.PCCalcsLast.length > 1) {
            const control2 = new FormControl(null, [Validators.required, Validators.min(0), Validators.max(100)]);
            (<FormArray>this.formGp.get('ServicesValue')).push(control2);
            const mainService2 = services.filter(v => v.ServiceID === 7)[0];
            this.mainServices.push(mainService2);
          }
        }
        for (let i = 0; i < this.contract.Service.length; i++) {
          const mainService = services.filter(v => v.ServiceID === this.contract.Service[i])[0];
          let control;
          if (+mainService.PCType > 0) {
            this.mainServices.push(mainService);
            if (this.mainDuty) {
              if (this.lastDuty) {
                if (this.contract.PCCalcsLast.length === 1) {
                  control = new FormControl(this.mainDuty.Services.Values[0], [Validators.required, Validators.min(0), Validators.max(100)]);
                } else {
                  control = new FormControl(this.mainDuty.Services.Values[i + 1], [Validators.required, Validators.min(0), Validators.max(100)]);
                }
              } else {
                control = new FormControl(this.mainDuty.Services.Values[i + 1], [Validators.required, Validators.min(0), Validators.max(100)]);
              }
            } else {
              control = new FormControl(null, [Validators.required, Validators.min(0), Validators.max(100)]);
            }
            (<FormArray>this.formGp.get('ServicesValue')).push(control);
          }
        }
        if (this.isReadOnly) {
          this.formGp.disable();
        }
      });
  }

  calculatePC(pc: { ID, PCProp, PC, Date }, mainData) {
    // let pcCalc: {PCRelation, PCCode};
    // const tempRelation = (mainData.filter(v => v.ID === pc.PCProp)[0].Data).map(v => v.PlanPCProps.DDate);
    // console.log(tempRelation);
    // console.log(tempRelation.sort((a, b) => +new Date(a) - +new Date(b))[0]);
    // console.log(mainData);
    // const d =  (mainData.filter(v => v.ID === pc.PCProp)[0].Data).filter(v => +new Date(v.PlanPCProps.DDate) === +new Date(tempRelation.sort((a, b) => +new Date(a) - +new Date(b))[0]))[0].ID;
    // console.log(d);
    // console.log(this.actPCProps.filter(v => +v.ActPCProp.ID === +d));
    // pcCalc = {
    //   PCCode: pc.ID,
    //   PCRelation: this.actPCProps.filter(v => +v.ActPCProp.ID === +d)[0]
    // };
    // console.log(pcCalc);
  }

  startSpeedCalc(data: { Date, Services: { Names, Values } }, pc: { ID: number, PCPropID: number, Value: number, Service: number }, shit) {
    // Date: moment(data.Date, 'YYYY/M/D').format('jYYYY/jMM/jDD'),
    console.log(data);
    this.lasts.pc.push({
      Service: pc.Service,
      Date: shit,
      ActPC: pc.Value,
      PlanPC: null,
    });
    console.log(shit);
    this.allPCRelations.sort((a, b) => +new Date(b.PlanDDate) - +new Date(a.PlanDDate));
    // console.log(this.allPCRelations);

    const uniqRelations = Array.from(new Set(this.allPCRelations.map(v => v.ActPCProp)));
    // console.log(uniqRelations);
    // console.log(uniqRelations, 'uniqRelations');
    // for (let i = 0; i < uniqRelations.length; i++) {
    const plans = this.allPCRelations.filter(v => +v.ActPCProp === +pc.PCPropID);
    this.contractService.getAllPCsByPCProp(this.contractID, pc.PCPropID).subscribe(
      (filteredActs) => {
        // console.log(plans, 'plans');
        // console.log(filteredActs, 'filteredActs');
        // console.log({
        //   Date: data.Date,
        //   PC: data.Services.Values[i] / 100
        // }, 'filteredActs');
        filteredActs.push({
          ID: 100000,
          PCProp: pc.PCPropID,
          Date: shit,
          PC: pc.Value,
        });
        console.log(filteredActs);
        filteredActs.sort((a, b) => +new Date(a.Date) - +new Date(b.Date));

        this.loopSubject.next({
          mainPC: {
            Date: shit,
            PC: pc.Value
          },
          uniqRelations: uniqRelations,
          plans: plans,
          i: 0,
          floatPC: {
            Date: shit,
            PC: pc.Value
          },
          floatPC90: {
            Date: shit,
            PC: pc.Value
          },
          startIntervalPCDate: +new Date(shit) - (this.totalInterval * 3600000 * 24),
          startIntervalPCDate90: +new Date(shit) - (90 * 3600000 * 24),
          floatInterval: this.totalInterval,
          floatInterval90: 90,
          isSpeedCalculationFinished: false,
          isSpeedCalculationFinished90: false,
          filteredActs: filteredActs,
          suitablePlan: null,
          suitablePlan90: null,
          mainSpeed: [],
          mainSpeed90: [],
          pcID: pc.ID,
          calcs: {
            PCRelation: null,
            PCCode: null,
            ProgressDeviation: null,
            Speed30D: null,
            Speed90D: null,
            TimeDeviation: null,
            Speed4Ontime: null,
            FinishTimeForecast: null
          }
        });
      });
    // }
    // const plans = this.allPCRelations.filter(v => +v.ActPCProp === +uniqRelations[0]);
    // this.floatInterval = this.totalInterval;
    // this.floatPC = {PC: .15, Date: '07/10/2019'};
    // this.startIntervalPCDate = +new Date(this.floatPC.Date) - (this.totalInterval * 3600000 * 24);
    // console.log(this.startIntervalPCDate);
    // console.log(plans);

    // console.log(this.allPCRelations.filter(v => +v.ActPCProp === +uniqRelations[0]));
    const lastPlanID = this.allPCRelations.filter(v => +v.ActPCProp === +uniqRelations[0])[0].PlanPCProps;
    console.log(lastPlanID);
    const mainPC = {
      Date: data.Date,
      PC: data.Services.Values[0] / 100
    };
    // this.contractService.getAllPCsByPCProp(this.contractID, lastPlanID).subscribe(
    //   (filteredPlans) => {
    //     this.contractService.getAllPCsByPCProp(this.contractID, uniqRelations[0]).subscribe(
    //       (filteredActs) => {
    // console.log(this.getSpeed4OnTime(mainPC, filteredPlans, filteredActs));
    // console.log(filteredPlans);
    // console.log(this.getProgressDeviation(mainPC, filteredPlans));
    // const speed = this.getSpeed(mainPC, filteredPlans, filteredActs, lastPlanID, 30);
    // console.log(this.getSpeed(mainPC, filteredPlans, filteredActs, lastPlanID, 30));
    // console.log(this.getFinishTimeForecast(mainPC, filteredPlans, filteredActs, speed));
    // console.log(this.getTimeDeviation(mainPC, filteredActs, filteredPlans, true));
    // const currentSpeed = this.getSpeed(mainPC, filteredPlans, filteredActs, lastPlanID, 30);
    // if (!currentSpeed) {
    // const plans = this.allPCRelations.filter(v => +v.ActPCProp === +uniqRelations[0]);
    // for (let i = 0; i < plans.length; i++) {
    // const pcDate1 = new Date(d.setDate(d.getDate() - interval));

    // }
    // }
    // }
    // );
    // }
    // );
  }

  getFinishTimeForecast(mainPC, finalDataPlan, finalDataAct, speed) {
    // Start Speed4OnTime
    if (!finalDataPlan) {
      return null;
    }
    console.log(finalDataPlan);
    const maxPlanDate = finalDataPlan[finalDataPlan.length - 1].Date;
    const actPC = mainPC;
    const planEqDate = this.calculationsService.getPCDate(actPC.PC, finalDataPlan);
    const planDuration = +new Date(maxPlanDate) - +planEqDate;
    const actDuration = +new Date(maxPlanDate) - +new Date(actPC.Date);
    const finishTimeForecast = (+planDuration / +speed) + +new Date(actPC.Date);
    if (finishTimeForecast === Infinity) {
      return null;

    } else {
      return new Date(+finishTimeForecast).toISOString().substring(0, 10);
    }
  }

  getSpeed4OnTime(mainPC: { PC, Date }, finalDataPlan, finalDataAct) {
    // Start Speed4OnTime
    const maxPlanDate = finalDataPlan[finalDataPlan.length - 1].Date;
    const actPC = mainPC;
    if (+new Date(actPC.Date) < +new Date(maxPlanDate)) {
      const planEqDate = this.calculationsService.getPCDate(actPC.PC, finalDataPlan);
      const planDuration = +new Date(maxPlanDate) - +planEqDate;
      const actDuration = +new Date(maxPlanDate) - +new Date(actPC.Date);
      const speed4OnTime = +planDuration / +actDuration;
      return speed4OnTime;
    } else {
      return null;
    }
  }

  weightedTotalTimeDeviation(plansTimeDeviation) {
    const sumActDuration = plansTimeDeviation.map(v => v.actDuration).reduce(this.getSum);
    let totalTimeDeviation = 0;
    // console.log(sumActDuration);
    for (let i = 0; i < plansTimeDeviation.length; i++) {
      totalTimeDeviation = totalTimeDeviation + plansTimeDeviation[i].timeDeviation * (plansTimeDeviation[i].actDuration / sumActDuration);
    }
    return totalTimeDeviation;
  }

  weightedTotalSpeed(mainSpeed: { Speed, Interval }[]) {
    if (mainSpeed.length === 0) {
      return null;
    }
    const sumInterval = mainSpeed.map(v => +v.Interval).reduce(this.getSum);
    let totalSpeed = 0;
    // console.log(sumActDuration);
    for (let i = 0; i < mainSpeed.length; i++) {
      totalSpeed = totalSpeed + mainSpeed[i].Speed * (mainSpeed[i].Interval / sumInterval);
    }
    return totalSpeed;
  }

  getTimeDeviation(mainPC: { PC, Date }, finalDataAct, finalDataPlan, isFirstPlan) {
    // Start TimeDeviation
    const minActDate = finalDataAct[0].Date;
    const minPlanDate = finalDataPlan[0].Date;
    // console.log(minActDate, 'minActDate');
    // console.log(minPlanDate, 'minPlanDate');

    let startDate = minPlanDate;
    const actPC = mainPC;
    if ((+new Date(minActDate) < +new Date(minPlanDate)) && isFirstPlan) {
      startDate = minActDate;
    }
    // console.log(startDate, 'startDate', actPC.Date);
    const actDuration = +new Date(actPC.Date) - +new Date(startDate);
    const planEqDate = this.calculationsService.getPCDate(actPC.PC, finalDataPlan);
    // console.log(actDuration, 'actDuration');
    // console.log(planEqDate, 'planEqDate');
    const planDuration = +planEqDate - +new Date(startDate);
    // console.log(planDuration, 'planDuration');
    if (actDuration === 0) {
      return null;
    } else {
      const timeDeviation = (+actDuration - +planDuration) / +planDuration;
      return {
        timeDeviation: timeDeviation,
        actDuration: actDuration
      };
    }
    // console.log('timeDeviation:', timeDeviation);
  }

  getSpeed(mainPC, filteredPlans, filteredActs, lastPlanID, interval) {
    // Start Speed

    const speed = this.calculationsService.getSpeed(mainPC.Date, interval, filteredActs, filteredPlans, lastPlanID, false);
    return speed;
  }


  getProgressDeviation(data, finalDataPlan) {
    // Start progressDeviation
    const progressDeviation = this.calculationsService.progressDeviation(+this.calculationsService.getPC(data.Date, finalDataPlan), +data.PC);
    return progressDeviation;
  }

  getDate(date) {
    return moment(date).format('jYYYY/jMM/jDD');
}

  getWriteReady() {

    this.actPCPropReadyCounter++;
    //
    console.log(this.pcRelations);
    // console.log(this.actPCProps);
    if (this.actPCPropReadyCounter === 3) {
      const mainPCRelations = [];
      for (let i = 0; i < this.allPCRelations.length; i++) {
        for (let j = 0; j < this.pcRelations.length; j++) {
          if (this.allPCRelations[i].ID === this.pcRelations[j]) {
            mainPCRelations.push(this.allPCRelations[i]);
          }
        }
      }
      this.allPCRelations = mainPCRelations;
      console.log(this.allPCRelations);
      for (let i = 0; i < this.pcRelations.length; i++) {

        this.actPCPropWithService[i] = {
          ID: this.allPCRelations.filter(v => v.ID === this.pcRelations[i])[0].ActPCProp,
          Service: null
        };
        this.actPCPropWithService[i].Service = this.mainActPCProps.filter(v => v.ID === this.actPCPropWithService[i].ID)[0].Service.results[0];

      }
      const mainData = [];
      console.log(Array.from(new Set(this.allPCRelations.map(v => v.ActPCProp))));

      const distActPCPropWithService = Array.from(new Set(this.actPCPropWithService.map(v => v.ID)));
      console.log(distActPCPropWithService);
      for (let i = 0; i < distActPCPropWithService.length; i++) {
        mainData.push({
          ID: distActPCPropWithService[i],
          Service: this.actPCPropWithService.filter(v => v.ID === distActPCPropWithService[i])[0].Service,
        });
      }
      this.actPCPropWithService = mainData;
      console.log(this.actPCPropWithService);
      console.log(this.actPCPropReadyCounter);
      console.log(mainData);
    }

    //   this.calculatePC( {
    //     ID: 56,
    //     PCProp: 6,
    //     PC: 0.65,
    //     Date: '6/11/2019',
    //   }, mainData);
    // }
    // }
  }

  createActPCCalcs(calcs: { PCRelation, PCCode, ProgressDeviation, Speed30D, Speed90D, TimeDeviation, Speed4Ontime, FinishTimeForecast, FinishTimeForecast90 }, actPCProp, mainPC, suitablePlan) {
    const pcLastIndex = this.lasts.pc.findIndex(v => +v.Service === +this.mainActPCProps.filter(v2 => +v2.ID === +actPCProp)[0].Service.results[0]);
    this.lasts.pc[pcLastIndex].PlanPC = this.calculationsService.getPC(this.lasts.pc[pcLastIndex].Date, suitablePlan);
    console.log(pcLastIndex, this.lasts.pc[pcLastIndex]);
    const pcCalcs: any = {
      DataAct: calcs.PCCode,
      PCRelation: calcs.PCRelation,
      ProgressDeviation: calcs.ProgressDeviation,
      Speed: calcs.Speed30D,
      Speed90D: calcs.Speed90D,
      TimeDeviation: calcs.TimeDeviation,
      Speed4OnTime: calcs.Speed4Ontime,
      FinishTimeForecast: calcs.FinishTimeForecast,
      FinishTimeForecast90: calcs.FinishTimeForecast90,
      FinishDates: null,
      planPC: this.lasts.pc[pcLastIndex].PlanPC,
      suitablePlan: suitablePlan[0].PCProp
    };
    console.log(pcCalcs);
    this.tempTransfer.getDataFromContextInfo().subscribe(
      (digestValue) => {
        this.tempTransfer.createActPCCalcs(digestValue, this.contractID, pcCalcs).subscribe(
          (rData: any) => {
          }
        );
      }
    );

    this.lasts.calcs.push({
      Service: this.mainActPCProps.filter(v => v.ID === actPCProp)[0].Service.results[0],
      Date: mainPC.Date,
      ProgressDeviation: calcs.ProgressDeviation,
      Speed30D: calcs.Speed30D,
      Speed90D: calcs.Speed90D,
      TimeDeviation: calcs.TimeDeviation,
      Speed4Ontime: calcs.Speed4Ontime,
      FinishTimeForecast: calcs.FinishTimeForecast,
      FinishTimeForecast90: calcs.FinishTimeForecast90,
    });
    if (this.lasts.calcs.length === this.formGp.value.ServicesValue.length) {
      this.tempTransfer.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.tempTransfer.updateContract(digestValue, this.contractID, this.lasts, 'pc').subscribe();
        }
      );
    }
    console.log(this.lasts, 'lasts');
  }

  onChangeChecked() {
    this.isChecked = !this.isChecked;
  }

  onSubmitClick() {
    let finalDate;
    console.log(this.selectedDate);
    let shit;
    try {
      if (this.selectedDate.calSystem) {
        console.log('sss');
        finalDate = this.selectedDate.format('YYYY/M/D');
        shit = moment(finalDate.slice(), 'jYYYY/jMM/jDD').format('YYYY/M/D');
        finalDate = moment(finalDate, 'jYYYY/jMM/jDD').format('YYYY/M/D');
      } else {
        if (this.selectedDate._l) {
          finalDate = this.selectedDate;
          shit = finalDate;
        } else if (this.selectedDate.split('/')[0] < 1500) {
          finalDate = moment(this.selectedDate, 'jYYYY/jMM/jDD').format('YYYY/M/D');
          shit = moment(finalDate.slice(), 'jYYYY/jMM/jDD').format('YYYY/M/D');
          finalDate = moment(finalDate, 'jYYYY/jMM/jDD').format('YYYY/M/D');
        } else {
          finalDate = this.selectedDate;
          shit = finalDate;
        }
        // if (+this.selectedDate.split('/')[0] > 1500) {
        //   finalDate = moment(this.selectedDate, 'YYYY/M/D').format('jYYYY/jMM/jDD');
        // }
      }
    } catch {

    }

    const data: { Date, Services: { Names, Values } } = {
      Date: finalDate,
      Services: {
        Names: this.mainServices.map(v => v.ServiceID),
        Values: this.formGp.value.ServicesValue
      },
    };

    let isServiceValid = true;
    let isTotalServiceValid = true;
    let isDateValid = false;
    let dutyDoneStatus = 2;
    let dutyApprovementStatus = 3;
    console.log(+new Date(finalDate) <= +new Date(this.today.en) , +new Date(finalDate) >= +new Date(moment(this.currentDutyCalender.StartDate, 'jYYYY/jMM/jDD').format('YYYY/M/D')) , +new Date(finalDate) > +new Date(moment(this.contract.LastPC[0].Date).format('YYYY/M/D')) , +new Date(finalDate) <= +new Date(moment(this.currentDutyCalender.FinishDate, 'jYYYY/jMM/jDD').format('YYYY/M/D')));
    if (+new Date(finalDate) <= +new Date(this.today.en) && +new Date(finalDate) >= +new Date(moment(this.currentDutyCalender.StartDate, 'jYYYY/jMM/jDD').format('YYYY/M/D')) && +new Date(finalDate) > +new Date(moment(this.contract.LastPC[0].Date).format('YYYY/M/D')) && +new Date(finalDate) <= +new Date(moment(this.currentDutyCalender.FinishDate, 'jYYYY/jMM/jDD').format('YYYY/M/D'))) {
      isDateValid = true;
    }
    console.log(data);
    console.log(data.Date);
    // console.log(moment(data.Date, 'jYYYY/jMM/jDD').format('YYYY/M/D'));

    // for (let i = 0; i < data.Services.Names.length; i++) {
    // this.startSpeedCalc(data, 36);
    // }

    for (let i = 0; i < this.contract.LastPC.length; i++) {
      data.Services.Names.filter((v, index) => {
        if (+v === +this.contract.LastPC[i].Service) {
          if (+data.Services.Values[index] < +this.contract.LastPC[i].ActPC * 100) {
            isServiceValid = false;
          }
          if (+data.Services.Values[0] === 100 && +data.Services.Values[index] !== 100) {
            isTotalServiceValid = false;
          }
        }

      });
    }
    if (+new Date(this.today) < +new Date(this.currentDutyCalender.FinishDate)) {
      dutyDoneStatus = 1;
    }
    if (this.isPM) {
      dutyApprovementStatus = 1;
    }
    // console.log(isTotalServiceValid);
    // console.log(isServiceValid);


    console.log('this.formGp.valid && isDateValid && isTotalServiceValid && isServiceValid');
    console.log(this.formGp.valid, isDateValid, isTotalServiceValid, isServiceValid);
    if (this.formGp.valid && isDateValid && isTotalServiceValid && isServiceValid) {
      console.log('ss');
      this.sharedService.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.sharedService.getTodayDateFromContextInfo().subscribe(
            () => {
              console.log('ss2');
              console.log(this.actPCPropWithService);
              for (let i = 0; i < data.Services.Names.length; i++) {
                this.actPCPropWithService.filter(v => {
                  if (v.Service === data.Services.Names[i]) {
                    const pc: { PCProp, PC, Date } = {
                      PCProp: v.ID,
                      PC: data.Services.Values[i] / 100,
                      Date: data.Date,
                    };
                    console.log(pc);
                    console.log(data);
                    if (this.isPM) {
                      this.contractService.sendDataToPCs(digestValue, this.contractID, pc).subscribe(
                        (response: any) => {
                          console.log(response);
                          this.startSpeedCalc(data, {ID: response.d.ID, PCPropID: response.d.PCPropId, Value: response.d.PC, Service: data.Services.Names[i]}, shit);
                          if (i === data.Services.Names.length - 1) {
                            this.contractService.updateContractDuties(digestValue, 'Duties', this.contractID, this.duty.Id, data, this.sharedService.todayData, dutyApprovementStatus, dutyDoneStatus, this.isPM, this.duty.ImporterDoneDate, true).subscribe(
                              () => {
                                this.dialogRef.close();
                              }
                            );
                          }
                        }
                      );
                    }
                  }
                });
              }
              if (!this.isPM) {
                this.contractService.updateContractDuties(digestValue, 'Duties', this.contractID, this.duty.Id, data, this.sharedService.todayData, dutyApprovementStatus, dutyDoneStatus, this.isPM, this.duty.ImporterDoneDate, true).subscribe(
                  () => {
                    this.dialogRef.close();
                  }
                );
              }
            }
          );
        }
      );
    } else {
      let text = '';
      if (!this.formGp.valid) {
        text = text + '<p style="direction: rtl;text-align: justify;"> - اطلاعات ناقص است!</p>';
      }
      if (!isDateValid) {
        text = text + '<p style="direction: rtl;text-align: justify;"> - تاریخ ورودی معتبر نیست!</p>';
      }
      if (!isTotalServiceValid) {
        text = text + '<p style="direction: rtl;text-align: justify;"> - درصد پیشرفت کلی معتبر نیست !</p>';
      }
      if (!isServiceValid) {
        text = text + '<p style="direction: rtl;text-align: justify;"> - درصد های پیشرفت معتبر نیست!</p>';
      }
      this.alertsService.alertsWrongContractForm(text).then((result) => {
        if (result.value) {
        }
      });
    }
  }

  getServiceName(service) {
    return this.services.filter(v => +v.ServiceID === +service)[0].Name;
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

  getSum(total, num) {
    return +total + +num;
  }
}
