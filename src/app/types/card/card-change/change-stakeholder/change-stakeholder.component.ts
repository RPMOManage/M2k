import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContractService } from '../../../../shared/services/contract.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { CurrenciesList } from '../../../../shared/models/currencies.model';
import { AlertsService } from '../../../../shared/services/alerts.service';
import { ChangesModel } from '../../../../shared/models/contractModels/changes.model';

@Component({
  selector: 'app-change-stakeholder',
  templateUrl: './change-stakeholder.component.html',
  styleUrls: ['./change-stakeholder.component.scss']
})
export class ChangeStakeholderComponent implements OnInit {
  @Input() contractID: number;
  @Input() change: ChangesModel;
  @Input() versionID: number;
  @Input() isPillar: boolean;
  @Output() changeTabIndex = new EventEmitter();
  pillarFormGps: FormGroup[] = [];
  notPillarFormGps: FormGroup[] = [];
  stakeHoldersPillarData = null;
  stakeHoldersNotPillarData = null;

  constructor(private sharedService: SharedService,
                      private contractService: ContractService,
                      private alertsService: AlertsService) { }

  ngOnInit() {
    if (this.change.Json.ChangeStakeHolderPillar) {
      this.stakeHoldersPillarData = this.change.Json.ChangeStakeHolderPillar;
    }
    if (this.change.Json.ChangeStakeHolderNotPillar) {
      this.stakeHoldersNotPillarData = this.change.Json.ChangeStakeHolderNotPillar;
    }

  }
  onSubmitClick() {
    let text = '';
    let isPillarValidation = true;
    let isNotPillarValidation = true;
    this.pillarFormGps.map(v => {
      if (v.invalid) {
        isPillarValidation = false;
      }
    });
    this.notPillarFormGps.map(v => {
      if (v.invalid) {
        isNotPillarValidation = false;
      }
    });
    if (this.pillarFormGps.length < 3) {
      text = text + '<p style="direction: rtl;text-align: right;"><span style="color: darkred;"> - </span><span>حداقل 3 ذی نفع وارد بنمایید!</span></p>';
    }
    console.log(this.pillarFormGps);
    console.log(this.pillarFormGps.map(v => v.value));
    if (isPillarValidation && isNotPillarValidation && this.pillarFormGps.length > 2) {
      this.sharedService.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.change.Json.ChangeStakeHolderPillar = {
            Data: []
          };
          this.change.Json.ChangeStakeHolderNotPillar = {
            Data: []
          };
          this.change.Json.ChangeStakeHolderPillar = {
            Data: this.pillarFormGps.map(v => v.value),
          };
          this.change.Json.ChangeStakeHolderNotPillar = {
            Data: this.notPillarFormGps.map(v => v.value),
          };
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
      console.log(this.pillarFormGps);
      console.log(this.notPillarFormGps);
    } else {
      this.alertsService.alertsWrongContractForm(text);
    }
  }

  onChangeForm(data: {FormGps: FormGroup[], isPillar: boolean}) {
    if (data.isPillar) {
      this.pillarFormGps = data.FormGps;
    } else {
      this.notPillarFormGps = data.FormGps;
    }
  }
}
