import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {SharedService} from '../../../shared/services/shared.service';
import {ContractService} from '../../../shared/services/contract.service';
import {ContractModel} from '../../../shared/models/contractModels/contract.model';
import {UserNameList} from '../../../shared/models/userName.model';
import {ContractAssignedCostResModel} from '../../../shared/models/contractModels/contractAssignedCostRes.model';
import {ContractCashFlowPlanModel} from '../../../shared/models/contractModels/contractCashFlowPlan.model';
import {ContractStakeHolderModel} from '../../../shared/models/contractModels/contractStakeHolder.model';
import {ContractPCModel} from '../../../shared/models/contractModels/contractPC.model';
import * as Highcharts from 'highcharts';
import {Chart} from 'angular-highcharts';
import {MatDialog, MatTableDataSource} from '@angular/material';
import {ContractServicesList} from '../../../shared/models/contractServices.model';
import {OperationTypesList} from '../../../shared/models/operationTypes.model';
import {DeliverablesList} from '../../../shared/models/Deliverables.model';
import {ZonesList} from '../../../shared/models/zones.model';
import * as moment from 'jalali-moment';

@Component({
  selector: 'app-contract-page',
  styleUrls: ['./contract-page.component.scss'],
  templateUrl: './contract-page.component.html',
})
export class ContractPageComponent implements OnInit {
  contractID: number;
  contract: ContractModel;
  lastPC: {
    Service: number,
    Date: string,
    ActPC: number,
    PlanPC: number
  };
  financial: number;
  costReses: ContractAssignedCostResModel[] = [];
  cashFlowPlans: ContractCashFlowPlanModel[] = [];
  stakeHolders: ContractStakeHolderModel[] = [];
  contractPCs: ContractPCModel[] = [];
  contractPCsPlan: ContractPCModel[] = [];
  selectedVersion: { ID: number, cashFlowPlanCode: number } = {
    ID: 1,
    cashFlowPlanCode: null,
  };
  ddate = [];
  actChart;
  planChart;
  // financialChart;
  chartOptions;
  mainChart;
  mainChartOptions;
  mainDeliverableCharts: { DelLabel, OpLabel, Data }[] = [];
  deliverableChartOptions;
  speedCharts = [];
  speedChartsOptions = [];
  finishTimeForecastCharts: { Label, Data }[] = [];
  finishTimeForecastChartsOptions = [];
  polarChart;
  polarChartOptions;
  financialChart;
  financialChartOptions;
  versions = [1];
  displayedColumns: string[] = ['Id', 'DDate', 'CostResourse', 'Cost'];
  dataSource;
  // pcs = [];
  // delProps: { ID, DelItem: { ID, Title }, Kind }[] = [];
  flappedIndex = 0;
  termoChart = [];
  selectedService = 7;
  contractServices: { ID, Title }[] = [];
  services: ContractServicesList[] = [];
  pcs: ContractPCModel[] = [];
  pcRelations: { ID, ActPCProp, PlanPCProps, PlanDDate, Service }[] = [];
  delProps: { ID, DelItem: { ID, Title }, Kind, DelPropsRev }[] = [];
  dels: { ID, Date, Value, DelPropsRev, Zone }[] = [];
  operationTypes: OperationTypesList[] = [];
  deliverables: DeliverablesList[] = [];
  mainChartIndex = 0;
  delItems: { ID, Deliverable: { ID, Title }, OperationType: { ID, Title } }[] = [];
  isSpinnerShow = false;
  financialRequests: { ID, GrossAmount, FinancialRequestType, Date }[] = [];
  financialPayments: { ID, GrossAmount, FinancialRequestType, Date }[] = [];
  financialDrawCounter = 0;
  zones: ZonesList[] = [];
  mainChartsHeight = 300;
  speedFlapped = false;

  constructor(private route: ActivatedRoute,
              private sharedService: SharedService,
              private contractService: ContractService) {
  }

