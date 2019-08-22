import { Component, Input, OnInit } from '@angular/core';
import { CardDialogComponent } from '../card-dialog/card-dialog.component';
import { MatDialog } from '@angular/material';
import * as Highcharts from 'highcharts';
import { Chart } from 'angular-highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import { ContractModel } from '../../../shared/models/contractModels/contract.model';
import { Router } from '@angular/router';
import { PMsList } from '../../../shared/models/PMs.model';
import { SharedService } from '../../../shared/services/shared.service';

HighchartsMore(Highcharts);

@Component({
  selector: 'app-card',
  styleUrls: ['./card.component.scss'],
  templateUrl: './card.component.html',
})
export class CardComponent implements OnInit {
  tabIndex = 0;
  @Input() contract: ContractModel;
  @Input() contractChanges;
  @Input() type;
  @Input() pms: PMsList[];
  changeCategories = [
    {id: 1, name: 'محدوده', colorClass: 'chips-red'},
    {id: 2, name: 'زمان', colorClass: 'chips-orange'},
    {id: 3, name: 'هزینه', colorClass: 'chips-green'},
    {id: 4, name: 'سایر', colorClass: 'chips-blue'},
  ];

  changeItems = [
    {id: 1, categoryID: 4, name: 'واحد سازمانی، گروه متولی، مدیر پروژه'},
    {id: 2, categoryID: 1, name: 'موضوع قرارداد'},
    {id: 3, categoryID: 1, name: 'آیین نامه ها و استانداردها'},
    {id: 4, categoryID: 1, name: 'خدمات قرارداد'},
    {id: 5, categoryID: 3, name: 'مبلغ قرارداد'},
    {id: 6, categoryID: 3, name: 'برآورد خدمات قرارداد'},
    {id: 7, categoryID: 3, name: 'محل تامین اعتبار'},
    {id: 8, categoryID: 1, name: 'احجام کلی کار'},
    {id: 9, categoryID: 2, name: 'تاریخ  پایان'},
    {id: 9, categoryID: 1, name: 'درصد پیشرفت فیزیکی واقعی'},
    {id: 9, categoryID: 2, name: 'درصد پیشرفت فیزیکی برنامه ای'},
    {id: 9, categoryID: 1, name: 'احجام کاری واقعی تحویل شده'},
    {id: 9, categoryID: 2, name: 'احجام کاری برنامه ای'},
    {id: 9, categoryID: 3, name: 'برنامه جریان نقدینگی'},
    {id: 9, categoryID: 4, name: 'ذی نفعان'},
  ];
  chart;
  chartOptions;

  constructor(public dialog: MatDialog,
                      private sharedService: SharedService,
                      private router: Router) {
  }

  ngOnInit() {
    this.buildChart();
    // this.reapeater();
    // this.chart = new Chart({
    //   chart: {
    //     type: 'bar',
    //     height: 100
    //   },
    //   title: {
    //     text: ''
    //   },
    //   xAxis: {
    //     categories: ['واقعی', 'برنامه ای', 'مالی'],
    //     title: {
    //       text: null
    //     }
    //   },
    //   yAxis: {
    //     min: 0,
    //     max: 100,
    //     title: {
    //       text: 'درصد',
    //       align: 'high'
    //     },
    //     labels: {
    //       overflow: 'justify'
    //     }
    //   },
    //   tooltip: {
    //     enabled: false
    //   },
    //   legend: {
    //     enabled: false
    //   },
    //   credits: {
    //     enabled: false
    //   },
    //   series: [{
    //     name: 'واقعی',
    //     color: '#d61a10',
    //     data: 75
    //   }]
    // });

    // this.chart = new Chart({
    //   chart: {
    //         type: 'bar',
    //         height: 100,
    //   },
    //   title: {
    //     text: '',
    //   },
    //   // credits: {
    //   //   enabled: false
    //   // },
    //   series: [
    //     {
    //       name: 'واقعی',
    //       color: '#d61a10',
    //       data: [75],
    //     },
    //   ],
    // });
  }

  reapeater() {
    setTimeout(() => {
      this.buildChart();
      this.reapeater();
    }, 5000);
  }

  getPMName(id: number) {
    const mainPM = this.pms.filter(v => v.User.ID === id)[0];
    if (mainPM) {
      return mainPM.User.Title;
    }
  }

  buildChart() {
    let mainService = 7;
    let data;

    if (this.contract.PCCalcsLast.length > 0) {
      if (this.contract.PCCalcsLast.length === 1) {
        mainService = this.contract.PCCalcsLast[0].Service;
      }
      data = [+this.contract.FinancialLast.FinancialProgress * 100, +this.contract.LastPC.filter(v => v.Service === mainService)[0].ActPC * 100, +this.contract.LastPC.filter(v => v.Service === mainService)[0].PlanPC * 100];
    } else {
      data = [+this.contract.FinancialLast.FinancialProgress * 100, 0, 0];
    }
    this.chartOptions = {
      chart: {
        polar: true,
        type: 'line',
        height: 200
      },

      title: {
        text: '',
        x: -80
      },

      pane: {
        size: '80%'
      },

      xAxis: {
        categories: ['پیشرفت مالی', 'پیشرفت واقعی', 'پیشرفت برنامه ای'],
        tickmarkPlacement: 'on',
        lineWidth: 0
      },

      yAxis: {
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        min: 0,
        max: 100
      },

      tooltip: {
        shared: true,
        pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.0f}</b><br/>'
      },

      legend: {
        enabled: false
      },

      series: [{
        name: 'پیشرفت',
        data: data,
        pointPlacement: 'off',
        color: this.getRandomColor(),
        type: 'area'
      },
      //   {
      //   name: 'Actual Spending',
      //   data: [50, 100, 80],
      //   pointPlacement: 'on',
      //   type: 'area'
      // }, {
      //   name: 'Actual Spending',
      //   data: [50, 100, 80],
      //   pointPlacement: 'on',
      //   type: 'area'
      // }
      ]
    };
      this.chart = new Chart(this.chartOptions);
  }

  onClickOnChips(contract: any) {
    this.dialog.open(CardDialogComponent, {
      width: '500px',
      data: {
        contract: contract,
        changeItems: this.changeItems,
        changeCategories: this.changeCategories,
        type: 'changes',
      },
    });
  }

  openDialog(contract: any) {
    this.dialog.open(CardDialogComponent, {
      width: '500px',
      data: {
        contract: contract,
        type: 'compContracts',
      },
    });
  }

  add() {
    this.chart.addPoint(Math.floor(Math.random() * 10));
  }

  onClickTitle(id: number) {
  this.router.navigate(['/contract'], {queryParams: {ID: id}, queryParamsHandling: null});
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

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  getSum(total, num) {
    return total + num;
  }
}
