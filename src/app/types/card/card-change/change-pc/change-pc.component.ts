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
import { ContractServicesList } from '../../../../shared/models/contractServices.model';
import { ContractPCModel } from '../../../../shared/models/contractModels/contractPC.model';
import { ChangesModel } from '../../../../shared/models/contractModels/changes.model';

@Component({
  selector: 'app-change-pc',
  templateUrl: './change-pc.component.html',
  styleUrls: ['./change-pc.component.scss']
})
export class ChangePcComponent implements OnInit {
  @Input() contractID: number;
  @Input() versionID: number;
  @Input() contract: ContractModel;
  @Input() change: ChangesModel;
  @Input() instance: string;
  @Output() changeTabIndex = new EventEmitter();
  formGp: FormGroup;
  selectedNewCostDeclareDate = '';
  column;
  columnHeader;
  costCodes: { ID, DDate, EqCost, Cost }[] = [];
  checkTable = false;
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
  cashFlowPlans: { ID, cashFlowPlansPropCode, Date, Cost }[] = [];
  dataCounter = 0;
  pcProps: { ID, Service, Kind }[] = [];
  pcs: ContractPCModel[] = [];
  contractServices: ContractServicesList[] = [];
  finishDate: string;
  tempAddDates = [];

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
    if (this.change.Json.ChangeFinishDate) {
      if (this.change.Json.ChangeFinishDate.Date) {
        this.finishDate = this.change.Json.ChangeFinishDate.Date;
      }
    } else {
      this.finishDate = this.contract.FinishDate;
    }

