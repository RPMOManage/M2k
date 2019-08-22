import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { HotTableRegisterer } from '@handsontable-pro/angular';
import * as Highcharts from 'highcharts';
import { Chart } from 'angular-highcharts';
import { SharedService } from '../../../shared/services/shared.service';
import { StepCustomChangesList } from '../../../shared/models/stepFormModels/stepCustomChanges.model';
import { ContractServicesList } from '../../../shared/models/contractServices.model';
import { CurrencyList } from '../../../shared/models/currency.model';
import { PlanActPropAddRowComponent } from '../plan-acts-prop-form/plan-act-prop-add-row/plan-act-prop-add-row.component';
import { MatDialog } from '@angular/material';
import { AlertsService } from '../../../shared/services/alerts.service';
import { isUndefined } from 'util';
import * as moment from 'jalali-moment';

@Component({
  selector: 'app-custom-changes',
  templateUrl: './custom-changes.component.html',
  styleUrls: ['./custom-changes.component.scss']
})
export class CustomChangesComponent implements OnInit {
  @Output() tableData = new EventEmitter();
  options: any = {
    rowHeaders: true,
    stretchH: 'all',
    height: 200,
    columns: [],
    colHeaders: []
  };
  costColumn: any = [{
    type: 'text',
    readOnly: true,
    width: '100%'
  }, {
      type: 'numeric',
      numericFormat: {
        pattern: '0,00'
      },
      width: '80%'
    },
  ];
  finishDateOptions: any = {
    rowHeaders: true,
    stretchH: 'all',
    height: 200,
    columns: [],
    colHeaders: []
  };
  finishDateColumn: any = [{
    type: 'text',
    readOnly: true,
    width: '100%'
  },
    {
      type: 'text',
      readOnly: true,
      width: '100%'
    }];
  progressPlanExtensionOptions: any = {
    rowHeaders: true,
    stretchH: 'all',
    height: 420,
  };
  costInstance = 'hotCostExtensionInstance';
  finishDateInstance = 'hotFinishDateExtensionInstance';
  progressPlanExtensionInstance = 'hotProgressPlanExtensionInstance';
  chart;
  chartOptions;
  customChangesData = new StepCustomChangesList();
  colHeaders = [];
  chartHeaders = [];
  column;
  contractServices: ContractServicesList[];
  contractCurrencies: CurrencyList[] = [];
  @Output() RemoveColumnAdded = new EventEmitter();
  declareDate = null;
  selectedCustomChangesDatePicker = null;
  @ViewChild('CustomChangesDatePicker') CustomChangesDatePicker;

  constructor(private sharedService: SharedService,
                      private hotRegisterer: HotTableRegisterer,
                      private dialog: MatDialog,
                      private alertsService: AlertsService) { }

  ngOnInit() {
          this.sharedService.getContractServices().subscribe(
            (data1) => {
              this.contractServices = data1;
              this.sharedService.getContractCurrencies().subscribe(
                (currency: CurrencyList[]) => {
                  this.contractCurrencies = currency;
                  if (this.sharedService.stepFormsData.newJson) {
                    this.customChangesData = this.sharedService.stepFormsData.newJson;
                    this.buildChart();
                    this.buildCostTable();
                    this.buildFinishDateTable();
                    this.buildProgressPlanExtensionTable();
                    this.declareDate = this.sharedService.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs;
                  }
                }
              );
            });
  }

