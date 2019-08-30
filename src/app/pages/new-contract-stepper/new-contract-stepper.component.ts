import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {SharedService} from '../../shared/services/shared.service';
import {ValidateNumeric} from '../../shared/validators/numeric.validator';
import {StepFormsDataList} from '../../shared/models/stepFormModels/stepFormsData.model';
import {StepContractFormList} from '../../shared/models/stepFormModels/stepContractForm.model';
import {AlertsService} from '../../shared/services/alerts.service';
import * as moment from 'jalali-moment';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {ContractTypesList} from '../../shared/models/contractTypes.model';
import {ZonesList} from '../../shared/models/zones.model';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {HotTableRegisterer} from '@handsontable-pro/angular';
import {NewContractStepperGaurdService} from '../../shared/gaurds/new-contract-stepper-gaurd.service';
import {Title} from '@angular/platform-browser';
import {isUndefined} from 'util';
import {CurrentUserList} from '../../shared/models/currentUser.model';


@Component({
  selector: 'app-new-contract-stepper',
  templateUrl: './new-contract-stepper.component.html',
  styleUrls: ['./new-contract-stepper.component.scss'],
  animations: [
    trigger('div1', [
      state('in', style({
        opacity: 1,
        transform: 'rotate(240deg)'
      })),
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'rotate(140deg)'
        }),
        animate('1s 1ms')
      ]),
    ])
  ]
})
export class NewContractStepperComponent implements OnInit {
  pillarStakeHoldersForm: FormGroup[] = [];
  nopillarStakeHoldersForm: FormGroup[] = [];
  rolesControl: FormControl[] = [];
  nRolesControlnoPillar: FormControl[] = [];
  finalApprovalFormGroup: FormGroup;
  assignedCostResourcesForm: FormGroup;
  contractsForm: FormGroup;
  ContractNatureId = [];
  deliverablesForm = [];
  contractDataForm: StepContractFormList;
  ovj = [];
  cashFlowPlanTable;
  checkRemoveColumnAdded = 0;
  today = {
    en: '',
    fa: ''
  };
  contractServices: ContractTypesList[];
  zones: ZonesList[] = [];
  editable = false;
  editable2 = false;
  stepLocks;
  isReadOnly: boolean;
  firstStep = 0;
  stepSituation = {
    contractForm: {
      default: false,
      exist: false
    },
    costAssignedResource: {
      default: false,
      exist: false
    },
    stakeHolders: {
      default: false,
      exist: false
    },
    planActsProp: {
      default: false,
      exist: false
    },
    cashFlowPlan: {
      default: false,
      exist: false
    },
    financialRequests: {
      default: false,
      exist: false
    },
    deliverables: [],
    finalStep: {
      default: false,
      exist: false
    },
  };
  selectedIndex = 0;
  currentIndex = 0;
  text = [];
  finalValid = false;
  newDates = [];
  checkDataArrive = false;
  isFinancial = true;
  isProgress = false;
  isPreContract = false;

  constructor(private _formBuilder: FormBuilder,
              private sharedService: SharedService,
              private alertsService: AlertsService,
              private hotRegisterer: HotTableRegisterer,
              private titleService: Title,
              private newContractStepperGaurd: NewContractStepperGaurdService,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
    if (this.activatedRoute.snapshot.url[0].path === 'pre-contract') {
      this.isPreContract = true;
    }
    this.isReadOnly = this.sharedService.isReadOnly;
    if (this.newContractStepperGaurd.isPM) {
      this.starter();
    }
  }

  ngOnInit() {
    console.log(this.isPreContract);
    this.sharedService.isProgressSubject1.subscribe(
      (checked: any) => {
        this.isProgress = checked;
      }
    );

    this.sharedService.isFinancialSubject.subscribe(
      (checked) => {
        this.isFinancial = !checked;
      }
    );
    this.sharedService.getCurrentUser().subscribe(
      (currentUser: CurrentUserList) => {
        this.sharedService.getUserInformation(currentUser.Id).subscribe();
      }
    );
  }

  onCheckAllValidations(e) {
    this.text = [];
    this.checkContractsFormValidation(0, true, true);
    this.checkAssignedCostResourcesFormValidation(0, true, true);
    this.checkStakeHoldersFormValidation(0, true, true);
    this.checkCashFlowPlanFormValidation(0, true, true);

    if (!this.isPreContract) {
      if (this.sharedService.stepFormsData.contractsForm.IsFinancial === false) {
        let sum = 0;
        let mainfrtExist = false;
        console.log(this.sharedService.stepFormsData.financialRequests);
        if (this.sharedService.stepFormsData.financialRequests) {
          this.sharedService.stepFormsData.financialRequests.map(v => {
            if (v.FinancialRequestType.ID === 1) {
              mainfrtExist = true;
              sum = +sum + +v.GrossAmount;
            }
          });
        }

        console.log(sum);
        // if (+sum > +this.sharedService.stepFormsData.contractsForm.Cost_Costs) {
        if (+sum > +this.sharedService.stepFormsData.contractsForm.Cost_Costs || (sum === 0 && mainfrtExist)) {
          this.stepSituation.financialRequests.default = false;
          this.stepSituation.financialRequests.exist = true;
          if (sum === 0) {
            this.text.push({
              name: 'اطلاعات مالی',
              content: 'اطلاعات ناقص هستند'
            });
          } else {
            this.text.push({
              name: 'اطلاعات مالی',
              content: this.showFinancialValidation(false)
            });
          }
        } else {
          this.stepSituation.financialRequests.default = true;
          this.stepSituation.financialRequests.exist = true;
          this.text.push({
            name: 'اطلاعات مالی',
            content: null
          });
        }
      } else {
        this.text.push({
          name: 'اطلاعات مالی',
          content: null
        });
        if (!this.sharedService.stepFormsData.financialRequests) {
          this.sharedService.stepFormsData.financialRequests = [];
        }
        if (!this.sharedService.stepFormsData.financialPayments) {
          this.sharedService.stepFormsData.financialPayments = [];
        }
      }
    }

    let counter = 0;
    this.contractDataForm.ContractServices.filter(v => {
      if (+this.contractServices.filter(v2 => v2.Id === v)[0].PCType > 0) {
        counter++;
      }
    });

    if (counter === 0 || this.isPreContract) {
      // this.sharedService.isProgressSubject1.next(false);
      // this.isProgress = false;
    } else {
      if (this.sharedService.isReadOnly) {

      } else {
        this.checkPlanActPropValidation('planActsPropTable', true, true);
      }
      // this.isProgress = true;
    }
    // if (this.sharedService.isProgress) {
    //   this.checkPlanActPropValidation('planActsPropTable', true, true);
    // } else {
    //   // this.text.push({
    //   //   name: 'درصد پیشرفت',
    //   //   content: null
    //   // });
    // }

    if (this.sharedService.stepFormsData.deliverablesForm) {
      for (let i = 0; i < this.sharedService.stepFormsData.deliverablesForm.length; i++) {
        // if (this.deliverablesForm[i].name_Deliverable) {
        this.checkDeliverablesValidation(this.sharedService.stepFormsData.deliverablesForm[i], i, true, true);
        // this.stepSituation.deliverables.push({
        //   default: false,
        //   exist: false
        // });
        // }
      }
    }

    if (this.text.filter(v => v.content === null).length === this.text.length) {
      this.finalValid = true;
    } else {
      this.finalValid = false;
    }


  }

  stepChange(step: number, delServiceId?: any, typeDel?: boolean) {
    const counter = 0;
    let id = this.selectedIndex;
    this.currentIndex = step;
    if (this.sharedService.stepFormsData.deliverablesForm.length + 5 === step && typeDel) {
      id = 10;
      this.currentIndex = 10;
    }
    if (id === 7 || id === 8 || id === 9 || id === 10 || id === 11) {
      this.indexingSteps();
    }
    if (id === 0) {
      if (this.stepLocks) {
        this.checkContractsFormValidation(0);
      } else {
        this.indexingSteps();
      }
    } else if (id === 1) {
      if (this.sharedService.stepsDirty.costAssignedResourcesForm) {
        this.checkAssignedCostResourcesFormValidation(0);
      } else {
        this.indexingSteps();
      }
    } else if (id === 2) {
      if (this.sharedService.stepsDirty.stakeHoldersForms) {
        this.checkStakeHoldersFormValidation(0);
      } else {
        this.indexingSteps();
      }
    } else if (id === 3) {
      if (this.sharedService.stepsDirty.planActsProp) {
        this.checkPlanActPropValidation('planActsPropTable');
      } else {
        this.indexingSteps();
      }
    } else if (id === 4) {
      if (this.sharedService.stepsDirty.cashFlow) {
        this.checkCashFlowPlanFormValidation(0);
      } else {
        this.indexingSteps();
      }
    } else {
      if (this.sharedService.stepsDirty.deliverable) {
        this.checkDeliverablesValidation(this.deliverablesForm[id - 5], 0, false, true, id - 5);
      } else {
        this.indexingSteps();
      }
    }
  }

  indexingSteps() {
    if (!this.stepLocks) {
      this.firstStep = this.currentIndex;
    }
    this.selectedIndex = this.currentIndex;
  }

  checkDelShow(del) {
    if (this.contractServices) {
      const haveDeliverable = this.contractServices.filter(v => {
        if ((v.Id === del.serviceId) && +v.DeliverableType > 0) {
          return true;
        }
      });
      if (haveDeliverable.length !== 0) {
        return true;
      } else {
        return false;
      }
    }
  }

  styleObject(id: number) {
    const styles: any = {};
    if (this.firstStep === id) {
      styles.background = 'rgba(206, 217, 223, 0.47)';
    }
    if (this.stepLocks) {
      styles.color = '#b5b5b5';
      styles.cursor = 'not-allowed';
    }
    return styles;
  }

  iconStyleObject() {
    const styles: any = {};
    if (this.stepLocks) {
      styles.filter = 'contrast(0%)';
    }
    return styles;
  }

