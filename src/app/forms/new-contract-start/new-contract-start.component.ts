import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UnitsList } from '../../shared/models/units.model';
import { SubUnitsList } from '../../shared/models/subUnits.model';
import { ContractTypesList } from '../../shared/models/contractTypes.model';
import { UserNameList } from '../../shared/models/userName.model';
import { PMsList } from '../../shared/models/PMs.model';
import { Observable } from 'rxjs/index';
import { SharedService } from '../../shared/services/shared.service';
import { map, startWith } from 'rxjs/internal/operators';
import { ImporterList } from '../../shared/models/importer.model';
import { AlertsService } from '../../shared/services/alerts.service';
import { Router } from '@angular/router';
import { CurrentUserList } from '../../shared/models/currentUser.model';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-new-contract-start',
  templateUrl: './new-contract-start.component.html',
  styleUrls: ['./new-contract-start.component.scss']
})
export class NewContractStartComponent implements OnInit {
  newContractStartForm: FormGroup;
  units: UnitsList[];
  subUnits: SubUnitsList[];
  contractServices: ContractTypesList[];
  subUnitsNames: SubUnitsList[] = [];
  checked = false;
  projectManagers: UserNameList[] = [];
  projectManagers2: PMsList[] = [];
  projectManagers2Names: PMsList[] = [];
  filteredOptions: Observable<any[]>;
  pmoExpert;
  myControl = new FormControl();
  importerID;
  titleNames = [
    {
      id: 0,
      name: 'قرارداد'
    }, {
      id: 1,
      name: 'پروژه خاص'
    },
  ];
  currentTitle = '';
  defaultUnits: UnitsList[] = [];

  constructor(private _formBuilder: FormBuilder,
              private sharedService: SharedService,
              private alertsService: AlertsService,
              private router: Router,
              private dialogRef: MatDialogRef<NewContractStartComponent>,
) {
  }

  ngOnInit() {
    this.sharedService.getCurrentUser().subscribe(
      (currentUser: CurrentUserList) => {
        this.sharedService.getUserInformation(currentUser.Id).subscribe();
      }
    );
    this.currentTitle = this.titleNames[0].name;
    this.newContractStartForm = this._formBuilder.group({
      ContractName: ['', Validators.required],
      ContractNatureId: new FormArray([]),
      ContractPMId: this.myControl,
      Id_Unit: ['', Validators.required],
      Id_SubUnit: ['', Validators.required],
      PMOExpertId_User: ['', Validators.required],
    });

    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith<string | any>(''),
        map(val => this.filter(val))
      );

    this.sharedService.getSubUnits().subscribe(
      (data) => {
        this.subUnits = data;
      }
    );

    this.sharedService.getAllUnits()
      .subscribe(
        (data: UnitsList[]) => {
          this.defaultUnits = data;
        }
      );
    this.sharedService.getPMs().subscribe(
      (pms) => {
        this.projectManagers2 = pms;
        this.projectManagers2Names = pms;
        this.projectManagers2 = this.projectManagers2Names.filter(v => v.UnitsId.includes(this.newContractStartForm.value.Id_Unit));
      });

    this.sharedService.getContractServices().subscribe(
      (data) => {
        this.contractServices = data.filter(v => v.ServiceID !== 7);
        for (let i = 0; i < this.contractServices.length; i++) {
          const control = new FormControl(null);
          (<FormArray>this.newContractStartForm.get('ContractNatureId')).push(control);
        }
      }
    );

