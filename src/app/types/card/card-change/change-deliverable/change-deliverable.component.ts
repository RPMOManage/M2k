import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContractService } from '../../../../shared/services/contract.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { HotTableRegisterer } from '@handsontable-pro/angular';
import { GenerateDatesService } from '../../../../shared/services/generate-dates.service';
import { ContractModel } from '../../../../shared/models/contractModels/contract.model';
import { AlertsService } from '../../../../shared/services/alerts.service';
import { MatDialog } from '@angular/material';
import * as moment from 'jalali-moment';
import { ContractServicesList } from '../../../../shared/models/contractServices.model';
import { DeliverablesList } from '../../../../shared/models/Deliverables.model';
import { OperationTypesList } from '../../../../shared/models/operationTypes.model';
import { ChangesModel } from '../../../../shared/models/contractModels/changes.model';

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
  delPropsRevs: { ID, DelProp, RevNumber, DDate }[] = [];
  checkTable = [];

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
    console.log(this.serviceID);
    this.sharedService.getDeliverables(null, null).subscribe(
      (deliverables: DeliverablesList[]) => {
        this.deliverables = deliverables;
        this.contractService.getDels(this.contractID).subscribe(
          (dels) => {
            this.dels = dels;
            console.log(this.dels);
            this.contractService.getAllDelPropsRevs(this.contractID).subscribe(
              (delPropsRevs) => {
                this.delPropsRevs = delPropsRevs;
                console.log(this.delPropsRevs);
                this.contractService.getContractDelProps(this.contractID).subscribe(
                  (delProps) => {
                    this.delProps = delProps;
                    console.log(this.delProps);
                    const mainDelProps = [];
                    this.contractService.getAllDelItems(this.contractID).subscribe(
                      (delItems) => {
                        this.delItems = delItems;
                        const mainDelItems = [];
                        let counter = 0;
                        for (let i = 0; i < this.contract.DelLast.length; i++) {
                          const selectedDelService = this.deliverables.filter(v => +v.Id === +this.contract.DelLast[i].Del)[0].Id_ContractService;
                          console.log(selectedDelService);
                          console.log(this.services);
                          const selectedService = this.services.filter(v => v.Id === selectedDelService)[0].ServiceID;
                          console.log(selectedService);
                          if (selectedService === this.serviceID) {
                            this.checkTable[counter] = false;
                            mainDelItems.push(
                              this.delItems.filter(v => v.Deliverable.ID === this.contract.DelLast[i].Del && v.OperationType.ID === this.contract.DelLast[i].Op)[0]
                            );
                            mainDelProps.push(this.delProps.filter(v => v.DelItem.ID === mainDelItems[counter].ID));
                            this.instances.push('c' + counter);
                            const mainDels = [];
                            this.buildTable(this.instances[counter], mainDelItems[counter]);
                            counter++;
                          }
                        }
                        console.log(this.instances);
                        console.log(mainDelProps);
                        console.log(mainDelItems);
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );





    this.contractService.getAllDelItems(this.contractID).subscribe(
      (delItems: { ID, Deliverable: { ID, Title }, OperationType: { ID, Title } }[]) => {
        for (let i = 0; i < delItems.length; i++) {
          const selectedDeliverable = this.deliverables.filter(v => +v.Id === +delItems[i].Deliverable.ID)[0];
          this.myDels.push({
            Id: selectedDeliverable.Id,
            Name: delItems[i].Deliverable.ID,
            MeasureUnit: selectedDeliverable.MeasureUnit,
            PossibleUnitIds: selectedDeliverable.PossibleUnitIds,
            PossibleOperationTypes_Deliverab: delItems[i].OperationType.ID,
            Id_ContractService: selectedDeliverable.Id_ContractService,
          });
        }
        console.log(this.myDels);
      }
    );

    // this.sharedService.getContractServices().subscribe(
    //   (data) => {
    //     this.contractServices = data;
    //     if (+this.contractServices.filter(v => v.ServiceID === this.serviceID)[0].DeliverableType === 2) {
    //       this.zoneShow = true;
    //     } else {
    //       this.zoneShow = false;
    //     }
    //     this.checkZone = true;
    //   }
    // );
    this.sharedService.getZones().subscribe(
      (data) => {
        this.zones = data;
      });
  }

  buildTable(instance, delItem) {
    console.log(instance);
    const mainDelProps = this.delProps.filter(v => v.DelItem.ID === delItem.ID);
    const selectedActDelPropsRevs = this.delPropsRevs.filter(v => v.DelProp === mainDelProps.filter(v => v.Kind === 'A')[0].ID)[0].ID;
    const selectedPlanDelPropsRevs = this.delPropsRevs.filter(v => v.DelProp === mainDelProps.filter(v => v.Kind === 'P')[0].ID)[0].ID;
    const acts = this.dels.filter(v => v.DelPropsRev === selectedActDelPropsRevs);
    const plans = this.dels.filter(v => v.DelPropsRev === selectedPlanDelPropsRevs);
    let dates = [];
    acts.map(v => {
      dates.push(v.Date);
    });
    plans.map(v => {
      dates.push(v.Date);
    });
    const colHeaders = ['تاریخ'];
    const columns = [
      {
        type: 'text',
        readOnly: true,
        width: '100%'
      },
    ];
    const obj = [];
    dates = Array.from(new Set(dates)).sort((a, b) => +new Date(a) - +new Date(b));
    for (let i = 0; i < dates.length; i++) {
      obj.push([
        dates[i],
      ]);
    }
    console.log(dates);
    const hotInstance = this.hotRegisterer.getInstance(instance);
    console.log(hotInstance);
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
    // checkTable[counter] = true;
    console.log(acts);
    console.log(plans);
    console.log(mainDelProps);
    console.log(delItem);
  }

  // setData() {
  //   this.dataCounter++;
  //   if (this.dataCounter === 3) {
  //     const obj = [];
  //     const nonDupDate = Array.from(new Set(this.pcs.map(v => v.Date))).sort((a, b) => +new Date(a) - +new Date(b));
  //     nonDupDate.push(this.finishDate);
  //     nonDupDate.push(this.change.DDate);
  //     if (this.change.Json.ChangeFinishDate.Date) {
  //       if (+new Date(this.change.Json.ChangeFinishDate.Date) > +new Date(this.contract.FinishDate)) {
  //         const changedDates = this.generateDatesService.changeInitiateDate(nonDupDate[nonDupDate.length - 1], this.change.Json.ChangeFinishDate.Date, true);
  //         changedDates.map(v => {
  //           nonDupDate.push(v);
  //         });
  //       }
  //     }
  //     const dates = Array.from(new Set(nonDupDate)).sort((a, b) => +new Date(a) - +new Date(b));
  //     console.log(dates);
  //     this.column = [
  //       {
  //         type: 'text',
  //         readOnly: true,
  //         width: '100%'
  //       },
  //     ];
  //     this.columnHeader = ['تاریخ'];
  //     for (let i = 0; i < this.pcProps.length; i++) {
  //       this.column.push({
  //         type: 'numeric',
  //         numericFormat: {
  //           pattern: '0.00%'
  //         },
  //       });
  //       this.columnHeader.push(this.contractServices.filter(v => +v.ServiceID === +this.pcProps[i].Service)[0].Name + this.pcProps[i].Kind);
  //     }
  //     for (let i = 0; i < dates.length; i++) {
  //       if (+new Date(dates[i]) <= +new Date(this.finishDate)) {
  //         obj.push([
  //           dates[i],
  //         ]);
  //         for (let j = 0; j < this.pcProps.length; j++) {
  //           let data = null;
  //           const pcPropPCs = this.pcs.filter(v => +new Date(v.Date) === +new Date(dates[i]) && +v.PCProp === +this.pcProps[j].ID);
  //           if (pcPropPCs.length > 0) {
  //             data = pcPropPCs[0].PC;
  //           }
  //           if (+new Date(dates[i]) < +new Date(this.change.DDate) && j % 2 === 0) {
  //             data = null;
  //           }
  //           obj[i].push(data);
  //         }
  //       }
  //     }
  //     console.log(obj);
  //     this.buildTable(obj);
  //   }
  // }

}
