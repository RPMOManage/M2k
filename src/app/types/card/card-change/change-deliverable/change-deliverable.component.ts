import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {ContractService} from '../../../../shared/services/contract.service';
import {SharedService} from '../../../../shared/services/shared.service';
import {HotTableRegisterer} from '@handsontable-pro/angular';
import {GenerateDatesService} from '../../../../shared/services/generate-dates.service';
import {ContractModel} from '../../../../shared/models/contractModels/contract.model';
import {AlertsService} from '../../../../shared/services/alerts.service';
import {MatDialog} from '@angular/material';
import * as moment from 'jalali-moment';
import {ContractServicesList} from '../../../../shared/models/contractServices.model';
import {DeliverablesList} from '../../../../shared/models/Deliverables.model';
import {OperationTypesList} from '../../../../shared/models/operationTypes.model';
import {ChangesModel} from '../../../../shared/models/contractModels/changes.model';
import {isUndefined} from 'util';
import {ZonesList} from '../../../../shared/models/zones.model';
import {PlanActPropAddRowComponent} from '../../../../pages/new-contract-stepper/plan-acts-prop-form/plan-act-prop-add-row/plan-act-prop-add-row.component';
import {PlanActPropDeleteRowComponent} from '../../../../pages/new-contract-stepper/plan-acts-prop-form/plan-act-prop-delete-row/plan-act-prop-delete-row.component';

