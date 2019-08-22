import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContractService } from '../../../../shared/services/contract.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { CurrenciesList } from '../../../../shared/models/currencies.model';
import { AlertsService } from '../../../../shared/services/alerts.service';

@Component({
  selector: 'app-change-cost',
  templateUrl: './change-cost.component.html',
  styleUrls: ['./change-cost.component.scss']
})
export class ChangeCostComponent implements OnInit {
  @Input() contractID: number;
  @Input() change: { ID, Date, ChangeItem, ImporterApproved, PMApproved, Json, DDate, Description };
  @Input() versionID: number;
  @Output() changeTabIndex = new EventEmitter();
  formGp: FormGroup;
  currencies: CurrenciesList[] = [];
  costCodes: { ID, DDate, EqCost, Cost }[] = [];
  isEqCostRequired = false;

  constructor(private router: Router,
              private contractService: ContractService,
              private _formBuilder: FormBuilder,
              private alertsService: AlertsService,
              private sharedService: SharedService) {
  }

  ngOnInit() {
    this.contractService.getCostCode(this.contractID, this.versionID).subscribe(
      (costCodes) => {
        this.costCodes = costCodes;
        this.costCodes = this.costCodes.sort((a, b) => +new Date(b.DDate) - +new Date(a.DDate));
      }
    );
    if (this.change.Json.ChangeCost) {
      if (this.change.Json.ChangeCost.Cost) {
        this.formGp = this._formBuilder.group({
          Cost: new FormControl(this.change.Json.ChangeCost.Cost, [Validators.required, Validators.min(0)]),
          EqCost: new FormControl(this.change.Json.ChangeCost.EqCost, []),
          Currency: new FormControl(this.change.Json.ChangeCost.Currency, [Validators.required]),
        });
      }
    } else {
      this.formGp = this._formBuilder.group({
        Cost: new FormControl(null, [Validators.required, Validators.min(0)]),
        EqCost: new FormControl(null, []),
        Currency: new FormControl(null, [Validators.required]),
      });
    }
    this.sharedService.getContractCurrencies().subscribe(
      (data) => {
        this.currencies = data;
        this.formGp.get('Currency').setValue('IRR');
      }
    );
  }

  onCurrencyChange(e) {
    console.log(e.value);
    if (e.value !== 'IRR') {
      this.isEqCostRequired = true;
      this.formGp.get('EqCost').setValidators([Validators.required, Validators.min(0)]);
    } else {
      this.isEqCostRequired = false;
      this.formGp.get('EqCost').setValidators([]);
    }
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
    const text = '';
    if (this.formGp.valid) {
      this.sharedService.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.change.Json.ChangeCost = {
            Cost: +this.formGp.get('Cost').value,
            Currency: this.formGp.get('Currency').value,
            EqCost: this.formGp.get('EqCost').value
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
      console.log(this.formGp.value);
    } else {
      this.alertsService.alertsWrongContractForm(text);
    }
  }

}
