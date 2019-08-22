import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SharedService } from '../../../../shared/services/shared.service';
import { HotTableRegisterer } from '@handsontable-pro/angular';
import { Chart } from 'angular-highcharts';
import * as Highcharts from 'highcharts';
import { ZonesList } from '../../../../shared/models/zones.model';
import { isUndefined } from 'util';
import { AlertsService } from '../../../../shared/services/alerts.service';
import * as moment from 'jalali-moment';
import { PlanActPropAddRowComponent } from '../../plan-acts-prop-form/plan-act-prop-add-row/plan-act-prop-add-row.component';
import { MatDialog } from '@angular/material';
import { GenerateDatesService } from '../../../../shared/services/generate-dates.service';
import { Subject } from 'rxjs/index';
import { PlanActPropDeleteRowComponent } from '../../plan-acts-prop-form/plan-act-prop-delete-row/plan-act-prop-delete-row.component';

@Component({
  selector: 'app-deliverables-box',
  templateUrl: './deliverables-box.component.html',
  styleUrls: ['./deliverables-box.component.scss']
})
export class DeliverablesBoxComponent implements OnInit, OnDestroy {
  @Input() instance;
  @Input() indexx;
  @Input() deliIndex;
  @Input() serviceId;
  @Input() delId;
  @Input() zoneShow;
  @Input() measureUnit;
  @Input() dell;
  @Input() zones: ZonesList[] = [];
  tableData = [];
  tableCols = 0;
  data = [];
  columns;
  colHeaders = [];
  colHeadersMain = [];
  column = [];
  checkTableFinishCreating = false;
  chart;
  chartOptions;
  counter = 0;
  isReadOnly: boolean;
  options = {
    stretchH: 'all',
    rowHeights: 26,
    height: 400,
    rowHeaders: true,
  };
  deliverablesForm: any;
  tableCheck = false;
  public tableChangingSub = new Subject();
  spinnerChecking = false;
  changedDates;

  constructor(private sharedService: SharedService,
              private hotRegisterer: HotTableRegisterer,
              private alertsService: AlertsService,
              private dialog: MatDialog,
              private generateDatesService: GenerateDatesService) {
  }

