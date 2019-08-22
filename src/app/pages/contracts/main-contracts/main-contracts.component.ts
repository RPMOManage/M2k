import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { SharedService } from '../../../shared/services/shared.service';
import { ContractService } from '../../../shared/services/contract.service';
import * as Highcharts from 'highcharts';
import { Chart } from 'angular-highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import { MatDialog } from '@angular/material';
import { ContractModel } from '../../../shared/models/contractModels/contract.model';
import { ContractServicesList } from '../../../shared/models/contractServices.model';
import { UnitsList } from '../../../shared/models/units.model';
import { ServicesTableComponent } from './services-table/services-table.component';
import { DeliverablesTableComponent } from './deliverables-table/deliverables-table.component';
import { DeliverablesList } from '../../../shared/models/Deliverables.model';
import { OperationTypesList } from '../../../shared/models/operationTypes.model';
import { PMsList } from '../../../shared/models/PMs.model';

// import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'app-main-contracts',
  styleUrls: ['./main-contracts.component.scss'],
  templateUrl: './main-contracts.component.html',
})
export class MainContractsComponent implements OnInit {
  flipped = false;
  tableFlipped = false;
  tempType = 'tempContracts';
  compType = 'compContracts';
  tabIndex = 0;
  chart;
  chartOptions;
  tableShow = 'contracts';
  contractsTemp: any[] = [
    {
      Title: 'دیجیتال سازی شبکه رادیویی مسیر یزد- هرمزگان ،تهران- جنوب', Code: 'TC234', PM: 'احسان رهبر', PMCode: 'p1', Status: 'importer',
      Picture: 'https://www.iamexpat.nl/sites/default/files/styles/article--full/public/work-contracts-netherlands.jpg', Date: '1396/07/20', IsSpecial: false,
    },
    {
      Title: 'اتصال انشعاب بندرعباس و سیلو سازمان غله به شبکه ریلی', Code: 'TC236', PM: 'مریم محمدی', PMCode: 'p2', Status: 'pm',
      Picture: 'http://commettelaw.com/wp-content/uploads/2017/04/Contract-Law-Ft-Lauderdale-Florida.jpg', Date: '1393/05/15', IsSpecial: true,
    },
    {
      Title: 'اتصال کارخانه فولاد ایرانیان به شبکه ریلی', Code: 'TC255', PM: 'حسین کمالی', PMCode: 'p3', Status: 'pmo',
      Picture: 'https://www.iamexpat.nl/sites/default/files/styles/' +
      'article--full/public/oldimages/67cddc45e6e8c166afe752d0b5e0866c1441700680.jpg', Date: '1395/02/11', IsSpecial: false,
    },
    {
      Title: 'بهسازی خطوط بلاک شمسی- اشکذر (نظرآباد)', Code: 'TC268', PM: 'علی پناهی', PMCode: 'p4', Status: 'importer',
      Picture: 'https://www.welcome-center-malta.com/wp-content/uploads/2018/04/Employment-contract.jpg', Date: '1394/07/27', IsSpecial: true,
    },
    {
      Title: 'پروژه طراحی و احداث خط دوم راه آهن (زیرسازی، روسازی و پل سازی) تهران - پرند (قطعه دوم)', Code: 'TC279', PM: 'مجید سعیدی', PMCode: 'p5', Status: 'pmo',
      Picture: 'https://img-aws.ehowcdn.com/877x500p/photos.demandstudios.com/getty/article/181/18/466050663.jpg', Date: '1397/09/30', IsSpecial: false,
    },
  ];
  contracts: ContractModel[] = [];
  filteredContracts: ContractModel[] = [];
  aggregate: { plan, act, finance } = {plan: 100, act: 70, finance: 58};

  mainContractsTemp: any[] = [];
  mainContractsComp: ContractModel[] = [];
  contractServices: ContractServicesList[];
  maxSpeed = null;
  maxTDeviation = null;
  maxPayDeviation = null;
  maxPDeviation = null;
  maxContractCost = null;
  minSpeed = null;
  minTDeviation = null;
  minPayDeviation = null;
  minPDeviation = null;
  minContractCost = null;
  progressChart;
  progressChartOptions;
  timeDeviationChart;
  timeDeviationChartOptions;
  rialWeightedChart;
  rialWeightedChartOptions;
  speedChart;
  speedChartOptions;
  deliverables: DeliverablesList[] = [];
  operations: OperationTypesList[] = [];
  pms: PMsList[] = [];
  viewType = '';