  ngOnInit() {
    this.sharedService.getZones().subscribe(
      (zones) => {
        this.zones = zones;
      }
    );
    this.sharedService.getOperationTypes().subscribe(
      (operationTypes) => {
        this.operationTypes = operationTypes;
      }
    );
    this.sharedService.getDeliverables(null, null).subscribe(
      (deliverables) => {
        this.deliverables = deliverables;
      }
    );
    this.sharedService.getContractServices().subscribe(
      (services) => {
        this.services = services;
        this.getContractInfo();
      });
    this.selectedVersion.cashFlowPlanCode = 1;
    this.route.queryParams.subscribe(
      (params: Params) => {
        this.contractID = params.ID;
        this.contractService.getAllDelPropsRevs(this.contractID).subscribe(
          (delPropsRevs) => {
            this.contractService.getContractDelProps(this.contractID).subscribe(
              (delProps: { ID, DelItem: { ID, Title }, Kind, DelPropsRev }[]) => {
                delProps.map(v => {
                  v.DelPropsRev = delPropsRevs.filter(v2 => v2.DelProp === v.ID)[0].ID;
                });
                this.delProps = delProps;
                this.contractService.getContractDel(this.contractID).subscribe(
                  (dels) => {
                    this.dels = dels;
                    this.contractService.getAllDelItems(this.contractID).subscribe(
                      (delItems) => {
                        this.delItems = delItems;
                        for (let i = 0; i < delItems.length; i++) {
                          this.mainDeliverableCharts[i] = {
                            DelLabel: delItems[i].Deliverable.ID,
                            OpLabel: delItems[i].OperationType.ID,
                            Data: []
                          };
                          this.buildDeliverableChart(i, delItems[i].ID);
                        }
                      }
                    );
                  }
                );
              }
            );
          }
        );
        this.contractService.getPCProps(this.contractID).subscribe(
          (mainPCProps) => {
            this.contractService.getAllPCRelations(this.contractID).subscribe(
              (pcRelations: { ID, ActPCProp, PlanPCProps, PlanDDate, Service }[]) => {
                pcRelations.map(v => {
                  v.Service = mainPCProps.filter(v2 => v2.ID === v.ActPCProp)[0].Service;
                });
                this.pcRelations = pcRelations;
                const pcProps = [];
                pcRelations.filter(v => {
                  pcProps.push(v.ActPCProp);
                  pcProps.push(v.PlanPCProps);
                });
                this.contractService.getDashboardContractPCs(this.contractID, pcProps).subscribe(
                  (pcs) => {
                    this.pcs = pcs;
                    this.buildMainChart();
                  }
                );
              }
            );
          }
        );

        this.contractService.getAllFinancialGrossAmountsASC(this.contractID, 'FinancialRequests').subscribe(
          (financialRequests) => {
            this.financialRequests = financialRequests;
            this.buildFinancialChart();
          }
        );
        this.contractService.getAllFinancialGrossAmountsASC(this.contractID, 'FinancialPayments').subscribe(
          (financialPayments) => {
            this.financialPayments = financialPayments;
            this.buildFinancialChart();
          }
        );


        // this.getAssignedReses();
        // this.getCashFlowPlan();
        // this.getStakeHolders();
        // this.getDeliverables();
        // this.getPCs();
      }
    );
  }