  addRowPopUp(instance) {
    const hotInstance = this.hotRegisterer.getInstance(instance);
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
        const text = '';
        if (text !== '') {
          this.alertsService.alertsWrong2(text).then((result2) => {
          });
        } else {
          this.alertsService.alertsSubmit().then((result2) => {
            this.addRow(result.format('YYYY/MM/DD'), instance);
          });
        }
      }
      hotInstance.deselectCell();
    });
  }

  addRow(newRowDate, instance) {
    const hotInstance = this.hotRegisterer.getInstance(instance);
    hotInstance.setDataAtCell(hotInstance.countRows(), 0, newRowDate);
    hotInstance.setDataAtCell(hotInstance.countRows() - 1, hotInstance.countCols() - 1,
      '<i _ngcontent-c4="2" style="z-index: 9;position: absolute;cursor: pointer;color: #9a1d1d;" class="fa fa-times" aria-hidden="true"></i>');
    setTimeout(() => {
      hotInstance.updateSettings({
        columnSorting: {
          column: 0,
          sortOrder: 'asc'
        }
      });
      const daDateD = hotInstance.getData().map(a => a[0]);
      hotInstance.selectRows(hotInstance.toVisualRow(daDateD.findIndex(a => +new Date(a) === +new Date(newRowDate))) - 1);
    }, 300);
  }

  getCSV(instance) {
    const hotInstance = this.hotRegisterer.getInstance(instance);
    const exportPlugin = hotInstance.getPlugin('exportFile');
    exportPlugin.downloadFile('csv', {filename: 'تغییرات مبلغ قرارداد', columnHeaders: true, range: [0, 0, hotInstance.countRows(), this.colHeaders.length - 1]});
  }

  click(event, coords, TD, instance) {

    const hotInstance = this.hotRegisterer.getInstance(instance);
    hotInstance.alter('remove_row', +coords.row);
    setTimeout(() => {
    }, 100);
  }

  buildCostTable() {
    const obj = [];
    let costColHeaders = [];
    const hotInstance = this.hotRegisterer.getInstance(this.costInstance);
    if (this.sharedService.stepFormsData.contractsForm.Id_Currency === 'IRR') {
      costColHeaders = ['تاریخ ابلاغ', 'مبلغ پس از ابلاغ (ریال)'];
      for (let i = 0; i < this.customChangesData.costTable.DDate.length; i++) {
        obj.push([this.customChangesData.costTable.DDate[i], this.customChangesData.costTable.Cost[i], '<i _ngcontent-c4="2" style="z-index: 9;position: absolute;cursor: pointer;color: #9a1d1d;" class="fa fa-times" aria-hidden="true"></i>']);
      }
    } else {
      this.costColumn.push({
        type: 'numeric',
        numericFormat: {
          pattern: '0,00'
        },
        width: '80%'
      });
      const currency = this.contractCurrencies.filter(v => v.Id === this.sharedService.stepFormsData.contractsForm.Id_Currency)[0].Name;
      costColHeaders = ['تاریخ ابلاغ', 'مبلغ پس از ابلاغ (ریال)', 'مبلغ پس از ابلاغ (' + currency + ')'];
      for (let i = 0; i < this.customChangesData.costTable.DDate.length; i++) {
        obj.push([this.customChangesData.costTable.DDate[i], this.customChangesData.costTable.Cost[i], this.customChangesData.costTable.eqCost[i], '<i _ngcontent-c4="2" style="z-index: 9;position: absolute;cursor: pointer;color: #9a1d1d;" class="fa fa-times" aria-hidden="true"></i>']);
      }
    }
    costColHeaders.push('Del');
    this.costColumn.push({
      renderer: 'html',
      readOnly: true,
      width: '40px'

    });
    hotInstance.updateSettings({
      data: obj,
      colHeaders: costColHeaders,
      columns: this.costColumn,
      columnSorting: {
        column: 0,
        sortOrder: 'asc'
      },
      afterOnCellMouseDown: (event, coords, TD) => {
        if (event.realTarget.nodeName.toLowerCase() === 'i' && coords.col === hotInstance.countCols() - 1) {
          this.alertsService.alertsRemove().then((result) => {
            if (result.value) {
              this.click(event, coords, TD, this.costInstance);
            }
          });
        }
      },
    });
  }

  buildFinishDateTable() {
    const obj = [];
    const finishDateColHeaders = ['تاریخ انعقاد', 'تاریخ پایان پس از ابلاغ'];
    for (let i = 0; i < this.customChangesData.endDateTable.DDate.length; i++) {
      obj.push([this.customChangesData.endDateTable.DDate[i], this.customChangesData.endDateTable.EndDate[i], '<i _ngcontent-c4="2" style="z-index: 9;position: absolute;cursor: pointer;color: #9a1d1d;" class="fa fa-times" aria-hidden="true"></i>']);
    }
    const hotInstance = this.hotRegisterer.getInstance(this.finishDateInstance);
    finishDateColHeaders.push('Del');
    this.finishDateColumn.push({
      renderer: 'html',
      readOnly: true,
      width: '40px'

    });
    hotInstance.updateSettings({
      data: obj,
      columns: this.finishDateColumn,
      colHeaders: finishDateColHeaders,
      columnSorting: {
        column: 0,
        sortOrder: 'asc'
      },
      afterOnCellMouseDown: (event, coords, TD) => {
        if (coords.col === 1) {
          this.selectedCustomChangesDatePicker = moment(event.srcElement.innerHTML, 'jYYYY/jMM/jDD');
          this.CustomChangesDatePicker.open();
        }
        if (event.realTarget.nodeName.toLowerCase() === 'i' && coords.col === hotInstance.countCols() - 1) {
          this.alertsService.alertsRemove().then((result) => {
            if (result.value) {
              this.click(event, coords, TD, this.finishDateInstance);
            }
          });
        }
      }
    });
  }

  buildProgressPlanExtensionTable() {
    this.column = [{
      type: 'text',
      readOnly: true,
      width: '80'
    }];
    const obj = [];
    for (let i = 0; i < this.customChangesData.progressTable.Date.length; i++) {
      obj.push([this.customChangesData.progressTable.Date[i]]);
      for (let s = 0; s < this.customChangesData.progressTable.Data.length; s++) {
            obj[obj.length - 1].push((this.customChangesData.progressTable.Data[s][i]));
      }
    }
    const servicesId = [];
    for (let i = 0; i < this.sharedService.stepFormsData.contractsForm.ContractNatureId.length; i++) {
      if (this.sharedService.stepFormsData.contractsForm.ContractNatureId[i]) {
        this.column.push({
          type: 'numeric',
          numericFormat: {
            pattern: '0.00%'
          },
        });
        const jab = obj.map((v, counter) => ({
            x: +new Date(v[0]),
            y: this.customChangesData.progressTable.Data[servicesId.length][counter]
          }));
        this.chart.addSeries({
          name: this.contractServices[i].Name,
          data: jab,
        }, true);
        servicesId.push({
          serviceId: i,
          serviceName: this.contractServices[i].Name
        });
      }
    }
    this.colHeaders[0] = 'تاریخ';
    for (let i = 0; i < servicesId.length; i++) {
        this.colHeaders[i + 1] = servicesId[i].serviceName + ' (برنامه ای) ';
        this.chartHeaders[i] =  'برنامه ای'  + ' | ' + servicesId[i].serviceName;
    }

    const hotInstance = this.hotRegisterer.getInstance(this.progressPlanExtensionInstance);
    hotInstance.updateSettings({
      colHeaders: this.colHeaders,
      columns: this.column,
      data: obj,
      columnSorting: {
        column: 0,
        sortOrder: 'asc'
      },
    });
  }

  buildChart() {
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
        name: 'مبلغ ( میلیون )'
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
            '<p style="direction: ltr;" class="highchart-Tooltip">' + 'مقدار : ' + Highcharts.numberFormat(Math.abs(this.point.y * 100), 2) + '</p>';
        }
      },
      series: []
    };
    this.chart = new Chart(this.chartOptions);
  }
}
