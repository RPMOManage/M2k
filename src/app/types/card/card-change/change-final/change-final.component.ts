import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContractService } from '../../../../shared/services/contract.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { CurrenciesList } from '../../../../shared/models/currencies.model';
import { AlertsService } from '../../../../shared/services/alerts.service';

@Component({
  selector: 'app-change-final',
  templateUrl: './change-final.component.html',
  styleUrls: ['./change-final.component.scss']
})
export class ChangeFinalComponent implements OnInit {
  @Input() contractID: number;
  @Input() change: { ID, Date, ChangeItem, ImporterApproved, PMApproved, Json, DDate, Description };
  @Input() versionID: number;
  @Output() changeTabIndex = new EventEmitter();
  @Output() write = new EventEmitter();
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
    console.log(this.change);
    this.formGp = this._formBuilder.group({
      Description: ['', Validators.required],
    });
  }

  onReject() {
    console.log('rejected');
  }

  onSubmit() {

    if (true) {
      this.alertsService.alerts().then((result) => {
        if (result.value) {
          this.write.emit();
          // this.contractService.updateChanges(digestValue, this.contractID, this.change).subscribe(
          //   () => {
          //   }
          // );
        }
      });
      // this.sharedService.getDataFromContextInfo().subscribe(
      //   (digestValue) => {
      //     this.change.Json.ChangeServiceCost = {
      //       Services: this.myServices,
      //       Costs: this.formGp.get('Costs').value,
      //     };
      //   }
      // );
    } else {
      const text = 'اطلاعات دارای مشکل می باشند!';
      this.alertsService.alertsWrongContractForm(text);
    }
  }
}
