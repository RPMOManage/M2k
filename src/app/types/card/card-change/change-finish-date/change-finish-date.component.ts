import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContractService } from '../../../../shared/services/contract.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { CurrenciesList } from '../../../../shared/models/currencies.model';
import { ContractModel } from '../../../../shared/models/contractModels/contract.model';
import * as moment from 'jalali-moment';
import { AlertsService } from '../../../../shared/services/alerts.service';
import { ChangesModel } from '../../../../shared/models/contractModels/changes.model';

@Component({
  selector: 'app-change-finish-date',
  templateUrl: './change-finish-date.component.html',
  styleUrls: ['./change-finish-date.component.scss']
})
export class ChangeFinishDateComponent implements OnInit {
  @Input() contractID: number;
  @Input() change: ChangesModel;
  @Input() versionID: number;
  @Input() contract: ContractModel;
  @Output() changeTabIndex = new EventEmitter();
  formGp: FormGroup;
  selectedFinishDate = null;
  finishDates: { ID, DDate, FinishDate }[] = [];

  constructor(private router: Router,
              private contractService: ContractService,
              private _formBuilder: FormBuilder,
              private alertsService: AlertsService,
              private sharedService: SharedService) {
  }

  ngOnInit() {
    this.contractService.getFinishDates(this.contractID, this.versionID).subscribe(
      (finishDates) => {
        this.finishDates = finishDates;
        this.finishDates = this.finishDates.sort((a, b) => +new Date(b.DDate) - +new Date(a.DDate));
      }
    );
    if (this.change.Json.ChangeFinishDate) {
      if (this.change.Json.ChangeFinishDate.Date) {
        this.formGp = this._formBuilder.group({
          FinishDate: new FormControl(this.change.Json.ChangeFinishDate.Date, [Validators.required]),
        });
        console.log(this.change.Json.ChangeFinishDate.Date);
        this.selectedFinishDate = moment(this.change.Json.ChangeFinishDate.Date, 'jYYYY/jM/jD').format('YYYY/MM/DD');
        console.log(this.selectedFinishDate);
      }
    } else {
      this.formGp = this._formBuilder.group({
        FinishDate: new FormControl(null, [Validators.required]),
      });
    }
  }

  onSubmitClick() {
    let text = '';
    let DateValidation = false;
    let finishDate;
    if (this.selectedFinishDate) {
      try {
        finishDate = moment(this.selectedFinishDate.format('jYYYY/jM/jD'), 'jYYYY/jM/jD').format('jYYYY/jM/jD');
      } catch {
        finishDate = moment(this.selectedFinishDate, 'YYYY/MM/DD').format('jYYYY/jM/jD');
      }
      console.log(finishDate);
      if (+new Date(finishDate) > +new Date(this.contract.StartDate)) {
        DateValidation = true;
      } else {
        text = text + '<p style="direction: rtl;text-align: right;"><span style="color: darkred;"> - </span><span>تاریخ پایان نمیتواند قبل از تاریخ شروع قرارداد (' + this.contract.StartDate + ') باشد!</span></p>';
      }
    }
    if (this.formGp.valid && DateValidation) {
      this.sharedService.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.change.Json.ChangeFinishDate = {
            Date: finishDate,
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