  constructor(private route: ActivatedRoute,
              private sharedService: SharedService,
              private contractService: ContractService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.sharedService.getPMs().subscribe(
      (data) => {
        this.pms = data;
      }
    );
    this.viewType = this.tableShow;
    this.contractService.getAllContracts().subscribe(
      (contracts) => {
        this.contracts = contracts;
        this.filteredContracts = contracts;
        this.mainContractsComp = contracts;
        this.buildProgressChart();
        this.buildTimeDeviationChart();
        this.buildRialWeightedChart();
        this.buildSpeedChart();
        let speed = 0;
        let tDeviation = 0;
        let pDeviation = 0;
        let payDeviation = 0;
        let contractCost = 0;
        let minSpeed = 0;
        let minTDeviation = 0;
        let minPDeviation = 0;
        let minPayDeviation = 0;
        let minContractCost = 0;
        this.mainContractsComp.filter(v => {
          if (v.FinancialLast.PaymentDeviation > payDeviation) {
            payDeviation = v.FinancialLast.PaymentDeviation;
          }
          if (v.FinancialLast.PaymentDeviation < minPayDeviation) {
            minPayDeviation = v.FinancialLast.PaymentDeviation;
          }
          if (v.Cost > contractCost) {
            contractCost = v.Cost;
          }
          if (v.Cost < minContractCost) {
            minContractCost = v.Cost;
          }
          v.PCCalcsLast.filter((v2) => {
            if (v.PCCalcsLast.length > 2) {
              if (+v2.Service === 7) {
                if (v2.Speed30D > speed) {
                  speed = v2.Speed30D;
                }
                if (v2.Speed30D < minSpeed) {
                  minSpeed = v2.Speed30D;
                }
                if (v2.TimeDeviation > tDeviation) {
                  tDeviation = v2.TimeDeviation;
                }
                if (v2.TimeDeviation < minTDeviation) {
                  minTDeviation = v2.TimeDeviation;
                }
                if (v2.ProgressDeviation > pDeviation) {
                  pDeviation = v2.ProgressDeviation;
                }
                if (v2.ProgressDeviation < minPDeviation) {
                  minPDeviation = v2.ProgressDeviation;
                }
              }
            } else {
              if (v2.Speed30D > speed) {
                speed = v2.Speed30D;
              }
              if (v2.Speed30D < minSpeed) {
                minSpeed = v2.Speed30D;
              }
              if (v2.TimeDeviation > tDeviation) {
                tDeviation = v2.TimeDeviation;
              }
              if (v2.TimeDeviation < minTDeviation) {
                minTDeviation = v2.TimeDeviation;
              }
              if (v2.ProgressDeviation > pDeviation) {
                pDeviation = v2.ProgressDeviation;
              }
              if (v2.ProgressDeviation < minPDeviation) {
                minPDeviation = v2.ProgressDeviation;
              }
            }
          });
        });
        this.maxSpeed = speed;
        this.maxTDeviation = tDeviation;
        this.maxPDeviation = pDeviation;
        this.maxPayDeviation = payDeviation;
        this.maxContractCost = contractCost;
        this.minSpeed = minSpeed;
        this.minTDeviation = minTDeviation;
        this.minPDeviation = minPDeviation;
        this.minPayDeviation = minPayDeviation;
        this.minContractCost = minContractCost;
        this.route.queryParams.subscribe(
          (params: any) => {
            let filteringContracts = this.mainContractsComp;
            // if (params.search) {
            //   this.contracts = this.mainContractsComp.filter(v => {
            //     if (v.Title.includes(params.search) || v.Code.includes(params.search) || v.ShortTitle.includes(params.search) || v.ContractCode.includes(params.search) || v.ContractSubject.includes(params.search) || v.Contractor.includes(params.search)) {
            //       return true;
            //     } else {
            //       return false;
            //     }
            //   });
            // } else if (params.search === '') {
            //   this.contracts = this.mainContractsComp;
            // }
            if (params.fromDate) {
              this.contracts = filteringContracts.filter(v => {
                if (+params.fromDate <= +new Date(v.StartDate)) {
                  return v;
                }
              });
            }
            if (params.toDate) {
              this.contracts = filteringContracts.filter(v => {
                if (+params.toDate >= +new Date(v.StartDate)) {
                  return v;
                }
              });
            }
            if (params.unit) {
              let units = [];
              if (params.unit[0].search(',') !== -1) {
                units = params.unit[0].split(',');
              } else {
                units = [+params.unit[0]];
              }
              const contractss = [];
              for (let i = 0; i < units.length; i++) {
                filteringContracts.filter(v => {
                  if (+v.Unit.Id === +units[i]) {
                    contractss.push(v);
                  }
                });
              }
              filteringContracts = contractss;
            }
            if (params.pm) {
              let pms = [];
              if (params.pm[0].search(',') !== -1) {
                pms = params.pm[0].split(',');
              } else {
                pms = [+params.pm[0]];
              }
              const contractss = [];
              for (let i = 0; i < pms.length; i++) {
                filteringContracts.filter(v => {
                  if (+v.PM.Id === +pms[i]) {
                    contractss.push(v);
                  }
                });
              }
              filteringContracts = contractss;
            }
            if (params.rai) {
              let rais = [];
              if (params.rai[0].search(',') !== -1) {
                rais = params.rai[0].split(',');
              } else {
                rais = [+params.rai[0]];
              }
              const contractss = [];
              for (let i = 0; i < rais.length; i++) {
                filteringContracts.filter(v => {
                  if (+v.RaiPart.Id === +rais[i]) {
                    contractss.push(v);
                  }
                });
              }
              filteringContracts = contractss;
            }
            if (params.importer) {
              let importers = [];
              if (params.importer[0].search(',') !== -1) {
                importers = params.importer[0].split(',');
              } else {
                importers = [+params.importer[0]];
              }
              const contractss = [];
              for (let i = 0; i < importers.length; i++) {
                filteringContracts.filter(v => {
                  if (+v.Importer.Id === +importers[i]) {
                    contractss.push(v);
                  }
                });
              }
              filteringContracts = contractss;
            }
            if (params.zone) {
              let zones = [];
              if (params.zone[0].search(',') !== -1) {
                zones = params.zone[0].split(',');
              } else {
                zones = [+params.zone[0]];
              }
              const contractss = [];
              for (let i = 0; i < zones.length; i++) {
                filteringContracts.filter(v => {
                  if (v.Zone.map(v2 => v2.Id).indexOf(zones[i]) !== -1) {
                    contractss.push(v);
                  }
                });
              }
              filteringContracts = contractss;
            }
            if (params.service) {
              let services = [];
              if (params.service[0].search(',') !== -1) {
                services = params.service[0].split(',');
              } else {
                services = [+params.service[0]];
              }
              const contractss = [];
              for (let i = 0; i < services.length; i++) {
                filteringContracts.filter(v => {
                  if (v.Service.indexOf(+services[i]) !== -1) {
                    contractss.push(v);
                  }
                });
              }
              filteringContracts = contractss;
            }
            if (params.minPA && params.maxPA) {
              const contractss = [];
              filteringContracts.filter(v => {
                let lastPC;
                if (v.PCCalcsLast.length > 1) {
                  lastPC = v.LastPC.filter(v2 => v2.Service === 7)[0];
                } else if (v.PCCalcsLast.length === 1) {
                  lastPC = v.LastPC.filter(v2 => v2.Service === v.PCCalcsLast[0].Service)[0];
                }
                if (lastPC) {
                  if (+lastPC.ActPC.toFixed(2) >= +params.minPA / 100 && +lastPC.ActPC.toFixed(2) <= +params.maxPA / 100) {
                    contractss.push(v);
                  }
                }
              });
              filteringContracts = contractss;
            }
            if (params.minPP && params.maxPP) {
              const contractss = [];
              filteringContracts.filter(v => {
                let lastPC;
                if (v.PCCalcsLast.length > 1) {
                  lastPC = v.LastPC.filter(v2 => v2.Service === 7)[0];
                } else if (v.PCCalcsLast.length === 1) {
                  lastPC = v.LastPC.filter(v2 => v2.Service === v.PCCalcsLast[0].Service)[0];
                }
                if (lastPC) {
                  if (+lastPC.PlanPC.toFixed(2) >= +params.minPP / 100 && +lastPC.PlanPC.toFixed(2) <= +params.maxPP / 100) {
                    contractss.push(v);
                  }
                }
              });
              filteringContracts = contractss;
            }
            if (params.minPF && params.maxPF) {
              const contractss = [];
              filteringContracts.filter(v => {
                let lastPF;
                if (v.FinancialLast.FinancialProgress) {
                  lastPF = v.FinancialLast.FinancialProgress.toFixed(2);
                } else {
                  lastPF = v.FinancialLast.FinancialProgress;
                }
                if (+lastPF >= +params.minPF / 100 && +lastPF <= +params.maxPF / 100) {
                  contractss.push(v);
                }
              });
              filteringContracts = contractss;
            }
            if (params.minSpeed && params.maxSpeed) {
              const contractss = [];
              filteringContracts.filter(v => {
                let lastSpeed;
                if (v.PCCalcsLast.length > 1) {
                  lastSpeed = v.PCCalcsLast.filter(v2 => v2.Service === 7)[0]
                } else if (v.PCCalcsLast.length === 1) {
                  lastSpeed = v.PCCalcsLast.filter(v2 => v2.Service === v.PCCalcsLast[0].Service)[0];
                }
                if (lastSpeed) {
                  if (+lastSpeed.Speed30D.toFixed(2) >= +params.minSpeed && +lastSpeed.Speed30D.toFixed(2) <= +params.maxSpeed) {
                    contractss.push(v);
                  }
                }
              });
              filteringContracts = contractss;
            }
            if (params.minTD && params.maxTD) {
              const contractss = [];
              filteringContracts.filter(v => {
                let lastSpeed;
                if (v.PCCalcsLast.length > 1) {
                  lastSpeed = v.PCCalcsLast.filter(v2 => v2.Service === 7)[0]
                } else if (v.PCCalcsLast.length === 1) {
                  lastSpeed = v.PCCalcsLast.filter(v2 => v2.Service === v.PCCalcsLast[0].Service)[0];
                }
                if (lastSpeed) {
                  if (+lastSpeed.TimeDeviation.toFixed(2) >= +params.minTD && +lastSpeed.TimeDeviation.toFixed(2) <= +params.maxTD) {
                    contractss.push(v);
                  }
                }
              });
              filteringContracts = contractss;
            }
            if (params.minPayD && params.maxPayD) {
              const contractss = [];
              filteringContracts.filter(v => {
                let lastPayD;
                if (v.FinancialLast.PaymentDeviation) {
                  lastPayD = v.FinancialLast.PaymentDeviation.toFixed(2);
                } else {
                  lastPayD = v.FinancialLast.PaymentDeviation;
                }
                if (+lastPayD >= +params.minPayD && +lastPayD <= +params.maxPayD) {
                  contractss.push(v);
                }
              });
              filteringContracts = contractss;
            }
            if (params.minPD && params.maxPD) {
              const contractss = [];
              filteringContracts.filter(v => {
                let lastPD;
                if (v.PCCalcsLast.length > 1) {
                  lastPD = v.PCCalcsLast.filter(v2 => v2.Service === 7)[0]
                } else if (v.PCCalcsLast.length === 1) {
                  lastPD = v.PCCalcsLast.filter(v2 => v2.Service === v.PCCalcsLast[0].Service)[0];
                }
                if (lastPD) {
                  if (+lastPD.ProgressDeviation.toFixed(2) >= +params.minPD && +lastPD.ProgressDeviation.toFixed(2) <= +params.maxPD) {
                    contractss.push(v);
                  }
                }
              });
              filteringContracts = contractss;
            }
            if (params.minCost && params.maxCost) {
              const contractss = [];
              filteringContracts.filter(v => {
                const lastCost = v.Cost;
                if (+lastCost >= +params.minCost && +lastCost <= +params.maxCost) {
                  contractss.push(v);
                }
              });
              filteringContracts = contractss;
            }
            if (params.cType) {
              filteringContracts = filteringContracts.filter(v => v.Kind.toLocaleLowerCase() === params.cType);
            }

            if ((<any>Object).entries(params).length === 0) {
              this.contracts = this.mainContractsComp;
            }
            this.filteredContracts = filteringContracts;
            this.contracts = filteringContracts;
            this.buildProgressChart();
            this.buildRialWeightedChart();
            this.buildTimeDeviationChart();
            this.buildSpeedChart();
          }
        );
      }
    );
    this.sharedService.getContractServices().subscribe(
      (data) => {
        this.contractServices = data;
      }
    );
    this.sharedService.getDeliverables(null, null).subscribe(
      (data) => {
        this.deliverables = data;
      }
    );
    this.sharedService.getOperationTypes().subscribe(
      (data) => {
        this.operations = data;
      }
    );
    this.buildChart();
    // this.sharedService.getCurrentUser().subscribe();
    // this.sharedService.getDataFromContextInfoRPMO().subscribe();
    this.mainContractsTemp = this.contractsTemp;
    // this.mainContractsComp = this.contracts;

  }

