import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SharedService } from '../../../shared/services/shared.service';
import { HotTableRegisterer } from '@handsontable-pro/angular';
import { StepProgressPlansFormList } from '../../../shared/models/stepFormModels/stepProgressPlansForm.model';
import { Chart } from 'angular-highcharts';
import * as Highcharts from 'highcharts';
import { ContractServicesList } from '../../../shared/models/contractServices.model';
import { MatDialog } from '@angular/material';
import { PlanActPropAddRowComponent } from './plan-act-prop-add-row/plan-act-prop-add-row.component';
import { isUndefined } from 'util';
import { AlertsService } from '../../../shared/services/alerts.service';
import * as moment from 'jalali-moment';
import { PlanActPropChartComponent } from './plan-act-prop-chart/plan-act-prop-chart.component';
import { Subject } from 'rxjs/index';
import { GenerateDatesService } from '../../../shared/services/generate-dates.service';
import { PlanActPropDeleteRowComponent } from './plan-act-prop-delete-row/plan-act-prop-delete-row.component';

@Component({
  selector: 'app-plan-acts-prop-form',
  templateUrl: './plan-acts-prop-form.component.html',
  styleUrls: ['./plan-acts-prop-form.component.scss']
})
export class PlanActsPropFormComponent implements OnInit {
  @Output() tableData = new EventEmitter();
  @Output() RemoveColumnAdded = new EventEmitter();
  @Input() instance;
  @Input() contractServices2: ContractServicesList[];
  tableDataSaved = [];
  tableCols = 0;
  contractServices: ContractServicesList[];
  colHeaders = [];
  chartHeaders = [];
  column;
  planActProps: StepProgressPlansFormList;
  data = [];
  chart;
  chartOptions;
  isReadOnly: boolean;
  contractDates = {
    declare: '',
    start: '',
    finish: ''
  };
  options: any = {
    rowHeaders: true,
    stretchH: 'all',
    minRow: 20,
    height: 400,
    // columnSorting: {
    //   column: 0,
    //   sortOrder: 'asc'
    // },
    colWidths: [45, 45, 45, 45, 45, 45, 45, 45],
    afterValidate: (isValid, value, row, prop, source) => {
      const hotInstance = this.hotRegisterer.getInstance(this.instance);
      if (value >= 0 && value <= 1) {
        return true;
      } else {
        return false;
      }
    },
  };
  tableCheck = false;
  public tableChangingSub = new Subject();
  spinnerChecking = false;
  changedDates;


  constructor(private sharedService: SharedService,
              private hotRegisterer: HotTableRegisterer,
              private dialog: MatDialog,
              private alertsService: AlertsService,
              private generateDatesService: GenerateDatesService) {
  }

  ngOnInit() {
    let changedDates;
    if (this.sharedService.stepFormsData.progressPlansForm) {
      changedDates = this.generateDatesService.initiateDate(this.sharedService.stepFormsData.progressPlansForm.date);
      this.changedDates = changedDates;
    } else {
      changedDates = this.generateDatesService.initiateDate(null);
    }
    this.changedDates = changedDates;
    let finishDate = this.sharedService.stepFormsData.contractsForm.FinishDate_Contract;
    const mainDate22 = moment(this.sharedService.todayData, 'YYYY/M/D');
    const todayFa = mainDate22.format('jYYYY/jM/jD');
    if (+new Date(finishDate) < +new Date(todayFa)) {
      finishDate = todayFa;
    }
    changedDates = changedDates.filter(v => {
      if (+new Date(v) >= +new Date(this.sharedService.stepFormsData.contractsForm.StartDate_Contract) &&
      +new Date(v) <= +new Date(finishDate)
      ) {
        return v;
      }
    });
    this.isReadOnly = this.sharedService.isReadOnly;
    setTimeout(() => {
      this.contractDates.declare = this.sharedService.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs;
      this.contractDates.start = this.sharedService.stepFormsData.contractsForm.StartDate_Contract;
      this.contractDates.finish = this.sharedService.stepFormsData.contractsForm.FinishDate_Contract;
      let mainDate;
      let haveData = false;
      if (this.sharedService.stepFormsData.progressPlansForm) {
        this.planActProps = this.sharedService.stepFormsData.progressPlansForm;
        mainDate = this.planActProps.date;
        if (this.planActProps.data) {
          haveData = true;
        }
      } else {
        for (let i = 0; i < this.sharedService.stepFormsData.progressPlansForm.data.length; i++) {
          this.sharedService.stepFormsData.progressPlansForm.data[i].plan = [];
          this.sharedService.stepFormsData.progressPlansForm.data[i].act = [];
          this.sharedService.stepFormsData.progressPlansForm.data[i].LastActPC = null;
          this.sharedService.stepFormsData.progressPlansForm.data[i].startFinish = null;
          this.sharedService.stepFormsData.progressPlansForm.date = [];
        }
        this.planActProps = this.sharedService.stepFormsData.progressPlansForm;
      }
      if (this.planActProps && this.sharedService.stepFormsData.contractsForm.StartDate_Contract && this.sharedService.stepFormsData.contractsForm.FinishDate_Contract) {
        this.buildChart();
        setTimeout(() => {
          this.sharedService.getContractServices().subscribe(
            (data1) => {
              this.contractServices = data1;
                this.buildTableTest(changedDates);
                setTimeout(() => {
                }, 500);
            }
          );
        }, 100);
      }
    }, 100);
    this.tableChangingSub.subscribe(
      () => {
        if (this.tableCheck) {
          this.sharedService.stepsDirty.planActsProp = true;
        }
      }
    );
  }

