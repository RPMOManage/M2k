import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SharedService } from '../../../shared/services/shared.service';
import { CurrencyList } from '../../../shared/models/currency.model';
import { HotTableRegisterer } from '@handsontable-pro/angular';
import { StepCashFlowPlanFormList } from '../../../shared/models/stepFormModels/stepCashFlowPlanForm.model';
import * as Highcharts from 'highcharts';
import { Chart } from 'angular-highcharts';
import { PlanActPropAddRowComponent } from '../plan-acts-prop-form/plan-act-prop-add-row/plan-act-prop-add-row.component';
import { isUndefined } from 'util';
import { AlertsService } from '../../../shared/services/alerts.service';
import { MatDialog } from '@angular/material';
import { Subject } from 'rxjs/index';
import { GenerateDatesService } from '../../../shared/services/generate-dates.service';
import { PlanActPropDeleteRowComponent } from '../plan-acts-prop-form/plan-act-prop-delete-row/plan-act-prop-delete-row.component';
import * as moment from 'jalali-moment';

@Component({
  selector: 'app-cash-flow-plan',
  templateUrl: './cash-flow-plan.component.html',
  styleUrls: ['./cash-flow-plan.component.scss']
})
export class CashFlowPlanComponent implements OnInit {
  @Output() tableData = new EventEmitter();
  tableDataSaved = [];
  tableCols = 0;
  data = [];
  tableChangingSub =  new Subject();
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
  instance = 'cashFlowPlanTable';
  check = false;
  currencies: CurrencyList[] = [];
  cashFlowPlanData: StepCashFlowPlanFormList;
  costOfProject = 0;
  chart;
  chartOptions;
  contractCost: number;
  column;
  haveData = false;
  isReadOnly: boolean;
  tableCheck = false;
  spinnerChecking = false;

  constructor(private sharedService: SharedService,
              private hotRegisterer: HotTableRegisterer,
              private alertsService: AlertsService,
              private dialog: MatDialog,
              private generateDatesService: GenerateDatesService) {
  }

  ngOnInit() {
    let changedDates;
    if (this.sharedService.stepFormsData.cashFlowPlanForm) {
      changedDates = this.generateDatesService.initiateDate(this.sharedService.stepFormsData.cashFlowPlanForm.date, true);
    } else {
      changedDates = this.generateDatesService.initiateDate(null, true);
    }
    let finishDate = this.sharedService.stepFormsData.contractsForm.FinishDate_Contract;
    const mainDate22 = moment(this.sharedService.todayData, 'YYYY/M/D');
    const todayFa = mainDate22.format('jYYYY/jM/jD');
    if (+new Date(finishDate) < +new Date(todayFa)) {
      finishDate = todayFa;
    }
    changedDates = changedDates.filter(v => {
      if (+new Date(v) >= +new Date(this.sharedService.stepFormsData.contractsForm.StartDate_Contract)
      ) {
        return v;
      }
    });
    this.isReadOnly = this.sharedService.isReadOnly;
    setTimeout(() => {
      this.initiateTable(changedDates);
    }, 300);
  }

