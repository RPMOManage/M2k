import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService } from '../../../../shared/services/contract.service';
import { SharedService } from '../../../../shared/services/shared.service';
import * as Highcharts from 'highcharts';
import { Chart } from 'angular-highcharts';
import { ContractModel } from '../../../../shared/models/contractModels/contract.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'jalali-moment';
import { isUndefined } from 'util';
import { AlertsService } from '../../../../shared/services/alerts.service';
import { Observable } from 'rxjs/index';
import { map, startWith } from 'rxjs/internal/operators';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-changes-request',
  templateUrl: './changes-request.component.html',
  styleUrls: ['./changes-request.component.scss']
})
export class ChangesRequestComponent implements OnInit {
  chart;
  chartOptions;
  contractID: number;
  startDate = '1397/11/07';
  finishDate = '1397/11/14';
  changeCategories: { ID, Title }[] = [];
  changeItemsWithChecked: { ID, Title, Order, ChangeCategory, ChangeItem, VersionMaker, Checked }[] = [];
  selectedOptions: { ID, Title, Order, ChangeCategory, ChangeItem, VersionMaker, Checked }[] = [];
  formGp: FormGroup;
  selectedDDate = null;
  changes: {ID, Date, ChangeItem, ImporterApproved, PMApproved, Json, DDate, Description}[] = [];
  today = {
    en: '',
    fa: ''
  };
  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]>;

  constructor(private router: Router,
              private contractService: ContractService,
              private route: ActivatedRoute,
              private alertsService: AlertsService,
              private _formBuilder: FormBuilder,
              private dialogRef: MatDialogRef<ChangesRequestComponent>,
              @Inject(MAT_DIALOG_DATA) public passedData: { contract: ContractModel },
              private sharedService: SharedService) {
  }

  ngOnInit() {
    this.contractID = this.passedData.contract.Id;
    this.contractService.getChange(this.contractID, null, false).subscribe(
      (change) => {
        this.changes = change;
        console.log(this.changes, 'change');
      }
    );
    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
    this.sharedService.getTodayDateFromContextInfo().subscribe(
      (today) => {
        this.today.en = today;
        this.today.fa = moment(this.today.en, 'YYYY/M/D').format('jYYYY/jM/jD');
      }
    );
    this.formGp = this._formBuilder.group({
      DDate: new FormControl(null, [Validators.required]),
      Description: new FormControl(null, [Validators.required]),
    });
    this.contractService.getAllChangeCategories().subscribe(
      (changeCategories) => {
        this.changeCategories = changeCategories;
        console.log(this.changeCategories);
      }
    );
    this.contractService.getAllChangeItems().subscribe(
      (changeItems) => {
        changeItems.map(v => {
          this.changeItemsWithChecked.push({
            ID: v.ID,
            Title: v.Title,
            Order: v.Order,
            ChangeCategory: v.ChangeCategory,
            ChangeItem: v.ChangeItem,
            VersionMaker: v.VersionMaker,
            Checked: false
          });
        });
        console.log(this.changeItemsWithChecked);
      }
    );
    // this.route.queryParams.subscribe(
    //   (params: any) => {
    //     if (params.ContractID) {
    //       this.contractID = +params.ID;
    //       this.contractService.getChange(this.contractID, null, true).subscribe(
    //         (change) => {
    //           this.change = change;
    //           this.buildChart();
    //         }
    //       );
    //       console.log(this.contractID);
    //       this.contractService.getContract(this.contractID).subscribe(
    //         (contract) => {
    //           this.contract = contract;
    //           console.log(this.contract);
    //           this.buildChart();
    //         }
    //       );
    //     }
    //   });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  getDelItems(id: number) {
    return this.changeItemsWithChecked.filter(v => v.ChangeCategory === id);
  }

  onClickListOp(id: number) {
    this.changeItemsWithChecked.filter(v => v.ID === id)[0].Checked = !this.changeItemsWithChecked.filter(v => v.ID === id)[0].Checked;
  }

  onBuildChangesWizard() {
    console.log(this.changes);
    let DDate = null;
    let text = '';
    let DDateValidation = [];
    const finalChangeCodes = [];
    this.changeItemsWithChecked.map(v => {
      if (v.Checked) {
        finalChangeCodes.push(v.ID);
        v.ChangeItem.map(v2 => {
          finalChangeCodes.push(v2);
        });
      }
    });
    if (this.selectedDDate) {
      DDate = moment(this.selectedDDate.format('jYYYY/jM/jD'), 'jYYYY/jM/jD').format('MM/DD/YYYY');
      const d = moment(this.selectedDDate.format('jYYYY/jM/jD'), 'jYYYY/jM/jD').format('jYYYY/jM/jD');
      console.log(d, DDate);
      // console.log(this.changes[0].DDate);
      if (this.changes.length > 0) {
        if (+new Date(d) > +new Date(this.changes[0].DDate)) {
          DDateValidation.push(true);
        } else {
          console.log(1);
          DDateValidation.push(false);
          text = text + '<p style="direction: rtl;text-align: right;"><span style="color: darkred;"> - </span><span>تاریخ تغییر باید بعد از آخرین تغییر (' + this.changes[0].DDate + ') باشد!</span></p>';
        }
      } else {
        if (+new Date(d) > +new Date(this.passedData.contract.DeclareDate)) {
          DDateValidation.push(true);
        } else {
          text = text + '<p style="direction: rtl;text-align: right;"><span style="color: darkred;"> - </span><span>تاریخ تغییر باید بعد از تاریخ ابلاغ قرارداد (' + this.passedData.contract.DeclareDate + ') باشد!</span></p>';
          DDateValidation.push(false);
        }
      }
      if (+new Date(d) <= +new Date(this.today.fa)) {
        console.log(2);
        DDateValidation.push(true);
      } else {
        console.log(3);
        text = text + '<p style="direction: rtl;text-align: right;"><span style="color: darkred;"> - </span><span>تاریخ تغییر نمیتواند بعد از امروز (' + this.today.fa + ') باشد!</span></p>';
        DDateValidation.push(false);
      }
    }
    if (finalChangeCodes.length === 0) {
      text = text + '<p style="direction: rtl;text-align: right;"><span style="color: darkred;"> - </span><span>حداقل یک مورد را انتخاب نمایید!</span></p>';
    }
    // if (this.formGp.valid && DDateValidation.filter(v => v === true).length === 2 && finalChangeCodes.length > 0) {
    if (this.formGp.valid && !(+DDateValidation.filter(v => v === false).length > 0)) {
      this.sharedService.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.alertsService.alerts().then((result) => {
            if (result.value) {
              this.contractService.sendDataToChanges(digestValue, Array.from(new Set(finalChangeCodes)), DDate, this.formGp.get('Description').value, 'Changes', this.contractID).subscribe(
                (rData: any) => {
                  console.log(rData.d.Id);
                  this.dialogRef.close();
                  this.router.navigate(['change'], {queryParams: {ID: this.contractID, ChangeID: rData.d.Id}, queryParamsHandling: 'merge'});
                });
            }
          });
        });
    } else {
      this.alertsService.alertsWrongContractForm(text);
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