  showChart() {
    const dialogRef = this.dialog.open(PlanActPropChartComponent, {
      width: '1300px',
      height: '600px',
      data: {
        tableData: this.hotRegisterer.getInstance(this.instance).getData(),
        chartHeaders: this.chartHeaders,
        planActPropsDataLength: this.planActProps.data.length,
        colHeaders: this.colHeaders,
      }
    });
  }

  buildTableTest(mainDate) {
    const mainDate2 = moment(this.sharedService.todayData, 'YYYY/M/D');
    const todayFa = mainDate2.format('jYYYY/jM/jD');
    // this.sharedService.stepsDirty.planActsProp = true;
    this.column = [{
      type: 'text',
      readOnly: true,
      width: '80'
    }];
    const obj = [];
    if (this.sharedService.stepFormsData.progressPlansForm) {
      for (let i = 0; i < mainDate.length; i++) {
        obj.push([mainDate[i]]);
        for (let j = 0; j < this.planActProps.data.length; j++) {
          let act, plan;
          if (!this.planActProps.data[j].act) {
            act = '';
          } else {
            if (+new Date(mainDate[i]) > +new Date(todayFa)) {
              act = '';
            } else {
              act = this.planActProps.data[j].act[i];
            }
          }
          if (!this.planActProps.data[j].plan) {
            plan = '';
          } else {
            if (+new Date(mainDate[i]) > +new Date(this.sharedService.stepFormsData.contractsForm.FinishDate_Contract)) {
              plan = '';
            } else {
              plan = this.planActProps.data[j].plan[i];
            }
          }
          if (isUndefined(act)) {
            act = '';
          }
          if (isUndefined(plan)) {
            plan = '';
          }
          if (j === 0) {
            if (+new Date(mainDate[i]) === +new Date(this.contractDates.finish)) {
              // plan = 1;
            }
            if (+new Date(mainDate[i]) === +new Date(this.contractDates.start)) {
              // plan = 0;
              // act = 0;
            }
          }
          obj[obj.length - 1].push(plan, act);
        }
      }
    }

    const servicesId = [];
    for (let i = 0; i < this.sharedService.stepFormsData.contractsForm.ContractNatureId.length; i++) {
      if (this.sharedService.stepFormsData.contractsForm.ContractNatureId[i]) {
        if (+this.contractServices[i].PCType > 0) {
          servicesId.push({
            serviceId: i,
            serviceName: this.contractServices[i].Name
          });
        }
      }
    }
    this.colHeaders[0] = 'تاریخ';
    if (servicesId.length > 1) {
      for (let i = 0; i < servicesId.length + 1; i++) {
        const act = [];
        const plan = [];
        if (i === 0) {
          this.colHeaders[(i) * 2 + 2] = ' کلی' + ' (واقعی) ';
          this.colHeaders[(i) * 2 + 1] = ' کلی' + ' (برنامه ای) ';
          this.chartHeaders[(i) * 2 + 2] = 'واقعی' + ' | ' + ' کلی';
          this.chartHeaders[(i) * 2 + 1] = 'برنامه ای' + ' | ' + ' کلی';
        } else {
          this.colHeaders[(i) * 2 + 2] = servicesId[i - 1].serviceName + ' (واقعی) ';
          this.colHeaders[(i) * 2 + 1] = servicesId[i - 1].serviceName + ' (برنامه ای) ';
          this.chartHeaders[(i) * 2 + 2] = 'واقعی' + ' | ' + servicesId[i - 1].serviceName;
          this.chartHeaders[(i) * 2 + 1] = 'برنامه ای' + ' | ' + servicesId[i - 1].serviceName;
        }
      }
    } else {
      this.colHeaders[(0) * 2 + 2] = servicesId[0].serviceName + ' (واقعی) ';
      this.colHeaders[(0) * 2 + 1] = servicesId[0].serviceName + ' (برنامه ای) ';
      this.chartHeaders[(0) * 2 + 2] = 'واقعی' + ' | ' + servicesId[0].serviceName;
      this.chartHeaders[(0) * 2 + 1] = 'برنامه ای' + ' | ' + servicesId[0].serviceName;
    }

    if (this.sharedService.stepFormsData.progressPlansForm) {
      const dates = obj.map(v => v[0]);
      for (let i = 0; i < (+this.colHeaders.length - 1) / 2; i++) {
        const jab = obj.map((v, counter) => ({
          x: new Date(dates[counter]),
          y: this.checkDataZeroforChart(v[(i) * 2 + 1])
        }));
        const jab2 = obj.map((v, counter) => ({
          x: new Date(dates[counter]),
          y: this.checkDataZeroforChart(v[(i) * 2 + 2])
        }));
        this.column.push({
          type: 'numeric',
          numericFormat: {
            pattern: '0.00%'
          },
        });
        this.column.push({
          type: 'numeric',
          numericFormat: {
            pattern: '0.00%'
          },
        });
          this.chart.addSeries({
          name: this.chartHeaders[(i) * 2 + 1],
          data: jab,
          color: 'blue'
        }, true);
        this.chart.addSeries({
          name: this.chartHeaders[(i) * 2 + 2],
          data: jab2,
          dashStyle: 'shortdash',
          color: 'red'
        }, true);
      }
    }
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    try {
      hotInstance.updateSettings({
        colHeaders: this.colHeaders,
        columns: this.column,
        data: obj,
        maxRows: mainDate.length,
        // columnSorting: {
        //   column: 0,
        //   sortOrder: 'asc'
        // },
        beforeChange: (changes, source) => {
          if (!this.sharedService.tablesDirty.planActsProp) {
            this.sharedService.tablesDirty.planActsProp = true;
          }
          setTimeout(
            () => {
              for (let i = 0; i < changes.length; i++) {
                if (this.chart.ref.series[changes[i][1] - 1]) {
                  if (changes[i][3] === '') {
                    this.chart.ref.series[changes[i][1] - 1].data[changes[i][0]].update({y: null});
                  } else {
                    this.chart.ref.series[changes[i][1] - 1].data[changes[i][0]].update({y: changes[i][3] * 100});
                  }
                }
              }
            }, 100);
          this.tableChangingSub.next(true);
          return true;
        },
        afterChange: () => {
          this.tableDataSaved = hotInstance.getData();
          this.tableCols = hotInstance.countCols();
          this.savingData();
        },
        afterOnCellMouseDown: (event, coords, TD) => {
          if (event.realTarget.nodeName.toLowerCase() === 'i' && coords.col === hotInstance.countCols() - 1) {
            this.alertsService.alertsRemove().then((result) => {
              if (result.value) {
                this.click(event, coords, TD);
              }
            });
          }
        },
      });
      this.spinnerChecking = true;
    } catch {}
    setTimeout(() => {
      this.tableCheck = true;
    }, 100);
    if (this.isReadOnly) {
      hotInstance.updateSettings({
        cells: (row, col, prop) => {
          const cellProperties: any = {};
          cellProperties.readOnly = true;
          return cellProperties;
        }
      });
    } else {
      setTimeout(() => {
        this.setReadOnly();
      }, 300);
    }

  }

