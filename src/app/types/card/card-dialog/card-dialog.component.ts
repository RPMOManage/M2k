import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-card-dialog',
  styleUrls: ['./card-dialog.component.scss'],
  templateUrl: './card-dialog.component.html',
})
export class CardDialogComponent implements OnInit {
  tabIndex = 0;
  @Input() contract;
  @Input() type;
  chart;

  constructor(@Inject(MAT_DIALOG_DATA) public data) {
  }

  ngOnInit() {
    console.log(this.data.type);
  }
  buildChart() {
  //   // this.chart = new Chart({
  //   //   chart: {
  //   //         type: 'bar',
  //   //         height: 100
  //   //   },
  //   //   title: {
  //   //     text: ''
  //   //   },
  //   //   // credits: {
  //   //   //   enabled: false
  //   //   // },
  //   //   series: [
  //   //     {
  //   //       name: 'واقعی',
  //   //       color: '#d61a10',
  //   //       data: [75]
  //   //     }
  //   //   ]
  //   // });
  }

  add() {
    this.chart.addPoint(Math.floor(Math.random() * 10));
  }

  goToHome() {
    // this.menuService.navigateHome();
  }

  onChangeTab(index: number) {
    this.tabIndex = index;
  }

  onAddContract() {
    alert('Add Contract!');
  }
}
