import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Chart} from 'angular-highcharts';
import {SharedService} from '../../shared/services/shared.service';
import {ContractService} from '../../shared/services/contract.service';
import {ContractModel} from '../../shared/models/contractModels/contract.model';
import * as moment from 'jalali-moment';

import anime from 'node_modules/animejs';
import {ContractServicesList} from '../../shared/models/contractServices.model';
import {BuildSiteService} from '../../shared/services/build-site.service';
import {TempTransferService} from '../../shared/services/temp-transfer.service';
import * as Highcharts from 'highcharts';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  menu: { ID, TitleEn, TitleFa }[] = [{
    ID: 0,
    TitleEn: 'contracts',
    TitleFa: 'قرارداد ها',
  }, {
    ID: 1,
    TitleEn: 'duties',
    TitleFa: 'وظایف',
  }, {
    ID: 2,
    TitleEn: 'changes',
    TitleFa: 'تغییرات',
  }, {
    ID: 3,
    TitleEn: 'wizard',
    TitleFa: 'ویزارد',
  }, {
    ID: 4,
    TitleEn: 'contract',
    TitleFa: 'صفحه قرارداد 3',
  }];
  chart;
  chartOptions;
  contracts: ContractModel[] = [];
  boxes: { PCPlan: any, PCAct: any, PCFinance: any, AllContract: number, TopPCSpeeds: any[], TopPCSpeeds90: any[], TopTimeDeviations: any[], TopPaymentDeviations: any[], TopFinishingContracts: any[], TopAfterFinishContracts: any[] } = {
    PCPlan: null,
    PCAct: null,
    PCFinance: null,
    AllContract: null,
    TopPCSpeeds: [],
    TopPCSpeeds90: [],
    TopTimeDeviations: [],
    TopPaymentDeviations: [],
    TopFinishingContracts: [],
    TopAfterFinishContracts: []
  };
  sortTime = false;
  sortSpeed = false;
  sortSpeed90 = false;
  sortPD = false;
  sortFc = false;
  sortAfc = false;
  isRotate = false;
  slideShows: { ID, Title, IsActive, URL }[] = [];
  slideShowsIndex = -1;
  slideShowTitle = 'نمودار پیشرفت کل پروژه ها';
  deviationFlapped = false;
  finishingFlapped = false;
  speedFlapped = false;
  today = '';
  services: ContractServicesList[] = [];

  constructor(private router: Router,
              private sharedService: SharedService,
              private contractService: ContractService) {
  }

  ngOnInit() {
    this.sharedService.getContractServices().subscribe(
      (services) => {
        this.services = services;
      }
    );
    if (this.sharedService.todayData) {
      this.today = this.sharedService.todayData;
      const mainDate = moment(this.today, 'YYYY/M/D');
      this.today = mainDate.format('jYYYY/jM/jD');
    }
    this.sharedService.today.subscribe(
      (today) => {
        this.today = <any>today;
        const mainDate = moment(this.today, 'YYYY/M/D');
        this.today = mainDate.format('jYYYY/jM/jD');
      }
    );
    this.sharedService.getSlideShows().subscribe(
      (slideShows) => {
        this.slideShows = slideShows;
      }
    );
    this.contractService.getAllContracts().subscribe(
      (contracts) => {
        this.contracts = contracts;
        this.boxes = {
          PCPlan: 0,
          PCAct: 0,
          PCFinance: 0,
          AllContract: this.contracts.length,
          TopPCSpeeds: [],
          TopPCSpeeds90: [],
          TopTimeDeviations: [],
          TopPaymentDeviations: [],
          TopFinishingContracts: [],
          TopAfterFinishContracts: []
        };
        const costs = this.contracts.map(v => v.Cost);
        const mainCost = +costs.reduce(this.getSum);
        for (let i = 0; i < this.contracts.length; i++) {
          let mainService = 7;
          if (contracts[i].PCCalcsLast.length === 1) {
            mainService = contracts[i].PCCalcsLast[0].Service;
          } else if (contracts[i].PCCalcsLast.length === 0) {
            mainService = null;
          }
          if (mainService) {
            this.boxes.TopPCSpeeds.push([this.contracts[i].PCCalcsLast.filter(v => v.Service === mainService)[0], i]);
            this.boxes.TopPCSpeeds90.push([this.contracts[i].PCCalcsLast.filter(v => v.Service === mainService)[0], i]);
            this.boxes.TopTimeDeviations.push([this.contracts[i].PCCalcsLast.filter(v => v.Service === mainService)[0], i]);
            if (contracts[i].LastPC) {
              this.boxes.PCPlan = this.boxes.PCPlan + ((+contracts[i].Cost / +mainCost) * +contracts[i].LastPC.filter(v => v.Service === mainService)[0].PlanPC);
              this.boxes.PCAct = this.boxes.PCAct + ((+contracts[i].Cost / +mainCost) * +contracts[i].LastPC.filter(v => v.Service === mainService)[0].ActPC);
            }
          }
          if (contracts[i].PCCalcsLast.length > 0 && this.contracts[i].FinancialLast) {
            this.boxes.TopPaymentDeviations.push([this.contracts[i].FinancialLast, i]);
          }
          if (+new Date(this.contracts[i].FinishDate) < (+new Date(this.today) + 5184000000) && +new Date(this.contracts[i].FinishDate) > +new Date(this.today)) {
            this.boxes.TopFinishingContracts.push([this.contracts[i].FinishDate, i]);
          }
          if (+new Date(this.contracts[i].FinishDate) < +new Date(this.today)) {
            this.boxes.TopAfterFinishContracts.push([this.contracts[i].FinishDate, i]);
          }

          if (contracts[i].FinancialLast) {
            this.boxes.PCFinance = this.boxes.PCFinance + ((+contracts[i].Cost / +mainCost) * +contracts[i].FinancialLast.FinancialProgress);
          }
        }
        if (this.contracts.length > 5) {
          this.boxes.TopPCSpeeds = this.boxes.TopPCSpeeds.sort((a, b) => b[0].Speed30D - a[0].Speed30D).slice(1).slice(-5);
          this.boxes.TopPCSpeeds90 = this.boxes.TopPCSpeeds.sort((a, b) => b[0].Speed90D - a[0].Speed90D).slice(1).slice(-5);
          this.boxes.TopTimeDeviations = this.boxes.TopTimeDeviations.sort((a, b) => b[0].TimeDeviation - a[0].TimeDeviation).slice(1).slice(-5);
          this.boxes.TopPaymentDeviations = this.boxes.TopPaymentDeviations.sort((a, b) => b[0].PaymentDeviation - a[0].PaymentDeviation).slice(1).slice(-5);
          this.boxes.TopFinishingContracts = this.boxes.TopFinishingContracts.sort((a, b) => +new Date(a[0]) - +new Date(b[0])).slice(1).slice(-5);
          this.boxes.TopAfterFinishContracts = this.boxes.TopAfterFinishContracts.sort((a, b) => +new Date(b[0]) - +new Date(a[0])).slice(1).slice(-5);
        } else {
          this.boxes.TopPCSpeeds = this.boxes.TopPCSpeeds.sort((a, b) => {
            if (b[0] && a[0]) {
              return b[0].Speed30D - a[0].Speed30D;
            }
          });
          this.boxes.TopPCSpeeds90 = this.boxes.TopPCSpeeds90.sort((a, b) => {
            if (b[0] && a[0]) {
              return b[0].Speed90D - a[0].Speed90D;
            }
          });
          this.boxes.TopTimeDeviations = this.boxes.TopTimeDeviations.sort((a, b) => {
            if (b[0] && a[0]) {
              return b[0].TimeDeviation - a[0].TimeDeviation;
            }
          });
          this.boxes.TopPaymentDeviations = this.boxes.TopPaymentDeviations.sort((a, b) => {
            if (b[0] && a[0]) {
              return b[0].PaymentDeviation - a[0].PaymentDeviation;
            }
          });
          this.boxes.TopFinishingContracts = this.boxes.TopFinishingContracts.sort((a, b) => {
            if (b[0] && a[0]) {
              return +new Date(a[0]) - +new Date(b[0]);
            }
          });
          this.boxes.TopAfterFinishContracts = this.boxes.TopAfterFinishContracts.sort((a, b) => {
            if (b[0] && a[0]) {
              return +new Date(b[0]) - +new Date(a[0]);
            }
          });
        }
        this.boxes.PCPlan = (this.boxes.PCPlan * 100).toFixed(2);
        this.boxes.PCAct = (this.boxes.PCAct * 100).toFixed(2);
        this.boxes.PCFinance = (this.boxes.PCFinance * 100).toFixed(2);
        this.buildChart();
        // setTimeout(
        //   () => {
        //     anime({
        //       targets: '#pc-round',
        //       innerHTML: [0, 10000],
        //       easing: 'linear',
        //       duration: 10000,
        //       round: 10 // Will round the animated value to 1 decimal
        //
        //     });
        //   }, 100
        // );
      });
    // this.sharedService.getProjecs().subscribe();
    // this.sharedService.getDDD().subscribe();
  }

  onClickContract(id: number) {
    this.router.navigate(['/contract'], {queryParams: {ID: id}, queryParamsHandling: 'merge'});
  }

  onChangeSpeedFlapped() {
    this.speedFlapped = !this.speedFlapped;
  }

  onChangeDeviationFlapped() {
    this.deviationFlapped = !this.deviationFlapped;
  }

  onChangeFinishingFlapped() {
    this.finishingFlapped = !this.finishingFlapped;
  }

  changeMainChartIndexNext() {
    this.slideShowsIndex++;
    if (this.slideShowsIndex === this.slideShows.length) {
      this.slideShowsIndex = -1;
    }
    this.getSlideShowTitle();
  }

  changeMainChartIndexPrevious() {
    this.slideShowsIndex--;
    if (this.slideShowsIndex === -2) {
      this.slideShowsIndex = this.slideShows.length - 1;
    }
    this.getSlideShowTitle();
  }

  getSlideShowTitle() {
    if (this.slideShowsIndex === -1) {
      this.slideShowTitle = 'نمودار پیشرفت کل پروژه ها';
    } else {
      this.slideShowTitle = this.slideShows[this.slideShowsIndex].Title;
    }
  }

  onAnimate() {
    if (!this.isRotate) {
      anime({
        targets: '#main',
        rotate: 180,
      });
    } else {
      anime({
        targets: '#main',
        rotate: 0,
      });
    }
    this.isRotate = !this.isRotate;
  }

  onChangeSort(type: string) {
    if (type === 'time') {
      this.sortTime = !this.sortTime;
      if (this.sortTime) {
        this.boxes.TopTimeDeviations = this.boxes.TopTimeDeviations.sort((a, b) => a[0].TimeDeviation - b[0].TimeDeviation);
      } else {
        this.boxes.TopTimeDeviations = this.boxes.TopTimeDeviations.sort((a, b) => b[0].TimeDeviation - a[0].TimeDeviation);
      }
    }
    if (type === 'speed') {
      this.sortSpeed = !this.sortSpeed;
      if (this.sortSpeed) {
        this.boxes.TopPCSpeeds = this.boxes.TopPCSpeeds.sort((a, b) => a[0].Speed30D - b[0].Speed30D);
      } else {
        this.boxes.TopPCSpeeds = this.boxes.TopPCSpeeds.sort((a, b) => b[0].Speed30D - a[0].Speed30D);
      }
    }
    if (type === 'speed90') {
      this.sortSpeed90 = !this.sortSpeed90;
      if (this.sortSpeed90) {
        this.boxes.TopPCSpeeds90 = this.boxes.TopPCSpeeds90.sort((a, b) => a[0].Speed90D - b[0].Speed90D);
      } else {
        this.boxes.TopPCSpeeds90 = this.boxes.TopPCSpeeds90.sort((a, b) => b[0].Speed90D - a[0].Speed90D);
      }
    }
    if (type === 'pd') {
      this.sortPD = !this.sortPD;
      if (this.sortPD) {
        this.boxes.TopPaymentDeviations = this.boxes.TopPaymentDeviations.sort((a, b) => a[0].PaymentDeviation - b[0].PaymentDeviation);
      } else {
        this.boxes.TopPaymentDeviations = this.boxes.TopPaymentDeviations.sort((a, b) => b[0].PaymentDeviation - a[0].PaymentDeviation);
      }
    }
    if (type === 'fc') {
      this.sortFc = !this.sortFc;
      if (this.sortFc) {
        this.boxes.TopFinishingContracts = this.boxes.TopFinishingContracts.sort((a, b) => +new Date(b[0]) - +new Date(a[0]));
      } else {
        this.boxes.TopFinishingContracts = this.boxes.TopFinishingContracts.sort((a, b) => +new Date(a[0]) - +new Date(b[0]));
      }
    }
    if (type === 'afc') {
      this.sortAfc = !this.sortAfc;
      if (this.sortAfc) {
        this.boxes.TopAfterFinishContracts = this.boxes.TopAfterFinishContracts.sort((a, b) => +new Date(a[0]) - +new Date(b[0]));
      } else {
        this.boxes.TopAfterFinishContracts = this.boxes.TopAfterFinishContracts.sort((a, b) => +new Date(b[0]) - +new Date(a[0]));
      }
    }
  }

  onChangeTable() {
    const mainUnits = this.contracts.map(v => v.Unit);
    const units = Array.from(new Set(this.contracts.map(v => v.Unit.Id)));
    const finalUnits = units.map(v => mainUnits.filter(v2 => v === v2.Id)[0]);
    return finalUnits;
  }

  getContractProgress(id: number, type, isTotal = false) {
    let fp = 0;
    let contracts, costs;
    if (isTotal) {
      contracts = this.contracts;
      costs = this.contracts.map(v => v.Cost);
    } else {
      contracts = this.contracts.filter(v => v.Unit.Id === id);
      costs = this.contracts.filter(v => v.Unit.Id === id).map(v => v.Cost);
    }
    const mainCost = +costs.reduce(this.getSum);
    if (type === 'plan') {
      for (let i = 0; i < contracts.length; i++) {
        if (contracts[i].PCCalcsLast.length > 1) {
          fp = fp + ((+contracts[i].Cost / +mainCost) * +contracts[i].LastPC.filter(v => v.Service === 7)[0].PlanPC);
        } else if (contracts[i].PCCalcsLast.length === 1) {
          fp = fp + ((+contracts[i].Cost / +mainCost) * +contracts[i].LastPC.filter(v => v.Service === contracts[i].PCCalcsLast[0].Service)[0].PlanPC);
        }
      }
    }
    if (type === 'act') {
      for (let i = 0; i < contracts.length; i++) {
        if (contracts[i].PCCalcsLast.length > 1) {
          fp = fp + ((+contracts[i].Cost / +mainCost) * +contracts[i].LastPC.filter(v => v.Service === 7)[0].ActPC);
        } else if (contracts[i].PCCalcsLast.length === 1) {
          fp = fp + ((+contracts[i].Cost / +mainCost) * +contracts[i].LastPC.filter(v => v.Service === contracts[i].PCCalcsLast[0].Service)[0].ActPC);
        }
      }
    }
    if (type === 'finance') {
      for (let i = 0; i < contracts.length; i++) {
        if (contracts[i].FinancialLast.FinancialProgress) {
          fp = fp + ((+contracts[i].Cost / +mainCost) * +contracts[i].FinancialLast.FinancialProgress);
        } else {
          fp = null;
        }
      }
    }
    if (type === 'dp') {
      for (let i = 0; i < contracts.length; i++) {
        if (contracts[i].PCCalcsLast.length > 1) {
          fp = fp + ((+contracts[i].Cost / +mainCost) * +contracts[i].PCCalcsLast.filter(v => v.Service === 7)[0].ProgressDeviation);
        } else if (contracts[i].PCCalcsLast.length === 1) {
          fp = fp + ((+contracts[i].Cost / +mainCost) * +contracts[i].PCCalcsLast.filter(v => v.Service === contracts[i].PCCalcsLast[0].Service)[0].ProgressDeviation);
        }
      }
    }
    if (type === 'dt') {
      for (let i = 0; i < contracts.length; i++) {
        if (contracts[i].PCCalcsLast.length > 1) {
          fp = fp + ((+contracts[i].Cost / +mainCost) * +contracts[i].PCCalcsLast.filter(v => v.Service === 7)[0].TimeDeviation);
        } else if (contracts[i].PCCalcsLast.length === 1) {
          fp = fp + ((+contracts[i].Cost / +mainCost) * +contracts[i].PCCalcsLast.filter(v => v.Service === contracts[i].PCCalcsLast[0].Service)[0].TimeDeviation);
        }
      }
    }
    if (type === 'dpay') {
      for (let i = 0; i < contracts.length; i++) {
        fp = fp + ((+contracts[i].Cost / +mainCost) * +contracts[i].FinancialLast.PaymentDeviation);
      }
    }
    if (type === 'sp') {
      for (let i = 0; i < contracts.length; i++) {
        if (contracts[i].PCCalcsLast.length > 1) {
          fp = fp + ((+contracts[i].Cost / +mainCost) * +contracts[i].PCCalcsLast.filter(v => v.Service === 7)[0].Speed30D);
        } else if (contracts[i].PCCalcsLast.length === 1) {
          fp = fp + ((+contracts[i].Cost / +mainCost) * +contracts[i].PCCalcsLast.filter(v => v.Service === contracts[i].PCCalcsLast[0].Service)[0].Speed30D);
        }
      }
      // return ((+fp / +contracts.length)).toFixed();
      return ((+fp)).toFixed();
    }
    // return ((+fp / +contracts.length) * 100).toFixed(2);
    return ((+fp) * 100).toFixed(2);
  }

  buildChart() {
    const series = [];
    const units = this.onChangeTable();
    const firstData = [];
    const secondData = [];
    const thirdData = [];
    const costs = this.contracts.map(v => v.Cost);
    const mainCost = +costs.reduce(this.getSum);
    for (let i = 0; i < this.contracts.length; i++) {
      let mainService = 7;
      if (this.contracts[i].PCCalcsLast.length === 1) {
        mainService = this.contracts[i].PCCalcsLast[0].Service;
      } else if (this.contracts[i].PCCalcsLast.length === 0) {
        mainService = null;
      }
      if (mainService) {
        firstData.push(+this.contracts[i].LastPC.filter(v => v.Service === mainService)[0].ActPC * 100);
        secondData.push(+this.contracts[i].LastPC.filter(v => v.Service === mainService)[0].PlanPC * 100);
      } else {
        firstData.push(null);
        secondData.push(null);
      }
      thirdData.push(+this.contracts[i].FinancialLast.FinancialProgress * 100);
    }
    let isScrollbarEnabled = false;
    if (this.contracts.length > 20) {
      isScrollbarEnabled = true;
    }
    series.push({
      name: 'پیشرفت برنامه ای',
      data: secondData,
    });
    series.push({
      name: 'پیشرفت واقعی',
      data: firstData,
      color: '#c63941'
    });

    series.push({
      name: 'پیشرفت مالی',
      data: thirdData,
      color: '#2b8c63'
    });
    this.chartOptions = {
      chart: {
        type: 'column',
        height: 300,
        zoomType: 'x'
      },
      title: {
        text: ''
      },
      tooltip: {
        padding: 4,
        useHTML: true,
        formatter: function () {
          return '<p class="highchart-Tooltip">' + this.series.name + '</p>' +
            '<p style="direction: ltr;" class="highchart-Tooltip">' + 'مقدار : ' + Highcharts.numberFormat(Math.abs(this.point.y), 0) + '</p>';
        }
      },
      xAxis: {
        categories: this.contracts.map(v => v.Title),
        min: 0,
        scrollbar: {
          enabled: isScrollbarEnabled
        },
        labels: {
          useHTML: true,
          style: {
            width: '100%',
            whiteSpace: 'normal'
          },
          step: 1,
          formatter: function () {
            return '<div align="center" style="text-align: right; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; width: 100%;font-family: IranSans;direction: rtl;"><span title="' + this.value + '">' + this.value + '</span></div>';
          }
        },
        tickLength: 0
      },
      yAxis: {
        min: 0,
        max: 100,
        title: {
          text: 'درصد'
        }
      },
      series: series,
    };
    this.chart = new Chart(this.chartOptions);
  }


  // buildChart2() {
  //   this.chartOptions = {
  //     chart: {
  //       type: 'column',
  //     },
  //     title: {
  //       text: ''
  //     },
  //     subtitle: {
  //       text: ''
  //     },
  //     xAxis: {
  //       type: 'category',
  //       title: {
  //         text: null
  //       },
  //       min: 0,
  //       max: 8,
  //       scrollbar: {
  //         enabled: true
  //       },
  //       tickLength: 0
  //     },
  //     yAxis: {
  //       min: 0,
  //       max: 1200,
  //       title: {
  //         text: 'Votes',
  //         align: 'high'
  //       }
  //     },
  //     plotOptions: {
  //       bar: {
  //         dataLabels: {
  //           enabled: true
  //         }
  //       }
  //     },
  //     legend: {
  //       enabled: false
  //     },
  //     credits: {
  //       enabled: false
  //     },
  //     series: [{
  //       name: 'Votes',
  //       data: [
  //         ["Gantt chart", 1000, 500],
  //         ["Autocalculation and plotting of trend lines", 575, 500],
  //         ["Allow navigator to have multiple data series", 523, 500],
  //         ["Implement dynamic font size", 427, 500],
  //         ["Multiple axis alignment control", 399, 500],
  //         ["Stacked area (spline etc) in irregular datetime series", 309, 500],
  //         ["Adapt chart height to legend height", 278, 500],
  //         ["Export charts in excel sheet", 239, 500],
  //         ["Toggle legend box", 235, 500],
  //         ["Venn Diagram", 203, 500],
  //         ["Add ability to change Rangeselector position", 182, 500],
  //         ["Draggable legend box", 157, 500],
  //         ["Sankey Diagram", 149, 500],
  //         ["Add Navigation bar for Y-Axis in Highstock", 144, 500],
  //         ["Grouped x-axis", 143, 500],
  //         ["ReactJS plugin", 137, 500],
  //         ["3D surface charts", 134, 500],
  //         ["Draw lines over a stock chart, for analysis purpose", 118, 500],
  //         ["Data module for database tables", 118, 500],
  //         ["Draggable points", 117, 500]
  //       ]
  //     }]
  //   };
  //   this.chart = new Chart(this.chartOptions);
  // }

  getSum(total, num) {
    return total + num;
  }
}
