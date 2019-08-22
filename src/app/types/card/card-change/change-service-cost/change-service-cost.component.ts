import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContractService } from '../../../../shared/services/contract.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { CurrenciesList } from '../../../../shared/models/currencies.model';
import { ContractServicesList } from '../../../../shared/models/contractServices.model';
import { ContractModel } from '../../../../shared/models/contractModels/contract.model';
import { ChangesModel } from '../../../../shared/models/contractModels/changes.model';
import { AlertsService } from '../../../../shared/services/alerts.service';

@Component({
  selector: 'app-change-service-cost',
  templateUrl: './change-service-cost.component.html',
  styleUrls: ['./change-service-cost.component.scss']
})
export class ChangeServiceCostComponent implements OnInit {
  @Input() contractID: number;
  @Input() change: ChangesModel;
  @Input() versionID: number;
  @Output() changeTabIndex = new EventEmitter();
  formGp: FormGroup;
  currencies: CurrenciesList[] = [];
  costCodes: {ID, DDate, EqCost, Cost}[] = [];
  services: ContractServicesList[] = [];
  @Input() contract: ContractModel;
  servicesNameIds: {ID, Title}[] = [];
  serviceCosts: { ID, CostCode, DDate, Service: { ID, Title }, Cost }[] = [];
  myServices = [];

  constructor(private router: Router,
              private contractService: ContractService,
              private _formBuilder: FormBuilder,
              private alertsService: AlertsService,
              private sharedService: SharedService) { }

  ngOnInit() {
    this.contractService.getAllServiceCosts(this.contractID).subscribe(
      (serviceCosts) => {
        console.log(serviceCosts);
        this.serviceCosts = serviceCosts.filter(v => {
          if (v.DDate === serviceCosts[0].DDate) {
            return v;
          }
        });
        this.sharedService.getContractServices().subscribe(
          (services) => {
            this.services = services.filter(v => {
              if (v.ServiceID !== 7) {
                return v;
              }
            });

            if (this.change.Json.ChangeService) {
              if (this.change.Json.ChangeService.Service) {
                for (let i = 0; i < this.change.Json.ChangeService.Service.length; i++) {
                  this.onAddService(i, true, null);
                  // const foundedSelectedChangesIndex = this.change.Json.ChangeServiceCost.Services.findIndex(v => v === this.change.Json.ChangeService.Service[i]);
                  // if (foundedSelectedChangesIndex !== -1) {
                  //   this.onAddService(i, true, this.change.Json.ChangeServiceCost.Costs[foundedSelectedChangesIndex]);
                  // } else {
                  //
                  // }
                  // this.myServices.push(this.services.filter(v => +v.ServiceID === +this.serviceCosts[i].Service.ID)[0].ServiceID);
                }
              }
            }

            for (let i = 0; i < this.serviceCosts.length; i++) {
                this.servicesNameIds.push({ID: this.servicesNameIds.length, Title: this.services.filter(v => +v.ServiceID === +this.serviceCosts[i].Service.ID)[0].Name});
                if (this.change.Json.ChangeServiceCost) {
                  if (this.change.Json.ChangeServiceCost.Services) {
                    const foundedSelectedChangesIndex = this.change.Json.ChangeServiceCost.Services.findIndex(v => v === this.serviceCosts[i].Service.ID);
                    if (foundedSelectedChangesIndex !== -1) {
                      this.onAddService(i, true, this.change.Json.ChangeServiceCost.Costs[foundedSelectedChangesIndex]);
                    }
                  }
                } else {
                  this.onAddService(i, true, this.serviceCosts[i].Cost);
                }
                this.myServices.push(this.services.filter(v => +v.ServiceID === +this.serviceCosts[i].Service.ID)[0].ServiceID);
            }
            // if (this.change.Json.ChangeServiceCost.Services) {
            //   for (let i = 0; i < this.change.Json.ChangeService.Service.length; i++) {
            //     this.servicesNameIds.push({ID: this.servicesNameIds.length, Title: this.services.filter(v => +v.ServiceID === +this.change.Json.ChangeService.Service[i])[0].Name});
            //     this.onAddService(i, true, null);
            //     this.myServices.push(this.change.Json.ChangeService.Service[i]);
            //   }
            // } else {
            //
            // }
            // for (let i = 0; i < this.services.length; i++) {
            //   if ((<any>this.contract.Service).filter(v => v === this.services[i].ServiceID).length > 0) {
            //     console.log((<any>this.contract.Service).filter(v => v === this.services[i].ServiceID).length);
            //     this.servicesNameIds.push({ID: this.servicesNameIds.length, Title: this.services[i].Name});
            //     this.onAddService(i, true, this.services[i].ServiceID);
            //   }
            // }
          }
        );
      }
    );
    this.contractService.getCostCode(this.contractID, this.versionID).subscribe(
      (costCodes) => {
        this.costCodes = costCodes;
        this.costCodes = this.costCodes.sort((a, b) => +new Date(b.DDate) - +new Date(a.DDate));
      }
    );
    this.formGp = this._formBuilder.group({
      Costs: new FormArray([], [Validators.required]),
    });
  }

  onAddService(i: number, isChecked: boolean, serviceID) {
    // if (isChecked) {
      console.log(serviceID, this.serviceCosts);
      // const data = this.serviceCosts.filter(v => +v.Service.ID === +serviceID)[0].Cost;
      const data = serviceID;
      const control = new FormControl(data, [Validators.required, Validators.min(0)]);
      (<FormArray>this.formGp.get('Costs')).push(control);
    // }
  }

  getServiceNames(serviceId) {
    try {
      const cs = this.servicesNameIds.filter(v => v.ID === serviceId)[0];
      if (cs) {
        return cs.Title;
      } else {
        return null;
      }
    } catch {
      return null;
    }
  }

  onSubmitClick() {
    let text = '';
    let sumValidation = false;
    const sumCost = this.formGp.get('Costs').value.reduce(this.getSum);
    if (this.change.Json.ChangeCost) {
      if (+sumCost === +this.change.Json.ChangeCost.Cost) {
        sumValidation = true;
      } else {
        text = text + '<p style="direction: rtl;text-align: right;"><span style="color: darkred;"> - </span><span>جمع مبلغ ها باید با مبلغ جدید قرارداد برابر باشند!</span></p>';
      }
    } else {
      if (+sumCost === +this.contract.Cost) {
        sumValidation = true;
      } else {
        text = text + '<p style="direction: rtl;text-align: right;"><span style="color: darkred;"> - </span><span>جمع مبلغ ها باید با مبلغ قرارداد برابر باشند!</span></p>';
      }
    }
    if (this.formGp.valid && sumValidation) {
      this.sharedService.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.change.Json.ChangeServiceCost = {
            Services: this.myServices,
            Costs: this.formGp.get('Costs').value,
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

  getSum(total, num) {
    return total + num;
  }
}