  buildFinancialChart() {
    this.financialDrawCounter++;
    if (this.financialDrawCounter === 2) {
      if (this.financialPayments.length !== 0 || this.financialRequests.length !== 0) {
        this.financialChartOptions = {
          chart: {
            type: 'line',
            zoomType: 'x',
            height: this.mainChartsHeight
          },

          title: {text: ''},

          legend: {
            align: 'right',
            verticalAlign: 'top',
            layout: 'vertical',
            x: 0,
            y: 130,
          },

          xAxis: {
            type: 'datetime',
            labels: {
              formatter: function () {
                const monthStr = Highcharts.dateFormat('%Y/%m/%e', this.value);
                return monthStr;
              }
            },
          },

          yAxis: {
            min: 0,
            maxPadding: 0.1,
            title: {
              text: 'میلیون ریال'
            },
            labels: {
              format: '{value:,.0f}',
              // formatter: function () {
              //   return this.value / 1000000;
              // }
            }
          },

          tooltip: {
            padding: 4,
            useHTML: true,
            formatter: function () {
              return '<p class="highchart-Tooltip">' + this.series.name + '</p>' +
                '<p class="highchart-Tooltip">' + ' تاریخ : ' + new Date(this.point.category).getFullYear() + '/' + (+new Date(this.point.category).getMonth() + 1) + '/' + new Date(this.point.category).getDate() + '</p>' +
                '<p style="direction: ltr;" class="highchart-Tooltip">' + 'مقدار : ' + Highcharts.numberFormat(Math.abs(this.point.y), 0) + '</p>';
            }
          },

          plotOptions: {
            line: {
              marker: {
                enabled: false
              }
            },
            series: {
              connectNulls: true,
              animation: {
                duration: 1000,
                easing: 'easeOutBounce'
              }
            }
          },

          series: []
        };

        this.financialChart = new Chart(this.financialChartOptions);

        let lastDate = '';
        if (this.financialPayments.length > 0) {
          lastDate = this.financialPayments[this.financialPayments.length - 1].Date;
        }
        if (this.financialRequests.length > 0) {
          if (+new Date(this.financialRequests[this.financialRequests.length - 1].Date) > +new Date(lastDate)) {
            lastDate = this.financialRequests[this.financialRequests.length - 1].Date;
          }
        }


        //////// Start Requests


        let mainSumRequests = 0;
        const financialRequests = this.financialRequests.slice();
        if (this.financialRequests.length > 0) {
          financialRequests.unshift({
            ID: 0,
            GrossAmount: 0,
            Date: financialRequests[0].Date,
            FinancialRequestType: financialRequests[0].FinancialRequestType,
          });
          const mainRequests = financialRequests.map(v => {
            mainSumRequests = +(+mainSumRequests + +(v.GrossAmount)).toFixed();
            return {
              x: new Date(v.Date),
              y: +mainSumRequests
            };
          });

          if (+new Date(lastDate) !== +mainRequests[mainRequests.length - 1].x) {
            mainRequests.push({
              x: new Date(lastDate),
              y: mainRequests[mainRequests.length - 1].y,
            });
          }

          this.financialChart.addSeries({
            step: true,
            name: 'مطالبات',
            data: mainRequests,
            color: 'blue',
            shadow: {
              width: 3,
              color: 'blue'
            },
            lineWidth: 3
          }, true);
// #22BFF2
        }


        //////// Start Prepaid

        let mainSumRequestPrepaid = 0;
        const financialRequestPrepaids = this.financialRequests.filter(v => v.FinancialRequestType === 6);
        if (financialRequestPrepaids.length > 0) {
          financialRequestPrepaids.unshift({
            ID: 0,
            GrossAmount: 0,
            Date: financialRequests[0].Date,
            FinancialRequestType: financialRequests[0].FinancialRequestType,
          });
          const mainRequestsPrepaid = financialRequestPrepaids.map(v => {
            mainSumRequestPrepaid = +(+mainSumRequestPrepaid + +(v.GrossAmount)).toFixed();
            return {
              x: new Date(v.Date),
              y: +mainSumRequestPrepaid
            };
          });

          if (+new Date(lastDate) !== +mainRequestsPrepaid[mainRequestsPrepaid.length - 1].x) {
            mainRequestsPrepaid.push({
              x: new Date(lastDate),
              y: mainRequestsPrepaid[mainRequestsPrepaid.length - 1].y,
            });
          }

          this.financialChart.addSeries({
            step: true,
            name: 'پیش پرداخت',
            data: mainRequestsPrepaid,
            color: 'green',
            shadow: {
              width: 5,
              color: 'green'
            },
            lineWidth: 3
          }, true);
        }


        //////// Start Invoice

        let mainSumRequestInvoice = 0;
        const financialRequestInvoices = this.financialRequests.filter(v => v.FinancialRequestType === 1);
        if (financialRequestInvoices.length > 0) {
          financialRequestInvoices.unshift({
            ID: 0,
            GrossAmount: 0,
            Date: financialRequestInvoices[0].Date,
            FinancialRequestType: financialRequestInvoices[0].FinancialRequestType,
          });
          const mainRequestsInvoice = financialRequestInvoices.map(v => {
            mainSumRequestInvoice = +(+mainSumRequestInvoice + +(v.GrossAmount)).toFixed();
            return {
              x: new Date(v.Date),
              y: +mainSumRequestInvoice
            };
          });

          if (+new Date(lastDate) !== +mainRequestsInvoice[mainRequestsInvoice.length - 1].x) {
            mainRequestsInvoice.push({
              x: new Date(lastDate),
              y: mainRequestsInvoice[mainRequestsInvoice.length - 1].y,
            });
          }

          this.financialChart.addSeries({
            step: true,
            name: 'صورت وضعیت',
            data: mainRequestsInvoice,
            color: 'gray',
            shadow: {
              width: 1,
              color: 'gray'
            },
            lineWidth: 3
          }, true);
        }

        //////// Start Adjustment

        let mainSumRequestAdjustment = 0;
        const financialRequestAdjustments = this.financialRequests.filter(v => v.FinancialRequestType === 2);
        if (financialRequestAdjustments.length > 0) {
          financialRequestAdjustments.unshift({
            ID: 0,
            GrossAmount: 0,
            Date: financialRequestAdjustments[0].Date,
            FinancialRequestType: financialRequestAdjustments[0].FinancialRequestType,
          });
          const mainRequestsAdjustment = financialRequestAdjustments.map(v => {
            mainSumRequestAdjustment = +(+mainSumRequestAdjustment + +(v.GrossAmount)).toFixed();
            return {
              x: new Date(v.Date),
              y: +mainSumRequestAdjustment
            };
          });

          if (+new Date(lastDate) !== +mainRequestsAdjustment[mainRequestsAdjustment.length - 1].x) {
            mainRequestsAdjustment.push({
              x: new Date(lastDate),
              y: mainRequestsAdjustment[mainRequestsAdjustment.length - 1].y,
            });
          }

          this.financialChart.addSeries({
            step: true,
            name: 'وضعیت تعدیل',
            data: mainRequestsAdjustment,
            color: 'orange',
            shadow: {
              width: 2,
              color: 'orange'
            },
            lineWidth: 3
          }, true);
        }

        //////// Start MaterialPrepaid

        let mainSumRequestMaterialPrepaid = 0;
        const financialRequestMaterialPrepaids = this.financialRequests.filter(v => v.FinancialRequestType === 7);
        if (financialRequestMaterialPrepaids.length > 0) {
          financialRequestMaterialPrepaids.unshift({
            ID: 0,
            GrossAmount: 0,
            Date: financialRequestMaterialPrepaids[0].Date,
            FinancialRequestType: financialRequestMaterialPrepaids[0].FinancialRequestType,
          });
          const mainRequestsMaterialPrepaid = financialRequestMaterialPrepaids.map(v => {
            mainSumRequestMaterialPrepaid = +(+mainSumRequestMaterialPrepaid + +(v.GrossAmount)).toFixed();
            return {
              x: new Date(v.Date),
              y: +mainSumRequestMaterialPrepaid
            };
          });

          if (+new Date(lastDate) !== +mainRequestsMaterialPrepaid[mainRequestsMaterialPrepaid.length - 1].x) {
            mainRequestsMaterialPrepaid.push({
              x: new Date(lastDate),
              y: mainRequestsMaterialPrepaid[mainRequestsMaterialPrepaid.length - 1].y,
            });
          }

          this.financialChart.addSeries({
            step: true,
            name: 'صورت وضعیت تعدیل',
            data: mainRequestsMaterialPrepaid,
            color: 'purple',
            shadow: {
              width: 2,
              color: 'purple'
            },
            lineWidth: 3
          }, true);
        }


        //////// Start Payments

        let mainSumPayments = 0;
        const financialPayments = this.financialPayments.slice();
        if (this.financialPayments.length > 0) {
          financialPayments.unshift({
            ID: 0,
            GrossAmount: 0,
            Date: financialPayments[0].Date,
            FinancialRequestType: financialPayments[0].FinancialRequestType,
          });
          const mainPayments = financialPayments.map(v => {
            mainSumPayments = +(+mainSumPayments + +(v.GrossAmount)).toFixed();
            return {
              x: new Date(v.Date),
              y: +mainSumPayments
            };
          });

          if (+new Date(lastDate) !== +mainPayments[mainPayments.length - 1].x) {
            mainPayments.push({
              x: new Date(lastDate),
              y: mainPayments[mainPayments.length - 1].y,
            });
          }

          this.financialChart.addSeries({
            step: true,
            name: 'پرداختی',
            data: mainPayments,
            color: 'red',
            shadow: {
              width: 2,
              color: 'red'
            },
            lineWidth: 3
          }, true);
        }
        this.isSpinnerShow = false;
        this.financialDrawCounter = 0;
      }
    }
  }