  initiateTable(changedDates: string[]) {
    if (this.sharedService.stepFormsData.cashFlowPlanForm) {
      this.cashFlowPlanData = this.sharedService.stepFormsData.cashFlowPlanForm;
      this.costOfProject = +this.sharedService.stepFormsData.contractsForm.Cost_Costs;
      this.contractCost = this.sharedService.stepFormsData.contractsForm.Cost_Costs;
      if (this.sharedService.stepFormsData.cashFlowPlanForm.data) {
        this.haveData = true;
      }
    } else {
      this.cashFlowPlanData = {date: null, data: null};
      this.sharedService.stepFormsData.cashFlowPlanForm = {date: [], data: []};
      this.costOfProject = this.sharedService.stepFormsData.contractsForm.Cost_Costs;
      this.contractCost = this.sharedService.stepFormsData.contractsForm.Cost_Costs;
      this.haveData = false;
    }
    if (this.cashFlowPlanData && this.sharedService.stepFormsData.contractsForm.StartDate_Contract && this.sharedService.stepFormsData.contractsForm.FinishDate_Contract) {
      this.buildTableTest(changedDates);
      this.buildChart(changedDates);
    } else {
      this.buildTableTest(changedDates);
      this.buildChart(changedDates);
    }
    this.tableChangingSub.subscribe(
      () => {
        if (this.tableCheck) {
          this.sharedService.stepsDirty.cashFlow = true;
        }
      }
    );

    this.sharedService.getContractCurrencies()
      .subscribe(
        (data) => {
          this.currencies = data;
        }
      );
    this.sharedService.newCostSubject.subscribe(
      () => {
        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        // hotInstance.setDataAtCell(hotInstance.countRows() - 1, 1, +this.sharedService.newCost);

      }
    );
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
        let finalDate = this.sharedService.stepFormsData.contractsForm.FinishDate_Contract;
        const mainDate = moment(this.sharedService.todayData, 'YYYY/M/D');
        const todayFa = mainDate.format('jYYYY/jM/jD');
        if (new Date(this.sharedService.stepFormsData.contractsForm.FinishDate_Contract) < new Date(todayFa)) {
          finalDate = todayFa;
        }
        const allTime = hotInstance.getData().map(v => +new Date(v[0]));
        if (allTime.indexOf(+new Date(result.format('jYYYY/jM/jD'))) !== -1) {
          text = '<p style="direction: rtl;text-align: right;"><span style="color: darkred;">- </span><span>تاریخ تکراری است!</span></p>';
        } else if (+new Date(result.format('jYYYY/jM/jD')) < +new Date(this.sharedService.stepFormsData.contractsForm.StartDate_Contract)) {
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
        changedDates: this.generateDatesService.initiateDate(null),
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
      hotInstance.deselectCell();
      this.tableDataSaved = hotInstance.getData();
      this.tableCols = hotInstance.countCols();
      this.savingData();
      this.sharedService.stepsDirty.cashFlow = true;
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

  buildChart(changedDates: string[]) {
    const acc = [];
    if (this.haveData) {
      for (let i = 0; i < changedDates.length; i++) {
        acc[i] = [
          Date.UTC(+changedDates[i].split('/')[0],
            +changedDates[i].split('/')[1] - 1,
            +changedDates[i].split('/')[2]), this.cashFlowPlanData.data[i]
        ];
      }
    } else {
      for (let i = 0; i < changedDates.length; i++) {
        acc[i] = [
          Date.UTC(+changedDates[i].split('/')[0],
            +changedDates[i].split('/')[1] - 1,
            +changedDates[i].split('/')[2]), null
        ];
      }
    }

    this.chartOptions = {
      chart: {
        type: 'line',
        zoomType: 'x',
        height: 450
      },
      title: {
        text: ''
      },
      dateFormat: 'YYYY/mm/dd',
      xAxis: {
        scrollbar: {
          enabled: true
        },
        type: 'datetime',
        labels: {
          formatter: function () {
            const monthStr = Highcharts.dateFormat('%Y/%m/%e', this.value);
            return monthStr;
          }
        },
      },
      yAxis: {
        title: {
          text: 'ریال'
        },
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        series: {
          connectNulls: true
        }
      },
      tooltip: {
        padding: 4,
        useHTML: true,
        formatter: function () {
          return '<p class="highchart-Tooltip">' + this.series.name + '</p>' +
            '<p class="highchart-Tooltip">' + ' تاریخ : ' + new Date(this.point.category).getFullYear() + '/' + (+new Date(this.point.category).getMonth() + 1) + '/' + new Date(this.point.category).getDate() + '</p>' +
            '<p style="direction: ltr;" class="highchart-Tooltip">' + 'مقدار : ' + Highcharts.numberFormat(Math.abs(this.point.y), 0) + '</p>';
        }
      },
      series: [{
        step: true,
        name: 'مبلغ هزینه برنامه ای',
        data: acc
      }]
    };
    this.chart = new Chart(this.chartOptions);
  }

  click(event, coords, TD) {
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    hotInstance.alter('remove_row', +coords.row);
  }

  buildTableTest(changedDates: string[]) {
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
    for (let i = 0; i < changedDates.length; i++) {
      if (this.cashFlowPlanData.data) {
        obj.push([changedDates[i], this.cashFlowPlanData.data[i]]);
      } else {
        if (i === 0) {
          // obj.push([changedDates[i], 0]);
        } if (i === changedDates.length - 1) {
          // obj.push([changedDates[i], this.costOfProject]);
          obj.push([changedDates[i], '']);
        } else {
          obj.push([changedDates[i], '']);
        }
      }
    }
    const hotInstance = this.hotRegisterer.getInstance('cashFlowPlanTable');
    try {
      hotInstance.updateSettings({
        colHeaders: ['تاریخ', 'مبلغ هزینه برنامه ای'],
        columns: this.column,
        data: obj,
        maxRows: changedDates.length,
        cells: (row, col, prop) => {
          const cellProperties: any = {};
          if (row === 0 || col === 2) {
            cellProperties.readOnly = true;
          }
          return cellProperties;
        },
        beforeChange: (changes, source) => {
          if (!this.sharedService.tablesDirty.cashFlowPlan) {
            this.sharedService.tablesDirty.cashFlowPlan = true;
          }
          setTimeout(
            () => {
              for (let i = 0; i < changes.length; i++) {
                this.chart.ref.series[0].data[changes[i][0]].update({y: changes[i][3]});
              }
            }, 100);
          this.tableChangingSub.next(true);
          return true;
        },
        afterChange: () => {
          this.tableDataSaved = hotInstance.getData();
          this.tableCols = hotInstance.countCols();
          this.savingData();
        }
      });
      hotInstance.setDataAtCell(0, 1, 0);
      // hotInstance.setDataAtCell(hotInstance.countRows() - 1, 1, this.costOfProject);
      this.spinnerChecking = true;
    } catch {}
    if (this.isReadOnly) {
      hotInstance.updateSettings({
        cells: (row, col, prop) => {
          const cellProperties: any = {};
          cellProperties.readOnly = true;
          return cellProperties;
        }
      });
    }
      setTimeout(() => {
      this.tableCheck = true;

    }, 100);
  }

  savingData() {
    this.sharedService.stepFormsData.cashFlowPlanForm.date = [];
    this.sharedService.stepFormsData.cashFlowPlanForm.date = this.tableDataSaved.map(a => a[0]);
    try {
      this.sharedService.stepFormsData.cashFlowPlanForm.data = [];
    } catch {
    }
        this.sharedService.stepFormsData.cashFlowPlanForm.data = this.tableDataSaved.map(v => v[1]);
  }
}