    this.starter();
  }

  onChangeTitle(e) {
    this.currentTitle = e.value.name;
  }

  starter() {
    if (this.sharedService.userData) {
      this.gettUs(this.sharedService.userData);
    } else {
      this.sharedService.user2.subscribe(
        (userData) => {
          this.gettUs(userData);
        });
    }

  }

  gettUs(userData) {
    const user = <any>userData;
    this.sharedService.getImporter(user.Id_Importer).subscribe(
      (importerData) => {
        const importer: ImporterList = <any>importerData;
        this.units = this.defaultUnits.filter(v => {
          if (importer.UnitIds.filter(vv => vv === v.Id).length > 0) {
            return true;
          }
        });
      });
  }

  onSubmitForm() {
    this.sharedService.stepFormsData = {};
    this.sharedService.stepFormsData.contractsForm = {};
    this.sharedService.stepFormsData.contractsForm.FullTitle_Contract = this.newContractStartForm.value.ContractName;
    this.sharedService.stepFormsData.contractsForm.ContractNatureId = this.newContractStartForm.value.ContractNatureId;
    this.sharedService.stepFormsData.contractsForm.PMId_User = this.newContractStartForm.value.ContractPMId;
    this.sharedService.stepFormsData.contractsForm.Id_Unit = this.newContractStartForm.value.Id_Unit;
    this.sharedService.stepFormsData.contractsForm.Id_SubUnit = this.newContractStartForm.value.Id_SubUnit;
    this.sharedService.stepFormsData.contractsForm.Id_Importer = this.importerID;
    this.sharedService.stepFormsData.contractsForm.PMOExpertId_User = this.units.filter((ep) => ep.Id === this.sharedService.stepFormsData.contractsForm.Id_Unit)[0].DefaultPMOExpertId_User;
    this.sharedService.stepFormsData.contractsForm.Costs = [];
    const finalServices = [];
    for (let i = 0; i < this.sharedService.stepFormsData.contractsForm.ContractNatureId.length; i++) {
      if (this.sharedService.stepFormsData.contractsForm.ContractNatureId[i] === true) {
        finalServices.push(this.contractServices[i].Id);
      }
    }
    this.sharedService.stepFormsData.contractsForm.ContractServices = finalServices;
    console.log(this.sharedService.stepFormsData.contractsForm);
    const deliverables = [];
    const planActsProp = [];
    if (finalServices.length > 1) {
      planActsProp.push({ServiceId: 'T'});
    }
    for (let i = 0; i < this.sharedService.stepFormsData.contractsForm.ContractNatureId.length; i++) {
      if (this.sharedService.stepFormsData.contractsForm.ContractNatureId[i]) {
        deliverables.push({serviceId: this.contractServices[i].Id});
        this.sharedService.stepFormsData.contractsForm.Costs.push(null);
        planActsProp.push({ServiceId: this.contractServices[i].Id});
      }
    }
    if (planActsProp.length === 2) {
      planActsProp.splice(0, 1);
    }
    this.sharedService.stepFormsData.deliverablesForm = {};
    this.sharedService.stepFormsData.deliverablesForm = deliverables;
    this.sharedService.stepFormsData.progressPlansForm = {};
    this.sharedService.stepFormsData.progressPlansForm.data = planActsProp;
    if (this.newContractStartForm.valid) {
      this.alertsService.alerts().then(
        (result) => {
          if (result.value) {
            this.sharedService.getDataFromContextInfo().subscribe(
              (data) => {
                this.sharedService.sendDataJson(data).subscribe(
                  (dd: any) => {
                    this.sharedService.stepFormsData.contractsForm.Code_Contract = 'TC' + dd.d.ID;
                    this.dialogRef.close();
                    this.router.navigate(['/wizard'], {queryParams: {'ContractID': 'TC' + dd.d.ID}});
                  }
                );
              });
          }
        }
      );
    } else {
      this.alertsService.alertsWrong2('اطلاعات دارای اشکال هستند!');
    }
  }

  unitChange(e, isEl?: boolean) {
    this.projectManagers = [];
    let el = e;
    if (isEl) {
      el = {target: {value: e.value}};
    }
    this.newContractStartForm.get('PMOExpertId_User').setValue(this.units.filter((ep) => ep.Id === el.target.value)[0].DefaultPMOExpertId_User);
    this.subUnitsNames = this.subUnits.filter(a => a.Id_Unit.includes(el.target.value));
    const havij = this.projectManagers2.filter((p) => p.UnitsId.includes(el.target.value));
    this.projectManagers2 = this.projectManagers2Names.filter(v => v.UnitsId.includes(el.target.value));
    this.newContractStartForm.get('ContractPMId').setValue('');
    this.newContractStartForm.get('Id_SubUnit').setValue('');
  }

  filter(val) {
    return this.projectManagers2;
  }

  displayFn(user?): string | undefined {
    return user ? user.User.Title : undefined;
  }
}