  savingData() {
    this.sharedService.stepFormsData.progressPlansForm.date = [];
    this.sharedService.stepFormsData.progressPlansForm.date = this.tableDataSaved.map(a => a[0]);
    try {
      this.sharedService.stepFormsData.progressPlansForm.data = [];
    } catch {

    }
    let counter = 1;
    const isTotal = this.sharedService.stepFormsData.contractsForm.ContractNatureId.map(v => v === true).length > 0 ? true : false;
    if (isTotal) {
      this.sharedService.stepFormsData.progressPlansForm.data.push({
        ServiceId: 'T',
        plan: this.tableDataSaved.map(v => v[counter]),
        act: this.tableDataSaved.map(v => v[counter + 1]),
        LastActPC: null,
        startFinish: null,
      });
      counter += 2;
    }
    for (let i = 0; i < this.sharedService.stepFormsData.contractsForm.ContractNatureId.length; i++) {
      if (this.sharedService.stepFormsData.contractsForm.ContractNatureId[i]) {
        if (+this.contractServices[i].PCType > 0) {
          this.sharedService.stepFormsData.progressPlansForm.data.push({
            ServiceId: this.contractServices[i].Id,
            plan: this.tableDataSaved.map(v => v[counter]),
            act: this.tableDataSaved.map(v => v[counter + 1]),
            LastActPC: null,
            startFinish: null,
          });
          counter += 2;
        }
      }
    }
  }

