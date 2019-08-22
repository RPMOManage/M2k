import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-show-description',
  templateUrl: './show-description.component.html',
  styleUrls: ['./show-description.component.scss']
})
export class ShowDescriptionComponent implements OnInit {
  description: string;
  user: string;
  date;

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public passedData: any) {
  }

  ngOnInit() {
    this.description = this.passedData.description;
    this.user = this.passedData.user;
    this.date = this.passedData.date;

  }

}
