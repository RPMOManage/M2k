import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContractService } from '../../../../shared/services/contract.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { CurrenciesList } from '../../../../shared/models/currencies.model';
import { CostResourcesList } from '../../../../shared/models/costResources.model';
import { ContractModel } from '../../../../shared/models/contractModels/contract.model';
import { AlertsService } from '../../../../shared/services/alerts.service';
import { ChangesModel } from '../../../../shared/models/contractModels/changes.model';

@Component({
  selector: 'app-change-assigned-cost-resources-date',
  templateUrl: './change-assigned-cost-resources.component.html',
  styleUrls: ['./change-assigned-cost-resources.component.scss']
})
export class ChangeAssignedCostResourcesComponent implements OnInit {
  @Input() contractID: number;
  @Input() versionID: number;
  @Input() contract: ContractModel;
  @Input() change: ChangesModel;
  @Output() changeTabIndex = new EventEmitter();
  formGp: FormGroup;
  selectedNewDeclareDate = '';
  selectedFinishDate = '';
  assignedCostResources: { ID, DDate, CostResource, Cost }[] = [];
  costResources: CostResourcesList[];

  constructor(private router: Router,
              private contractService: ContractService,
              private _formBuilder: FormBuilder,
              private alertsService: AlertsService,
              private sharedService: SharedService) {
  }

  ngOnInit() {
    this.contractService.getAssignedCostResources(this.contractID).subscribe(
      (assignedCostResources) => {
        this.assignedCostResources = assignedCostResources;
        const finalAssignedCostResources = this.assignedCostResources.filter(v => {
          if (v.DDate === this.assignedCostResources[0].DDate) {
            return v;
          }
        });
        this.assignedCostResources = finalAssignedCostResources;
        if (this.assignedCostResources.length === 0) {
          this.onAddCostResource();
        } else {
          if (this.change.Json.ChangeAssignedCost) {
            if (this.change.Json.ChangeAssignedCost.CostResources) {
              for (let i = 0; i < this.change.Json.ChangeAssignedCost.CostResources.length; i++) {
                this.onAddCostResourceWithData({ID: i, DDate: null, CostResource: this.change.Json.ChangeAssignedCost.CostResources[i], Cost: this.change.Json.ChangeAssignedCost.Costs[i]});
              }
            }
          } else {
            for (let i = 0; i < this.assignedCostResources.length; i++) {
              this.onAddCostResourceWithData(this.assignedCostResources[i]);
            }
          }
        }
      }
    );
    this.sharedService.getCostResources().subscribe(
      (data) => {
        this.costResources = data;
      }
    );
    this.formGp = this._formBuilder.group({
      CostResources: new FormArray([], [Validators.required]),
      Costs: new FormArray([], [Validators.required]),
      SumPayments: new FormArray([]),
    });
  }

  onAddCostResourceWithData(costResource: { ID, DDate, CostResource, Cost }) {
    const control = new FormControl(costResource.Cost, [Validators.required, Validators.min(1)]);
    (<FormArray>this.formGp.get('Costs')).push(control);

    const control2 = new FormControl(costResource.CostResource, Validators.required);
    (<FormArray>this.formGp.get('CostResources')).push(control2);

    const control3 = new FormControl(10, Validators.required);
    (<FormArray>this.formGp.get('SumPayments')).push(control3);
  }

  onAddCostResource() {
    const control = new FormControl(null, [Validators.required, Validators.min(1)]);
    (<FormArray>this.formGp.get('Costs')).push(control);

    const control2 = new FormControl(null, Validators.required);
    (<FormArray>this.formGp.get('CostResources')).push(control2);
  }

  onDeleteCostResource(id: number) {
    (<FormArray>this.formGp.get('Costs')).removeAt(id);
    (<FormArray>this.formGp.get('CostResources')).removeAt(id);
  }

  getCostResourceName(id: number) {
    return this.costResources.filter(v => v.ID === id)[0].Name;
  }

  onSubmitClick() {
    let text = '';
    let sumValidation = false;
    const sumCost = this.formGp.get('Costs').value.reduce(this.getSum);
    const findDuplicates = this.formGp.get('CostResources').value.reduce(function (acc, el, i, arr) {
      if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el);
      return acc;
    }, []);
    if (this.change.Json) {
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
    }
    if (findDuplicates.length > 0) {
      text = text + '<p style="direction: rtl;text-align: justify;"><span style="color: darkred;">' + '' + '- </span><span>رکوردها تکراری است!</span></p>';
    }
    if (this.formGp.valid && sumValidation && findDuplicates.length === 0) {
      this.sharedService.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.change.Json.ChangeAssignedCost = {
            CostResources: this.formGp.get('CostResources').value,
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
