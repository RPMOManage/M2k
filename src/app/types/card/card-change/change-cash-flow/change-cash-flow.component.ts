import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContractService } from '../../../../shared/services/contract.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { HotTableRegisterer } from '@handsontable-pro/angular';
import { GenerateDatesService } from '../../../../shared/services/generate-dates.service';
import { ContractModel } from '../../../../shared/models/contractModels/contract.model';
import { PlanActPropAddRowComponent } from '../../../../pages/new-contract-stepper/plan-acts-prop-form/plan-act-prop-add-row/plan-act-prop-add-row.component';
import { AlertsService } from '../../../../shared/services/alerts.service';
import { MatDialog } from '@angular/material';
import { isUndefined } from 'util';
import * as moment from 'jalali-moment';
import { PlanActPropDeleteRowComponent } from '../../../../pages/new-contract-stepper/plan-acts-prop-form/plan-act-prop-delete-row/plan-act-prop-delete-row.component';
import { ChangesModel } from '../../../../shared/models/contractModels/changes.model';

@Component({
  selector: 'app-change-cash-flow',
  templateUrl: './change-cash-flow.component.html',
  styleUrls: ['./change-cash-flow.component.scss']
})
export class ChangeCashFlowComponent implements OnInit {
  @Input() contractID: number;
  @Input() change: ChangesModel;
  @Input() versionID: number;
  @Input() contract: ContractModel;
  @Output() changeTabIndex = new EventEmitter();
  formGp: FormGroup;
  selectedNewCostDeclareDate = '';
  column;
  costCodes: { ID, DDate, EqCost, Cost }[] = [];
  checkTable = false;
  instance = 'changeCashFlowPlanTable';
  options: any = {
    rowHeaders: true,
    stretchH: 'all',
    height: 420,
    columns: [
      {
        type: 'text',
        readOnly: true,
        width: '100%'
      },
      {
        type: 'numeric',
        numericFormat: {
          pattern: '0,00'
        },
        width: '80%'
      }
    ]
  };
  startDate: string;
  finishDate: string;
  cashFlowPlans: { ID, cashFlowPlansPropCode, Date, Cost }[] = [];

  constructor(private router: Router,
              private contractService: ContractService,
              private _formBuilder: FormBuilder,
              private sharedService: SharedService,
              private hotRegisterer: HotTableRegisterer,
              private generateDatesService: GenerateDatesService,
              private alertsService: AlertsService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.contractService.getAllCashFlowPlans(this.contractID, 1).subscribe(
      (cashFlowPlans) => {
        this.cashFlowPlans = cashFlowPlans;
        console.log(this.cashFlowPlans);
      }
    );
    this.sharedService.getTodayDateFromContextInfo().subscribe();
    this.contractService.getCostCode(this.contractID, this.versionID).subscribe(
      (costCodes) => {
        this.costCodes = costCodes;
        this.costCodes = this.costCodes.sort((a, b) => +new Date(b.DDate) - +new Date(a.DDate));
      }
    );
    this.contractService.getAllFinancialGrossAmounts(this.contractID, 'FinancialPayments').subscribe(
      (financialPayments) => {
        if (financialPayments[0]) {
          this.startDate = financialPayments[0].Date;
        } else {
          this.startDate = this.contract.StartDate;
        }
        this.finishDate = this.contract.FinishDate;
        setTimeout(() => {
          if (this.change.Json.ChangeFinishDate) {
            this.finishDate = this.change.Json.ChangeFinishDate.Date;
          }
          const changedDates = this.generateDatesService.changeInitiateDate(this.startDate, this.finishDate, true);
          this.buildTable(changedDates);
        }, 100);
      }
    );
    this.formGp = this._formBuilder.group({
      Cost: new FormControl(null, [Validators.required]),
      EqCost: new FormControl(null),
      NewCostDeclareDate: new FormControl(null, [Validators.required]),
      Currency: new FormControl(null, [Validators.required]),
      Description: new FormControl(null, [Validators.required])
    });
  }

