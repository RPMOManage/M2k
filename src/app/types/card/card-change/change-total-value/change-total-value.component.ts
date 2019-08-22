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
import { ZonesList } from '../../../../shared/models/zones.model';
import { DeliverablesList } from '../../../../shared/models/Deliverables.model';
import { OperationTypesList } from '../../../../shared/models/operationTypes.model';
import { Observable } from 'rxjs/index';
import { map, startWith } from 'rxjs/internal/operators';

@Component({
  selector: 'app-total-value',
  templateUrl: './change-total-value.component.html',
  styleUrls: ['./change-total-value.component.scss']
})
export class ChangeTotalValueComponent implements OnInit {
  @Input() contractID: number;
  @Input() versionID: number;
  @Input() contract: ContractModel;
  @Input() change: ChangesModel;
  @Output() changeTabIndex = new EventEmitter();
  formGp: FormGroup;
  selectedNewCostDeclareDate = '';
  column;
  columnHeader;
  costCodes: { ID, DDate, EqCost, Cost }[] = [];
  checkTable = false;
  instance = 'chagnePCsTable';
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
  cashFlowPlans: { ID, cashFlowPlansPropCode, Date, Cost }[] = [];
  dataCounter = 0;
  pcProps: { ID, Service, Kind }[] = [];
  pcs: ContractPCModel[] = [];
  contractServices: ContractServicesList[] = [];
  finishDate: string;
  zones: ZonesList[] = [];
  deliverables: DeliverablesList[] = [];
  addDeliverablesForms: FormGroup[] = [];
  possibleOperationTypes = [[[]]];
  operationTypes: OperationTypesList[] = [];
  deliIndex = '';
  // deliverablesForm: StepDeliverablesFormList;
  filteredOptions: Observable<DeliverablesList[]>[] = [];
  myControl = new FormControl();
  isReadOnly: boolean;
  hasDup = false;
  zoneShow;
  services: ContractServicesList[] = [];
  finalServices = [];
  dels = [];
  counter = [];
  mainServices: ContractServicesList[] = [];

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
    console.log(this.contract.DelLast);

    if (this.change.Json.ChangeServiceCost) {
      this.finalServices = this.change.Json.ChangeServiceCost.Services;
    } else {
      this.finalServices = this.contract.Service;
    }

    const foundedIndex = this.finalServices.findIndex(v => +v === 7);
    if (foundedIndex > 0) {
      this.finalServices.splice(foundedIndex, 1);
    }