  starter() {
    // debugger
    this.stepLocks = this.sharedService.stepLocks;
    this.sharedService.stepLocksSubject
      .subscribe(
        (data) => {
          this.stepLocks = data;
        }
      );

    this.sharedService.getDataJson(this.newContractStepperGaurd.contractID, this.isPreContract)
      .subscribe(
        (data: StepFormsDataList) => {
          console.log(data);
          setTimeout(() => {
            if (data.contractsForm) {
              this.stepSituation.contractForm.exist = true;
            }
            if (data.assignedCostResourcesForm) {
              this.stepSituation.costAssignedResource.exist = true;
            }
            if (data.stackHoldersForm) {
              this.stepSituation.stakeHolders.exist = true;
            }
            if (data.progressPlansForm) {
              this.stepSituation.planActsProp.exist = true;
            }
            if (data.cashFlowPlanForm) {
              this.stepSituation.cashFlowPlan.exist = true;
            }
            if (data.finalApprovalForm) {
              this.stepSituation.finalStep.exist = true;
            }
            if (data.deliverablesForm) {

            }
            this.deliverablesForm = data.deliverablesForm;
            this.contractDataForm = data.contractsForm;
            this.sharedService.getContractServices().subscribe(
              (data) => {
                this.contractServices = data;
                let counter = 0;
                this.contractDataForm.ContractServices.filter(v => {
                  if (+this.contractServices.filter(v2 => v2.Id === v)[0].PCType > 0) {
                    counter++;
                  }
                });
                console.log(this.contractDataForm, this.contractDataForm.ContractServices, this.contractServices);
                if (counter === 0) {
                  this.sharedService.isProgressSubject1.next(false);
                } else {
                  this.sharedService.isProgressSubject1.next(true);
                }
              }
            );
            this.setTitle(this.contractDataForm.FullTitle_Contract);
            this.buildContractForm();
            if (this.sharedService.stepFormsData.assignedCostResourcesForm) {
              const hobbies: any = this.sharedService.stepFormsData.assignedCostResourcesForm.hobbies;
              const costResources = this.sharedService.stepFormsData.assignedCostResourcesForm.CostResources;
              for (let i = 0; i < hobbies.length; i++) {
                this.addHobby([hobbies[i], costResources[i]]);
              }
            } else {
              this.addHobby([null, null]);
            }
            this.ContractNatureId = data.contractsForm.ContractNatureId;
            if (data.stackHoldersForm) {
              for (let i = 0; i < data.stackHoldersForm.length; i++) {
                this.addPillarStakeHoldersForm(
                  data.stackHoldersForm[i].OragnizationName_StakeholdersCon,
                  data.stackHoldersForm[i].Role_StakeholdersContract,
                  data.stackHoldersForm[i].Role_Other_StakeholdersContract,
                  data.stackHoldersForm[i].AgentName_StakeholdersContract,
                  data.stackHoldersForm[i].Id_ContractAgentPostions,
                  data.stackHoldersForm[i].pish_PhoneNumber_StakeholdersContract,
                  data.stackHoldersForm[i].PhoneNumber_StakeholdersContract,
                  data.stackHoldersForm[i].int_PhoneNumber_StakeholdersContract,
                  data.stackHoldersForm[i].Address_StakeholdersContract,
                  data.stackHoldersForm[i].Email_StakeholdersContract,
                  i
                );
              }
            } else {
              let shFormNumber = 3;
              if (this.isPreContract) {
                shFormNumber = 1;
              }
              for (let i = 0; i < shFormNumber; i++) {
                this.addPillarStakeHoldersForm(
                  null,
                  null,
                  null,
                  null,
                  null,
                  null,
                  null,
                  null,
                  null,
                  null,
                  i
                );
              }
            }
            if (data.stackHoldersForm2) {
              for (let i = 0; i < data.stackHoldersForm2.length; i++) {
                this.addNoPillarStakeHoldersForm(
                  data.stackHoldersForm2[i].OragnizationName_StakeholdersCon,
                  data.stackHoldersForm2[i].Role_StakeholdersContract,
                  data.stackHoldersForm2[i].Role_Other_StakeholdersContract,
                  data.stackHoldersForm2[i].AgentName_StakeholdersContract,
                  data.stackHoldersForm2[i].Id_ContractAgentPostions,
                  data.stackHoldersForm2[i].pish_PhoneNumber_StakeholdersContract,
                  data.stackHoldersForm2[i].PhoneNumber_StakeholdersContract,
                  data.stackHoldersForm2[i].int_PhoneNumber_StakeholdersContract,
                  data.stackHoldersForm2[i].Address_StakeholdersContract,
                  data.stackHoldersForm2[i].Email_StakeholdersContract,
                  i
                );
              }
            } else {
            }
            this.stepBuilder();
            setTimeout(() => {
              this.checkAllValidationsInFirstPlace();
              if (this.contractDataForm.StartDate_Contract && this.contractDataForm.FinishDate_Contract) {
              }
              if (+new Date(this.today.fa) > +new Date(this.contractDataForm.FinishDate_Contract)) {
                this.checkAllValidationsInFirstPlace();
              }
            }, 1000);
            this.checkDataArrive = true;
          }, 100);
        }
      );
    this.sharedService.today.subscribe(
      (data: any) => {
        this.today.en = data;
        const mainDate = moment(this.sharedService.todayData, 'YYYY/M/D');
        // mainDate = moment('2017-07-09', 'YYYY/M/D');
        this.today.fa = mainDate.format('jYYYY/jM/jD');
      }
    );
    this.sharedService.getTodayDateFromContextInfo().subscribe();
    this.sharedService.getZones().subscribe(
      (data) => {
        this.zones = data;
      });
    this.assignedCostResourcesForm = this._formBuilder.group({
      CostResources: new FormArray([]),
      hobbies: new FormArray([], [Validators.required])
    });
    this.finalApprovalFormGroup = this._formBuilder.group({
      Description: ['', Validators.required],
      isApproved: ['', Validators.required],
      approver: ['', Validators.required],
      date: ['', Validators.required],
      role: ['', Validators.required]
    });

    this.sharedService.contractServicesSubject.subscribe(
      (data: any) => {
        this.sharedService.stepFormsData.contractsForm.ContractNatureId = data;
        console.log(data);
        this.stepBuilder();
      }
    );
  }

