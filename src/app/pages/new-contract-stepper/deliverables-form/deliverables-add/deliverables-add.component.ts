import { Component, EventEmitter, Inject, OnInit, Optional, Output } from '@angular/core';
import { SharedService } from '../../../../shared/services/shared.service';
import { ZonesList } from '../../../../shared/models/zones.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DeliverablesList } from '../../../../shared/models/Deliverables.model';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { OperationTypesList } from '../../../../shared/models/operationTypes.model';
import { StepDeliverablesFormList } from '../../../../shared/models/stepFormModels/stepDeliverablesForm.model';
import { Observable } from 'rxjs/index';
import { map, startWith } from 'rxjs/internal/operators';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AlertsService } from '../../../../shared/services/alerts.service';

@Component({
  selector: 'app-deliverables-add',
  templateUrl: './deliverables-add.component.html',
  styleUrls: ['./deliverables-add.component.scss'],
  animations: [
    trigger('list1', [
      state('in', style({
        opacity: 1,
        transform: 'translateX(0)'
      })),
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'translateX(-100px)'
        }),
        animate(300)
      ]),
    ])
  ]
})
export class DeliverablesAddComponent implements OnInit {
  @Output() creatingDeliverable = new EventEmitter();
  zones: ZonesList[] = [];
  deliverables: DeliverablesList[] = [];
  addDeliverablesForm: FormGroup;
  possibleOperationTypes = [[]];
  operationTypes: OperationTypesList[] = [];
  deliIndex = '';
  deliverablesForm: StepDeliverablesFormList;
  filteredOptions: Observable<DeliverablesList[]>[] = [];
  myControl = new FormControl();
  isReadOnly: boolean;
  hasDup = false;
  zoneShow;

  constructor(private sharedService: SharedService,
              @Optional() @Inject(MAT_DIALOG_DATA) public passedData: any,
              private _formBuilder: FormBuilder,
              public dialogRef: MatDialogRef<DeliverablesAddComponent>,
              private alertsService: AlertsService) {
  }

  ngOnInit() {
    this.deliverables = this.passedData.deliverables;
    this.operationTypes = this.passedData.operationTypes;
    this.zones = this.passedData.zones;
    this.zoneShow = this.passedData.zoneShow;
    this.deliverablesForm = this.sharedService.stepFormsData.deliverablesForm[this.passedData.data];
    this.filteredOptions[0] = this.myControl.valueChanges
      .pipe(
        startWith<string | DeliverablesList>(''),
        map(value => typeof value === 'string' ? value : value.Name),
        map(name => name ? this.filter(name) : this.deliverables.slice())
      );

    this.addDeliverablesForm = this._formBuilder.group({
      name_Deliverable: new FormArray([]),
      value_Deliverable: new FormArray([]),
      zone_deliverables: new FormArray([]),
      operationTypes_deliverables: new FormArray([])
    });
    if (!this.passedData.isChange) {
      this.isReadOnly = this.sharedService.isReadOnly;
      this.deliverables = this.deliverables.filter(v => {
        if ((v.PossibleUnitIds.indexOf(+this.sharedService.stepFormsData.contractsForm.Id_Unit) > -1) && (v.Id_ContractService === this.passedData.serviceName)) {
          return true;
        } else {
          return false;
        }
      });
      if (this.deliverablesForm.name_Deliverable) {
        for (let i = 0; i < this.deliverablesForm.name_Deliverable.length; i++) {
          this.onAddd(
            this.deliverablesForm.name_Deliverable[i],
            this.deliverablesForm.value_Deliverable[i],
            this.deliverablesForm.zone_deliverables[i],
            this.deliverablesForm.operationTypes_deliverables[i],
            true,
            i
          );
        }
      } else {
        this.onAddd({id: null}, null, null, null, false, 0);
      }
    } else {
      console.log(this.deliverables);
      this.deliverables = this.deliverables.filter(v => {
        if ((v.PossibleUnitIds.indexOf(+1) > -1) && (v.Id_ContractService === this.passedData.serviceName)) {
          return true;
        } else {
          return false;
        }
      });
      console.log(this.passedData.myDels);
      this.deliverablesForm = this.passedData.myDels.filter(v => v.serviceId === this.passedData.serviceName)[0];
      if (this.passedData.myDels.length !== 0) {
        for (let i = 0; i < this.passedData.myDels.length; i++) {
          this.onAddd(
            {Id: +this.passedData.myDels[i].Name},
            null,
            null,
            {Id: this.passedData.myDels[i].PossibleOperationTypes_Deliverab},
            true,
            i
          );
        }
      } else {
        this.onAddd({id: null}, null, null, null, false, 0);
      }
    }
  }

  valueChanged() {
  }

  onDeleteDeliverable(id: number) {
    this.alertsService.alertsRemove().then((result) => {
      if (result) {
        if (result.value) {
          (<FormArray>this.addDeliverablesForm.get('name_Deliverable')).removeAt(id);
          (<FormArray>this.addDeliverablesForm.get('value_Deliverable')).removeAt(id);
          (<FormArray>this.addDeliverablesForm.get('zone_deliverables')).removeAt(id);
          (<FormArray>this.addDeliverablesForm.get('operationTypes_deliverables')).removeAt(id);
          this.possibleOperationTypes.splice(id, 1);
          this.sharedService.stepFormsData.deliverablesForm[this.passedData.data].name_Deliverable.splice(id, 1);
          this.sharedService.stepFormsData.deliverablesForm[this.passedData.data].operationTypes_deliverables.splice(id, 1);
          this.sharedService.stepFormsData.deliverablesForm[this.passedData.data].value_Deliverable.splice(id, 1);
          this.sharedService.stepFormsData.deliverablesForm[this.passedData.data].zone_deliverables.splice(id, 1);
          this.sharedService.stepFormsData.deliverablesForm[this.passedData.data].data.splice(id, 1);
          this.sharedService.stepFormsData.deliverablesForm[this.passedData.data].date.splice(id, 1);
          this.sharedService.stepsDirty.deliverable = true;
        }
      }
    });
  }