  checkDataZeroforChart(value) {
    if (value !== '' && value !== null) {
      return value * 100;
    } else {
      return null;
    }
  }

  click(event, coords, TD) {
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    hotInstance.alter('remove_row', +coords.row);
    setTimeout(() => {
      this.setReadOnly();
    }, 100);
  }

  buildChart() {
    this.chartOptions = {
      chart: {
        type: 'spline',
        zoomType: 'x',
        height: 450,
        animation: true
      },
      plotOptions: {
        series: {
          connectNulls: true
        }
      },
      yAxis: {
        max: 100,
        min: 0,
        title: {
          text: 'درصد پیشرفت'
        },
        labels: {
          formatter: function () {
            return this.value + '%';
          }
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
      legend: {
        width: 600,
        itemWidth: 300,
        itemStyle: {
          width: 280
        },
        rtl: true,
      },
      dateFormat: 'YYYY/mm/dd',
      xAxis: {
        type: 'datetime',
        labels: {
          formatter: function () {
            const monthStr = Highcharts.dateFormat('%Y/%m/%e', this.value);
            return monthStr;
          }
        },
      },
      title: {
        text: ''
      },
      credits: {
        enabled: false
      },
      series: []
    };
    this.chart = new Chart(this.chartOptions);
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
        } else if (+new Date(result.format('jYYYY/jM/jD')) < +new Date(this.sharedService.stepFormsData.contractsForm.StartDate_Contract) || +new Date(result.format('jYYYY/jM/jD')) > +new Date(finalDate)) {
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
        this.savingData();
      }
      hotInstance.deselectCell();
      this.sharedService.stepsDirty.planActsProp = true;
    });
  }

  switchingMonth(month: number) {
    let selectedMonth;
    if (month < 7) {
      selectedMonth = 31;
    } else if (month > 6 && month < 12) {
      selectedMonth = 30;
    } else {
      selectedMonth = 29;
    }
    return selectedMonth;
  }

  setReadOnly() {
    const mainDate = moment(this.sharedService.todayData, 'YYYY/M/D');
    const today = mainDate.format('jYYYY/jM/jD');
    const hotInstance2 = this.hotRegisterer.getInstance(this.instance);
    let tableData;
    let tableCountRows;
    try {
      tableData = hotInstance2.getData();
      tableCountRows = hotInstance2.countRows();
    } catch {}
    hotInstance2.updateSettings({
      cells: (row, col, prop) => {
      }
    });
    hotInstance2.updateSettings({
      cells: (row, col, prop) => {
        const cellProperties: any = {};
        if (tableData[hotInstance2.toVisualRow(row)]) {
          if (col % 2 !== 0) {
            if (new Date(tableData[hotInstance2.toVisualRow(row)][0]) > new Date(this.sharedService.stepFormsData.contractsForm.FinishDate_Contract)) {
              cellProperties.readOnly = true;
            }
          } else {
            if ((new Date(tableData[hotInstance2.toVisualRow(row)][0]) > new Date(today))) {
              cellProperties.readOnly = true;
            }
          }
        }
        return cellProperties;
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
      this.setReadOnly();
    }, 300);
  }

  getCSV() {
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    const exportPlugin = hotInstance.getPlugin('exportFile');
    exportPlugin.downloadFile('csv', {filename: 'ProgressPLan', columnHeaders: true, range: [0, 0, hotInstance.countRows(), this.colHeaders.length - 1]});
  }

  sum_odd(rowNumbers: number) {
    const arr = [];
    for (let i = 0; i < rowNumbers; i++) {
      if (i % 2 === 1) {
        arr.push(i);
      }
    }
    return arr;
  }
}