  onFlapping(id: number) {
    this.flappedIndex = id;
    this.buildMainChart();
    if (!this.mainChart) {
      this.buildMainChart();
    }
  }

  onChangeSpeedFlapped() {
    this.speedFlapped = !this.speedFlapped;
  }

  getDeliverables() {
    // this.contractService.getContractDelProps(this.contractID).subscribe(
    //   (data: { ID, DelItem: { ID, Title }, Kind }[]) => {
    //     this.contractService.getContractDel(this.contractID).subscribe(
    //       (contractDel) => {
    //       }
    //     );
    //     this.delProps = data;
    //     this.delItems = Array.from(new Set(data.map(v => v.DelItem.ID)));
    //     // this.stakeHolders = data;
    //   }
    // );
  }

  changeMainChartIndexNext() {
    this.isSpinnerShow = true;
    this.mainChartIndex++;
    if (this.mainChartIndex > 2) {
      this.mainChartIndex = 0;
    }
    if (this.mainChartIndex === 0) {
      if (this.pcs.length === 0) {
        this.isSpinnerShow = false;
      }
      this.buildMainChart();
    }
    if (this.mainChartIndex === 1) {
      if (this.delItems.length === 0) {
        this.isSpinnerShow = false;
      }
      for (let i = 0; i < this.delItems.length; i++) {
        this.mainDeliverableCharts[i] = {
          DelLabel: this.delItems[i].Deliverable.ID,
          OpLabel: this.delItems[i].OperationType.ID,
          Data: []
        };
        this.buildDeliverableChart(i, this.delItems[i].ID);
      }
    }
    if (this.mainChartIndex === 2) {
      if (this.financialPayments.length === 0 && this.financialRequests.length === 0) {
        this.isSpinnerShow = false;
      }
      this.financialDrawCounter = 1;
      this.buildFinancialChart();
    }
  }

  changeMainChartIndexPrevious() {
    this.isSpinnerShow = true;
    this.mainChartIndex--;
    if (this.mainChartIndex < 0) {
      this.mainChartIndex = this.mainChartIndex = 2;
    }
    if (this.mainChartIndex === 0) {
      if (this.pcs.length === 0) {
        this.isSpinnerShow = false;
      }
      this.buildMainChart();
    }
    if (this.mainChartIndex === 1) {
      if (this.delItems.length === 0) {
        this.isSpinnerShow = false;
      }
      for (let i = 0; i < this.delItems.length; i++) {
        this.mainDeliverableCharts[i] = {
          DelLabel: this.delItems[i].Deliverable.ID,
          OpLabel: this.delItems[i].OperationType.ID,
          Data: []
        };
        this.buildDeliverableChart(i, this.delItems[i].ID);
      }
    }
    if (this.mainChartIndex === 2) {
      if (this.financialPayments.length === 0 && this.financialRequests.length === 0) {
        this.isSpinnerShow = false;
      }
      this.financialDrawCounter = 1;
      this.buildFinancialChart();
    }
  }

  getTotalDel(delLabel, opLabel) {
    const lastDel = this.contract.DelLast.filter(v => v.Del === delLabel && v.Op === opLabel)[0];
    return lastDel.TotalVal + ' / ' + lastDel.ActSum + '  ' + this.deliverables.filter(v => v.Id === delLabel)[0].MeasureUnit;
  }

  getDeliverableName(id: number) {
    const deliverable = this.deliverables.filter(v => +v.Id === +id)[0];
    if (deliverable) {
      return deliverable.Name;
    }
  }

  getOperationTypeName(id: number) {
    const operationType = this.operationTypes.filter(v => +v.Id === +id)[0];
    if (operationType) {
      return operationType.Name;
    }
  }

  getDelItemName(id: number) {
    return this.delProps.filter(v => +v.ID === +id)[0].DelItem.Title;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue;
  }

