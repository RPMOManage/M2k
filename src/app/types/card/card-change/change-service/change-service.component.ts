import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContractService } from '../../../../shared/services/contract.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { CurrenciesList } from '../../../../shared/models/currencies.model';
import { ContractServicesList } from '../../../../shared/models/contractServices.model';
import { ContractModel } from '../../../../shared/models/contractModels/contract.model';
import { AlertsService } from '../../../../shared/services/alerts.service';
import { ChangesModel } from '../../../../shared/models/contractModels/changes.model';
import { isUndefined } from 'util';

@Component({
  selector: 'app-change-service',
  templateUrl: './change-service.component.html',
  styleUrls: ['./change-service.component.scss']
})
export class ChangeServiceComponent implements OnInit {
  @Input() contractID: number;
  @Input() change: ChangesModel;
  @Input() versionID: number;
  @Output() changeTabIndex = new EventEmitter();
  formGp: FormGroup;
  currencies: CurrenciesList[] = [];
  costCodes: {ID, DDate, EqCost, Cost}[] = [];
  services: ContractServicesList[] = [];
  @Input() contract: ContractModel;
  myServices: ContractServicesList[] = [];
  disabledServices = [];

  constructor(private router: Router,
              private contractService: ContractService,
              private _formBuilder: FormBuilder,
              private alertsService: AlertsService,
              private sharedService: SharedService) { }

  ngOnInit() {
    this.contractService.getCostCode(this.contractID, this.versionID).subscribe(
      (costCodes) => {
        this.costCodes = costCodes;
        this.costCodes = this.costCodes.sort((a, b) => +new Date(b.DDate) - +new Date(a.DDate));
      }
    );
    this.formGp = this._formBuilder.group({
      Service: new FormArray([], [Validators.required]),
    });
    this.sharedService.getContractServices().subscribe(
      (services) => {
        this.services = services.filter(v => {
          if (v.ServiceID !== 7) {
            return v;
          }
        });
        for (let i = 0; i < this.services.length; i++) {
          if (this.change.Json.ChangeService) {
            const selectedChangeService = this.change.Json.ChangeService.Service.filter(v => v === this.services[i].ServiceID);
            if ((<any>this.contract.Service).filter(v => v === this.services[i].ServiceID).length > 0 || selectedChangeService.length > 0) {
              if (selectedChangeService.length > 0) {
                this.onAddService(i, true, selectedChangeService[0]);
              } else {
                this.onAddService(i, true);
              }
            } else {
              this.myServices.push(this.services[i]);
              console.log(this.myServices);
              this.onAddService(i, false);
            }
          } else {
            if ((<any>this.contract.Service).filter(v => v === this.services[i].ServiceID).length > 0) {
              this.onAddService(i, true);
              this.myServices.push(this.services[i]);
            } else {
              this.onAddService(i, false);
            }
            // this.myServices.push(this.services[i]);
            // console.log(this.myServices);
          }
        }
      }
    );
  }

  onAddService(i: number, isChecked: boolean, isFromChanges?: any) {
      const control = new FormControl(isChecked);
    (<FormArray>this.formGp.get('Service')).push(control);
    if (!isFromChanges) {
      if (isChecked) {
        this.disabledServices.push(i);
        // (<any>this.formGp.get('Service')).controls[i].disable();
      }
    }
  }

  isDisable(id: number) {
    return this.disabledServices.findIndex(v => v === id) !== -1;
  }

  onSubmitClick() {
    const selectedServices = [];
    // console.log(this.formGp.get('Service').value);
    // this.myServices.filter((v, index) => {
    //   if (this.formGp.get('Service').value[index]) {
    //     selectedServices.push(v.ServiceID);
    //   }
    // });
    const mainSelectedServices = this.services.filter((v, index) => {
      if (this.formGp.get('Service').value[index]) {
        return v.ServiceID;
      }
    });
    if (this.formGp.valid) {
      this.sharedService.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.change.Json.ChangeService = {
            Service: mainSelectedServices.map(v => v.ServiceID),
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
    }
  }
}
