import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild} from '@angular/core';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {SharedService} from '../../../shared/services/shared.service';
import {SubUnitsList} from '../../../shared/models/subUnits.model';
import {UnitsList} from '../../../shared/models/units.model';
import {ImporterList} from '../../../shared/models/importer.model';
import {PMsList} from '../../../shared/models/PMs.model';
import {ContractServicesList} from '../../../shared/models/contractServices.model';
import {CurrenciesList} from '../../../shared/models/currencies.model';
import {ContractorsList} from '../../../shared/models/contractors.model';
import {Observable} from 'rxjs/index';
import {map, startWith} from 'rxjs/internal/operators';
import * as moment from 'jalali-moment';
import {MatDialog} from '@angular/material';
import {ContractorAddRowComponent} from './contractor-add-row/contractor-add-row.component';
import {RaiPartsList} from '../../../shared/models/raiParts.model';
import {isUndefined} from 'util';
import {ZonesList} from '../../../shared/models/zones.model';
import {OperationTypesList} from '../../../shared/models/operationTypes.model';

@Component({
  // changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-contract-form',
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.scss']
})
export class ContractFormComponent implements OnInit {
  @Input() formGp: FormGroup;
  @Input() isPreContract: boolean;
  @Output() addContractService = new EventEmitter();
  @Output() addCost = new EventEmitter();
  @Output() formData = new EventEmitter();
  projectManagers2: PMsList[] = [];
  projectManagers2Names: PMsList[] = [];
  subUnits: SubUnitsList[];
  subUnitsNames: SubUnitsList[] = [];
  units: UnitsList[];
  contractServices: ContractServicesList[] = [];
  contractors: ContractorsList[] = [];
  newContractors = [];
  currencies: CurrenciesList[] = [];
  raiParts: RaiPartsList[] = [];
  filteredOptionsPM: Observable<any[]>;
  filteredContractors: Observable<any[]>;
  defContractServices = [];
  selectedDeclareDate = null;
  selectedStartDate = null;
  selectedFinishDate = null;
  selectedDocToComptroller = null;
  selectedSigningRecall = null;
  selectedWinnerDeclare = null;
  datePickerConfig = {
    format: 'jYYYY/jMM/jDD'
  };
  @ViewChild('declareDate') declareDate;
  @ViewChild('startDate') startDate;
  @ViewChild('finishDate') finishDate;
  importerId;
  isReadOnly: boolean;
  defaultUnits: UnitsList[] = [];
  zones: ZonesList[] = [];
  inputServiceNames = [];
  selectedServiceNames = [];
  contractNatureIds = [];
  operationalPriorities = [{ID: 1, Name: 1}, {ID: 2, Name: 2}, {ID: 3, Name: 3}, {ID: 4, Name: 4}, {ID: 5, Name: 5}];
  operationTypes: OperationTypesList[] = [];
  goals: { Id, Name }[] = [];
  demandants: { Id, Name }[] = [];
  tenderTypes: { Id, Name }[] = [];
  tenderOrganizers: { Id, Name }[] = [];

  constructor(private sharedService: SharedService,
              private dialog: MatDialog,
              private renderer: Renderer2) {
  }