@Component({
  selector: 'app-change-deliverable',
  templateUrl: './change-deliverable.component.html',
  styleUrls: ['./change-deliverable.component.scss']
})
export class ChangeDeliverableComponent implements OnInit {
  @Input() contractID: number;
  @Input() versionID: number;
  @Input() contract: ContractModel;
  @Input() change: ChangesModel;
  @Input() serviceID: number;
  @Input() services: ContractServicesList[] = [];
  @Output() changeTabIndex = new EventEmitter();
  instances = [];
  contractServices: ContractServicesList[] = [];
  zoneShow: boolean;
  deliverables: DeliverablesList[] = [];
  myDels: DeliverablesList[] = [];
  operationTypes: OperationTypesList[] = [];
  checkZone = false;
  zones: ZonesList[] = [];
  dels: { ID, DelPropsRev, Date, Zone, Value }[] = [];
  delItems: { ID, Deliverable: { ID, Title }, OperationType: { ID, Title } }[] = [];
  delProps: { ID, DelItem: { ID, Title }, Kind }[] = [];
  delPropsRevs: { ID, DelProp, RevNumber, DDate, TotalValue?: number }[] = [];
  checkTable = [];
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
    ]
  };
  bTableCounter = 0;
  colHeadersInst: {
    colHeaders: string[],
    instance: ''
  }[] = [];

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
    console.log(this.change.Json);
    this.sharedService.getZones().subscribe(
      (zones) => {
        this.zones = zones;
      }
    );
    this.sharedService.getOperationTypes().subscribe(
      (operationTypes) => {
        this.operationTypes = operationTypes;
      }
    );
    this.contractService.getAllDelProps(this.contractID).subscribe(
      (delProps) => {
        this.delProps = delProps;
        this.buildTables();
        // console.log(this.delProps);
      }
    );
    this.contractService.getAllDelPropsRevs(this.contractID).subscribe(
      (delPropsRevs) => {
        this.delPropsRevs = delPropsRevs;
        this.buildTables();
      }
    );
    this.contractService.getDels(this.contractID).subscribe(
      (dels) => {
        this.dels = dels;
        this.buildTables();
      }
    );
    this.sharedService.getDeliverables(null, null).subscribe(
      (deliverables) => {
        this.deliverables = deliverables;
        if (this.change.Json.ChangeDeliverables) {
          for (let i = 0; i < this.change.Json.ChangeDeliverables.length; i++) {
            this.instances.push(this.change.Json.ChangeDeliverables[i].instance);
            this.delItems.push(null);
            this.buildTable(this.change.Json.ChangeDeliverables[i].instance, null, null, null, null, i, true);
          }
        } else {
          this.contractService.getAllDelItems(this.contractID).subscribe(
            (delItems) => {
              for (let i = 0; i < delItems.length; i++) {
                // console.log(this.serviceID);
                if (this.deliverables.filter(v => v.Id === delItems[i].Deliverable.ID && v.Id_ContractService === this.services.filter(v2 => v2.ServiceID === this.serviceID)[0].Id).length > 0) {
                  this.delItems.push(delItems[i]);
                  this.instances.push(delItems[i].ID + '-' + delItems[i].Deliverable.ID + '-' + delItems[i].OperationType.ID);
                }
              }
              // console.log(this.delItems);
              this.buildTables();
            }
          );
        }
      }
    );
  }

  buildTables() {
    let foundedDelProps = [];
    let foundedDelPropsRevs = [];
    let mainDels = [];
    this.bTableCounter++;
    if (this.bTableCounter === 4) {
      for (let i = 0; i < this.delItems.length; i++) {
        foundedDelProps = this.delProps.filter(v => v.DelItem === this.delItems[i].ID);
        for (let j = 0; j < foundedDelProps.length; j++) {
          foundedDelPropsRevs.push(this.delPropsRevs.filter(v => v.DelProp === foundedDelProps[j].ID)[0].ID);
          this.dels.filter(v => {
            if (v.DelPropsRev === foundedDelPropsRevs[j]) {
              mainDels.push(v);
            }
          });
        }
        console.log(mainDels, foundedDelProps, foundedDelPropsRevs);
        const zones = Array.from(new Set(mainDels.map(v => v.Zone)));
        // console.log(zones);
        this.buildTable(this.instances[i], this.delItems[i], foundedDelPropsRevs, mainDels, zones);
        foundedDelProps = [];
        foundedDelPropsRevs = [];
        mainDels = [];
      }
    }
  }

  getTotalValue(id: any) {
    const foundedDelProp = this.delProps.filter(v => +v.DelItem === +id && v.Kind === 'P')[0].ID;
    return this.delPropsRevs.filter(v => v.DelProp === foundedDelProp)[0].TotalValue;
  }

  getMeasureUnit(id: any) {
    return this.deliverables.filter(v => +v.Id === +id)[0].MeasureUnit;
  }

  getDeliverableName(id: any) {
    return this.deliverables.filter(v => +v.Id === +id)[0].Name;
  }

  getOperationType(id: any) {
    return this.operationTypes.filter(v => +v.Id === +id)[0].Name;
  }

  getCSV(instance) {
    const hotInstance = this.hotRegisterer.getInstance(instance);
    console.log(hotInstance.getData());
    const exportPlugin = hotInstance.getPlugin('exportFile');
    exportPlugin.downloadFile('csv', {
      filename: 'ProgressPLan',
      columnHeaders: true,
      range: [0, 0, hotInstance.countRows(), this.colHeadersInst.filter(v => v.instance === instance)[0].colHeaders.length - 1]
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
        let text = '';
        let finalDate = this.change.DDate;
        const mainDate = moment(this.sharedService.todayData, 'YYYY/M/D');
        const todayFa = mainDate.format('jYYYY/jM/jD');
        // if (new Date(this.sharedService.stepFormsData.contractsForm.FinishDate_Contract) < new Date(todayFa)) {
        //   finalDate = todayFa;
        // }
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
            this.addRow(result.format('YYYY/MM/DD'), instance);
          });
        }
      }
      hotInstance.deselectCell();
      this.sharedService.stepsDirty.deliverable = true;
    });
  }

  deleteRowPopUp(instance) {
    const hotInstance = this.hotRegisterer.getInstance(instance);
    const dateOfTable = hotInstance.getData().map(a => a[0]);
    const dialogRef = this.dialog.open(PlanActPropDeleteRowComponent, {
      width: '500px',
      height: '500px',
      data: {
        data: dateOfTable,
        changedDates: this.generateDatesService.changeInitiateDate(dateOfTable[0], this.change.DDate, false),
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
    });
  }

  addRow(newRowDate, instance) {
    const hotInstance = this.hotRegisterer.getInstance(instance);
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
      // this.setReadOnly();
    }, 300);
  }

  onSubmitClick() {
    if (true) {
      this.sharedService.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.change.Json.ChangeDeliverables = [];
          for (let i = 0; i < this.delItems.length; i++) {
            const hotInstance = this.hotRegisterer.getInstance(this.instances[i]);
            this.change.Json.ChangeDeliverables[i] = {
              Data: hotInstance.getData(),
              ColHeaders: this.colHeadersInst.filter(v => v.instance === this.instances[i])[0].colHeaders,
              instance: this.colHeadersInst.filter(v => v.instance === this.instances[i])[0].instance,
              ServiceID: this.serviceID,
              totalValue: this.getTotalValue(+this.instances[i].split('-')[0]),
            };
          }
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
    }
  }

  buildTable(instance, delItem, foundedDelPropsRevs, mainDels: { ID, DelPropsRev, Date, Zone, Value }[], zones, cr = null, isChange = false) {
    setTimeout(() => {
      const hotInstance = this.hotRegisterer.getInstance(instance);
      console.log(hotInstance);
      console.log(instance, delItem);
      let mainDate = [];
      // nonDupDate.push(this.finishDate);
      // nonDupDate.push(this.change.DDate);
      const columns = [
        {
          type: 'text',
          readOnly: true,
          width: '100%'
        },
      ];
      if (isChange) {
        for (let i = 0; i < this.change.Json.ChangeDeliverables[cr].ColHeaders.length - 1; i++) {
          columns.push({
            type: 'text',
            readOnly: false,
            width: '100%'
          });
        }
        mainDate = this.change.Json.ChangeDeliverables[cr].Data.map(v => v[0]);
        const nonDupDate = Array.from(new Set(mainDate)).sort((a, b) => +new Date(a) - +new Date(b));
        const changedDates = this.generateDatesService.changeInitiateDate(nonDupDate[0], this.change.DDate, false);
        changedDates.map(v => {
          nonDupDate.push(v);
        });
        const dates = Array.from(new Set(nonDupDate)).sort((a, b) => +new Date(a) - +new Date(b));
        const colHeaders = this.change.Json.ChangeDeliverables[cr].ColHeaders;
        const obj = this.change.Json.ChangeDeliverables[cr].Data;
        console.log(obj);
        this.colHeadersInst.push({
          colHeaders: this.change.Json.ChangeDeliverables[cr].ColHeaders,
          instance: this.change.Json.ChangeDeliverables[cr].instance
        });
        hotInstance.updateSettings({
          colHeaders: colHeaders,
          columns: columns,
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
      } else {
        mainDate = mainDels.map(v => v.Date);
        const nonDupDate = Array.from(new Set(mainDate)).sort((a, b) => +new Date(a) - +new Date(b));
        const changedDates = this.generateDatesService.changeInitiateDate(nonDupDate[0], this.change.DDate, false);
        changedDates.map(v => {
          nonDupDate.push(v);
        });
        const dates = Array.from(new Set(nonDupDate)).sort((a, b) => +new Date(a) - +new Date(b));
        const colHeaders = ['تاریخ'];
        for (let j = 0; j < foundedDelPropsRevs.length; j++) {
          columns.push({
            type: 'text',
            readOnly: false,
            width: '100%'
          });
        }
        const obj = [];
        mainDate = Array.from(new Set(dates)).sort((a, b) => +new Date(a) - +new Date(b));
        for (let i = 0; i < mainDate.length; i++) {
          obj.push([
            mainDate[i],
          ]);
          if (zones[0]) {
            for (let j = 0; j < zones.length; j++) {
              if (i === 0) {
                const zoneName = this.zones.filter(v => v.Id === zones[j])[0].Name;
                colHeaders.push(zoneName + ' (برنامه ای) ');
                colHeaders.push(zoneName + ' (واقعی) ');
              }
              const filtredMainDels = mainDels.filter(v => v.Zone === zones[j] && v.DelPropsRev === foundedDelPropsRevs[j] && v.Date === mainDate[i]);
              const filtredMainDels2 = mainDels.filter(v => v.Zone === zones[j] && v.DelPropsRev === foundedDelPropsRevs[j + 1] && v.Date === mainDate[i]);
              if (filtredMainDels2.length > 0) {
                obj[i].push(filtredMainDels2[0].Value);
              } else {
                obj[i].push(null);
              }
              if (filtredMainDels.length > 0) {
                obj[i].push(filtredMainDels[0].Value);
              } else {
                obj[i].push(null);
              }
            }
          } else {
            for (let j = 0; j < 1; j++) {
              if (i === 0) {
                colHeaders.push(' (برنامه ای) ');
                colHeaders.push(' (واقعی) ');
              }
              const filtredMainDels = mainDels.filter(v => v.DelPropsRev === foundedDelPropsRevs[j] && v.Date === mainDate[i]);
              const filtredMainDels2 = mainDels.filter(v => v.DelPropsRev === foundedDelPropsRevs[j + 1] && v.Date === mainDate[i]);
              if (filtredMainDels2.length > 0) {
                obj[i].push(filtredMainDels2[0].Value);
              } else {
                obj[i].push(null);
              }
              if (filtredMainDels.length > 0) {
                obj[i].push(filtredMainDels[0].Value);
              } else {
                obj[i].push(null);
              }
            }
          }
        }
        this.colHeadersInst.push({
          colHeaders: colHeaders,
          instance: instance
        });
        hotInstance.updateSettings({
          colHeaders: colHeaders,
          columns: columns,
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
      }

    }, 100);
  }
}
