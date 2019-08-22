import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContractService } from '../../../../../shared/services/contract.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { CurrenciesList } from '../../../../../shared/models/currencies.model';
import { ContractStakeHolderModel } from '../../../../../shared/models/contractModels/contractStakeHolder.model';
import { AgentPositionsList } from '../../../../../shared/models/agentPositions.model';

@Component({
  selector: 'app-change-stakeholder-form',
  templateUrl: './change-stakeholder-form.component.html',
  styleUrls: ['./change-stakeholder-form.component.scss']
})
export class ChangeStakeholderFormComponent implements OnInit {
  @Input() contractID: number;
  @Input() versionID: number;
  @Input() isPillar: boolean;
  @Input() stakeHoldersPillarData;
  @Input() stakeHoldersNotPillarData;
  @Output() changeFrom = new EventEmitter();
  formGp: FormGroup[] = [];
  selectedNewCostDeclareDate = '';
  currencies: CurrenciesList[] = [];
  costCodes: {ID, DDate, EqCost, Cost}[] = [];
  contractStakeholders: ContractStakeHolderModel[] = [];
  agentPositions: AgentPositionsList[];
  stackHoldersRoles = ['کارفرما', 'پیمانکار', 'مشاور', 'مدیر طرح', 'سایر'];

  constructor(private router: Router,
              private contractService: ContractService,
              private _formBuilder: FormBuilder,
              private sharedService: SharedService) { }

  ngOnInit() {
    this.sharedService.getAgentPositions().subscribe(
      (data) => {
        this.agentPositions = data;
        this.contractService.getContractStakeHolders(this.contractID).subscribe(
          (contractStakeholders) => {
            this.contractStakeholders = contractStakeholders;
            console.log(this.contractStakeholders[0].PhoneNumber.split('-'));
            if (this.isPillar) {
              if (this.stakeHoldersPillarData) {
                for (let i = 0; i < this.stakeHoldersPillarData.Data.length; i++) {
                  this.onAddFormFromJson(this.stakeHoldersPillarData.Data[i], i);
                }
              } else {
                const stakeholders = this.contractStakeholders.filter(v => v.IsPillar === true);
                if (stakeholders.length > 0) {
                  for (let i = 0; i < stakeholders.length; i++) {
                    this.onAddForm(stakeholders[i], i);
                  }
                  this.changeFrom.emit({FormGps: this.formGp, isPillar: this.isPillar});
                } else {
                  this.onAddNullForm();
                }
              }
            } else {
              if (this.stakeHoldersNotPillarData) {
                for (let i = 0; i < this.stakeHoldersNotPillarData.Data.length; i++) {
                  this.onAddFormFromJson(this.stakeHoldersNotPillarData.Data[i], i);
                }
              } else {
                const stakeholders = this.contractStakeholders.filter(v => v.IsPillar === false);
                if (stakeholders.length > 0) {
                  for (let i = 0; i < stakeholders.length; i++) {
                    this.onAddForm(stakeholders[i], i);
                  }
                  this.changeFrom.emit({FormGps: this.formGp, isPillar: this.isPillar});
                }
              }
            }
          }
        );
      }
    );
  }

  onAddForm(stakeholder: ContractStakeHolderModel, i) {
    const phone = stakeholder.PhoneNumber.split('-');
      this.formGp.push(this._formBuilder.group({
        OragnizationName_StakeholdersCon: [stakeholder.OrgName, Validators.required],
        Role_StakeholdersContract: [stakeholder.Role, Validators.required],
        Role_Other_StakeholdersContract: [null],
        AgentName_StakeholdersContract: [stakeholder.AgentName, Validators.required],
        Id_ContractAgentPostions: [stakeholder.AgentPosition.Id, Validators.required],
        pish_PhoneNumber_StakeholdersContract: [+phone[0], Validators.required],
        PhoneNumber_StakeholdersContract: [+phone[1], Validators.required],
        int_PhoneNumber_StakeholdersContract: [+phone[3]],
        Address_StakeholdersContract: [stakeholder.LocationAddress],
        Email_StakeholdersContract: [stakeholder.Email]
      }));
    this.formGp[i].valueChanges.subscribe(
      (formData) => {
        this.changeFrom.emit({FormGps: this.formGp, isPillar: this.isPillar});
      }
    );
  }

  onAddFormFromJson(stakeHolderData, i) {
    this.formGp.push(this._formBuilder.group({
      OragnizationName_StakeholdersCon: [stakeHolderData.OragnizationName_StakeholdersCon, Validators.required],
      Role_StakeholdersContract: [stakeHolderData.Role_StakeholdersContract, Validators.required],
      Role_Other_StakeholdersContract: [stakeHolderData.Role_Other_StakeholdersContract],
      AgentName_StakeholdersContract: [stakeHolderData.AgentName_StakeholdersContract, Validators.required],
      Id_ContractAgentPostions: [stakeHolderData.Id_ContractAgentPostions, Validators.required],
      pish_PhoneNumber_StakeholdersContract: [stakeHolderData.pish_PhoneNumber_StakeholdersContract, Validators.required],
      PhoneNumber_StakeholdersContract: [stakeHolderData.PhoneNumber_StakeholdersContract, Validators.required],
      int_PhoneNumber_StakeholdersContract: [stakeHolderData.int_PhoneNumber_StakeholdersContract],
      Address_StakeholdersContract: [stakeHolderData.Address_StakeholdersContract],
      Email_StakeholdersContract: [stakeHolderData.Email_StakeholdersContract]
    }));
    this.formGp[i].valueChanges.subscribe(
      (formData) => {
        this.changeFrom.emit({FormGps: this.formGp, isPillar: this.isPillar});
      }
    );
  }

  onAddNullForm() {
      this.formGp.push(this._formBuilder.group({
        OragnizationName_StakeholdersCon: [null, Validators.required],
        Role_StakeholdersContract: [null, Validators.required],
        Role_Other_StakeholdersContract: [null],
        AgentName_StakeholdersContract: [null, Validators.required],
        Id_ContractAgentPostions: [null, Validators.required],
        pish_PhoneNumber_StakeholdersContract: [null, Validators.required],
        PhoneNumber_StakeholdersContract: [null, Validators.required],
        int_PhoneNumber_StakeholdersContract: [null],
        Address_StakeholdersContract: [null],
        Email_StakeholdersContract: [null]
      }));
    this.formGp[this.formGp.length - 1].valueChanges.subscribe(
      (formData) => {
        this.changeFrom.emit({FormGps: this.formGp, isPillar: this.isPillar});
      }
    );
  }

  showEqCost() {
    let isShow = false;
    this.costCodes.map(v => {
      if (v.EqCost !== -1) {
        isShow = true;
      }
    });
    return isShow;
  }

  onSubmitClick() {
    console.log(this.formGp);
  }

}