  getPC(date: string, type: string) {
    let pc: any;
    if (type === 'A') {
      pc = this.contractPCs.filter(v => v.Date === date);
      if (pc.length !== 0) {
        pc = pc[0].PC;
      } else {
        pc = null;
      }
    } else {
      pc = this.contractPCsPlan.filter(v => v.Date === date);
      if (pc.length !== 0) {
        pc = pc[0].PC;
      } else {
        pc = null;
      }
    }
    return pc;
  }

  calculate(deviationValue) {
    let chosenColor;
    if (deviationValue >= 0 && deviationValue < 10) {
      chosenColor = '#005ff2';
    } else if (deviationValue >= 10 && deviationValue < 50) {
      chosenColor = '#ff7b26';
    } else if (deviationValue >= 50 && deviationValue < 80) {
      chosenColor = '#ee1b00';
    } else if (deviationValue >= 80) {
      chosenColor = '#ff0010';
    } else {
      chosenColor = '#005ff2';
    }
    return {deviationValue: deviationValue, chosenColor: chosenColor};
  }

  onSelect(e) {
    this.selectedService = e.value;
    if (this.pcs.length > 0) {
      this.buildMainChart();
    }

    console.log(this.contract.FinancialLast);
    console.log(this.contract.PCCalcsLast);

    const pcCalc = this.contract.PCCalcsLast.filter(v => v.Service === +this.selectedService)[0];
    this.buildTermoChart(2, this.contract.FinancialLast.PaymentDeviation);
    console.log(pcCalc);
    if (pcCalc) {
      this.buildSpeedCharts(0, pcCalc.Speed30D);
      this.buildSpeedCharts(1, pcCalc.Speed90D);
      this.buildSpeedCharts(2, pcCalc.Speed4Ontime);
      this.buildTermoChart(0, pcCalc.ProgressDeviation);
      this.buildTermoChart(1, pcCalc.TimeDeviation);
      if (pcCalc.FinishTimeForecast) {
        this.buildFinishTimeForecast(0, '30Days', moment(pcCalc.FinishTimeForecast).format('jYYYY/jMM/jDD'), pcCalc.Speed30D);
      }
      if (pcCalc.FinishTimeForecast90) {
        this.buildFinishTimeForecast(1, '30Days', moment(pcCalc.FinishTimeForecast90).format('jYYYY/jMM/jDD'), pcCalc.Speed90D);
      }
      if (pcCalc.Speed4Ontime) {
        this.buildFinishTimeForecast(2, '30Days', this.contract.FinishDate, pcCalc.Speed4Ontime);
      }
    } else {
      this.mainChartIndex = 2;
      this.buildTermoChart(0, null);
      this.buildTermoChart(1, null);
    }
    let financialProgress = 0;
    if (this.contract.FinancialLast) {
      financialProgress = +this.contract.FinancialLast.FinancialProgress * 100;
    }
    if (this.contract.PCCalcsLast.length !== 0) {
      if (this.contract.LastPC) {
        this.buildPolarChart([financialProgress, +this.contract.LastPC.filter(v => v.Service === +this.selectedService)[0].ActPC * 100, +this.contract.LastPC.filter(v => v.Service === +this.selectedService)[0].PlanPC * 100]);
      }
    } else {
      this.buildPolarChart([financialProgress, null, null]);
    }
  }

  buildTermoChart(i, deviationValue) {
    let data: { deviationValue: number, chosenColor: string };
    if (deviationValue) {
      data = this.calculate(deviationValue * 100);
    } else {
      data = this.calculate(null);
    }
    // if (data.deviationValue < 0) {
    //   data.deviationValue = +(data.deviationValue * -1).toFixed();
    // }
    let value = deviationValue;
    if (deviationValue) {
      value = +data.deviationValue.toFixed(1);
    }
    const chosenColor = '#fb5d47';
    this.termoChart[i] = {
      'chart': {
        'caption': '',
        'subcaption': '',
        'subcaptionFontBold': '0',
        'lowerLimit': '0',
        'upperLimit': '100',
        'numberSuffix': '%',
        'bgColor': '#ffffff',
        'showTickMarks': '0',
        'showTickValues': '0',
        'showBorder': '0',
        'plotGradientColor': '',
        'thmFillColor': data.chosenColor
      },
      'value': value
    };
  }

  buildFinishTimeForecast(i: number, type: string, date: any, speed) {
    let color;
    speed = speed * 100;
    if (speed >= 0 && speed <= 30) {
      color = 'rgb(192, 0, 0)';
    }
    if (speed > 30 && speed <= 60) {
      color = 'rgb(255, 69, 0)';
    }

    if (speed > 60 && speed <= 90) {
      color = 'rgb(229, 229, 84)';
    }

    if (speed > 90) {
      color = 'rgb(51, 204, 51)';
    }

    this.finishTimeForecastCharts[i] = {
      Data: null,
      Label: date
    };
    let percent;
    let text = '';
    percent = 100;
    text = '';
    this.finishTimeForecastChartsOptions[i] = {
      chart: {
        renderTo: 'container',
        type: 'pie',
        height: 140
      },
      title: {
        text: ''
      },
      plotOptions: {
        pie: {
          colors: [color],
          shadow: false
        }
      },
      series: [{
        name: text,
        data: [
          ['پیشرفت | درصد', percent],
          {
            'name': 'Incomplete',
            'y': 100 - percent,
            'color': 'rgba(0,0,0,0)'
          }
        ],
        size: '120%',
        innerSize: '90%',
        showInLegend: false,
        dataLabels: {
          enabled: false
        }
      }]
    };
    this.finishTimeForecastCharts[i].Data = new Chart(this.finishTimeForecastChartsOptions[i]);
  }