    this.sharedService.getContractServices().subscribe(
      (services) => {
        this.services = services;
        this.sharedService.getDeliverables(null, null).subscribe(
          (deliverables) => {
            this.deliverables = deliverables;
            console.log(this.deliverables);
            this.sharedService.getOperationTypes().subscribe(
              (operationTypes) => {
                this.operationTypes = operationTypes;
                if (this.change.Json.ChangeTotalValue) {
                  for (let i = 0; i < this.change.Json.ChangeTotalValue.length; i++) {
                    const selectedService = this.services.filter(v => +v.ServiceID === +this.change.Json.ChangeTotalValue[i].Service)[0];
                    this.mainServices.push(selectedService);
                    this.addDeliverablesForms[i] = this._formBuilder.group({
                      name_Deliverable: new FormArray([]),
                      value_Deliverable: new FormArray([]),
                      zone_deliverables: new FormArray([]),
                      operationTypes_deliverables: new FormArray([]),
                      changesPercentage: new FormControl(this.change.Json.ChangeTotalValue[i].ChangesPercentage, Validators.required),
                    });

                    this.possibleOperationTypes[i] = [];
                    const delsOfService = this.deliverables.filter(v => v.Id_ContractService === selectedService.Id);
                    console.log(delsOfService);
                    this.dels.push(delsOfService);
                    this.counter.push(0);

                    for (let j = 0; j < this.change.Json.ChangeTotalValue[i].Name_Deliverable.length; j++) {
                      const tempFoundedDel = delsOfService.filter(v => +v.Id === +this.change.Json.ChangeTotalValue[i].Name_Deliverable[j]);
                      if (tempFoundedDel.length > 0) {
                        this.onAddd({Id: tempFoundedDel[0].Id}, this.change.Json.ChangeTotalValue[i].Value_Deliverable[j], null, this.change.Json.ChangeTotalValue[i].OperationTypes_deliverables[j], true, this.counter[i], i);
                        // this.addDeliverablesForms[i].get('operationTypes_deliverables').disable();
                        this.counter[i]++;
                        // this.changeSelected({value: tempFoundedDel[0].Id}, i, i);
                      }
                    }
                  }

                } else {
                  for (let i = 0; i < this.finalServices.length; i++) {
                    const selectedService = this.services.filter(v => +v.ServiceID === +this.finalServices[i])[0];
                    if (+selectedService.DeliverableType > 0) {
                      this.mainServices.push(selectedService);
                      this.addDeliverablesForms[i] = this._formBuilder.group({
                        name_Deliverable: new FormArray([]),
                        value_Deliverable: new FormArray([]),
                        zone_deliverables: new FormArray([]),
                        operationTypes_deliverables: new FormArray([]),
                        changesPercentage: new FormControl(0, Validators.required),
                      });
                      this.possibleOperationTypes[i] = [];
                      const delsOfService = this.deliverables.filter(v => v.Id_ContractService === selectedService.Id);
                      this.dels.push(delsOfService);
                      this.counter.push(0);
                      for (let j = 0; j < this.contract.DelLast.length; j++) {
                        const tempFoundedDel = delsOfService.filter(v => +v.Id === +this.contract.DelLast[j].Del);
                        if (tempFoundedDel.length > 0) {
                          this.onAddd({Id: tempFoundedDel[0].Id}, this.contract.DelLast[j].TotalVal, null, this.contract.DelLast[j].Op, true, this.counter[i], i);
                          // this.addDeliverablesForms[i].get('operationTypes_deliverables').disable();
                          this.counter[i]++;
                          // this.changeSelected({value: tempFoundedDel[0].Id}, i, i);
                        }
                      }
                    }
                  }
                }
              });
          });
      }
    );


    this.filteredOptions[0] = this.myControl.valueChanges
      .pipe(
        startWith<string | DeliverablesList>(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(name => name ? this.filter(name) : this.deliverables.slice())
      );


    // if (!this.passedData.isChange) {
    //   this.isReadOnly = this.sharedService.isReadOnly;
    //   this.deliverables = this.deliverables.filter(v => {
    //     if ((v.PossibleUnitIds.indexOf(+this.sharedService.stepFormsData.contractsForm.Id_Unit) > -1) && (v.Id_ContractService === this.passedData.serviceName)) {
    //       return true;
    //     } else {
    //       return false;
    //     }
    //   });
    //   if (this.deliverablesForm.name_Deliverable) {
    //     for (let i = 0; i < this.deliverablesForm.name_Deliverable.length; i++) {
    //       this.onAddd(
    //         this.deliverablesForm.name_Deliverable[i],
    //         this.deliverablesForm.value_Deliverable[i],
    //         this.deliverablesForm.zone_deliverables[i],
    //         this.deliverablesForm.operationTypes_deliverables[i],
    //         true,
    //         i
    //       );
    //     }
    //   } else {
    //     this.onAddd({id: null}, null, null, null, false, 0);
    //   }
    // } else {
    // this.deliverables = this.deliverables.filter(v => {
    //   if ((v.PossibleUnitIds.indexOf(+1) > -1) && (v.Id_ContractService === this.passedData.serviceName)) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // });
    // console.log(this.passedData.myDels);
    // this.deliverablesForm = this.passedData.myDels.filter(v => v.serviceId === this.passedData.serviceName)[0];
    // if (this.passedData.myDels.length !== 0) {
    //   for (let i = 0; i < this.passedData.myDels.length; i++) {
    //     this.onAddd(
    //       {Id: +this.passedData.myDels[i].Name},
    //       null,
    //       null,
    //       {Id: this.passedData.myDels[i].PossibleOperationTypes_Deliverab},
    //       true,
    //       i
    //     );
    //   }
    // } else {
    //   this.onAddd({id: null}, null, null, null, false, 0);
    // }
    // }
  }

