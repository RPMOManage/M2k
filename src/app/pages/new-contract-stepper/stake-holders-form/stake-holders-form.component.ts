import { Component, EventEmitter, Input, OnInit, Output, ViewChildren  } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/index';
import { AgentPositionsList } from '../../../shared/models/agentPositions.model';
import { SharedService } from '../../../shared/services/shared.service';
import { AlertsService } from '../../../shared/services/alerts.service';

@Component({
  selector: 'app-stake-holders-form',
  templateUrl: './stake-holders-form.component.html',
  styleUrls: ['./stake-holders-form.component.scss']
})
export class StakeHoldersFormComponent implements OnInit {
  @Output() formData = new EventEmitter();
  @Input() formGp: FormGroup[] = [];
  @Input() mainTitle: string;
  @Input() idGenerator: number;
  @Input() rolesControl: FormControl[];
  @Output() addStakeHoldersForm = new EventEmitter();
  @Output() deleteStakeHoldersForm = new EventEmitter();
  @ViewChildren ('role') role;
  filteredContractors: Observable<any[]>[] = [];
  agentPositions: AgentPositionsList[];
  stackHoldersRoles = ['کارفرما', 'پیمانکار', 'مشاور', 'مدیر طرح', 'سایر'];
  contractorsControl: FormControl[] = [];
  isReadOnly: boolean;
  step = 0;

  constructor(private sharedService: SharedService,
              private alertsService: AlertsService) {
  }

  ngOnInit() {
    this.isReadOnly = this.sharedService.isReadOnly;
    this.sharedService.getAgentPositions().subscribe(
      (data) => {
        this.agentPositions = data;
      }
    );

    for (let i = 0; i < this.formGp.length; i ++) {
      this.formGp[i].valueChanges.subscribe(
        () => {
          this.sharedService.stepsDirty.stakeHoldersForms = true;
        }
      );
    }
  }

  setStep(index: number) {
    this.step = index;
  }

  onRoleSelectionChange(e, id) {
    if (e.target.value !== 'سایر') {
      this.formGp[id].get('Role_Other_StakeholdersContract').setValue(null);
      this.formGp[id].get('Role_Other_StakeholdersContract').clearValidators();
    }
  }

  checkStep() {
  }

  displayFn(user?): string | undefined {
    if (user === 'سایر') {
      return '';
    }
    return user ? user : undefined;
  }

  filter3(val) {
    return this.stackHoldersRoles;
  }

  deleteForm(id) {
    this.alertsService.alertsRemove().then((result) => {
      if (result.value) {
        this.deleteStakeHoldersForm.emit(id);
      }
    });
  }

  addSHForm() {
    this.addStakeHoldersForm.emit(1);
  }
}