  buildSpeedCharts(i: number, speed: number) {
    speed = +(speed * 100).toFixed();
    let height = 165;
    let step = 2;
    if (i === 2) {
      height = 140;
      step = 3;
    }
    this.speedChartsOptions[i] = {
      chart: {
        type: 'gauge',
        height: height,
        animation: true,
      },

      title: {
        text: ''
      },
      plotOptions: {
        gauge: {
          wrap: false
        }
      },

      pane: {
        startAngle: -150,
        endAngle: 150,
        background: [{
          className: 'outer-pane',
          outerRadius: '115%'
        }, {
          className: 'middle-pane',
          outerRadius: '112%'
        }, {
          // default background
        }, {
          className: 'inner-pane',
          outerRadius: '105%',
          innerRadius: '103%'
        }]
      },

      // the value axis
      yAxis: {
        min: 0,
        max: 210,

        minorTickInterval: 'auto',
        minorTickLength: 10,
        minorTickPosition: 'inside',

        tickPixelInterval: 30,
        tickPosition: 'inside',
        tickLength: 10,
        tickWidth: 1,
        tickColor: '#000',
        labels: {
          step: step,
          style: {
            fontSize: '12px'
          }
        },
        title: {
          text: ''
        },
        plotBands: [{
          from: 0,
          to: 30,
          className: 'green-band'
        }, {
          from: 30,
          to: 60,
          className: 'yellow-band'
        }, {
          from: 60,
          to: 90,
          className: 'red-band'
        }, {
          from: 90,
          to: 210,
          className: 'sabz-band'
        }]
      },
      tooltip: {
        enabled: false
      },
      series: [{
        name: 'Speed',
        data: [speed],
      }]
    };
    this.speedCharts[i] = new Chart(this.speedChartsOptions[i]);
  }

