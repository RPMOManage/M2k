import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CostResourcesList } from '../../../shared/models/costResources.model';
import { SharedService } from '../../../shared/services/shared.service';
import { AlertsService } from '../../../shared/services/alerts.service';

@Component({
  selector: 'app-assigned-cost-resources-form',
  templateUrl: './assigned-cost-resources-form.component.html',
  styleUrls: ['./assigned-cost-resources-form.component.scss']
})
export class AssignedCostResourcesFormComponent implements OnInit {
  @Output() formData = new EventEmitter();
  @Input() formGp: FormGroup;
  costResources: CostResourcesList[];
  @Output() addHobby = new EventEmitter();
  @Output() deleteHobby = new EventEmitter();
  currency = 'ریال';
  cost: number;
  isReadOnly: boolean;

  constructor(public sharedService: SharedService,
              private alertsService: AlertsService) {
  }

  ngOnInit() {

    this.isReadOnly = this.sharedService.isReadOnly;
          this.sharedService.newCost = +this.sharedService.stepFormsData.contractsForm.Cost_Costs;
          this.cost = +this.sharedService.stepFormsData.contractsForm.Cost_Costs;
          this.formGp.valueChanges.subscribe(
            () => {
              this.sharedService.stepsDirty.costAssignedResourcesForm = true;
            }
          );
    this.sharedService.getCostResources().subscribe(
      (data) => {
        this.costResources = data;
      }
    );
  }

  onAddHobby(hobby, costResource) {
    this.addHobby.emit([hobby, costResource]);
  }

  delete(id: number) {
    this.alertsService.alertsRemove().then((result) => {
      if (result.value === true) {
        this.deleteHobby.emit(id);
      }
    });
  }

  checkStep() {
    this.formData.emit(this.formGp);
  }

  getSum(total, num) {
    return total + num;
  }
}