  valueChanged() {
  }

  onDeleteDeliverable(id: number) {
    // this.alertsService.alertsRemove().then((result) => {
    //   if (result) {
    //     if (result.value) {
    //       (<FormArray>this.addDeliverablesForm.get('name_Deliverable')).removeAt(id);
    //       (<FormArray>this.addDeliverablesForm.get('value_Deliverable')).removeAt(id);
    //       (<FormArray>this.addDeliverablesForm.get('zone_deliverables')).removeAt(id);
    //       (<FormArray>this.addDeliverablesForm.get('operationTypes_deliverables')).removeAt(id);
    //       this.possibleOperationTypes.splice(id, 1);
    //       this.sharedService.stepFormsData.deliverablesForm[this.passedData.data].name_Deliverable.splice(id, 1);
    //       this.sharedService.stepFormsData.deliverablesForm[this.passedData.data].operationTypes_deliverables.splice(id, 1);
    //       this.sharedService.stepFormsData.deliverablesForm[this.passedData.data].value_Deliverable.splice(id, 1);
    //       this.sharedService.stepFormsData.deliverablesForm[this.passedData.data].zone_deliverables.splice(id, 1);
    //       this.sharedService.stepFormsData.deliverablesForm[this.passedData.data].data.splice(id, 1);
    //       this.sharedService.stepFormsData.deliverablesForm[this.passedData.data].date.splice(id, 1);
    //       this.sharedService.stepsDirty.deliverable = true;
    //     }
    //   }
    // });
  }

  onAddd(a, b, c, d, check, i, num) {
    const control2 = new FormControl(+a.Id, Validators.required);
    (<FormArray>this.addDeliverablesForms[num].get('name_Deliverable')).push(control2);

    const control9 = new FormControl(b, Validators.required);
    (<FormArray>this.addDeliverablesForms[num].get('value_Deliverable')).push(control9);


    // if (this.passedData.zoneShow) {
    const control = new FormControl(c, Validators.required);
    (<FormArray>this.addDeliverablesForms[num].get('zone_deliverables')).push(control);
    // }
    let control4;
    if (d !== null) {
      control4 = new FormControl(d.Id, Validators.required);
    } else {
      control4 = new FormControl(d, Validators.required);
    }
    (<FormArray>this.addDeliverablesForms[num].get('operationTypes_deliverables')).push(control4);

    let dd;
    if (check) {
      dd = {
        value: a.Id
      };
    }
    this.changeSelected(dd, i, num);
    // if (this.isReadOnly) {
    //   this.addDeliverablesForm.disable();
    // }
  }

  changeSelected(e, num, formID) {
    if (e) {
      const delName = e.value;
      let delOperations: any;
      // if (!this.passedData.isChange) {
      //   delOperations = this.deliverables.filter(v => v.Id === delName)[0].PossibleOperationTypes_Deliverab;
      // } else {
      delOperations = this.dels[formID].filter(v => +v.Id === +delName)[0].PossibleOperationTypes_Deliverab;
      // }
      this.possibleOperationTypes[formID][num] = [];
      // console.log(this.possibleOperationTypes);
      for (let i = 0; i < delOperations.length; i++) {
        // if (!this.passedData.isChange) {
        //   this.possibleOperationTypes[num].push(
        //     this.operationTypes.filter(a => +a.Id.toString().includes(delOperations[i]))[0]
        //   );
        // } else {
        this.possibleOperationTypes[formID][num].push(
          this.operationTypes.filter(a => +a.Id.toString().includes(delOperations[i]))[0]
        );
        // console.log(this.possibleOperationTypes);
        // }
      }
      if (this.possibleOperationTypes[formID][num].length === 1) {
        // console.log(formID);
        const opDel: any = this.addDeliverablesForms[formID].get('operationTypes_deliverables');
        opDel.controls[num].setValue(this.possibleOperationTypes[formID][num][0].Id);
      }
    }
  }

  getServiceName(id: number) {
    const selectedService = this.services.filter(v => +v.ServiceID === +id)[0];
    if (selectedService) {
      return selectedService.Name;
    } else {
      return null;
    }
  }