  ngOnInit() {
    this.sharedService.getAllUnits()
      .subscribe(
        (data: UnitsList[]) => {
          this.defaultUnits = data;
          if (this.sharedService.isReadOnly) {
            this.units = this.defaultUnits;
          }
        }
      );
    this.sharedService.getPMs().subscribe(
      (pms) => {
        // this.projectManagers2 = pms;
        this.projectManagers2Names = pms;
        this.projectManagers2 = this.projectManagers2Names.filter(v => v.UnitsId.includes(this.formGp.value.Id_Unit));
      });
    this.isReadOnly = this.sharedService.isReadOnly;
    this.formGp.valueChanges.subscribe(
      () => {
        if (this.formGp.dirty) {
          this.sharedService.stepsDirty.contractForm = true;
          this.sharedService.changeStepLocks(true);
        }
      }
    );
    this.sharedService.getOperationTypes().subscribe(
      (data: OperationTypesList[]) => {
        this.operationTypes = data;
      });

    this.sharedService.getZones().subscribe(
      (data: ZonesList[]) => {
        this.zones = data;
      });

    this.sharedService.getGoals().subscribe(
      (data: { Id, Name }[]) => {
        this.goals = data;
      });

    this.sharedService.getDemandants().subscribe(
      (data: { Id, Name }[]) => {
        this.demandants = data;
      });

    if (this.isPreContract) {
      this.sharedService.getTenderTypes().subscribe(
        (data: { Id, Name }[]) => {
          this.tenderTypes = data;
        });

      this.sharedService.getTenderOrganizers().subscribe(
        (data: { Id, Name }[]) => {
          this.tenderOrganizers = data;
        });
    }

    this.selectedDeclareDate = this.formGp.get('DeclareDate_FinishDates_And_Costs').value.format('YYYY/MM/DD');
    this.selectedStartDate = this.formGp.get('StartDate_Contract').value.format('YYYY/MM/DD');
    this.selectedFinishDate = this.formGp.get('FinishDate_Contract').value.format('YYYY/MM/DD');
    if (this.isPreContract) {
      this.selectedDocToComptroller = this.formGp.get('DocToComptroller').value.format('YYYY/MM/DD');
      this.selectedSigningRecall = this.formGp.get('SigningRecall').value.format('YYYY/MM/DD');
      this.selectedWinnerDeclare = this.formGp.get('WinnerDeclare').value.format('YYYY/MM/DD');
    }
    this.sharedService.getContractServices().subscribe(
      (data) => {
        this.contractServices = data.filter(v => v.ServiceID !== 7);
        for (let i = 0; i < this.contractServices.length; i++) {
          this.addContractService.emit(i);
        }

        const contractServiceCheckboxes = [];
        for (let i = 0; i < this.contractServices.length; i++) {
          const cs = this.formGp.get('ContractServices').value.filter(v => v === this.contractServices[i].Id);
          let control;
          if (cs.length > 0) {
            contractServiceCheckboxes.push(true);
            control = new FormControl(true);
          } else {
            contractServiceCheckboxes.push(false);
            control = new FormControl(false);
          }
          (<FormArray>this.formGp.get('ContractNatureId')).push(control);
        }
        for (let i = 0; i < this.formGp.get('ContractNatureId').value.length; i++) {
          this.contractNatureIds.push(i);
        }
        this.formGp.get('ContractNatureId');
        this.formGp.get('ContractNatureId').setValue(contractServiceCheckboxes);
        if (this.isReadOnly) {
          this.formGp.get('ContractNatureId').disable();
        }
        setTimeout(() => {
          this.formGp.valueChanges.subscribe(
            () => {
              this.sharedService.stepsDirty.contractForm = true;
            });
        }, 300);
        this.contractServices.filter((v, index) => {
          if (this.formGp.get('ContractNatureId').value[index]) {
            this.selectedServiceNames.push(v.Name);
          }
        });
      }
    );

    this.sharedService.getContractCurrencies().subscribe(
      (data) => this.currencies = data
    );

    if (!this.isPreContract) {
      this.sharedService.getContractors().subscribe(
        (data) => {
          this.contractors = data;
          if (this.formGp.get('Id_Contractor').value) {
            if (this.contractors.filter(v => v.Id === this.formGp.get('Id_Contractor').value.Id).length === 0) {
              this.formGp.get('Id_Contractor').setValue(null);
            }
          }
        }
      );
    }

    this.sharedService.getRaiParts().subscribe(
      (data) => this.raiParts = data
    );

    if (this.sharedService.isReadOnly) {
      this.sharedService.getSubUnits().subscribe(
        (data) => {
          this.subUnits = data;
          this.subUnitsNames = data;
        }
      );
    } else {
      this.starter();
      this.sharedService.getSubUnits().subscribe(
        (data) => {
          this.subUnits = data;
          this.subUnitsNames = data;
          if (this.formGp.get('Id_SubUnit').value) {
            this.subUnitsNames = this.subUnits.filter(v => {
              if (v.Id_Unit.indexOf(this.formGp.value.Id_Unit) > -1) {
                return true;
              } else {
                return false;
              }
            });
          }
        }
      );
    }

    this.filteredOptionsPM = this.formGp.get('PMId_User').valueChanges
      .pipe(
        startWith<string | any>(''),
        map(val => this.filterPM(val))
      );

    if (!this.isPreContract) {
      this.filteredContractors = this.formGp.get('Id_Contractor').valueChanges
        .pipe(
          startWith<string | any>(''),
          map(val => this.filter3(val, 1))
        );
    }
  }


  onAddCost() {
    this.addCost.emit([this.formGp.get('ContractServices').value, true]);
  }

  onDeleteCost(id: number) {
    this.addCost.emit([null, false, id]);
  }

  starter() {
    if (this.sharedService.userData) {
      console.log(2222);
      this.gettUs(this.sharedService.userData);
    } else {
      console.log(3333);
      this.sharedService.user2.subscribe(
        (userData) => {
          this.gettUs(userData);
        });
    }
  }