  buildTable(changedDates: string[]) {
    const update = [];
    this.column = [
      {
        type: 'text',
        readOnly: true,
        width: '100%'
      },
      {
        type: 'numeric',
        numericFormat: {
          pattern: '0,00'
        },
        width: '80%'
      }
    ];
    const obj = [];
    if (this.change.Json.ChangeCashFlow) {
      for (let i = 0; i < this.change.Json.ChangeCashFlow.Dates.length; i++) {
        obj.push([this.change.Json.ChangeCashFlow.Dates[i], this.change.Json.ChangeCashFlow.Values[i]]);
      }
      console.log(this.instance);
      const hotInstance = this.hotRegisterer.getInstance('changeCashFlowPlanTable');
      console.log(hotInstance);
      try {
        hotInstance.updateSettings({
          colHeaders: ['تاریخ', 'مبلغ هزینه برنامه ای (تجمعی) '],
          columns: this.column,
          data: obj,
          maxRows: changedDates.length,
          cells: (row, col, prop) => {
            const cellProperties: any = {};
            // if (row === 0 || col === 2) {
            //   cellProperties.readOnly = true;
            // }
            return cellProperties;
          },
        });
        // hotInstance.setDataAtCell(0, 1, 0);
        this.checkTable = true;
        // hotInstance.setDataAtCell(hotInstance.countRows() - 1, 1, this.costOfProject);
      } catch {
      }
    } else {
      for (let i = 0; i < changedDates.length; i++) {
        obj.push([changedDates[i], '']);
      }
      console.log(this.instance);
      const hotInstance = this.hotRegisterer.getInstance('changeCashFlowPlanTable');
      console.log(hotInstance);
      try {
        hotInstance.updateSettings({
          colHeaders: ['تاریخ', 'مبلغ هزینه برنامه ای (تجمعی) '],
          columns: this.column,
          data: obj,
          maxRows: changedDates.length,
          cells: (row, col, prop) => {
            const cellProperties: any = {};
            // if (row === 0 || col === 2) {
            //   cellProperties.readOnly = true;
            // }
            return cellProperties;
          },
        });
        // hotInstance.setDataAtCell(0, 1, 0);
        this.checkTable = true;
        // hotInstance.setDataAtCell(hotInstance.countRows() - 1, 1, this.costOfProject);
      } catch {
      }
    }
  }