  buildPolarChart(data) {
    this.polarChartOptions = {
      chart: {
        polar: true,
        type: 'line',
        height: 320,
        animation: true,
      },

      title: {
        text: '',
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
    this.polarChart = new Chart(this.polarChartOptions);
  }

  buildMainChart() {
    // console.log(+new Date('1398/02/31'));
    // console.log(+new Date('1398/03/03'));
    const acts: ContractPCModel[] = this.pcs.filter(v => +v.PCProp === this.pcRelations.filter(v2 => v2.Service === +this.selectedService)[0].ActPCProp);
    const relatedPlansByService = this.pcRelations.filter(v2 => v2.Service === +this.selectedService);
    this.mainChartOptions = {
      chart: {
        type: 'spline',
        zoomType: 'x',
        animation: true,
        height: this.mainChartsHeight
      },

      title: {
        text: ''
      },

      subtitle: {
        text: ''
      },

      legend: {
        align: 'right',
        verticalAlign: 'top',
        layout: 'vertical',
        x: 0,
        y: 130,
      },

      yAxis: {
        max: 100,
        min: 0,
        title: {
          text: 'درصد پیشرفت'
        },
        labels: {
          formatter: function () {
            return this.value + '%';
          }
        }
      },

      xAxis: {
        type: 'datetime',
        labels: {
          formatter: function () {
            const monthStr = Highcharts.dateFormat('%Y/%m/%e', this.value);
            return monthStr;
          }
        },
      },

      tooltip: {
        padding: 4,
        useHTML: true,
        formatter: function () {
          return '<p class="highchart-Tooltip">' + this.series.name + '</p>' +
            '<p class="highchart-Tooltip">' + ' تاریخ : ' + new Date(this.point.category).getFullYear() + '/' + (+new Date(this.point.category).getMonth() + 1) + '/' + new Date(this.point.category).getDate() + '</p>' +
            '<p style="direction: ltr;" class="highchart-Tooltip">' + 'مقدار : ' + Highcharts.numberFormat(Math.abs(this.point.y), 0) + '</p>';
        }
      },

      plotOptions: {
        series: {
          connectNulls: true
        }
      },

      series: [],
    };

    this.mainChart = new Chart(this.mainChartOptions);
    const mainActs = acts.map(v => {
      return {
        x: +new Date(v.Date),
        y: +(v.PC * 100).toFixed()
      };
    });
    this.mainChart.addSeries({
      name: 'واقعی',
      data: mainActs,
      color: '#f25a53'
    }, true);
    for (let i = 0; i < relatedPlansByService.length; i++) {
      const plans = this.pcs.filter(v => +v.PCProp === relatedPlansByService[i].PlanPCProps);
      const mainPlans = plans.map(v => ({
        x: new Date(v.Date),
        y: +(v.PC * 100).toFixed()
      }));
      let color = null;
      if (i === 0) {
        color = '#7CB5EC';
      }
      if (i === relatedPlansByService.length - 1) {
        color = '#60b779';
      }
      if (color) {
        this.mainChart.addSeries({
          name: 'برنامه ی ' + this.getPersianCounter(i + 1),
          data: mainPlans,
          color: color
        }, true);
      } else {
        this.mainChart.addSeries({
          name: 'برنامه ی ' + this.getPersianCounter(i + 1),
          data: mainPlans,
        }, true);
      }
    }
    this.isSpinnerShow = false;
  }

  buildDeliverableChart(counter, delItem) {
    this.deliverableChartOptions = {
      chart: {
        type: 'column',
        height: this.mainChartsHeight,
        zoomType: 'x',
        animation: true,
      },
      title: {
        text: ''
      },
      dateFormat: 'YYYY/mm/dd',
      subtitle: {
        text: ''
      },
      legend: {
        align: 'right',
        verticalAlign: 'top',
        layout: 'vertical',
        x: 0,
        y: 130,
        // width: 600,
        // itemWidth: 300,
        // itemStyle: {
        //   width: 280
        // },
        // rtl: true,
      },
      xAxis: [{
        title: {
          text: ''
        },
        type: 'datetime',
        labels: {
          formatter: function () {
            const monthStr = Highcharts.dateFormat('%Y/%m/%e', this.value);
            return monthStr;
          }
        },
        reversed: false,
      }, {
        opposite: true,
        scrollbar: {
          enabled: false
        },
        type: 'datetime',
        reversed: false,
        linkedTo: 0,
        labels: {
          formatter: function () {
            const monthStr = Highcharts.dateFormat('%Y/%m/%e', this.value);
            return monthStr;
          }
        },
      }],
      yAxis: {
        // minRange: 150,
        plotLines: [{
          color: '#4b3a69',
          width: 3,
          value: 0
        }],
        title: {
          text: 'Del'
        },
        scrollbar: {
          enabled: false
        },
        labels: {
          formatter: function () {
            return Math.abs(this.value);
          }
        }
      },

      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            formatter: function () {
              return Math.abs(this.y);
            },
            enabled: true,
          }
        }
      },
      tooltip: {
        padding: 4,
        useHTML: true,
        formatter: function () {
          return '<p class="highchart-Tooltip">' + this.series.name + '</p>' +
            '<p class="highchart-Tooltip">' + ' تاریخ : ' + new Date(this.point.category).getFullYear() + '/' + (+new Date(this.point.category).getMonth() + 1) + '/' + new Date(this.point.category).getDate() + '</p>' +
            '<p class="highchart-Tooltip">' + 'مقدار : ' + Highcharts.numberFormat(Math.abs(this.point.y), 0) + '</p>';
        }
      },
      series: [],
    };
    let zoneName = '';
    this.mainDeliverableCharts[counter].Data = new Chart(this.deliverableChartOptions);
    const delProps = this.delProps.filter(v => v.DelItem.ID === delItem);
    for (let i = 0; i < delProps.length; i++) {
      const dels = this.dels.filter(v => v.DelPropsRev === delProps[i].DelPropsRev);
      const zones = Array.from(new Set(dels.map(v => v.Zone[0])));
      // let actSum = 0;
      // let planSum = 0;
      for (let j = 0; j < zones.length; j++) {
        let mainActs;
        if (delProps[i].Kind === 'A') {
          zoneName = 'واقعی ';
          mainActs = dels.filter(v => v.Zone[0] === zones[j]).map(v => {
            // actSum = +actSum + +v.Value;
            return {
              x: new Date(v.Date),
              y: +v.Value
            };
          });
        } else {
          zoneName = 'برنامه ای ';
          mainActs = dels.filter(v => v.Zone[0] === zones[j]).map(v => {
            // planSum = (planSum + +v.Value);
            return {
              x: new Date(v.Date),
              y: v.Value * -1
            };
          });
        }
        let lineName;
        if (this.zones && zones[j]) {
          lineName = zoneName + ' | ' + this.zones.filter(v => +v.Id === +zones[j])[0].Name;
        } else if (!this.zones && zones[j]) {
          lineName = zoneName + ' | ' + zones[j];
        } else {
          lineName = zoneName;
        }

        this.mainDeliverableCharts[counter].Data.addSeries({
          name: lineName,
          data: mainActs,
        }, true);
      }
    }

