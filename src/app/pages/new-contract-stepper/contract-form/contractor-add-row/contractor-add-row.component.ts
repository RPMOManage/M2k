import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contractor-add-row',
  templateUrl: './contractor-add-row.component.html',
  styleUrls: ['./contractor-add-row.component.scss']
})
export class ContractorAddRowComponent implements OnInit {
  formGp: FormGroup;
  contractorTypes = ['حقیقی', 'حقوقی'];
  title = 'اضافه کردن طرف قرارداد';

  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.formGp = this._formBuilder.group({
      contractorType: ['L', Validators.required],
      contractorName: ['', Validators.required],
      contractorPish_PhoneNumber: ['', Validators.required],
      contractorPhoneNumber: ['', Validators.required],
      contractorInt_PhoneNumber: [''],
      contractorAddress: [''],

    });
    this.changed();
  }

  changed() {
    if (this.formGp.get('contractorType').value === 'R') {
      this.formGp.get('contractorName').setValue(' آقای ');
      this.formGp.get('contractorType').setValue('R');
    } else {
      this.formGp.get('contractorName').setValue(' شرکت ');
      this.formGp.get('contractorType').setValue('L');
    }
  }
}
