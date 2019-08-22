import { Component, ElementRef, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-plan-act-prop-add-row',
  templateUrl: './plan-act-prop-add-row.component.html',
  styleUrls: ['./plan-act-prop-add-row.component.scss']
})
export class PlanActPropAddRowComponent implements OnInit {
  formGp: FormGroup;
  title = '';
  selectedDate = '';
  @ViewChild('DateEl', { read: ElementRef }) DateEl: ElementRef;
  @ViewChild('dd') dd: ElementRef;
  datePickerConfig = {
    format: 'jYYYY/jMM/jDD'
  };

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public passedData: any,
              private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.formGp = this._formBuilder.group({
      date: ['', Validators.required]
    });
    this.title = this.passedData.data;
  }

}