  checkAllValidationsInFirstPlace() {
    this.checkContractsFormValidation(0, true);
    this.checkAssignedCostResourcesFormValidation(0, true);
    for (let i = 0; i < this.deliverablesForm.length; i++) {
      this.stepSituation.deliverables.push({
        default: false,
        exist: false
      });
    }
    this.checkStakeHoldersFormValidation(0, true);
    this.checkPlanActPropValidation('planActsPropTable', true);
    this.checkCashFlowPlanFormValidation(0, true, true);
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  stepBuilder() {
    this.ovj = [];
    const steps = this.sharedService.stepFormsData.contractsForm.ContractNatureId;
    if (steps[0]) {
      this.ovj.push(0);
      this.ovj.push(1);
      this.ovj.push(7);
    }
    if (steps[1]) {
      this.ovj.push(0);
      this.ovj.push(2);
      this.ovj.push(8);
    }
    if (steps[2]) {
      this.ovj.push(0);
      this.ovj.push(1);
      this.ovj.push(9);
    }
    if (steps[3]) {
    }
    if (steps[4]) {
      this.ovj.push(1);
    }
  }

  buildContractForm() {
    const contractorsControl: FormControl = new FormControl(this.contractDataForm.Id_Contractor);
    if (this.isPreContract) {
      this.contractsForm = this._formBuilder.group({
        Code_Contract: new FormControl(this.contractDataForm.Code_Contract, [Validators.required]),
        FullTitle_Contract: new FormControl(this.contractDataForm.FullTitle_Contract, [Validators.required]),
        ShortTitle_Contract: [this.contractDataForm.ShortTitle_Contract],
        Subject_Contract: new FormControl(this.contractDataForm.Subject_Contract, [Validators.required, Validators.minLength(30)]),
        StartDate_Contract: new FormControl(moment(this.contractDataForm.StartDate_Contract, 'jYYYY/jMM/jDD')),
        FinishDate_Contract: new FormControl(moment(this.contractDataForm.FinishDate_Contract, 'jYYYY/jMM/jDD')),
        DeclareDate_FinishDates_And_Costs: new FormControl(moment(this.contractDataForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jMM/jDD')),
        GuaranteePeriod: new FormControl(this.contractDataForm.GuaranteePeriod, [Validators.required, Validators.min(0), ValidateNumeric]),
        Cost_Costs: new FormControl(this.contractDataForm.Cost_Costs, [Validators.required, Validators.min(100), ValidateNumeric]),
        Cost_EqCosts: new FormControl(this.contractDataForm.Cost_EqCosts, [Validators.min(100), ValidateNumeric]),
        Costs: new FormArray([]),
        Id_Unit: new FormControl(this.contractDataForm.Id_Unit, [Validators.required]),
        Id_SubUnit: new FormControl(this.contractDataForm.Id_SubUnit, [Validators.required]),
        ContractNatureId: new FormArray([]),
        Id_ContractType: new FormControl(this.contractDataForm.Id_ContractType),
        SignatoryRaiParts: new FormControl(this.contractDataForm.SignatoryRaiParts, [Validators.required]),
        Id_Currency: new FormControl(this.contractDataForm.Id_Currency, [Validators.required]),
        PMOExpertId_User: new FormControl(this.contractDataForm.PMOExpertId_User, [Validators.required]),
        PMId_User: new FormControl(this.contractDataForm.PMId_User, [Validators.required]),
        Id_Importer: new FormControl(''),
        Standards_Contract: [this.contractDataForm.Standards_Contract, [Validators.required, Validators.minLength(30)]],
        ContractServices: new FormArray([]),
        Zones: new FormControl(this.contractDataForm.Zones, [Validators.required]),
        OperationalPriority: new FormControl(this.contractDataForm.OperationalPriority, [Validators.required]),
        OperationType: new FormControl(this.contractDataForm.OperationType, [Validators.required]),
        Goal: new FormControl(this.contractDataForm.Goal, [Validators.required]),
        Demandant: new FormControl(this.contractDataForm.Demandant, [Validators.required]),
        TenderType: new FormControl(this.contractDataForm.TenderType, [Validators.required]),
        TenderOrganizer: new FormControl(this.contractDataForm.TenderOrganizer, [Validators.required]),
        DocToComptroller: new FormControl(moment(this.contractDataForm.DocToComptroller, 'jYYYY/jMM/jDD')),
        SigningRecall: new FormControl(moment(this.contractDataForm.SigningRecall, 'jYYYY/jMM/jDD')),
        WinnerDeclare: new FormControl(moment(this.contractDataForm.WinnerDeclare, 'jYYYY/jMM/jDD')),
      });
    } else {
      this.contractsForm = this._formBuilder.group({
        Code_Contract: new FormControl(this.contractDataForm.Code_Contract, [Validators.required]),
        FullTitle_Contract: new FormControl(this.contractDataForm.FullTitle_Contract, [Validators.required]),
        ShortTitle_Contract: [this.contractDataForm.ShortTitle_Contract],
        Number_Contract: new FormControl(this.contractDataForm.Number_Contract, [Validators.required]),
        Subject_Contract: new FormControl(this.contractDataForm.Subject_Contract, [Validators.required, Validators.minLength(30)]),
        StartDate_Contract: new FormControl(moment(this.contractDataForm.StartDate_Contract, 'jYYYY/jMM/jDD')),
        FinishDate_Contract: new FormControl(moment(this.contractDataForm.FinishDate_Contract, 'jYYYY/jMM/jDD')),
        DeclareDate_FinishDates_And_Costs: new FormControl(moment(this.contractDataForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jMM/jDD')),
        GuaranteePeriod: new FormControl(this.contractDataForm.GuaranteePeriod, [Validators.required, Validators.min(0), ValidateNumeric]),
        Cost_Costs: new FormControl(this.contractDataForm.Cost_Costs, [Validators.required, Validators.min(100), ValidateNumeric]),
        Cost_EqCosts: new FormControl(this.contractDataForm.Cost_EqCosts, [Validators.min(100), ValidateNumeric]),
        Costs: new FormArray([]),
        Id_Unit: new FormControl(this.contractDataForm.Id_Unit, [Validators.required]),
        Id_SubUnit: new FormControl(this.contractDataForm.Id_SubUnit, [Validators.required]),
        ContractNatureId: new FormArray([]),
        Id_ContractType: new FormControl(this.contractDataForm.Id_ContractType),
        SignatoryRaiParts: new FormControl(this.contractDataForm.SignatoryRaiParts, [Validators.required]),
        Id_Currency: new FormControl(this.contractDataForm.Id_Currency, [Validators.required]),
        PMOExpertId_User: new FormControl(this.contractDataForm.PMOExpertId_User, [Validators.required]),
        PMId_User: new FormControl(this.contractDataForm.PMId_User, [Validators.required]),
        Id_Contractor: contractorsControl,
        Id_Importer: new FormControl(''),
        Standards_Contract: [this.contractDataForm.Standards_Contract, [Validators.required, Validators.minLength(30)]],
        ContractServices: new FormArray([]),
        IsFinancial: new FormControl(this.contractDataForm.IsFinancial),
        Zones: new FormControl(this.contractDataForm.Zones, [Validators.required]),
        OperationalPriority: new FormControl(this.contractDataForm.OperationalPriority, [Validators.required]),
        OperationType: new FormControl(this.contractDataForm.OperationType, [Validators.required]),
        Goal: new FormControl(this.contractDataForm.Goal, [Validators.required]),
        Demandant: new FormControl(this.contractDataForm.Demandant, [Validators.required]),
      });
    }

    if (!this.contractDataForm.Id_Currency) {
      this.contractsForm.get('Id_Currency').setValue('IRR');
    }
    this.contractsForm.get('Id_Unit').setValue(this.contractDataForm.Id_Unit);
    if (this.isReadOnly) {
      this.contractsForm.disable();
    }

    for (let i = 0; i < this.contractDataForm.ContractServices.length; i++) {
      const control = new FormControl(this.sharedService.stepFormsData.contractsForm.ContractServices[i]);
      (<FormArray>this.contractsForm.get('ContractServices')).push(control);
    }

    this.sharedService.isFinancialSubject.next(this.contractDataForm.IsFinancial);

    for (let i = 0; i < this.contractDataForm.ContractNatureId.filter(v => v).length; i++) {
      let control = null;
      if (this.contractDataForm.Costs[i]) {
        control = new FormControl(this.contractDataForm.Costs[i], Validators.required);
      } else {
        control = new FormControl(null, Validators.required);
      }
      (<FormArray>this.contractsForm.get('Costs')).push(control);
    }

    if (this.contractsForm.invalid) {
      this.sharedService.changeStepLocks(true);
    }
  }

  addContractService(passedData) {
  }

  addCost(passedData) {
    while (this.contractsForm.get('Costs').value.length !== 0) {
      (<FormArray>this.contractsForm.get('Costs')).removeAt(0);
    }

    // for (let i = 0; i < passedData[0].length; i++) {
    //   let control = null;
    //   if (this.contractDataForm.Costs[i]) {
    //     control = new FormControl(null, Validators.required);
    //   } else {
    //     control = new FormControl(null, Validators.required);
    //   }
    //   (<FormArray>this.contractsForm.get('Costs')).push(control);
    // }
    console.log(this.contractsForm.get('Costs').value);
    // const costs = [];
    // for (let i = 0; i < 3; i++) {
    //   const control = new FormControl(100, Validators.required);
    //   (<FormArray>this.contractsForm.get('Costs')).setValue(control);
    // }
    //
    // console.log(this.contractsForm.get('Costs').value);
    // if (passedData[1]) {
    //   const control = new FormControl(passedData[0], Validators.required);
    //   (<FormArray>this.contractsForm.get('Costs')).push(control);
    // } else {
    //   (<FormArray>this.contractsForm.get('Costs')).removeAt(passedData[2]);
    // }
  }

  addHobby(passedData) {
    const control = new FormControl(passedData[0], [Validators.required, Validators.min(1)]);
    (<FormArray>this.assignedCostResourcesForm.get('hobbies')).push(control);

    const control2 = new FormControl(passedData[1], Validators.required);
    (<FormArray>this.assignedCostResourcesForm.get('CostResources')).push(control2);
    if (this.isReadOnly) {
      this.assignedCostResourcesForm.disable();
    }
  }

  deleteHobby(id: number) {
    (<FormArray>this.assignedCostResourcesForm.get('hobbies')).removeAt(id);
    (<FormArray>this.assignedCostResourcesForm.get('CostResources')).removeAt(id);
  }

  deleteStakeHoldersForm(id: number, isPillar: boolean) {
    if (isPillar) {
      this.pillarStakeHoldersForm.splice(id, 1);
    } else {
      this.nopillarStakeHoldersForm.splice(id, 1);
    }
  }

  addPillarStakeHoldersForm(Org = '', Rol = '', RolOther = '', Ag = '', Id = '', pish = '', phone = '', int = '', add = '', eml = '', i = 0) {
    this.rolesControl[i] = new FormControl(Rol, [Validators.min(3)]);
    this.pillarStakeHoldersForm.push(this._formBuilder.group({
      OragnizationName_StakeholdersCon: [Org, Validators.required],
      Role_StakeholdersContract: [Rol, Validators.required],
      Role_Other_StakeholdersContract: [RolOther],
      AgentName_StakeholdersContract: [Ag, Validators.required],
      Id_ContractAgentPostions: [Id, Validators.required],
      pish_PhoneNumber_StakeholdersContract: [pish, Validators.required],
      PhoneNumber_StakeholdersContract: [phone, Validators.required],
      int_PhoneNumber_StakeholdersContract: [int],
      Address_StakeholdersContract: [add],
      Email_StakeholdersContract: [eml]
    }));
    if (this.isReadOnly) {
      this.pillarStakeHoldersForm[i].disable();
    }
  }

  getDeliverableFormIndex(servciceId: number) {
    return this.sharedService.stepFormsData.deliverablesForm.findIndex(a => a.serviceId === servciceId);
  }

  addNoPillarStakeHoldersForm(Org = '', Rol = '', RolOther = '', Ag = '', Id = '', pish = '', phone = '', int = '', add = '', eml = '', i = 0) {
    this.nRolesControlnoPillar[i] = new FormControl(Rol, [Validators.min(3)]);
    this.nopillarStakeHoldersForm.push(this._formBuilder.group({
      OragnizationName_StakeholdersCon: [Org, Validators.required],
      Role_StakeholdersContract: [Rol, Validators.required],
      Role_Other_StakeholdersContract: [RolOther],
      AgentName_StakeholdersContract: [Ag, Validators.required],
      Id_ContractAgentPostions: [Id, Validators.required],
      pish_PhoneNumber_StakeholdersContract: [pish, Validators.required],
      PhoneNumber_StakeholdersContract: [phone, Validators.required],
      int_PhoneNumber_StakeholdersContract: [int],
      Address_StakeholdersContract: [add],
      Email_StakeholdersContract: [eml]
    }));
    if (this.isReadOnly) {
      this.nopillarStakeHoldersForm[i].disable();
    }
  }

  checkAssignedCostResourcesFormValidation(e, firstTime?: boolean, isText?: boolean) {
    if (!firstTime) {
      this.stepSituation.costAssignedResource.exist = true;
    }
    const validations = {
      sumCosts: true,
      duplicate: false
    };
    if (this.assignedCostResourcesForm.get('hobbies').value.reduce(this.getSum) !== this.contractsForm.get('Cost_Costs').value) {
      validations.sumCosts = false;
    }
    const findDuplicates = this.assignedCostResourcesForm.get('CostResources').value.reduce(function (acc, el, i, arr) {
      if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) {
        acc.push(el);
      }
      return acc;
    }, []);
    if (findDuplicates.length > 0) {
      validations.duplicate = true;
    }

    if (!validations.sumCosts || this.assignedCostResourcesForm.invalid || validations.duplicate) {
      this.stepSituation.costAssignedResource.default = false;
      const text = this.showAssignedCostResourcesFormValidation(validations.sumCosts, validations.duplicate);
      if (firstTime) {
        if (isText) {
          this.text.push({
            name: 'محل تامین اعتبار',
            content: text
          });
        }
      } else {
        this.showWrongMessage(text);
      }
    } else {
      if (firstTime) {
        if (isText) {
          this.text.push({
            name: 'محل تامین اعتبار',
            content: null
          });
        }
        this.stepSituation.costAssignedResource.exist = true;
        this.stepSituation.costAssignedResource.default = true;
      } else {
        this.showGoodMessage(this.assignedCostResourcesForm.value, 'assigned');
      }
    }
  }

  checkStakeHoldersFormValidation(e, firstTime?: boolean, isText?: boolean) {
    if (!firstTime) {
      this.stepSituation.stakeHolders.exist = true;
    }
    const validations = {
      PillarFormsValidations: [],
    };
    const pillarStakeHoldersForms = [];
    let text = '';
    for (let i = 0; i < this.pillarStakeHoldersForm.length; i++) {
      pillarStakeHoldersForms[i] = this.pillarStakeHoldersForm[i].value;
      if (this.pillarStakeHoldersForm[i].invalid) {
        text = text + this.showStakeHoldersFormValidation(i + 1);
        validations.PillarFormsValidations[i] = false;
      }
    }
    const noPillarStakeHoldersForms = [];
    for (let i = 0; i < this.nopillarStakeHoldersForm.length; i++) {
      noPillarStakeHoldersForms[i] = this.nopillarStakeHoldersForm[i].value;
    }

    if (validations.PillarFormsValidations.filter(a => a === false).length > 0) {
      this.stepSituation.stakeHolders.default = false;
      if (firstTime) {
        if (isText) {
          this.text.push({
            name: 'ذینفعان',
            content: text
          });
        }
      } else {
        this.showWrongMessage(text, [pillarStakeHoldersForms, noPillarStakeHoldersForms], null, 'pillarSH');
      }
    } else {
      if (firstTime) {
        if (isText) {
          this.text.push({
            name: 'ذینفعان',
            content: null
          });
        }
        this.stepSituation.costAssignedResource.exist = true;
        this.stepSituation.stakeHolders.default = true;
      } else {
        this.showGoodMessage([pillarStakeHoldersForms, noPillarStakeHoldersForms], 'pillarSH');
      }
    }
  }

  checkDeliverablesValidation(data, type?: number, firstTime?: boolean, isText?: boolean, num?: number) {
    const hotInstancesData = [];
    const hotInstancesDates = [];
    const realName = [];
    const tabs = [];
    let haveZone = false;
    let text = '';
    try {
      console.log(data);
      for (let i = 0; i < data.name_Deliverable.length; i++) {
        hotInstancesData[i] = data.data[i];
        hotInstancesDates[i] = data.date[i];
        realName[i] = data.name_Deliverable[i].Name + ':' + data.value_Deliverable[i] + ' ' + data.name_Deliverable[i].MeasureUnit;
        if (data.zone_deliverables[i]) {
          if (data.zone_deliverables[i] !== null) {
            tabs[i] = data.zone_deliverables[i];
            haveZone = true;
          } else {
            tabs[i] = data.name_Deliverable[i].Name;
          }
        } else {
          tabs[i] = data.name_Deliverable[i].Name;
        }
      }
    } catch {
      text = text + 'ندارد';
    }
    const value_Deliverable = data.value_Deliverable;
    const validations = {
      colSums: [[]],
      isPlanSumBThanAct: [[]],
      hasNegatives: [[]],
      hasNull: [[]],
      lastCostValidation: [],
      finalCheckValue: [],
      pSBTA: [],
    };
    let sumCols = 0;
    const colData = [];
    const Dates = [];
    const planSums = [];
    for (let i = 0; i < hotInstancesData.length; i++) {
      validations.finalCheckValue[i] = 0;
      validations.colSums[i] = [];
      colData[i] = [];
      Dates[i] = hotInstancesDates[i];
      for (let j = 0; j < hotInstancesData[i].length; j++) {
        colData[i][j] = hotInstancesData[i][j];
        sumCols = +(+sumCols + +colData[i][j].reduce(this.getSum));
        validations.colSums[i][j] = +sumCols;
        sumCols = 0;
      }
    }

    for (let i = 0; i < validations.colSums.length; i++) {
      validations.isPlanSumBThanAct[i] = [];
      validations.hasNegatives[i] = [];
      validations.hasNull[i] = [];
      planSums[i] = 0;
      for (let j = 0; j < validations.colSums[i].length / 2; j++) {
        if (validations.colSums[i][j * 2 + 1] <= validations.colSums[i][j * 2]) {
          validations.isPlanSumBThanAct[i][j] = true;
        } else {
          validations.isPlanSumBThanAct[i][j] = false;
        }

        if (hotInstancesData[i].filter(a => a[j] === '').length > 0) {
          validations.hasNull[i][j] = true;
        } else {
          validations.hasNull[i][j] = false;
        }

        planSums[i] = planSums[i] + +validations.colSums[i][j * 2 + 1];
        try {
          if (colData[i][j * 2 + 1].some(v => +v < 0) || colData[i][j * 2].some(v => +v < 0)) {
            validations.hasNegatives[i][j] = true;
          } else {
            validations.hasNegatives[i][j] = false;
          }
        } catch {
        }
        validations.finalCheckValue[i] = +(+validations.finalCheckValue[i] + +validations.colSums[i][j * 2]).toFixed(10);
      }
    }
    for (let i = 0; i < validations.finalCheckValue.length; i++) {
      if (+(+validations.finalCheckValue[i]) !== +(+value_Deliverable[i])) {
        validations.lastCostValidation[i] = false;
      } else {
        validations.lastCostValidation[i] = true;
      }
      if (validations.isPlanSumBThanAct[i].filter(v => v === false).length !== 0) {
        validations.pSBTA[i] = false;
      } else {
        validations.pSBTA[i] = true;
      }
    }
    // console.log((validations.hasNegatives[0].filter(v => v === true).length !== 0));
    // console.log((validations.hasNegatives[0].filter(v => v === true).length !== 0));
    // console.log((validations.finalCheckValue > value_Deliverable));
    // console.log(validations.lastCostValidation.filter(v => v === false).length !== 0);
    if ((validations.hasNegatives[0].filter(v => v === true).length !== 0) || (validations.pSBTA.filter(v => v === false).length !== 0) || (validations.finalCheckValue > value_Deliverable) || validations.lastCostValidation.filter(v => v === false).length !== 0) {
      // this.stepSituation.deliverables[type].default = false;
      text = this.showDeliverablesFormMessage(validations.hasNegatives, validations.isPlanSumBThanAct, validations.colSums, validations.hasNull, value_Deliverable, planSums, realName, tabs, validations.lastCostValidation, validations.pSBTA.filter(v => v === false).length, haveZone);
      if (firstTime) {
        if (isText) {
          this.text.push({
            name: this.contractServices.filter(v => v.Id === data.serviceId)[0].Name,
            content: text
          });
        }
      } else {
        this.showWrongMessage(text, this.sharedService.stepFormsData.deliverablesForm, [Dates, colData, type, num], 'deliverable');
      }
    } else {
      if (firstTime) {
        // this.stepSituation.deliverables[type].default = true;
        if (isText) {
          if (data.date) {
            if (data.date.length === 0 && +this.contractServices.filter(v => v.Id === data.serviceId)[0].DeliverableType > 0) {
              this.text.push({
                name: this.contractServices.filter(v => v.Id === data.serviceId)[0].Name,
                content: 'اطلاعات ناقص هستند!'
              });
            } else {
              this.text.push({
                name: this.contractServices.filter(v => v.Id === data.serviceId)[0].Name,
                content: null
              });
            }
          } else {
            if (+this.contractServices.filter(v => v.Id === data.serviceId)[0].DeliverableType > 0) {
              this.text.push({
                name: this.contractServices.filter(v => v.Id === data.serviceId)[0].Name,
                content: 'اطلاعات ناقص هستند!'
              });
            }
          }
        }
      } else {
        this.showGoodMessage([Dates, colData, type, num], 'deliverable');
      }
    }
  }

  showDeliverablesFormMessage(hasNegatives, isPlanSumBThanAct, colSums, hasNull, value_Deliverable, planSums, realName, tabs, lastCostValidation, pSBTALength, haveZone) {
    console.log(tabs);
    let text = '';
    text = '<table style="font-size: 13px;" class="table table-bordered"><tbody>';
    for (let i = 0; i < colSums.length; i++) {
      text = text + '<tr>';
      text = text + '<th style="text-align: right;">' + realName[i] + '</th>';
      text = text + '<td>';

      if (haveZone) {
        for (let n = 0; n < hasNegatives[i].length; n++) {
          if (hasNegatives[i][n] === true) {
            text = text + '<p>اطلاعات ناحیه ' + this.getZoneName(tabs[i][n]) + '  دارای اشکال است!</p>';
          }
          if (isPlanSumBThanAct[i][n] === false) {
            text = text + '<p>مجموع عملکرد واقعی ناحیه ' + this.getZoneName(tabs[i][n]) + ' از برنامه ای آن بیشتر است!</p>';
          }
        }
      } else {
        for (let n = 0; n < hasNegatives[i].length; n++) {
          if (hasNegatives[i][n] === true) {
            text = text + '<p>اطلاعات ' + tabs[i] + '  دارای اشکال است!</p>';
          }
          if (isPlanSumBThanAct[i][n] === false) {
            text = text + '<p>مجموع عملکرد واقعی ' + tabs[i] + ' از برنامه ای آن بیشتر است!</p>';
          }
        }
      }

      if (lastCostValidation[i] === false) {
        text = text + '<p>مجموع برنامه ای  ' + realName[i] + '  دارای اشکال است!</p>';
      }

      text = text + '</td>';
      text = text + '</tr>';
    }
    text = text + '</tbody></table>';
    return text;
  }

  checkFinalApprovalFormValidation(e) {
    console.log(this.finalApprovalFormGroup.value, 'value');
    this.showGoodMessage(this.finalApprovalFormGroup.value, 'final');
  }

  checkContractsFormValidation(e, firstTime?: boolean, isText?: boolean) {
    if (!firstTime) {
      const finalServices = [];
      for (let i = 0; i < this.contractsForm.get('ContractNatureId').value.length; i++) {
        if (this.contractsForm.get('ContractNatureId').value[i] === true) {
          finalServices.push(this.contractServices[i].Id);
        }
      }
      this.contractsForm.get('ContractServices').setValue(finalServices);
    }

    const dates = {
      start: null,
      finish: null,
      declare: null
    };
    if (this.contractsForm.get('DeclareDate_FinishDates_And_Costs').value !== 'Invalid date') {
      try {
        dates.declare = (this.contractsForm.get('DeclareDate_FinishDates_And_Costs').value).format('jYYYY/jM/jD');
      } catch {
        dates.declare = moment(this.contractsForm.get('DeclareDate_FinishDates_And_Costs').value, 'YYYY/M/D').format('jYYYY/jM/jD');
      }
    }

    if (this.contractsForm.get('StartDate_Contract').value !== 'Invalid date') {
      try {
        dates.start = (this.contractsForm.get('StartDate_Contract').value).format('jYYYY/jM/jD');
      } catch {
        dates.start = moment(this.contractsForm.get('StartDate_Contract').value, 'YYYY/M/D').format('jYYYY/jM/jD');
      }
    }

    if (this.contractsForm.get('FinishDate_Contract').value !== 'Invalid date') {
      try {
        dates.finish = (this.contractsForm.get('FinishDate_Contract').value).format('jYYYY/jM/jD');
      } catch {
        dates.finish = moment(this.contractsForm.get('FinishDate_Contract').value, 'YYYY/M/D').format('jYYYY/jM/jD');
      }
    }

    if (this.sharedService.stepFormsData.progressPlansForm) {
      if (+this.contractsForm.get('Cost_Costs').value !== +this.contractDataForm.Cost_Costs) {
        this.sharedService.newCost = +this.contractsForm.get('Cost_Costs').value;
        this.sharedService.newCostSubject.next(true);
      }
      if (+new Date(dates.declare) !== +new Date(this.contractDataForm.DeclareDate_FinishDates_And_Costs)) {
      }
    }
    const validations = {
      costValidation: true,
      startBThanDecDatedValidation: true,
      finishBThanStartDatedValidation: true,
      contractServiceSelection: true,
      eqCostValidation: true,
    };
    if (new Date(dates.start) < new Date(dates.declare)) {
      validations.startBThanDecDatedValidation = false;
    }
    if (new Date(dates.finish) < new Date(dates.start)) {
      validations.finishBThanStartDatedValidation = false;
    }

    if (!this.contractsForm.get('ContractNatureId').value.find(x => x === true)) {
      validations.contractServiceSelection = false;
    }

    if (this.contractsForm.get('Id_Currency').value !== 'IRR') {
      if (+this.contractsForm.get('Cost_EqCosts').value <= 0) {
        validations.eqCostValidation = false;
      }
    }

    if (!this.contractsForm.valid) {
    }

    const costs = this.contractsForm.get('Costs').value.reduce(this.getSum);
    if (+this.contractsForm.get('Cost_Costs').value !== +costs) {
      validations.costValidation = false;
    }

    if (!validations.costValidation || !validations.startBThanDecDatedValidation || !validations.finishBThanStartDatedValidation || !validations.contractServiceSelection || !validations.eqCostValidation || this.contractsForm.invalid) {
      this.stepSituation.contractForm.default = false;
      const text = this.showContactsFormMessage(validations.costValidation, validations.startBThanDecDatedValidation, validations.finishBThanStartDatedValidation, validations.contractServiceSelection, validations.eqCostValidation);
      if (firstTime) {
        if (isText) {
          this.text.push({
            name: 'اطلاعات پایه قرارداد',
            content: text
          });
        }
      } else {
        this.alertsService.alertsWrongContractForm(text).then((result) => {
        });
      }
    } else {
      if (firstTime) {
        if (isText) {
          this.text.push({
            name: 'اطلاعات پایه قرارداد',
            content: null
          });
        }
        this.stepSituation.contractForm.default = true;
        this.sharedService.changeStepLocks(false);
      } else {
        this.showGoodMessage(this.contractsForm.value, 'contract');
      }
    }
  }

  showGoodMessage(stepData, formName) {
    this.alertsService.alerts().then(
      (result) => {
        if (result.value) {
          this.sendDataToJson(stepData, formName, true);
        }
      });
  }


  sendDataToJson(stepData, formName, isOk = false) {
    this.setTitle(this.contractDataForm.FullTitle_Contract);
    if (formName === 'assigned') {
      this.sharedService.stepFormsData.assignedCostResourcesForm = stepData;
    }
    if (formName === 'contract') {
      if (isUndefined(stepData[0])) {
        this.sharedService.stepFormsData.contractsForm = stepData;
      } else {
        this.sharedService.stepFormsData.contractsForm = stepData[0];
      }
      const dates = {
        start: null,
        finish: null,
        declare: null
      };
      try {
        dates.declare = (this.contractsForm.get('DeclareDate_FinishDates_And_Costs').value).format('jYYYY/jM/jD');
      } catch {
        dates.declare = moment(this.contractsForm.get('DeclareDate_FinishDates_And_Costs').value, 'YYYY/M/D').format('jYYYY/jM/jD');
      }
      try {
        dates.start = (this.contractsForm.get('StartDate_Contract').value).format('jYYYY/jM/jD');
      } catch {
        dates.start = moment(this.contractsForm.get('StartDate_Contract').value, 'YYYY/M/D').format('jYYYY/jM/jD');
      }
      try {
        dates.finish = (this.contractsForm.get('FinishDate_Contract').value).format('jYYYY/jM/jD');
      } catch {
        dates.finish = moment(this.contractsForm.get('FinishDate_Contract').value, 'YYYY/M/D').format('jYYYY/jM/jD');
      }
      this.sharedService.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs = dates.declare;
      this.sharedService.stepFormsData.contractsForm.StartDate_Contract = dates.start;
      this.sharedService.stepFormsData.contractsForm.FinishDate_Contract = dates.finish;

      let finalDate = this.sharedService.stepFormsData.contractsForm.FinishDate_Contract;
      if (new Date(this.sharedService.stepFormsData.contractsForm.FinishDate_Contract) < new Date(this.today.fa)) {
        finalDate = this.today.fa;
      }
      for (let i = 0; i < this.sharedService.stepFormsData.contractsForm.ContractNatureId.length; i++) {
        // if (this.sharedService.stepFormsData.contractsForm.ContractNatureId[i] && !this.sharedService.stepFormsData.deliverablesForm[i]) {
        if (this.sharedService.stepFormsData.contractsForm.ContractNatureId[i]) {
          if (this.sharedService.stepFormsData.deliverablesForm.filter(v => v.serviceId === this.contractServices[i].Id).length === 0) {
            this.sharedService.stepFormsData.deliverablesForm.push({
              serviceId: this.contractServices[i].Id,
              date: []
            });
          }
        }
      }

      const mService = [];
      const indService = [];
      for (let i = 0; i < this.contractsForm.get('ContractNatureId').value.length; i++) {
        if (this.contractsForm.get('ContractNatureId').value[i]) {
          mService.push(this.contractServices[i].Id);
          this.sharedService.changeStepLocks(true);
        }
      }
      for (let i = 0; i < this.deliverablesForm.length; i++) {
        if (mService.filter(v => v === this.deliverablesForm[i].serviceId).length === 0) {
          this.deliverablesForm.splice(i, 1);
          indService.push(i);
          this.sharedService.changeStepLocks(true);
        }
      }
    }

    if (formName === 'pillarSH') {
      if (isOk) {
        this.sharedService.stepFormsData.stackHoldersForm = stepData[0];
        this.sharedService.stepFormsData.stackHoldersForm2 = stepData[1];
      } else {
        this.sharedService.stepFormsData.stackHoldersForm = stepData[0][0];
        this.sharedService.stepFormsData.stackHoldersForm2 = stepData[0][1];
      }
    }
    let isFinal = false;
    if (formName === 'final') {
      if (!this.sharedService.stepFormsData.finalApprovalForm) {
        this.sharedService.stepFormsData.finalApprovalForm = [];
      }
      this.sharedService.stepFormsData.finalApprovalForm.push(this.finalApprovalFormGroup.value);
      console.log(this.sharedService.stepFormsData.finalApprovalForm);
      if (this.sharedService.stepFormsData.finalApprovalForm[this.sharedService.stepFormsData.finalApprovalForm.length - 1].isApproved) {
        isFinal = true;
      } else {
        isFinal = false;
      }
    }
    console.log(isFinal, 'isFinal');
    this.sharedService.getDataFromContextInfo().subscribe(
      (data) => {
        this.sharedService.updateDataJson(data, +this.sharedService.stepFormsData.contractsForm.Code_Contract, isFinal, null, this.isPreContract).subscribe(
          () => {
            if (formName === 'contract') {
              this.contractsForm.markAsDirty();
              this.sharedService.newDate.next(this.newDates);
              this.sharedService.newDate.subscribe(
                () => this.stepSituation.contractForm.default = true
              );
              this.sharedService.stepsDirty.contractForm = false;
              this.sharedService.changeStepLocks(false);
            }
            if (formName === 'assigned') {
              this.sharedService.stepsDirty.costAssignedResourcesForm = false;
              if (isOk) {
                this.stepSituation.costAssignedResource.default = true;
              } else {
                this.stepSituation.costAssignedResource.default = false;
              }
            }
            if (formName === 'pillarSH') {
              this.sharedService.stepsDirty.stakeHoldersForms = false;
              if (isOk) {
                this.stepSituation.stakeHolders.default = true;
              } else {
                this.stepSituation.stakeHolders.default = false;
              }
            }
            if (formName === 'progress') {
              if (isOk) {
                this.stepSituation.planActsProp.default = true;
              } else {
                this.stepSituation.planActsProp.default = false;
              }
              this.sharedService.stepsDirty.planActsProp = false;
            }
            if (formName === 'cashFlow') {
              if (isOk) {
                this.stepSituation.cashFlowPlan.default = true;
              } else {
                this.stepSituation.cashFlowPlan.default = false;
              }
              this.sharedService.stepsDirty.cashFlow = false;
            }
            if (formName === 'deliverable') {
              if (isOk) {
                // this.stepSituation.deliverables[stepData[2]].default = true;
              } else {
                // this.stepSituation.deliverables[stepData[1][2]].default = true;
              }
              this.sharedService.stepsDirty.deliverable = false;
            }
            this.indexingSteps();
            if (this.sharedService.userMainRole === 2 && this.sharedService.stepFormsData.finalApprovalForm[this.sharedService.stepFormsData.finalApprovalForm.length - 1].isApproved) {
              this.router.navigate(['build'], {queryParams: {'ContractID': 'TC' + this.newContractStepperGaurd.contractID}});
            } else {
              if (formName === 'final') {
                this.router.navigate(['contracts-drafts']);
              }
            }
          },
          (error) => {
          }
        );
      });
  }

  checkCashFlowPlanFormValidation(hotInstance, firstTime?: boolean, isText?: boolean) {
    if (!firstTime) {
      this.stepSituation.cashFlowPlan.exist = true;
    }
    hotInstance = this.hotRegisterer.getInstance('cashFlowPlanTable');
    const validations = {
      sortedValidation: true,
      checkFirstZeroValidation: true,
      lastCostValidation: false,
      hasNull: false,
    };
    const cashFlowPlanForm = {
      date: [],
      data: []
    };
    if (this.sharedService.stepFormsData.cashFlowPlanForm) {
      cashFlowPlanForm.date = this.sharedService.stepFormsData.cashFlowPlanForm.date;
      cashFlowPlanForm.data = this.sharedService.stepFormsData.cashFlowPlanForm.data;
    }

    if (!this.isSorted(cashFlowPlanForm.data)) {
      validations.sortedValidation = false;
    }

    if (cashFlowPlanForm.data[0] !== 0) {
      validations.checkFirstZeroValidation = false;
    }
    if (cashFlowPlanForm.data[cashFlowPlanForm.data.length - 1] >= this.contractsForm.get('Cost_Costs').value) {
      validations.lastCostValidation = true;
    }

    cashFlowPlanForm.data.filter(v => {
      if (v === null || v === '') {
        validations.hasNull = true;
      }
    });
    if (!validations.sortedValidation || !validations.checkFirstZeroValidation || !validations.lastCostValidation || validations.hasNull) {
      this.stepSituation.cashFlowPlan.default = false;
      const text = this.showCashFlowPlanFormValidation(validations.sortedValidation, validations.checkFirstZeroValidation, validations.lastCostValidation, validations.hasNull);
      if (firstTime) {
        if (isText) {
          this.text.push({
            name: 'برنامه جریان نقدینگی',
            content: text
          });
        }
      } else {
        this.showWrongMessage(text, this.sharedService.stepFormsData.cashFlowPlanForm, [cashFlowPlanForm.data, cashFlowPlanForm.date, 0], 'cashFlow');
      }
    } else {
      if (firstTime) {
        this.stepSituation.cashFlowPlan.default = true;
        if (isText) {
          this.text.push({
            name: 'برنامه جریان نقدینگی',
            content: null
          });
        }
      } else {
        this.showGoodMessage([null, [cashFlowPlanForm.data, cashFlowPlanForm.date]], 'cashFlow');
      }
    }
  }

  showAssignedCostResourcesFormValidation(sumCosts, duplicate) {
    let text = '';

    if (!sumCosts) {
      text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">' + '' + '- </span><span>جمع مبلغ ها یکی نمی باشد!</span></p>';
    }

    if (duplicate) {
      text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">' + '' + '- </span><span>رکوردها تکراری است!</span></p>';
    }

    return text;
  }

  showStakeHoldersFormValidation(counter: number) {
    let text = '';
    text = '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">' + '' + '- </span><span>اطلاعات فرم شماره  ' + counter + ' ارکان اصلی صحیح نمی باشد! ' + '</span></p>';
    return text;
  }

  showCashFlowPlanFormValidation(sortedVal, checkFirstZeroVal, lastCostVal, hasNull) {
    let text = '';

    if (!checkFirstZeroVal) {
      text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">' + '' + '- </span><span>مبلغ هزینه در اولین تاریخ برابر 0 باشد!</span></p>';
    }

    if (!lastCostVal) {
      text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">' + '' + '- </span><span>آخرین مبلغ بزرگتر یا مساوی مبلغ قرارداد باشد!</span></p>';
    }

    if (hasNull || !sortedVal) {
      text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">' + '' + '- </span><span>مبالغ هزینه صعودی نیستند و یا نقص دارند!</span></p>';
    }

    return text;
  }

  showFinancialValidation(isSumValid) {
    let text = '';
    if (!isSumValid) {
      text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">' + '' + '- </span><span>مبلغ کل صورت وضعیت ها نمی تواند از مبلغ کل قرارداد ' + this.sharedService.stepFormsData.contractsForm.Cost_Costs + ' بیشتر باشد!</span></p>';
    }
    return text;
  }

  showContactsFormMessage(costVal, StartDecVal, finishStartVal, servicesVal, eqCostVal) {
    let text = '';

    if (!servicesVal) {
      text = text + '<p style="direction: rtl;text-align: right;"><span style="color: darkred;"> - </span><span>حداقل یک خدمات قرارداد انتخاب نمایید!</span></p>';
    }

    if (!costVal) {
      text = text + '<p style="direction: rtl;text-align: right;"><span style="color: darkred;"> - </span><span>جمع مبلغ ها یکی نمی باشد!</span></p>';
    }

    if (!StartDecVal) {
      text = text + '<p style="direction: rtl;text-align: right;"><span style="color: darkred;"> - </span><span>تاریخ انعقاد نمی تواند بعد از تاریخ شروع باشد!</span></p>';
    }

    if (!finishStartVal) {
      text = text + '<p style="direction: rtl;text-align: right;"><span style="color: darkred;"> - </span><span>تاریخ شروع نمی تواند بعد از تاریخ پایان باشد!</span></p>';
    }

    if (!eqCostVal) {
      text = text + '<p style="direction: rtl;text-align: right;"><span style="color: darkred;"> - </span><span>مبلغ ارزی قرارداد نمی تواند خالی باشد!</span></p>';
    }
    return text;
  }

  checkCustomChangesValidation(instance, firstTime?: boolean, isText?: boolean) {
    let text = '';
    instance = 'hotProgressPlanExtensionInstance';
    const costInstance = this.hotRegisterer.getInstance('hotCostExtensionInstance');
    const finishDateInstance = this.hotRegisterer.getInstance('hotFinishDateExtensionInstance');
    let isDup = false;
    text = text + '<div class="row"><div class="col-md-12"><table style="font-size: 13px;" class="table table-bordered"><tbody>';
    const cData = costInstance.getData().map(v => +new Date(v[0]));
    text = text + '<tr><th>تغییرات مبلغ قرارداد' + '<td>' + this.showCustomChangesCostMessage(cData) + '</td></th></tr>';

    const fdData = finishDateInstance.getData().map(v => +new Date(v[0]));
    text = text + '<tr><th>تغییرات تاریخ پایان قرارداد' + '<td>' + this.showCustomChangesFinishDateMessage(fdData) + '</td></th></tr>';

    text = text + '</tbody></table></div></div>';
    console.log(cData, 'cData');
    console.log(new Set(cData), 'cData');

    console.log(isDup);

    const hotInstance = this.hotRegisterer.getInstance(instance);
    const validations = {
      sortedValidation: true,
      checkFirstZeroValidation: true,
      lastCostValidation: true,
    };
    const planActPropForm = {
      date: [],
      data: []
    };
    const today = this.today.fa;
    const daDate = hotInstance.getData().map(a => a[0]);
    planActPropForm.date = daDate;
    const ck = [];
    const ckNoneGenerate = [];
    const firstfill = [];
    const isNull = [];
    const isDefect = [];
    const isSorted = [];
    const ActualBeforeTen = [];
    let colorCounter = 0;
    let firstZeroCounter = 0;
    const nullCounter = [];
    const isFirstZero = [];
    const isLastHundred = [];
    const zeroCounter = [];
    const hundredCounter = [];
    const colData = [];
    for (let i = 0; i < hotInstance.countCols() - 1; i++) {
      colData[i] = hotInstance.getData().map(a => a[i + 1]);
    }
    for (let m = 0; m < hotInstance.countCols() - 1 - this.checkRemoveColumnAdded; m++) {
      nullCounter[m] = 0;
      firstfill[m] = false;
      isFirstZero[m] = true;
      isLastHundred[m] = false;
      isNull[m] = 0;
      isDefect[m] = true;
      isSorted[m] = true;
      ActualBeforeTen[m] = false;
      firstZeroCounter = 0;
      ck[m] = 0;
      zeroCounter[m] = 0;
      hundredCounter[m] = 0;
      let op = 0;
      const da = hotInstance.getData().map(a => a[m + 1]);
      for (let i = 0; i < da.length; i++) {
        if (da[i] === 0) {
          zeroCounter[m]++;
        }
        if (da[i] === 1) {
          hundredCounter[m]++;
        }
        if (da[i] === '' || da[i] === null) {
        } else {
          if (firstfill[m] === true) {
            if (da[i - 1] === '' || da[i - 1] === null || isNaN(da[i - 1])) {
              colorCounter = i - 1;
              op++;
              while ((da[colorCounter] === null) || (da[colorCounter] === '')) {
                if (this.validteDate(colorCounter, +daDate[colorCounter].split('/')[1], +daDate[colorCounter].split('/')[2])) {
                  isDefect[m] = true;
                  if (!firstTime) {
                    hotInstance.setDataAtCell(colorCounter, m + 1, '.');
                  }
                }
                colorCounter--;
              }
            }
          }
          firstfill[m] = true;
        }
        if (this.validteDate(i, +daDate[i].split('/')[1], +daDate[i].split('/')[2])) {
          if (da[i] === '' || da[i] === null) {
            isNull[m]++;

          } else {

            if (op === 0) {
              isDefect[m] = false;
            }

            if (da[i] < 0 || da[i] > 1 || isNaN(da[i])) {
              isDefect[m] = true;
              op++;
            }

            if (da[i] !== 0 && firstZeroCounter === 0) {
              isFirstZero[m] = false;
            }
            firstZeroCounter++;

          }
        }
        if (da[i] !== '' && da[i] !== null && !isNaN(da[i])) {
          if (i > 0) {
            if (da[i] < da[i - 1 - ck[m]]) {
              isSorted[m] = false;
            }
            ck[m] = 0;
          }
        } else {
          ck[m]++;
        }
      }
      let ko = hotInstance.countRows() - 1 - ck[m];

      if (ko < 0) {
        ko = 0;
      }
      if (da[ko] === 1) {
        isLastHundred[m] = true;
      }
      if (
        Date.UTC(
          +today.split('/')[0],
          +today.split('/')[1],
          +today.split('/')[2] - 10) <=
        Date.UTC(
          daDate[ko].split('/')[0],
          daDate[ko].split('/')[1],
          daDate[ko].split('/')[2])
      ) {
        ActualBeforeTen[m] = true;
      }
    }
    // console.log(ckNoneGenerate, 'ckNoneGenerate');
    // console.log('isLastHundred', isLastHundred);
    // console.log('ck', ck);
    // console.log('isFirstZero', isFirstZero);
    // console.log('is ActualBeforeTen', ActualBeforeTen);
    // console.log('isDefect', isDefect);
    // console.log('is Null', isNull);
    // console.log('is Sorted', isSorted);
    // console.log(hotInstance);
    text = text + this.showCustomChangesMessage(ActualBeforeTen, isDefect, isSorted, isFirstZero, isLastHundred, isNull, ck, today, zeroCounter, hundredCounter, hotInstance.getColHeader());
    this.showWrongMessage(text, this.sharedService.stepFormsData.progressPlansForm, [colData, daDate, 0], 'progress');
  }

  checkPlanActPropValidation(instance, firstTime?: boolean, isText?: boolean) {
    const hotInstance = this.hotRegisterer.getInstance(instance);
    const validations = {
      sortedValidation: true,
      checkFirstZeroValidation: true,
      lastCostValidation: true,
    };
    const planActPropForm = {
      date: [],
      data: []
    };
    const colHeaders = [];
    const isTotal = this.sharedService.stepFormsData.contractsForm.ContractNatureId.map(v => v === true).length > 0 ? true : false;
    const isTotal2 = this.sharedService.stepFormsData.contractsForm.ContractNatureId.map(v => v === true).length > 2 ? true : false;
    const colData = [];
    for (let i = 0; i < this.sharedService.stepFormsData.progressPlansForm.data.length; i++) {
      colData.push(this.sharedService.stepFormsData.progressPlansForm.data[i].plan);
      colData.push(this.sharedService.stepFormsData.progressPlansForm.data[i].act);
    }
    let colDataLoop = colData.length - this.checkRemoveColumnAdded;
    if (this.sharedService.stepFormsData.progressPlansForm.data.length < 3) {
      colDataLoop = colData.length - this.checkRemoveColumnAdded - 2;
    }
    if (isTotal) {
      colHeaders.push('T');
    }
    if (isTotal2) {
      for (let i = 0; i < this.sharedService.stepFormsData.contractsForm.ContractNatureId.length; i++) {
        if (this.sharedService.stepFormsData.contractsForm.ContractNatureId[i]) {
          colHeaders.push(this.contractServices[i].Id);
        }
      }
    }

    const today = this.today.fa;
    const daDate = this.sharedService.stepFormsData.progressPlansForm.date;
    planActPropForm.date = daDate;
    const ck = [];
    const ckNoneGenerate = [];
    const firstfill = [];
    const isNull = [];
    const isDefect = [];
    const isSorted = [];
    const ActualBeforeTen = [];
    let colorCounter = 0;
    let firstZeroCounter = 0;
    const nullCounter = [];
    const isFirstZero = [];
    const isLastHundred = [];
    const zeroCounter = [];
    const hundredCounter = [];


    for (let m = 0; m < colDataLoop; m++) {
      nullCounter[m] = 0;
      firstfill[m] = false;
      isFirstZero[m] = true;
      isLastHundred[m] = false;
      isNull[m] = 0;
      isDefect[m] = true;
      isSorted[m] = true;
      ActualBeforeTen[m] = false;
      firstZeroCounter = 0;
      ck[m] = 0;
      zeroCounter[m] = 0;
      hundredCounter[m] = 0;
      let op = 0;
      let da = colData[m];
      if (isUndefined(da)) {
        da = [];
      }
      for (let i = 0; i < da.length; i++) {
        if (da[i] === ' ' || da[i] === '  ') {
          da[i] = '';
        }
        if (da[i] === 0) {
          zeroCounter[m]++;
        }
        if (da[i] === 1) {
          hundredCounter[m]++;
        }
        if (da[i] === '' || da[i] === null) {
        } else {
          if (da[i] !== 0 && firstZeroCounter === 0) {
            isFirstZero[m] = false;
          }
          firstZeroCounter++;
          if (firstfill[m] === true) {
            if (da[i - 1] === '' || da[i - 1] === null || isNaN(da[i - 1])) {
              colorCounter = i - 1;
              op++;
              while ((da[colorCounter] === null) || (da[colorCounter] === '')) {
                if (this.validteDate(colorCounter, +daDate[colorCounter].split('/')[1], +daDate[colorCounter].split('/')[2])) {
                  isDefect[m] = true;
                  // hotInstance.setCellMeta(0, 3, 'valid', false);
                  if (!firstTime) {
                    try {
                      // hotInstance.setDataAtCell(colorCounter, m + 1, '.');
                    } catch {
                    }
                  }
                }
                colorCounter--;
              }
            }
          }
          firstfill[m] = true;
        }
        if (this.validteDate(i, +daDate[i].split('/')[1], +daDate[i].split('/')[2])) {
          if (da[i] === '' || da[i] === null) {
            isNull[m]++;

          } else {

            if (op === 0) {
              isDefect[m] = false;
            }

            if (da[i] < 0 || da[i] > 1 || isNaN(da[i])) {
              isDefect[m] = true;
              op++;
            }
          }
        }
        if (da[i] !== '' && da[i] !== null && !isNaN(da[i])) {
          if (i > 0) {
            if (da[i] < da[i - 1 - ck[m]]) {
              isSorted[m] = false;
            }
            ck[m] = 0;
          }
        } else {
          ck[m]++;
        }
        if (da[i] < 0 || da[i] > 1 || isNaN(da[i])) {
          isDefect[m] = true;
        }
      }
      let ko;
      if (colData[0]) {
        ko = colData[0].length - 1 - ck[m];
      } else {
        ko = 0;
      }

      if (ko < 0) {
        ko = 0;
      }
      // console.log('ko', ko);

      // console.log(da[ko], 'daKO');
      // console.log(ko, 'ko');
      // console.log(ck[m], 'ck m');
      if (da[ko] === 1) {
        isLastHundred[m] = true;
      }
      if (daDate) {
        if (
          Date.UTC(
            +today.split('/')[0],
            +today.split('/')[1],
            +today.split('/')[2] - 10) <=
          Date.UTC(
            daDate[ko].split('/')[0],
            daDate[ko].split('/')[1],
            daDate[ko].split('/')[2]) || da[ko] === 1) {
          ActualBeforeTen[m] = true;
        }
      }
    }
    // console.log(da, 'colData');
    // console.log(ckNoneGenerate, 'ckNoneGenerate');
    // console.log('isLastHundred', isLastHundred);
    // console.log('ck', ck);
    // console.log('isFirstZero', isFirstZero);
    // console.log('is ActualBeforeTen', ActualBeforeTen);
    // console.log('isDefect', isDefect);
    // console.log('is Null', isNull);
    // console.log('is Sorted', isSorted);
    // console.log(hotInstance);
    const checkAllActualBeforeTen = ActualBeforeTen.filter((v, index) => {
      if (index % 2 !== 0) {
        if (v === true) {
          return true;
        }
      }
    });
    isDefect.map((v, index) => {
      if (+new Date(this.sharedService.stepFormsData.contractsForm.StartDate_Contract) > +new Date(this.today.fa) && index % 2 !== 0) {
        console.log(isDefect[index], index);
        isDefect[index] = false;
      }
    });
    const checkAllIsDefect = isDefect.filter(v => v === false);
    const checkAllIsSorted = isSorted.filter(v => v === true);
    const checkAllIsFirstZero = isFirstZero.filter(v => v === true);
    let checkHundredCounter = false;
    hundredCounter.filter(v => {
      if (v > 1) {
        checkHundredCounter = true;
      }
    });
    const checkIsLastHundred = isLastHundred.filter((v, index) => {
      if (index % 2 === 0) {
        if (v === true) {
          return true;
        }
      }
    });
    let checkNull = false;

    // if (Date.UTC(+this.sharedService.stepFormsData.contractsForm.StartDate_Contract.split('/')[0], +this.sharedService.stepFormsData.contractsForm.StartDate_Contract.split('/')[1], +this.sharedService.stepFormsData.contractsForm.StartDate_Contract.split('/')[2])
    //   <
    //   Date.UTC(+today.split('/')[0], +today.split('/')[1], +today.split('/')[2])) {
    //   if (isNull[1] !== 0) {
    //     checkNull = true;
    //   }
    // } else {
    //   checkNull = false;
    // }
    // console.log((checkAllActualBeforeTen.length !== ActualBeforeTen.length / 2));
    // console.log((checkAllIsDefect.length !== isDefect.length));
    // console.log((checkAllIsSorted.length !== isSorted.length));
    // console.log((checkAllIsFirstZero.length !== isFirstZero.length));
    // console.log((checkIsLastHundred.length !== isLastHundred.length / 2));
    // console.log(isNull[1] !== 0);
    // console.log(checkAllActualBeforeTen.length !== ActualBeforeTen.length / 2);
    // console.log(isDefect);
    // console.log(checkAllIsDefect.length !== isDefect.length);
    //   console.log(checkAllIsSorted.length !== isSorted.length);
    //   console.log(checkIsLastHundred.length !== isLastHundred.length / 2);
    //   console.log(checkNull);
    if ((checkAllActualBeforeTen.length !== ActualBeforeTen.length / 2) || (checkAllIsDefect.length !== isDefect.length) || (checkAllIsSorted.length !== isSorted.length) || (checkAllIsFirstZero.length !== isFirstZero.length) || (checkIsLastHundred.length !== isLastHundred.length / 2) || checkNull || checkHundredCounter) {
      this.stepSituation.planActsProp.default = false;
      const text = this.showPlanActsPropFormMessage(ActualBeforeTen, isDefect, isSorted, isFirstZero, isLastHundred, isNull, ck, today, zeroCounter, hundredCounter, colHeaders);
      if (firstTime) {
        if (isText) {
          this.text.push({
            name: 'درصد پیشرفت',
            content: text
          });
        }
      } else {
        this.showWrongMessage(text, this.sharedService.stepFormsData.progressPlansForm, [colData, daDate, 0], 'progress');
      }
    } else {
      if (firstTime) {
        this.stepSituation.planActsProp.default = true;
        if (isText) {
          this.text.push({
            name: 'درصد پیشرفت',
            content: null
          });
        }
      } else {
        this.showGoodMessage(hotInstance, 'progress');
      }
    }
  }

  showCustomChangesCostMessage(Data) {
    let text = '';
    if (+Data.length !== +new Set(Data).size) {
      text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
        + '' +
        '- </span><span>تاریخ های ابلاغ تکراری نباشند!</span></p>';
    }
    if (Data[0] > +new Date(this.sharedService.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs)) {
      text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
        + '' +
        '- </span><span>تاریخ ابلاغ باید پس از تاریخ انعقاد قرارداد باشد!</span></p>';
    }
    return text;
  }

  showCustomChangesFinishDateMessage(Data) {
    let text = '';
    if (+Data.length !== +new Set(Data).size) {
      text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
        + '' +
        '- </span><span>تاریخ های ابلاغ تکراری نباشند!</span></p>';
    }
    if (Data[0] > +new Date(this.sharedService.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs)) {
      text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
        + '' +
        '- </span><span>تاریخ ابلاغ باید پس از تاریخ انعقاد قرارداد باشد!</span></p>';
    }
    return text;
  }

  showCustomChangesMessage(ActualBeforeTen, isDefect, isSorted, isFirstZero, isLastHundred, isNull, ck, today, zeroCounter, hundredCounter, colHeader) {
    let text = '';
    const dateBeforeTen = new Date(Date.UTC(
      +today.split('/')[0],
      +today.split('/')[1],
      +today.split('/')[2] - 10));
    text = '<hr><h5 style="direction: rtl;text-align: right ">برنامه بازبینی شده</h5><div class="row"><div class="col-md-12"><table style="font-size: 13px;" class="table table-bordered"><tbody>';
    for (let i = 0; i < isDefect.length; i++) {
      text = text + '<tr>';
      text = text + '<th style="text-align: center;">' + colHeader[i + 1].replace('(برنامه ای)', '') + '</th>';
      text = text + '<td>';

      // hundredCounter
      if (hundredCounter[i] > 1) {
        text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
          + '' +
          '- </span><span>بیش از یک رکورد با مقدار 100 در اطلاعات برنامه ای وجود دارد!</span></p>';
      }


      // zeroCounter
      if (zeroCounter[i] > 1) {
        text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
          + '' +
          '- </span><span>بیش از یک رکورد با مقدار 0 در اطلاعات برنامه ای وجود دارد!</span></p>';
      }

      if (isDefect[i] || isNull[i] === ck) {
        text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
          + '' +
          '- </span><span> اطلاعات برنامه ای کامل نیست!</span></p>';
      }

      //////////////////////// Is Sorted ///////////////////////
      if (!isSorted[i]) {
        text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
          + '' +
          '- </span><span>اطلاعات برنامه ای صعودی نیست!</span></p>';
      }

      //////////////////////// Is LastHundred ///////////////////////
      if (!isLastHundred[i]) {
        text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
          + '' +
          '- </span><span>آخرین رکورد برنامه ای 100 نیست!</span></p>';
      }

      text = text + '</td>';
      text = text + '</tr>';
    }
    text = text + '</tbody></table></div></div>';
    return text;
  }

  showPlanActsPropFormMessage(ActualBeforeTen, isDefect, isSorted, isFirstZero, isLastHundred, isNull, ck, today, zeroCounter, hundredCounter, colHeaders) {
    let text = '';
    let cn = 0;
    const dateBeforeTen = new Date(Date.UTC(
      +today.split('/')[0],
      +today.split('/')[1],
      +today.split('/')[2] - 10));
    text = '<table style="font-size: 13px;" class="table table-bordered"><tbody>';
    let messagesLength = isDefect.length / 2 - 1;
    if (colHeaders.length === 2) {
      messagesLength = 0;
    }
    console.log(colHeaders);
    console.log(messagesLength);
    for (let i = -1; i < messagesLength; i++) {
      // if (l === 0) {
      text = text + '<tr>';
      text = text + '<th style="text-align: center;">' + this.getServiceNameByName(colHeaders[i + 1]) + '</th>';
      text = text + '<td>';

      // hundredCounter
      if (hundredCounter[cn] > 1 && hundredCounter[cn + 1] > 1) {
        text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
          + '' +
          '- </span><span>بیش از یک رکورد با مقدار 100 در اطلاعات برنامه ای و واقعی وجود دارد!</span></p>';
      } else if (hundredCounter[cn] > 1) {
        text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
          + '' +
          '- </span><span>بیش از یک رکورد با مقدار 100 در اطلاعات برنامه ای وجود دارد!</span></p>';
      } else if (hundredCounter[cn + 1] > 1) {
        text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
          + '' +
          '- </span><span>!بیش از یک رکورد با مقدار 100 در اطلاعات واقعی وجود دارد</span></p>';
      }


      // zeroCounter
      if (zeroCounter[cn] > 1 && zeroCounter[cn + 1] > 1) {
        text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
          + '' +
          '- </span><span>بیش از یک رکورد با مقدار 0 در اطلاعات برنامه ای و واقعی وجود دارد!</span></p>';
      } else if (zeroCounter[cn] > 1) {
        text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
          + '' +
          '- </span><span>بیش از یک رکورد با مقدار 0 در اطلاعات برنامه ای وجود دارد!</span></p>';
      } else if (zeroCounter[cn + 1] > 1) {
        text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
          + '' +
          '- </span><span>بیش از یک رکورد با مقدار 0 در اطلاعات واقعی وجود دارد!</span></p>';
      }

      if (Date.UTC(+this.sharedService.stepFormsData.contractsForm.StartDate_Contract.split('/')[0], +this.sharedService.stepFormsData.contractsForm.StartDate_Contract.split('/')[1], +this.sharedService.stepFormsData.contractsForm.StartDate_Contract.split('/')[2])
        <
        Date.UTC(+today.split('/')[0], +today.split('/')[1], +today.split('/')[2])) {
        //////////////////////// Is Defected ///////////////////////
        if (isDefect[cn] && isDefect[cn + 1] || (isNull[cn] === ck && isNull[cn + 1] === ck)) {
          text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
            + '' +
            '- </span><span> اطلاعات برنامه ای و واقعی کامل نیست!</span></p>';
        } else if (isDefect[cn + 1] || isNull[cn + 1] === ck) {
          text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
            + '' +
            '- </span><span> اطلاعات واقعی کامل نیست!</span></p>';
        }
      }
      if (isDefect[cn] || isNull[cn] === ck) {
        text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
          + '' +
          '- </span><span> اطلاعات برنامه ای کامل نیست!</span></p>';
      }

      //////////////////////// Is Sorted ///////////////////////
      if (!isSorted[cn] && !isSorted[cn + 1]) {
        text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
          + '' +
          '- </span><span>اطلاعات برنامه ای و واقعی صعودی نیست!</span></p>';
      } else if (!isSorted[cn]) {
        text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
          + '' +
          '- </span><span>اطلاعات برنامه ای صعودی نیست!</span></p>';
      } else if (!isSorted[cn + 1]) {
        text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
          + '' +
          '- </span><span>اطلاعات واقعی صعودی نیست!</span></p>';
      }

      //////////////////////// Is LastHundred ///////////////////////
      if (!isLastHundred[cn]) {
        text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
          + '' +
          '- </span><span>آخرین رکورد برنامه ای 100 نیست!</span></p>';
      }

      //////////////////////// Is FirstZero ///////////////////////
      if (!isFirstZero[cn] && !isFirstZero[cn + 1]) {
        text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
          + '' +
          '- </span><span>اولین رکورد برنامه ای و واقعی 0 نیست!</span></p>';
      } else if (!isFirstZero[cn]) {
        text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
          + '' +
          '- </span><span>اولین رکورد برنامه ای 0 نیست!</span></p>';
      } else if (!isFirstZero[cn + 1]) {
        text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
          + '' +
          '- </span><span>اولین رکورد واقعی 0 نیست!</span></p>';
      }


      //////////////////////// ActualBeforeTen ///////////////////////
      if (
        (Date.UTC(+this.sharedService.stepFormsData.contractsForm.StartDate_Contract.split('/')[0], +this.sharedService.stepFormsData.contractsForm.StartDate_Contract.split('/')[1], +this.sharedService.stepFormsData.contractsForm.StartDate_Contract.split('/')[2])
          <
          Date.UTC(+today.split('/')[0], +today.split('/')[1], +today.split('/')[2] - 10)) &&
        (
          isLastHundred[cn + 1] === false
        )
      ) {
        if (!ActualBeforeTen[cn + 1]) {
          let mainDate = moment(today, 'jYYYY/jM/jD');
          mainDate = mainDate.subtract(10, 'jDay');
          text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">'
            + '' +
            '- </span><span>اطلاعات واقعی باید حداقل تا تاریخ <span>' + mainDate.format('jYYYY/jM/jD') + '</span><span> (10 روز قبل از امروز) </span> وارد شده باشند!</span></p>';
        }
      }


      //////////////////////// 100 ///////////////////////


      text = text + '</td>';
      text = text + '</tr>';
      cn = cn + 2;
    }
    text = text + '</tbody></table>';

    return text;
  }

  showWrongMessage(text, form?, tableDataAndType?, formName?) {
    this.alertsService.alertsWrong(text).then((result) => {
      if (result.value) {
        this.sendDataToJson([form, tableDataAndType], formName);
      }
    });
  }

  RemoveColumnAdded(e) {
    this.checkRemoveColumnAdded = 1;
  }

  getServiceName(serviceId: string) {
    if (this.contractServices) {
      return this.contractServices.filter(v => v.Id === serviceId)[0].Name;
    } else {
      return null;
    }
  }

  getZoneName(zoneId: string) {
    if (this.zones) {
      return this.zones.filter(v => v.Id === zoneId)[0].Name;
    } else {
      return null;
    }
  }

  getServiceNameByName(serviceId: string) {
    if (serviceId === 'T') {
      return 'کلی';
    } else {
      if (this.contractServices) {
        return this.contractServices.filter(v => v.Id === serviceId)[0].Name;
      } else {
        return null;
      }
    }
  }

  validteDate(i, month: number, day: number) {
    const finishDate = this.sharedService.stepFormsData.contractsForm.FinishDate_Contract.split('/');
    if (+month < 7 && +day === 31) {
      return true;
    } else if (+month > 6 && +month < 12 && +day === 30) {
      return true;
    } else if (+month === 12 && +day === 29) {
      return true;
    } else if (i === 0) {
      return true;
    } else if ((+month === +finishDate[1]) && (+day === +finishDate[2])) {
      return true;
    } else {
      return false;
    }
  }

  isSorted(arr) {
    const limit = arr.length - 1;
    return arr.every((_, i) => (i < limit ? arr[i] <= arr[i + 1] : true));
  }

  getSum(total, num) {
    return +total + +num;
  }

  generateDate() {
    const generatedDate = this.generateDates(+this.countMon(this.sharedService.stepFormsData.contractsForm.FinishDate_Contract), this.contractsForm.get('StartDate_Contract').value.split('/'));
    console.log(generatedDate, 'generatedDates');
    const mainDate = moment('1395/05/09', 'YYYY/M/D');
    const ajab = mainDate.subtract(1, 'months');
    const today = ajab.format('jYYYY/jM/jD');

    console.log(today);
  }

  generateDates(numMon, date) {
    const dates = [];
    dates[0] = +date[0] + '/' + this.addZeroToMonth(+date[1]) + '/' + this.addZeroToMonth(+date[2]);
    for (let i = 0; i < +numMon; i++) {
      if (i !== 0) {
        date[1] = +date[1] + 1;
      }
      if (+date[1] === 13) {
        date[1] = 1;
        date[0] = +date[0] + 1;
      }
      date[2] = this.switchingMonth(+date[1]);
      dates[i + 1] = date[0] + '/' + this.addZeroToMonth(+date[1]) + '/' + date[2];
    }
    // dates[+numMon + 1] = this.sharedService.stepFormsData.contractsForm.FinishDate_Contract.replace('-', '/');
    dates[+numMon + 1] = this.contractsForm.get('FinishDate_Contract').value;
    dates[+numMon + 1] = dates[+numMon + 1].replace('-', '/');
    return dates;
  }

  switchingMonth(month: number) {
    let selectedMonth;
    if (month < 7) {
      selectedMonth = 31;
    } else if (month > 6 && month < 12) {
      selectedMonth = 30;
    } else {
      selectedMonth = 29;
    }
    return selectedMonth;
  }

  addZeroToMonth(month) {
    if (+month < 10) {
      return '0' + month;
    } else {
      return month;
    }
  }

  countMon(finishDate: string) {
    const m = moment(this.contractsForm.get('StartDate_Contract').value, 'jYYYY/jM/jD');
    const md = moment(finishDate, 'jYYYY/jM/jD');
    let counter = 0;
    counter = md.diff(m, 'months');
    return counter;
  }
}
