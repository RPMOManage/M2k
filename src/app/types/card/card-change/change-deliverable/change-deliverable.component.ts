import {Component, Input, OnInit} from '@angular/core';
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
  instances = [];
  contractServices: ContractServicesList[] = [];
  zoneShow: boolean;
  deliverables: DeliverablesList[] = [];
  myDels: DeliverablesList[] = [];
  operationTypes: OperationTypesList[] = [];
  checkZone = false;
  zones;
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
    this.sharedService.getOperationTypes().subscribe(
      (operationTypes) => {
        this.operationTypes = operationTypes;
      }
    );
    this.contractService.getAllDelProps(this.contractID).subscribe(
      (delProps) => {
        this.delProps = delProps;
        this.buildTables();
        console.log(this.delProps);
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
        this.contractService.getAllDelItems(this.contractID).subscribe(
          (delItems) => {
            for (let i = 0; i < delItems.length; i++) {
              if (this.deliverables.filter(v => v.Id === delItems[i].Deliverable.ID && v.Id_ContractService === 'C').length > 0) {
                this.delItems.push(delItems[i]);
                this.instances.push(delItems[i].ID + '-' + delItems[i].Deliverable.ID + '-' + delItems[i].OperationType.ID);
              }
            }
            console.log(this.delItems);
            this.buildTables();
          }
        );
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
        this.buildTable(this.instances[i], this.delItems[i], foundedDelPropsRevs, mainDels);
        foundedDelProps = [];
        foundedDelPropsRevs = [];
        mainDels = [];
      }
    }
  }

  getTotalValue(id: number) {
    const foundedDelProp = this.delProps.filter(v => +v.DelItem === +id && v.Kind === 'P')[0].ID;
    return this.delPropsRevs.filter(v => v.DelProp === foundedDelProp)[0].TotalValue;
  }

  getMeasureUnit(id: number) {
    return this.deliverables.filter(v => +v.Id === +id)[0].MeasureUnit;
  }

  getDeliverableName(id: number) {
    return this.deliverables.filter(v => +v.Id === +id)[0].Name;
  }

  getOperationType(id: number) {
    return this.operationTypes.filter(v => +v.Id === +id)[0].Name;
  }

  buildTable(instance, delItem, foundedDelPropsRevs, mainDels: { ID, DelPropsRev, Date, Zone, Value }[]) {
    setTimeout(() => {
      const hotInstance = this.hotRegisterer.getInstance(instance);
      console.log(hotInstance);
      console.log(instance, delItem);
      let mainDate = [];
      let zones = [];
      const columns = [
        {
          type: 'text',
          readOnly: true,
          width: '100%'
        },
      ];
      mainDels.map(v => {
        mainDate.push(v.Date);
      });
      mainDels.map(v => {
        zones.push(v.Zone);
      });

      const colHeaders = ['تاریخ'];
      for (let j = 0; j < foundedDelPropsRevs.length; j++) {
        columns.push({
          type: 'number',
          readOnly: false,
          width: '100%'
        });
      }
      const obj = [];
      mainDate = Array.from(new Set(mainDate)).sort((a, b) => +new Date(a) - +new Date(b));
      zones = Array.from(new Set(zones));
      console.log(mainDate);
      console.log(zones);


      // for (let i = 0; i < mainDate.length; i++) {
      //   obj.push([mainDate[i]]);
      //   for (let j = 0; j < zones.length; j++) {
      //     let act;
      //     let plan;
      //     if (this.deliverablesForm.data) {
      //       if (this.deliverablesForm.data[this.indexx]) {
      //         if (this.deliverablesForm.data[this.indexx][j * 2]) {
      //           if (+new Date(mainDate[i]) > +new Date(this.sharedService.stepFormsData.contractsForm.FinishDate_Contract)) {
      //             plan = '';
      //           } else {
      //             if (this.deliverablesForm.data[this.indexx][j * 2][i]) {
      //               plan = this.deliverablesForm.data[this.indexx][j * 2][i];
      //             } else {
      //               plan = null;
      //             }
      //           }
      //         } else {
      //           plan = '';
      //         }
      //       } else {
      //         plan = '';
      //       }
      //       if (this.deliverablesForm.data[this.indexx]) {
      //         if (this.deliverablesForm.data[this.indexx][j * 2 + 1]) {
      //           if (this.deliverablesForm.data[this.indexx][j * 2 + 1][i]) {
      //             act = this.deliverablesForm.data[this.indexx][j * 2 + 1][i];
      //           } else {
      //             act = null;
      //           }
      //         } else {
      //           act = '';
      //         }
      //       } else {
      //         act = '';
      //       }
      //     } else {
      //       act = '';
      //       plan = '';
      //     }
      //     if (isUndefined(act)) {
      //       act = null;
      //     }
      //     if (isUndefined(plan)) {
      //       plan = null;
      //     }
      //     const zoneName = this.getZoneName(this.deliverablesForm.zone_deliverables[this.indexx][j]);
      //     if (i === 0) {
      //       this.column.push({
      //         type: 'numeric',
      //       });
      //       this.column.push({
      //         type: 'numeric',
      //       });
      //       this.colHeaders[this.colHeaders.length] = zoneName + ' (برنامه ای) ';
      //       this.colHeadersMain[this.colHeadersMain.length] = zoneName + ' (برنامه ای) ';
      //       this.colHeaders[this.colHeaders.length] = zoneName + ' (واقعی) ';
      //       this.colHeadersMain[this.colHeadersMain.length] = zoneName + ' (واقعی) ';
      //     }
      //     obj[obj.length - 1].push(plan, act);
      //   }
      // }


      for (let i = 0; i < mainDate.length; i++) {
        obj.push([
          mainDate[i],
        ]);
        for (let j = 0; j < foundedDelPropsRevs.length; j++) {
          const filtredMainDels = mainDels.filter(v => v.DelPropsRev === foundedDelPropsRevs[j] && v.Date === mainDate[i]);
          if (filtredMainDels.length > 0) {
            obj[obj.length - 1].push(filtredMainDels[0].Value);
          }
        }
      }
      console.log(obj);
      // console.log(dates);
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
    }, 100);
  }
}