  filter(name: string): DeliverablesList[] {
    return this.deliverables.filter(option =>
      option.Name.indexOf(name) === 0);
  }

  onSubmitClick() {
    let text = '';
    let sumValidation = false;
    console.log(this.addDeliverablesForms);
    console.log(this.addDeliverablesForms[0]);
    if (true) {
      this.sharedService.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.change.Json.ChangeTotalValue = [];
          for (let i = 0; i < this.addDeliverablesForms.length; i++) {
            this.change.Json.ChangeTotalValue[i] = {
              Service: this.mainServices[i].ServiceID,
              ChangesPercentage: this.addDeliverablesForms[i].get('changesPercentage').value,
              Name_Deliverable: this.addDeliverablesForms[i].get('name_Deliverable').value,
              OperationTypes_deliverables: this.addDeliverablesForms[i].get('operationTypes_deliverables').value,
              Value_Deliverable: this.addDeliverablesForms[i].get('value_Deliverable').value
            };
          }
          console.log(this.change.Json.ChangeTotalValue);
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

  showForm() {
    // const dp: any = [];
    // let op = true;
    // let checkVal = true;
    // let checkZone = true;
    // for (let i = 0; i < this.addDeliverablesForm.value.name_Deliverable.length; i++) {
    //   dp.push(this.addDeliverablesForm.value.name_Deliverable[i] + '|' + this.addDeliverablesForm.value.operationTypes_deliverables[i]);
    //
    //   if (!this.addDeliverablesForm.value.operationTypes_deliverables[i]) {
    //     op = false;
    //   }
    //   if (this.addDeliverablesForm.value.value_Deliverable[i] === null || this.addDeliverablesForm.value.value_Deliverable[i] <= 0) {
    //     checkVal = false;
    //   }
    //   if (this.zoneShow) {
    //     if ((this.addDeliverablesForm.value.zone_deliverables[i] === null) || (this.addDeliverablesForm.value.zone_deliverables[i].length === 0)) {
    //       checkZone = false;
    //     }
    //   }
    // }
    // this.hasDup = dp.some((val, i) => {
    //   return dp.indexOf(val) !== i;
    // });
    // if (!this.hasDup && op && checkVal && checkZone) {
    //   this.deliverablesForm = new StepDeliverablesFormList();
    //   this.deliverablesForm.name_Deliverable = [];
    //   this.deliverablesForm.operationTypes_deliverables = [];
    //   this.deliverablesForm.zone_deliverables = [];
    //   this.deliverablesForm.value_Deliverable = [];
    //   this.deliverablesForm.date = [];
    //   for (let i = 0; i < this.addDeliverablesForm.value.name_Deliverable.length; i++) {
    //     this.deliverablesForm.name_Deliverable[i] = this.deliverables.filter(v => v.Id === this.addDeliverablesForm.value.name_Deliverable[i])[0];
    //     this.deliverablesForm.operationTypes_deliverables[i] = this.operationTypes.filter(v => v.Id === this.addDeliverablesForm.value.operationTypes_deliverables[i])[0];
    //     this.deliverablesForm.zone_deliverables[i] = this.addDeliverablesForm.value.zone_deliverables[i];
    //     this.deliverablesForm.value_Deliverable[i] = this.addDeliverablesForm.value.value_Deliverable[i];
    //     this.deliverablesForm.date[i] = [];
    //   }
    //   this.deliverablesForm.serviceId = this.sharedService.stepFormsData.deliverablesForm[this.passedData.data].serviceId;
    //   this.sharedService.stepFormsData.deliverablesForm[this.passedData.data] = this.deliverablesForm;
    //   console.log(this.deliverablesForm);
    //   this.dialogRef.close();
    // } else {
    //   this.hasDup = true;
    // }
    // this.sharedService.stepsDirty.deliverable = true;
  }

  getMeasureUnit(delId) {
    if (this.deliverables.filter(a => a.Id === delId)[0]) {
      return this.deliverables.filter(a => a.Id === delId)[0].MeasureUnit;
    } else {
      return null;
    }
  }

}