  ngOnInit() {
    console.log(this.instance);
    this.isReadOnly = this.sharedService.isReadOnly;
    this.deliIndex = this.sharedService.stepFormsData.deliverablesForm.findIndex(a => a.serviceId === this.serviceId);
    this.deliverablesForm = this.sharedService.stepFormsData.deliverablesForm[this.deliIndex];
    let changedDates;
    if (this.deliverablesForm.date) {
      changedDates = this.generateDatesService.initiateDate(this.dell.date[this.indexx]);
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
    setTimeout(() => {
      this.buildTableTest(changedDates);
      this.tableChangingSub.subscribe(
        () => {
          if (this.tableCheck) {
            this.sharedService.stepsDirty.deliverable = true;
          }
        }
      );
    }, 100);
  }

  savingData() {
    if (this.sharedService.stepFormsData.deliverablesForm[this.deliIndex].date[0] === []) {
      this.sharedService.stepFormsData.deliverablesForm[this.deliIndex].date[this.indexx] = [];
      this.sharedService.stepFormsData.deliverablesForm[this.deliIndex].date[this.indexx] = this.tableData.map(a => a[0]);
    } else {
      this.sharedService.stepFormsData.deliverablesForm[this.deliIndex].date[this.indexx] = this.tableData.map(a => a[0]);
      // for (let i = 0; i < this.sharedService.stepFormsData.deliverablesForm[this.deliIndex].date.length; i++) {
      //   console.log(i);
      //   this.sharedService.stepFormsData.deliverablesForm[this.deliIndex].date[i] = this.tableData.map(a => a[0]);
      // }
      // this.sharedService.stepFormsData.deliverablesForm[this.deliIndex].date = [];
      // this.sharedService.stepFormsData.deliverablesForm[this.deliIndex].date[this.indexx] = [];
      // this.sharedService.stepFormsData.deliverablesForm[this.deliIndex].date[this.indexx] = this.tableData.map(a => a[0]);
    }
    try {
      this.sharedService.stepFormsData.deliverablesForm[this.deliIndex].data[this.indexx] = [];
    } catch {
      this.sharedService.stepFormsData.deliverablesForm[this.deliIndex].data = [];
      this.sharedService.stepFormsData.deliverablesForm[this.deliIndex].data[this.indexx] = [];
    }
    for (let j = 0; j < this.tableCols - 1; j++) {
      this.sharedService.stepFormsData.deliverablesForm[this.deliIndex].data[this.indexx][j] = this.tableData.map(a => a[j + 1]);
    }
  }

  ngOnDestroy() {
    this.savingData();
  }

  getCSV() {
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    const exportPlugin = hotInstance.getPlugin('exportFile');
    exportPlugin.downloadFile('csv', {filename: 'ProgressPLan', columnHeaders: true, range: [0, 0, hotInstance.countRows(), this.colHeaders.length - 1]});
  }

  getSum(total, num) {
    return total + num;
  }

  sumChanges() {
    const hotInstance2 = this.hotRegisterer.getInstance(this.instance);
    for (let i = 1; i <= hotInstance2.countCols(); i++) {
      const data = [];
      // console.log(hotInstance.getData().filter(v => v[i] !== undefined && v[i] !== '' && v[i] !== null));
      // console.log(hotInstance.getData().filter(v => v[i] !== undefined && v[i] !== '' && v[i] !== null).map(v2 => v2[i]));
      // console.log(hotInstance.getData().map(v2 => v2[i]));
      const sum = (+hotInstance2.getData().map(v2 => +v2[i]).reduce(this.getSum)).toFixed(3);
      console.log(sum);
      this.colHeaders[i] = this.colHeadersMain[i] + ' = ' + +sum + ' ' + this.measureUnit;
    }
    hotInstance2.updateSettings({
      colHeaders: this.colHeaders,
    });
  }

  buildTableTest(mainDate) {
    console.log(mainDate);
    this.column = [{
      type: 'text',
      readOnly: true,
      width: '80'
    }];
    const obj = [];
    this.colHeaders[0] = 'تاریخ';
    this.colHeadersMain[0] = 'تاریخ';

    if (this.zoneShow) {
      for (let i = 0; i < mainDate.length; i++) {
        obj.push([mainDate[i]]);
        for (let j = 0; j < this.dell.zone_deliverables[this.indexx].length; j++) {
          let act;
          let plan;
          if (this.deliverablesForm.data) {
            if (this.deliverablesForm.data[this.indexx]) {
              if (this.deliverablesForm.data[this.indexx][j * 2]) {
                if (+new Date(mainDate[i]) > +new Date(this.sharedService.stepFormsData.contractsForm.FinishDate_Contract)) {
                  plan = '';
                } else {
                  if (this.deliverablesForm.data[this.indexx][j * 2][i]) {
                    plan = this.deliverablesForm.data[this.indexx][j * 2][i];
                  } else {
                    plan = null;
                  }
                }
              } else {
                plan = '';
              }
            } else {
              plan = '';
            }
            if (this.deliverablesForm.data[this.indexx]) {
              if (this.deliverablesForm.data[this.indexx][j * 2 + 1]) {
                if (this.deliverablesForm.data[this.indexx][j * 2 + 1][i]) {
                  act = this.deliverablesForm.data[this.indexx][j * 2 + 1][i];
                } else {
                  act = null;
                }
              } else {
                act = '';
              }
            } else {
              act = '';
            }
          } else {
            act = '';
            plan = '';
          }
          if (isUndefined(act)) {
            act = null;
          }
          if (isUndefined(plan)) {
            plan = null;
          }
          const zoneName = this.getZoneName(this.deliverablesForm.zone_deliverables[this.indexx][j]);
          if (i === 0) {
            this.column.push({
              type: 'numeric',
            });
            this.column.push({
              type: 'numeric',
            });
            this.colHeaders[this.colHeaders.length] = zoneName + ' (برنامه ای) ';
            this.colHeadersMain[this.colHeadersMain.length] = zoneName + ' (برنامه ای) ';
            this.colHeaders[this.colHeaders.length] = zoneName + ' (واقعی) ';
            this.colHeadersMain[this.colHeadersMain.length] = zoneName + ' (واقعی) ';
          }
          obj[obj.length - 1].push(plan, act);
        }
      }
    } else {
      for (let i = 0; i < mainDate.length; i++) {
        obj.push([mainDate[i]]);
        for (let j = 0; j < 2; j++) {
          let act;
          if (this.deliverablesForm.data) {
            if (this.deliverablesForm.data[this.indexx]) {
              act = this.deliverablesForm.data[this.indexx][j][i];
            } else {
              act = '';
            }
          } else {
            act = '';
          }
          if (isUndefined(act)) {
            act = null;
          }
          const zoneName = this.deliverablesForm.name_Deliverable[this.indexx].Name;
          if (i === 0) {
            this.column.push({
              type: 'numeric',
            });
            if (j % 2 === 0) {
              this.colHeaders[this.colHeaders.length] = zoneName + ' (برنامه ای) ';
              this.colHeadersMain[this.colHeadersMain.length] = zoneName + ' (برنامه ای) ';
            } else {
              this.colHeaders[this.colHeaders.length] = zoneName + ' (واقعی) ';
              this.colHeadersMain[this.colHeadersMain.length] = zoneName + ' (واقعی) ';
            }
          }
          obj[obj.length - 1].push(act);
        }
      }
    }

    this.colHeaders[this.colHeaders.length] = 'حذف';
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    console.log(this.instance);
    console.log(hotInstance);
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
        afterOnCellMouseDown: (event, coords, TD) => {
          if (event.realTarget.nodeName.toLowerCase() === 'i' && coords.col === hotInstance.countCols() - 1) {
            this.alertsService.alertsRemove().then((result) => {
              if (result.value) {
                this.click(event, coords, TD);
              }
            });
          }
        },
        beforeChange: (changes, source) => {
          this.tableChangingSub.next(true);
        },
        afterChange: () => {
          this.sumChanges();
          this.tableData = hotInstance.getData();
          this.tableCols = hotInstance.countCols();
          this.savingData();
        }
      });
      setTimeout(() => {
        this.sumChanges();
        if (this.isReadOnly) {
          hotInstance.updateSettings({
            cells: (row, col, prop) => {
              const cellProperties: any = {};
              cellProperties.readOnly = true;
              return cellProperties;
            }
          });
        } else {
          this.setReadOnly();
        }
        this.tableCheck = true;
      }, 100);
      this.spinnerChecking = true;
    } catch {
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
        let finalDate = this.sharedService.stepFormsData.contractsForm.FinishDate_Contract;
        const mainDate = moment(this.sharedService.todayData, 'YYYY/M/D');
        const todayFa = mainDate.format('jYYYY/jM/jD');
        if (new Date(this.sharedService.stepFormsData.contractsForm.FinishDate_Contract) < new Date(todayFa)) {
          finalDate = todayFa;
        }
        const allTime = hotInstance.getData().map(v => +new Date(v[0]));
        if (allTime.indexOf(+new Date(result.format('jYYYY/jM/jD'))) !== -1) {
          text = '<p style="direction: rtl;text-align: right;"><span style="color: darkred;">- </span><span>تاریخ تکراری است!</span></p>';
        } else if (new Date(result.format('YYYY/MM/DD')).getTime() < allTime[0] || +new Date(result.format('YYYY/MM/DD')) > +new Date(finalDate)) {
          text = text + '<p style="direction: rtl;text-align: right;"><span style="color: darkred;">- </span><span>تاریخ اشتباه است!</span></p>';
        }
        if (text !== '') {
          this.alertsService.alertsWrong2(text).then((result2) => {
          });
        } else {
          this.alertsService.alertsSubmit().then((result2) => {
            this.addRow(result.format('YYYY/MM/DD'));
          });
        }
      }
      hotInstance.deselectCell();
      this.sharedService.stepsDirty.deliverable = true;
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
      this.sumChanges();
      this.tableData = hotInstance.getData();
      this.tableCols = hotInstance.countCols();
      this.savingData();
      this.sharedService.stepsDirty.deliverable = true;
    });
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
    } catch {
    }
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

  click(event, coords, TD) {
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    hotInstance.alter('remove_row', +coords.row);
    setTimeout(() => {
      this.setReadOnly();
    }, 100);
  }

  getZoneName(zoneId) {
    return this.zones.filter(a => a.Id === zoneId)[0].Name;
  }

  sum_odd(rowNumbers: number) {
    const arr = [];
    for (let i = 0; i < rowNumbers - 1; i++) {
      if (i % 2 === 1) {
        arr.push(i);
      }
    }
    return arr;
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