  getServiceNames(serviceId) {
    try {
      const cs = this.contractServices.filter(v => v.Id === serviceId)[0];
      if (this.isReadOnly) {
        this.formGp.disable();
      }
      if (cs) {
        return cs.Name;
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }

  onChangeFinancial(e) {
    this.sharedService.isFinancialSubject.next(e.checked);
  }

  gettUs(userData) {
    const user = <any>userData;
    this.importerId = user.Id_Importer;
    this.formGp.get('Id_Importer').setValue(this.importerId);
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

  onChangeCurrency(e) {
    this.formGp.get('Cost_EqCosts').setValue(null);
  }

  addConstractor() {
    const dialogRef = this.dialog.open(ContractorAddRowComponent, {
      width: '700px',
      height: '600px',
      data: {
        data: '',
      }
    });
    dialogRef.afterClosed().subscribe(
      (result) => {
        if (isUndefined(result) || result === '') {
        } else {
          this.sharedService.getDataFromContextInfo().subscribe(
            (digestValue) => {
              this.sharedService.addContractor(digestValue, result).subscribe(
                (contractorRes: any) => {
                  this.sharedService.getContractors().subscribe(
                    (data2) => {
                      this.contractors = data2;
                      const contractor = this.contractors.filter(v => v.Id === contractorRes.d.ID)[0];
                      this.formGp.get('Id_Contractor').setValue(contractor);
                    });
                });
            }
          );
          this.newContractors.push(result);
          setTimeout(() => {
          }, 100);
        }
      });
  }

  filter3(val, type: number) {
    let searched = val;
    if (searched.Name) {
      searched = searched.Name;
    }
    searched = searched.replace('شرکت', '');
    searched = searched.replace('خانم', '');
    searched = searched.replace('آقای', '');
    searched = searched.replace('مشارکت', '');
    return this.contractors.filter(option =>
      option.Name.indexOf(searched) >= 0);
  }

  filterPM(val) {
    return this.projectManagers2;
  }

  checkBoxChange(e, i, service, serviceId) {

    let control;
    this.defContractServices[i] = service;
    if (service) {
      control = new FormControl(serviceId);
      (<FormArray>this.formGp.get('ContractServices')).push(control);
      this.inputServiceNames.push(this.contractServices.filter(v => v.Id === serviceId)[0].Name);
      // this.onAddCost();
      // const si = this.formGp.get('ContractServices').value.filter(v => v === serviceId).length;
      // if (si === 0) {

      //   (<FormArray>this.formGp.get('Costs')).push(null);
      // }
      // const control2 = new FormControl(0);
      // (<FormArray>this.formGp.get('Costs')).push(control2);
    } else {
      const si = this.formGp.get('ContractServices').value.findIndex(v => v === serviceId);
      (<FormArray>this.formGp.get('ContractServices')).removeAt(si);
      // this.inputServiceNames.push(this.contractServices.filter(v => v.Id === serviceId)[0].Name);
      // this.onAddCost();
      // this.onDeleteCost(i);

      // (<FormArray>this.formGp.get('Costs')).removeAt(si);
      // this.onDeleteCost(i);
    }
    while (this.formGp.get('Costs').value.length !== 0) {
      (<FormArray>this.formGp.get('Costs')).removeAt(0);
    }

    let counter = 0;
    console.log(this.contractServices);
    this.formGp.get('ContractServices').value.filter(v => {
      if (+this.contractServices.filter(v2 => v2.Id === v)[0].PCType > 0) {
        counter++;
      }
    });

    if (counter === 0) {
      this.sharedService.isProgressSubject1.next(false);
      // this.isProgress = false;
    } else {
      this.sharedService.isProgressSubject1.next(true);
      // this.isProgress = true;
    }

    for (let i = 0; i < this.formGp.get('ContractServices').value.length; i++) {
      const control2 = new FormControl(null);
      (<FormArray>this.formGp.get('Costs')).push(control2);
      (<FormArray>this.formGp.get('Costs')).controls[i].setValue(null);
    }


    console.log(this.formGp.get('ContractServices').value);
    console.log(this.formGp.get('Costs').value);
    this.selectedServiceNames = [];
    this.contractServices.filter((v, index) => {
      if (this.formGp.get('ContractNatureId').value[index]) {
        this.selectedServiceNames.push(v.Name);
      }
    });
    console.log(this.selectedServiceNames);
    this.inputServiceNames.push(this.contractServices.filter(v => v.Id === serviceId)[0].Name);

  }

  displayFnPM(user?): string | undefined {
    return user ? user.User.Title : undefined;
  }

  displayFn(user?): string | undefined {
    return user ? user.Name : undefined;
  }

  onSelectUnit(e) {
    const selectedUnit = e.value;
    this.formGp.get('PMOExpertId_User').setValue(this.units.filter(v => v.Id === selectedUnit)[0].DefaultPMOExpertId_User);
    this.subUnitsNames = this.subUnits.filter(v => {
      if (v.Id_Unit.indexOf(selectedUnit) > -1) {
        return true;
      } else {
        return false;
      }
    });
    this.projectManagers2 = this.projectManagers2Names.filter(v => v.UnitsId.includes(selectedUnit));
    if (this.formGp.get('Id_SubUnit').value) {
      this.formGp.get('Id_SubUnit').setValue(this.formGp.value.Id_SubUnit);
    }
    this.formGp.get('PMId_User').setValue('');
    this.formGp.get('Id_SubUnit').setValue('');
    console.log('akab');
  }

  onChangeCost(e) {
  }

  getSum(total, num) {
    return total + num;
  }
}
