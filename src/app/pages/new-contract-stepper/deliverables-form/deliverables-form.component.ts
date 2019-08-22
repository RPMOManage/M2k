import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DeliverablesAddComponent } from './deliverables-add/deliverables-add.component';
import { StepDeliverablesFormList } from '../../../shared/models/stepFormModels/stepDeliverablesForm.model';
import { HotTableRegisterer } from '@handsontable-pro/angular';
import { isUndefined } from 'util';
import { SharedService } from '../../../shared/services/shared.service';
import { ContractServicesList } from '../../../shared/models/contractServices.model';
import { DeliverablesChartComponent } from './deliverables-chart/deliverables-chart.component';
import { ZonesList } from '../../../shared/models/zones.model';
import { DeliverablesList } from '../../../shared/models/Deliverables.model';
import { OperationTypesList } from '../../../shared/models/operationTypes.model';

@Component({
  selector: 'app-deliverables-form',
  templateUrl: './deliverables-form.component.html',
  styleUrls: ['./deliverables-form.component.scss']
})
export class DeliverablesFormComponent implements OnInit {
  @Output() tableData = new EventEmitter();
  @Input() ind;
  @Input() deliverablesForm: StepDeliverablesFormList;
  @Input() serviceIndex;
  @Input() serviceName;
  @Input() zones;
  instance = [];
  contractServices: ContractServicesList[] = [];
  zoneShow: boolean;
  zoneNames: ZonesList[] = [];
  deliverables: DeliverablesList[] = [];
  operationTypes: OperationTypesList[] = [];
  tabsShow = 0;
  checkZone = false;

  constructor(private dialog: MatDialog,
              private hotRegisterer: HotTableRegisterer,
              private sharedService: SharedService) {
  }

  ngOnInit() {
    // this.sharedService.zones.subscribe(
    //   (data: ZonesList[]) => {
    this.sharedService.getOperationTypes().subscribe(
      (data) => {
        this.operationTypes = data;
      });
    this.sharedService.stepFormsData.contractsForm.Zones.filter(v => {
      this.zoneNames.push({
        Id: v,
        Name: this.zones.filter(v2 => +v2.Id === +v)[0].Name
      });
    });
    // });
    this.sharedService.getContractServices().subscribe(
      (data) => {
        this.contractServices = data;
        if (+this.contractServices.filter(v => v.Id === this.serviceName)[0].DeliverableType === 2) {
          this.zoneShow = true;
        } else {
          this.zoneShow = false;
        }
        this.checkZone = true;
      }
    );
    this.getDataForAddDeliverable();
  }

  onChangeTab(id: number) {
    this.tabsShow = id;
  }

  getDataForAddDeliverable() {
    this.sharedService.getDeliverables(this.sharedService.stepFormsData.contractsForm.Id_Unit, this.serviceName).subscribe(
      (data1) => {
        this.deliverables = data1;
        if (this.deliverablesForm.name_Deliverable) {
          for (let i = 0; i < this.deliverablesForm.name_Deliverable.length; i++) {
            this.deliverablesForm.name_Deliverable[i].MeasureUnit = this.deliverables.filter(v => +v.Id === +this.deliverablesForm.name_Deliverable[i].Id)[0].MeasureUnit;
          }
        }
      });
  }

  addDeliverables() {
    const dialogRef = this.dialog.open(DeliverablesAddComponent, {
      width: '1200px',
      height: '500px',
      data: {
        data: this.serviceIndex,
        serviceName: this.serviceName,
        zoneShow: this.zoneShow,
        serviceRealName: this.contractServices.filter(v => v.Id === this.serviceName)[0].Name,
        deliverables: this.deliverables,
        operationTypes: this.operationTypes,
        zones: this.zoneNames,
        isChange: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (isUndefined(result) || result === '') {
      } else {
      }
    });
  }

  showChart(i: number, title: string, tooltip: string, MeasureUnit: string) {
    const dialogRef = this.dialog.open(DeliverablesChartComponent, {
      width: '1300px',
      height: '600px',
      data: {
        tableData: this.hotRegisterer.getInstance('httt' + i + this.deliverablesForm.serviceId + this.deliverablesForm.name_Deliverable[i].Id).getData(),
        zones: this.deliverablesForm.zone_deliverables[i],
        name_Deliverable: this.deliverablesForm.name_Deliverable,
        title: title,
        tooltip: tooltip,
        zoneNames: this.zones,
        measureUnit: MeasureUnit
      }
    });
  }
}