  buildSpeedChart() {
    const series = [];
    const units = this.onChangeTable();
    for (let i = 0; i < units.length; i++) {
      series.push([units[i].Title, +this.getContractProgress(units[i].Id, 'sp')]
      );
    }
    this.speedChartOptions = {
      chart: {
        type: 'columnpyramid'
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: units.map(v => v.Title)
      },
      yAxis: {
        min: 0,
        title: {
          text: 'سرعت ماهیانه'
        }
      },
      tooltip: {
        // valueSuffix: ' m'
      },
      series: [{
        name: 'سرعت ماهیانه',
        colorByPoint: true,
        data: series,
        showInLegend: false
      }]
    };
    this.speedChart = new Chart(this.speedChartOptions);
  }

  onChangeType(type) {
    this.viewType = type;
    this.onChangeTableShow(type);
  }

  buildRialWeightedChart() {
    const series = [];
    const units = this.onChangeTable();
    const cost = this.getContractCosts(null, 'all');
    for (let i = 0; i < units.length; i++) {
      series.push({
        name: units[i].Title,
        y: +((+this.getContractCosts(units[i].Id) * 100) / +cost).toFixed(2)
      });
    }
    this.rialWeightedChartOptions = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
      },
      title: {
        text: ''
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            formatter: function () {
              return Math.round(this.percentage * 100) / 100 + ' %';
            },
            distance: -30,
            color: 'white'
          },
          showInLegend: true
        }
      },
      series: [{
        name: 'مبلغ (میلیون ریال)',
        colorByPoint: true,
        data: series
      }]
    };
    this.rialWeightedChart = new Chart(this.rialWeightedChartOptions);
  }

  buildTimeDeviationChart() {
    const series = [];
    const units = this.onChangeTable();
    const firstData = [];
    const secondData = [];
    const thirdData = [];
    for (let i = 0; i < units.length; i++) {
      firstData.push(+this.getContractProgress(units[i].Id, 'dp'));
      secondData.push(+this.getContractProgress(units[i].Id, 'dpay'));
    }
    series.push({
      name: 'انحراف پیشرفت',
      data: firstData,
    });
    series.push({
      name: 'انحراف پرداخت',
      data: secondData,
      color: '#c63941'
    });
    this.timeDeviationChartOptions = {
      chart: {
        type: 'column'
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: units.map(v => v.Title)
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
    this.timeDeviationChart = new Chart(this.timeDeviationChartOptions);
  }

  buildProgressChart() {
    const series = [];
    const units = this.onChangeTable();
    const firstData = [];
    const secondData = [];
    const thirdData = [];
    for (let i = 0; i < units.length; i++) {
      firstData.push(+this.getContractProgress(units[i].Id, 'act'));
      secondData.push(+this.getContractProgress(units[i].Id, 'plan'));
      thirdData.push(+this.getContractProgress(units[i].Id, 'finance'));
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
    this.progressChartOptions = {
      chart: {
        type: 'column'
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: units.map(v => v.Title)
      },
      yAxis: {
        min: 0,
        max: 100,
        title: {
          text: 'درصد'
        }
      },

      // plotOptions: {
      //   series: {
      //     label: {
      //       connectorAllowed: false
      //     },
      //     pointStart: 2010
      //   }
      // },

      series: series,
    };
    this.progressChart = new Chart(this.progressChartOptions);
  }

  onChangeTable() {
    const mainUnits = this.contracts.map(v => v.Unit);
    const units = Array.from(new Set(this.contracts.map(v => v.Unit.Id)));
    const finalUnits = units.map(v => mainUnits.filter(v2 => v === v2.Id)[0]);
    return finalUnits;
  }

  getContractLengths(id: number, type = null) {
    if (type === 'all') {
      return this.filteredContracts.length;
    } else {
      return this.filteredContracts.filter(v => v.Unit.Id === id).length;
    }
  }

  getContractCosts(id: number, type = null) {
    let costs;
    if (this.filteredContracts.length > 0) {
      if (type === 'all') {
        costs = this.filteredContracts.map(v => v.Cost);
      } else {
        costs = this.filteredContracts.filter(v => v.Unit.Id === id).map(v => v.Cost);
      }
      return (+costs.reduce(this.getSum) / 1000000).toFixed();
    } else {
      return null;
    }
  }

  getContractProgress(id: number, type, isTotal = false) {
    let fp = 0;
    let contracts, costs;
    if (isTotal) {
      contracts = this.filteredContracts;
      costs = this.filteredContracts.map(v => v.Cost);
    } else {
      contracts = this.filteredContracts.filter(v => v.Unit.Id === id);
      costs = this.filteredContracts.filter(v => v.Unit.Id === id).map(v => v.Cost);
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
        fp = fp + ((+contracts[i].Cost / +mainCost) * +contracts[i].FinancialLast.FinancialProgress);
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

  onSearch(data: { contracts: any, type: string }) {
    if (data.type === this.compType) {
      this.contracts = data.contracts;
      this.filteredContracts = data.contracts;
    } else {
      this.contractsTemp = data.contracts;
    }
  }

  onChangeTableShow(e) {
    this.tableShow = e;
  }

  toggleView() {
    this.flipped = !this.flipped;
  }

  toggleTableView() {
    this.tableFlipped = !this.tableFlipped;
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

  onShowDeliverablesTable(unit) {
    const dialogRef = this.dialog.open(DeliverablesTableComponent, {
      width: '1000px',
      height: '750px',
      data: {
        unit: unit,
        contracts: this.filteredContracts,
        title: unit.Title,
        deliverables: this.deliverables,
        operations: this.operations
      }
    });
  }

  onShowServicesTable(unit, isTotal = false) {
    let lastRecord;
    if (isTotal) {
      lastRecord = {
        length: this.getContractLengths(null, 'all'),
        costs: this.getContractCosts(null, 'all'),
        plan: this.getContractProgress(null, 'plan', true),
        act: this.getContractProgress(null, 'act', true),
        dp: this.getContractProgress(null, 'dp', true),
        dt: this.getContractProgress(null, 'dt', true),
        sp: this.getContractProgress(null, 'sp', true),
      };
    } else {
      lastRecord = {
        length: this.getContractLengths(unit.Id),
        costs: this.getContractCosts(unit.Id),
        plan: this.getContractProgress(unit.Id, 'plan'),
        act: this.getContractProgress(unit.Id, 'act'),
        dp: this.getContractProgress(unit.Id, 'dp'),
        dt: this.getContractProgress(unit.Id, 'dt'),
        sp: this.getContractProgress(unit.Id, 'sp'),
      };
    }
    const dialogRef = this.dialog.open(ServicesTableComponent, {
      width: '1000px',
      height: '750px',
      data: {
        unit: unit,
        contracts: this.filteredContracts,
        isTotal: isTotal,
        contractServices: this.contractServices,
        lastRecord: lastRecord,
        title: unit.Title
      }
    });
  }

  buildChart() {
    this.chartOptions = {
      chart: {
        polar: true,
        type: 'line',
        height: 240
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
        data: [+this.aggregate.finance, +this.aggregate.act, +this.aggregate.plan],
        pointPlacement: 'off',
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

  getSum(total, num) {
    return total + num;
  }
}
