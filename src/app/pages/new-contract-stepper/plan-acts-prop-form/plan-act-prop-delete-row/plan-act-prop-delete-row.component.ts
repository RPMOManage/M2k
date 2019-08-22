import { Component, ElementRef, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GenerateDatesService } from '../../../../shared/services/generate-dates.service';

@Component({
  selector: 'app-plan-act-prop-delete-row',
  templateUrl: './plan-act-prop-delete-row.component.html',
  styleUrls: ['./plan-act-prop-delete-row.component.scss']
})
export class PlanActPropDeleteRowComponent implements OnInit {
  formGp: FormGroup;
  title = '';
  @ViewChild('DateEl', { read: ElementRef }) DateEl: ElementRef;
  @ViewChild('dd') dd: ElementRef;
  datePickerConfig = {
    format: 'jYYYY/jMM/jDD'
  };
  dates = [];

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public passedData: any,
              private _formBuilder: FormBuilder,
              private generateDatesService: GenerateDatesService) { }

  ngOnInit() {
    this.formGp = this._formBuilder.group({
      date: ['', Validators.required]
    });
    console.log(this.passedData.data);

    if (this.passedData.changedDates) {
      const changedDates = this.passedData.changedDates;
      const removeDates = null;
      const notIncluded = this.passedData.data.filter(val => !changedDates.includes(val));
      this.dates = notIncluded;
    } else {
      this.dates = this.passedData.tempAddDates;
    }
    this.title = this.passedData.data;
  }

}