    // for (let i = 0; i < relatedPlansByService.length; i++) {
    //   const plans = this.pcs.filter(v => +v.PCProp === relatedPlansByService[i].PlanPCProps);
    //   const mainPlans = plans.map(v => ({
    //     x: new Date(v.Date),
    //     y: +(v.PC * 100).toFixed()
    //   }));
    //   this.mainChart.addSeries({
    //     name: 'برنامه ی ' + this.getPersianCounter(i + 1),
    //     data: mainPlans,
    //     dashStyle: 'shortdash',
    //   }, true);
    // }
    if (this.delItems.length - 1 === counter) {
      this.isSpinnerShow = false;
    }
  }

  getPersianCounter(i) {
    switch (i) {
      case 1: {
        return 'اول';
      }
      case 2: {
        return 'دوم';
      }
      case 3: {
        return 'سوم';
      }
      case 4: {
        return 'چهارم';
      }
      case 5: {
        return 'پنجم';
      }
      case 6: {
        return 'ششم';
      }
      case 7: {
        return 'هفتم';
      }
      case 8: {
        return 'هشتم';
      }
      case 9: {
        return 'نهم';
      }
      case 10: {
        return 'دهم';
      }
    }
  }

  // getPCs() {
  //   // this.contractService.getPCRelations().subscribe();
  //   const pcPropId = [1, 2, 3];
  //   for (let i = 0; i < pcPropId.length; i++) {
  //     this.contractService.getContractPCs(this.contractID, pcPropId[i]).subscribe(
  //       (data: ContractPCModel[]) => {
  //         this.pcs.push({
  //           ID: pcPropId[i],
  //           Data: data
  //         });
  //         if (i === pcPropId.length - 1) {
  //           this.pcs.sort((a, b) => a.ID - b.ID);
  //         }
  //       }
  //     );
  //   }
  //   // this.contractService.getContractPCs(this.contractID, pcPropId).subscribe(
  //   //   (data: ContractPCModel[]) => {
  //   // data.filter(v => {
  //   //   this.ddate.push(v.Date);
  //   // });
  //   // this.contractPCs = data;
  //   //     pcPropId = 2;
  //   //     this.contractService.getContractPCs(this.contractID, pcPropId).subscribe(
  //   //       (data2: ContractPCModel[]) => {
  //   //         data2.filter(v => {
  //   //           this.ddate.push(v.Date);
  //   //         });
  //   //         this.ddate = Array.from(new Set(this.ddate));
  //   //         this.contractPCsPlan = data2;
  //   //       }
  //   //     );
  //   //   }
  //   // );
  // }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return 'rgba(60, 172, 197, 0.75)';
    // return color;
  }

  getSum(total, num) {
    return total + num;
  }

  getStakeHolders() {
    this.contractService.getContractStakeHolders(this.contractID).subscribe(
      (data: ContractStakeHolderModel[]) => {
        this.stakeHolders = data;
      }
    );
  }

  getCashFlowPlan() {
    this.contractService.getContractCashFlowPlans(this.contractID, this.selectedVersion.cashFlowPlanCode).subscribe(
      (data: ContractCashFlowPlanModel[]) => {
        this.cashFlowPlans = data;
      }
    );
  }

  getAssignedReses() {
    this.contractService.getContractAssignedCostReses(this.contractID).subscribe(
      (data: ContractAssignedCostResModel[]) => {
        this.costReses = data;
        this.dataSource = new MatTableDataSource(data);
      }
    );
  }

  getContractInfo() {
    this.contractService.getContract(this.contractID).subscribe(
      (contract: ContractModel) => {
        this.contract = contract;
        this.sharedService.getPMId(contract.PM.Id).subscribe(
          (pmId: number) => {
            this.sharedService.getPMName(pmId).subscribe(
              (pmName: string) => {
                this.contract.PM.Title = pmName;
              }
            );
          }
        );
        this.lastPC = this.contract.LastPC.filter(v => v.Service === 7)[0];
        if (this.contract.Service.length > 1) {
          this.contractServices.push({ID: 7, Title: this.services.filter(v => v.ServiceID === 7)[0].Name});
        }
        for (let i = 0; i < this.contract.Service.length; i++) {
          this.contractServices.push({
            ID: this.contract.Service[i],
            Title: this.services.filter(v => v.ServiceID === this.contract.Service[i])[0].Name
          });
        }
        this.selectedService = this.contractServices[0].ID;
        this.onSelect({value: this.selectedService});
        // this.financial = this.contract.FinancialLast.FinancialProgress;
        // console.log(this.financial);
        // console.log(this.lastPC);
        // this.buildChart('Act');
        // this.buildChart('Plan');
        // this.buildChart('Financial');
      }
    );
  }

  // buildChart(type: string) {
  //   let percent;
  //   let text;
  //   let color;
  //   if (type === 'Act') {
  //     if (this.lastPC) {
  //       percent = this.lastPC.ActPC * 100;
  //       text = 'Act';
  //       color = '#f21313d9';
  //     }
  //   } else if (type === 'Plan') {
  //     if (this.lastPC) {
  //       percent = this.lastPC.PlanPC * 100;
  //       text = 'Plan';
  //       color = '#1392f2d9';
  //     }
  //   } else {
  //     // percent = this.financial * 100;
  //     percent = 80;
  //     text = 'Financial';
  //     color = '#28c03ed9';
  //   }
  //   this.chartOptions = {
  //     chart: {
  //       renderTo: 'container',
  //       type: 'pie',
  //       height: 200
  //     },
  //     title: {
  //       text: ''
  //     },
  //     plotOptions: {
  //       pie: {
  //         colors: [color],
  //         shadow: false
  //       }
  //     },
  //     series: [{
  //       name: text,
  //       data: [
  //         ['پیشرفت | درصد', percent],
  //         {
  //           'name': 'Incomplete',
  //           'y': 100 - percent,
  //           'color': 'rgba(0,0,0,0)'
  //         }
  //       ],
  //       size: '120%',
  //       innerSize: '90%',
  //       showInLegend: false,
  //       dataLabels: {
  //         enabled: false
  //       }
  //     }]
  //   };
  //   if (type === 'Act') {
  //     this.actChart = new Chart(this.chartOptions);
  //   } else if (type === 'Plan') {
  //     this.planChart = new Chart(this.chartOptions);
  //   } else {
  //     this.financialChart = new Chart(this.chartOptions);
  //   }
  // }
}