  onAddd(a, b, c, d, check, num) {
    const control2 = new FormControl(a.Id, Validators.required);
    (<FormArray>this.addDeliverablesForm.get('name_Deliverable')).push(control2);

    const control9 = new FormControl(b, Validators.required);
    (<FormArray>this.addDeliverablesForm.get('value_Deliverable')).push(control9);


    if (this.passedData.zoneShow) {
      const control = new FormControl(c, Validators.required);
      (<FormArray>this.addDeliverablesForm.get('zone_deliverables')).push(control);
    }
    let control4;
    if (d !== null) {
      control4 = new FormControl(d.Id, Validators.required);
    } else {
      control4 = new FormControl(d, Validators.required);
    }
    (<FormArray>this.addDeliverablesForm.get('operationTypes_deliverables')).push(control4);

    let dd;
    if (check) {
      dd = {
        value: a.Id
      };
    }
      this.changeSelected(dd, num);
    if (this.isReadOnly) {
      this.addDeliverablesForm.disable();
    }
  }

  changeSelected(e, num) {
    if (e) {
      const delName = e.value;
      let delOperations: any;
      if (!this.passedData.isChange) {
        delOperations = this.deliverables.filter(v => v.Id === delName)[0].PossibleOperationTypes_Deliverab;
      } else {
        delOperations = this.deliverables.filter(v => +v.Id === +delName)[0].PossibleOperationTypes_Deliverab;
      }
      this.possibleOperationTypes[num] = [];
      for (let i = 0; i < delOperations.length; i++) {
        if (!this.passedData.isChange) {
          this.possibleOperationTypes[num].push(
            this.operationTypes.filter(a => +a.Id.toString().includes(delOperations[i]))[0]
          );
        } else {
          this.possibleOperationTypes[num].push(
            this.operationTypes.filter(a => +a.Id.toString().includes(delOperations[i]))[0]
          );
        }
      }
      if (this.possibleOperationTypes[num].length === 1) {
        const opDel: any = this.addDeliverablesForm.get('operationTypes_deliverables');
        opDel.controls[num].setValue(this.possibleOperationTypes[num][0].Id);
      }
    }
  }

  filter(name: string): DeliverablesList[] {
    return this.deliverables.filter(option =>
      option.Name.indexOf(name) === 0);
  }

  showForm() {
    const dp: any = [];
    let op = true;
    let checkVal = true;
    let checkZone = true;
    for (let i = 0; i < this.addDeliverablesForm.value.name_Deliverable.length; i++) {
      dp.push(this.addDeliverablesForm.value.name_Deliverable[i] + '|' + this.addDeliverablesForm.value.operationTypes_deliverables[i]);

      if (!this.addDeliverablesForm.value.operationTypes_deliverables[i]) {
        op = false;
      }
      if (this.addDeliverablesForm.value.value_Deliverable[i] === null || this.addDeliverablesForm.value.value_Deliverable[i] <= 0) {
        checkVal = false;
      }
      if (this.zoneShow) {
        if ((this.addDeliverablesForm.value.zone_deliverables[i] === null) || (this.addDeliverablesForm.value.zone_deliverables[i].length === 0)) {
          checkZone = false;
        }
      }
    }
    this.hasDup = dp.some((val, i) => {
      return dp.indexOf(val) !== i;
    });
    if (!this.hasDup && op && checkVal && checkZone) {
      this.deliverablesForm = new StepDeliverablesFormList();
      this.deliverablesForm.name_Deliverable = [];
      this.deliverablesForm.operationTypes_deliverables = [];
      this.deliverablesForm.zone_deliverables = [];
      this.deliverablesForm.value_Deliverable = [];
      this.deliverablesForm.date = [];
      for (let i = 0; i < this.addDeliverablesForm.value.name_Deliverable.length; i++) {
        this.deliverablesForm.name_Deliverable[i] = this.deliverables.filter(v => v.Id === this.addDeliverablesForm.value.name_Deliverable[i])[0];
        this.deliverablesForm.operationTypes_deliverables[i] = this.operationTypes.filter(v => v.Id === this.addDeliverablesForm.value.operationTypes_deliverables[i])[0];
        this.deliverablesForm.zone_deliverables[i] = this.addDeliverablesForm.value.zone_deliverables[i];
        this.deliverablesForm.value_Deliverable[i] = this.addDeliverablesForm.value.value_Deliverable[i];
        this.deliverablesForm.date[i] = [];
      }
      this.deliverablesForm.serviceId = this.sharedService.stepFormsData.deliverablesForm[this.passedData.data].serviceId;
      this.sharedService.stepFormsData.deliverablesForm[this.passedData.data] = this.deliverablesForm;
      console.log(this.deliverablesForm);
      this.dialogRef.close();
    } else {
      this.hasDup = true;
    }
    this.sharedService.stepsDirty.deliverable = true;
  }

  getMeasureUnit(delId) {
    if (this.deliverables.filter(a => a.Id === delId)[0]) {
      return this.deliverables.filter(a => a.Id === delId)[0].MeasureUnit;
    } else {
      return null;
    }
  }
}
