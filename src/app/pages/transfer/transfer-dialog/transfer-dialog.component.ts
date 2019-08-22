import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { OldContractList } from '../../../shared/models/transferModels/oldContract.model';

@Component({
  selector: 'app-transfer-dialog',
  templateUrl: './transfer-dialog.component.html',
  styleUrls: ['./transfer-dialog.component.scss']
})
export class TransferDialogComponent implements OnInit {
  contract: OldContractList;
  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public passedData: any) { }

  ngOnInit() {
    this.contract = this.passedData.data;
  }

}