    this.dataCounter = 0;
    this.contractService.getPCProps(this.contractID).subscribe(
      (pcProps: { ID, Service, Kind }[]) => {
        this.pcProps = pcProps.filter(v => v.ID > 0 && v.ID < 9);
        this.pcProps = pcProps;
        this.setData();
      }
    );
    this.contractService.getDashboardContractPCs(this.contractID, [1, 2, 3, 4, 5, 6, 7, 8]).subscribe(
      (pcs: ContractPCModel[]) => {
        this.pcs = pcs;
        this.setData();
      }
    );
    this.sharedService.getContractServices().subscribe(
      (data) => {
        this.contractServices = data;
        this.setData();
      });
    this.sharedService.getTodayDateFromContextInfo().subscribe();
    // this.contractService.getCostCode(this.contractID, this.versionID).subscribe(
    //   (costCodes) => {
    //     this.costCodes = costCodes;
    //     this.costCodes = this.costCodes.sort((a, b) => +new Date(b.DDate) - +new Date(a.DDate));
    //   }
    // );
    // this.contractService.getAllFinancialGrossAmounts(this.contractID, 'FinancialPayments').subscribe(
    //   (financialPayments) => {
    //     this.startDate = financialPayments[0].Date;
    //     this.finishDate = this.contract.FinishDate;
    //     setTimeout(() => {
    //       const changedDates = this.generateDatesService.changeInitiateDate(this.startDate, this.contract.FinishDate, true);
    //       this.buildTable(changedDates);
    //     }, 100);
    //   }
    // );
    this.formGp = this._formBuilder.group({
      Cost: new FormControl(null, [Validators.required]),
      EqCost: new FormControl(null),
      NewCostDeclareDate: new FormControl(null, [Validators.required]),
      Currency: new FormControl(null, [Validators.required]),
      Description: new FormControl(null, [Validators.required])
    });
  }

  setData() {
    this.dataCounter++;
    if (this.dataCounter === 3) {
      if (this.change.Json.ChangePC) {
        const obj = [];
        const nonDupDate = Array.from(new Set(this.change.Json.ChangePC.Date)).sort((a, b) => +new Date(a) - +new Date(b));
        nonDupDate.push(this.finishDate);
        nonDupDate.push(this.change.DDate);
        if (this.change.Json.ChangeFinishDate) {
          if (this.change.Json.ChangeFinishDate.Date) {
            if (+new Date(this.change.Json.ChangeFinishDate.Date) > +new Date(this.contract.FinishDate)) {
              const changedDates = this.generateDatesService.changeInitiateDate(nonDupDate[nonDupDate.length - 1], this.change.Json.ChangeFinishDate.Date, true);
              changedDates.map(v => {
                nonDupDate.push(v);
              });
            }
          }
        }
        const dates = Array.from(new Set(nonDupDate)).sort((a, b) => +new Date(a) - +new Date(b));
        this.column = [
          {
            type: 'text',
            readOnly: true,
            width: '100%'
          },
        ];
        this.columnHeader = this.change.Json.ChangePC.ColHeaders;
        for (let i = 0; i < this.change.Json.ChangePC.Data.length; i++) {
          this.column.push({
            type: 'numeric',
            numericFormat: {
              pattern: '0.00%'
            },
          });
        }
        for (let i = 0; i < dates.length; i++) {
          if (+new Date(dates[i]) <= +new Date(this.finishDate)) {
            obj.push([
              dates[i],
            ]);
            for (let j = 0; j < this.change.Json.ChangePC.Data.length; j++) {
              obj[i].push(this.change.Json.ChangePC.Data[j][i]);
            }
          }
        }
        this.buildTable(obj);
      } else {
        const obj = [];
        const nonDupDate = Array.from(new Set(this.pcs.map(v => v.Date))).sort((a, b) => +new Date(a) - +new Date(b));
        nonDupDate.push(this.finishDate);
        nonDupDate.push(this.change.DDate);
        if (this.change.Json.ChangeFinishDate) {
          if (this.change.Json.ChangeFinishDate.Date) {
            if (+new Date(this.change.Json.ChangeFinishDate.Date) > +new Date(this.contract.FinishDate)) {
              const changedDates = this.generateDatesService.changeInitiateDate(nonDupDate[nonDupDate.length - 1], this.change.Json.ChangeFinishDate.Date, true);
              changedDates.map(v => {
                nonDupDate.push(v);
              });
            }
          }
        }
        const dates = Array.from(new Set(nonDupDate)).sort((a, b) => +new Date(a) - +new Date(b));
        this.column = [
          {
            type: 'text',
            readOnly: true,
            width: '100%'
          },
        ];
        this.columnHeader = ['تاریخ'];
        console.log(this.pcProps);
        for (let i = 0; i < this.pcProps.length; i++) {
          this.column.push({
            type: 'numeric',
            numericFormat: {
              pattern: '0.00%'
            },
          });
          this.columnHeader.push(this.contractServices.filter(v => +v.ServiceID === +this.pcProps[i].Service)[0].Name + this.pcProps[i].Kind);
        }
        for (let i = 0; i < dates.length; i++) {
          if (+new Date(dates[i]) <= +new Date(this.finishDate)) {
            obj.push([
              dates[i],
            ]);
            for (let j = 0; j < this.pcProps.length; j++) {
              let data = null;
              const pcPropPCs = this.pcs.filter(v => +new Date(v.Date) === +new Date(dates[i]) && +v.PCProp === +this.pcProps[j].ID);
              if (pcPropPCs.length > 0) {
                data = pcPropPCs[0].PC;
              }
              if (+new Date(dates[i]) < +new Date(this.change.DDate) && j % 2 === 0) {
                data = null;
              }
              obj[i].push(data);
            }
          }
        }
        this.buildTable(obj);
      }
    }
  }

  setReadOnly() {
    const mainDate = moment(this.sharedService.todayData, 'YYYY/M/D');
    const today = mainDate.format('jYYYY/jM/jD');
    const hotInstance2: any = this.hotRegisterer.getInstance(this.instance);
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

    const changeItems: number[] = <any>this.change.ChangeItem;
    const changeReadOnlyBehaviors = {
      havePCPlan: false,
      havePCActs: false,
      haveTotalValue: false,
    };
    for (let i = 0; i < changeItems.length; i++) {
      if (changeItems[i] === 10) {
        changeReadOnlyBehaviors.havePCActs = true;
      }
      if (changeItems[i] === 11) {
        changeReadOnlyBehaviors.havePCPlan = true;
      }
      if (changeItems[i] === 9) {
        changeReadOnlyBehaviors.haveTotalValue = true;
      }
    }
    if (changeReadOnlyBehaviors.havePCPlan && !changeReadOnlyBehaviors.havePCActs) {
      hotInstance2.updateSettings({
        cells: (row, col, prop) => {
          const cellProperties: any = {};
          if (tableData[hotInstance2.toVisualRow(row)]) {
            if (col % 2 === 0) {
              cellProperties.readOnly = true;
            } else {
              if (+new Date(tableData[hotInstance2.toVisualRow(row)][0]) < +new Date(this.change.DDate) || +new Date(tableData[hotInstance2.toVisualRow(row)][0]) > +new Date(this.finishDate)) {
                cellProperties.readOnly = true;
              }
            }
          }
          return cellProperties;
        }
      });
    }
    if (!changeReadOnlyBehaviors.havePCPlan && changeReadOnlyBehaviors.havePCActs) {
      hotInstance2.updateSettings({
        cells: (row, col, prop) => {
          const cellProperties: any = {};
          if (tableData[hotInstance2.toVisualRow(row)]) {
            if (col % 2 === 0) {
              if (+new Date(tableData[hotInstance2.toVisualRow(row)][0]) > +new Date(today)) {
                cellProperties.readOnly = true;
              }
            } else {
              cellProperties.readOnly = true;
            }
          }
          return cellProperties;
        }
      });
    }
    if (changeReadOnlyBehaviors.havePCPlan && changeReadOnlyBehaviors.havePCActs) {
      hotInstance2.updateSettings({
        cells: (row, col, prop) => {
          const cellProperties: any = {};
          if (tableData[hotInstance2.toVisualRow(row)]) {
            if (col % 2 === 0) {
              if (+new Date(tableData[hotInstance2.toVisualRow(row)][0]) > +new Date(today)) {
                cellProperties.readOnly = true;
              }
            } else {
              if (+new Date(tableData[hotInstance2.toVisualRow(row)][0]) < +new Date(this.change.DDate) || +new Date(tableData[hotInstance2.toVisualRow(row)][0]) > +new Date(this.finishDate)) {
                cellProperties.readOnly = true;
              }
            }
          }
          return cellProperties;
        }
      });
    }
  }

  buildTable(obj) {
    const update = [];
    // const obj =/ [];
    // for (let i = 0; i < changedDates.length; i++) {
    //   obj.push([changedDates[i], '']);
    // }
    const hotInstance = this.hotRegisterer.getInstance('chagnePCsTable');
    try {
      hotInstance.updateSettings({
        colHeaders: this.columnHeader,
        columns: this.column,
        data: obj,
        maxRows: obj.length,
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
      this.setReadOnly();
      // hotInstance.setDataAtCell(hotInstance.countRows() - 1, 1, this.costOfProject);
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
        let finalDate = this.finishDate;
        const mainDate = moment(this.sharedService.todayData, 'YYYY/M/D');
        const todayFa = mainDate.format('jYYYY/jM/jD');
        if (new Date(this.finishDate) < new Date(todayFa)) {
          finalDate = todayFa;
        }
        const allTime = hotInstance.getData().map(v => +new Date(v[0]));
        if (allTime.indexOf(+new Date(result.format('jYYYY/jM/jD'))) !== -1) {
          text = '<p style="direction: rtl;text-align: right;"><span style="color: darkred;">- </span><span>تاریخ تکراری است!</span></p>';
        } else if (+new Date(result.format('jYYYY/jM/jD')) < +new Date(this.contract.StartDate) || +new Date(result.format('jYYYY/jM/jD')) > +new Date(this.finishDate)) {
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
        changedDates: null,
        tempAddDates: this.tempAddDates
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (isUndefined(result) || result === '') {
      } else {
        const daDateD = hotInstance.getData().map(a => a[0]);
        const index = daDateD.findIndex(v => +new Date(v) === +new Date(result));
        hotInstance.alter('remove_row', index);
        this.tempAddDates.splice(this.tempAddDates.findIndex(v => v === result), 1);
        hotInstance.updateSettings({
          maxRows: daDateD.length - 1
        });
        this.setReadOnly();
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
    this.tempAddDates.push(newRowDate);
    this.setReadOnly();
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
    let text = '';
    let sumValidation = false;
    if (true) {
      this.sharedService.getDataFromContextInfo().subscribe(
        (digestValue) => {
          const hotInstance: any = this.hotRegisterer.getInstance(this.instance);
          this.change.Json.ChangePC = {
            Date: [],
            Data: [],
            ColHeaders: []
          };
          this.change.Json.ChangePC.Date = hotInstance.getData().map(a => a[0]);
          this.change.Json.ChangePC.ColHeaders = this.columnHeader;
          for (let i = 1; i < hotInstance.countCols(); i++) {
            this.change.Json.ChangePC.Data[i - 1] = hotInstance.getData().map(a => a[i]);
          }
          console.log(this.change.Json.ChangePC);
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
    } else {
      this.alertsService.alertsWrongContractForm(text);
    }
  }
}