  addRowPopUp() {
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    const dialogRef = this.dialog.open(PlanActPropAddRowComponent, {
      width: '500px',
      height: '500px',
      data: {
        data: 'aaa',
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (isUndefined(result) || result === '') {
      } else {
        let text = '';
        let finalDate = this.finishDate;
        const mainDate = moment(this.sharedService.todayData, 'YYYY/M/D');
        console.log(mainDate);
        const todayFa = mainDate.format('jYYYY/jM/jD');
        console.log(todayFa);
        if (new Date(this.finishDate) < new Date(todayFa)) {
          finalDate = todayFa;
        }
        const allTime = hotInstance.getData().map(v => +new Date(v[0]));
        if (allTime.indexOf(+new Date(result.format('jYYYY/jM/jD'))) !== -1) {
          text = '<p style="direction: rtl;text-align: right;"><span style="color: darkred;">- </span><span>تاریخ تکراری است!</span></p>';
        } else if (+new Date(result.format('jYYYY/jM/jD')) < +new Date(this.startDate)) {
          text = text + '<p style="direction: rtl;text-align: right;"><span style="color: darkred;">- </span><span>تاریخ اشتباه است!</span></p>';
        }
        if (text !== '') {
          this.alertsService.alertsWrong2(text).then((result2) => {
          });
        } else {
          this.alertsService.alertsSubmit().then((result2) => {
            this.addRow(result.format('jYYYY/jMM/jDD'));
          });
        }
      }
      hotInstance.deselectCell();
    });
  }

  deleteRowPopUp() {
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    const dialogRef = this.dialog.open(PlanActPropDeleteRowComponent, {
      width: '500px',
      height: '500px',
      data: {
        data: hotInstance.getData().map(a => a[0]),
        changedDates: this.generateDatesService.changeInitiateDate(this.startDate, this.finishDate, true)
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (isUndefined(result) || result === '') {
      } else {
        const daDateD = hotInstance.getData().map(a => a[0]);
        const index = daDateD.findIndex(v => +new Date(v) === +new Date(result));
        hotInstance.alter('remove_row', index);
        hotInstance.updateSettings({
          maxRows: daDateD.length - 1
        });
      }
    });
  }

  addRow(newRowDate) {
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    const daDateD = hotInstance.getData().map(a => a[0]);
    let counter = 0;
    daDateD.filter(v => {
      if (+new Date(v) < +new Date(newRowDate)) {
        counter++;
      }
    });
    hotInstance.updateSettings({
      maxRows: daDateD.length + 1
    });
    hotInstance.alter('insert_row', counter);
    hotInstance.setDataAtCell(counter, 0, newRowDate);
    setTimeout(() => {
      hotInstance.selectRows(counter);
    }, 300);
  }

  getCSV() {
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    const exportPlugin = hotInstance.getPlugin('exportFile');
    exportPlugin.downloadFile('csv', {filename: 'CashFlowPlan', columnHeaders: true, range: [0, 0, hotInstance.countRows(), 1]});
  }

  onSubmitClick() {
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    const dates = hotInstance.getData().map(a => a[0]);
    const values = hotInstance.getData().map(a => a[1]);
    let lastValidation = false;
    let isSorted = false;
    let hasNull = false;
    let hasNegative = false;
    let text = '';
    if (this.change.Json.ChangeCost) {
      if (+values[dates.length - 1] === +this.change.Json.ChangeCost.Cost) {
        lastValidation = true;
      } else {
        text = text + '<p style="direction: rtl;text-align: right;"><span style="color: darkred;"> - </span><span>مبلغ پایانی باید برابر مبلغ جدید قرارداد (' + this.change.Json.ChangeCost.Cost + ') باشد!</span></p>';
      }
    } else {
      if (+values[dates.length - 1] === +this.contract.Cost) {
        lastValidation = true;
      } else {
        text = text + '<p style="direction: rtl;text-align: right;"><span style="color: darkred;"> - </span><span>مبلغ پایانی باید برابر مبلغ قرارداد (' + this.contract.Cost + ') باشد!</span></p>';
      }
    }
    values.filter(v => {
      if (v === null || v === '') {
        hasNull = true;
      }
      if (v < 0) {
        hasNegative = true;
      }
    });
    if (this.isSorted(values)) {
      isSorted = true;
    }

    if (!isSorted || hasNull) {
      text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">' + '' + '- </span><span>مبالغ هزینه صعودی نیستند و یا نقص دارند!</span></p>';
    }

    if (hasNegative) {
      text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">' + '' + '- </span><span>مبلغ هزینه نمی تواند منفی باشد!</span></p>';
    }

    if (lastValidation && isSorted && !hasNull && !hasNegative) {
      this.sharedService.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.change.Json.ChangeCashFlow = {
            Dates: dates,
            Values: values,
          };
          this.alertsService.alerts().then((result) => {
            if (result.value) {
              this.contractService.updateChanges(digestValue, this.contractID, this.change).subscribe(
                () => {
                  this.changeTabIndex.emit();
                }
              );
            }
          });
        }
      );
      console.log(this.formGp.value);
    } else {
      this.alertsService.alertsWrongContractForm(text);
    }
  }

  isSorted(arr) {
    const limit = arr.length - 1;
    return arr.every((_, i) => (i < limit ? arr[i] <= arr[i + 1] : true));
  }
}
