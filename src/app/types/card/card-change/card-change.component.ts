import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ContractService} from '../../../shared/services/contract.service';
import {SharedService} from '../../../shared/services/shared.service';
import * as Highcharts from 'highcharts';
import {Chart} from 'angular-highcharts';
import {ContractModel} from '../../../shared/models/contractModels/contract.model';
import {ContractServicesList} from '../../../shared/models/contractServices.model';
import {TempTransferService} from '../../../shared/services/temp-transfer.service';
import * as moment from 'jalali-moment';
import {CurrencyList} from '../../../shared/models/currency.model';
import {AuthService} from '../../../shared/services/auth.service';
import {HotTableRegisterer} from '@handsontable-pro/angular';
import {CalculationsService} from '../../../shared/services/calculations.service';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-card-change',
  templateUrl: './card-change.component.html',
  styleUrls: ['./card-change.component.scss']
})
export class CardChangeComponent implements OnInit {
  chart;
  chartOptions;
  changeID: number;
  contractID: number;
  versionID: number;
  startDate = '1397/11/07';
  finishDate = '1397/11/14';
  contract: ContractModel;
  change: { ID, Date, ChangeItem, ImporterApproved, PMApproved, Json, DDate, Description };
  tabIndex = 100;
  contractServices: any;
  changeItems: { ID, Title, Order, ChangeCategory, ChangeItem, VersionMaker }[];
  deliverableSteps = [];
  services: ContractServicesList[] = [];
  currentUnlockedIndex = 1;
  currencies: CurrencyList[] = [];
  today = {
    en: null,
    fa: null
  };
  isPM = false;
  checkUserRole = false;
  instance = 'chagnePCsTable';
  mainActPCProps: { ID, Service }[] = [];
  actPCPropWithService: { ID, Service }[] = [];
  allPCRelations: { ID, ActPCProp, PlanPCProps, PlanDDate }[] = [];
  minPlanDates = [];
  loopSubject = new Subject();
  currentPlanID: number;
  plansTimeDeviation = [];
  mainSpeed: { Speed, Interval }[] = [];
  totalInterval = 30;
  suitablePlans = [];
  finalCounterForWritngDuty = 0;
  lasts: {
    costAssignedReses: { ResID: number, Cost: number }[],
    serviceCost: { Service: number, Cost: number }[],
    pc: { Service: number, Date: string, ActPC: number, PlanPC: number }[],
    del: { Del: number, Op: number, TotalVal: number, Date: string, ActSum: number, PlanSum: number }[],
    financial?: { TotalGrossPayment: number, TotalNetPayment: number, TotalGrossRequest: number, TotalNetRequest: number, TotalInvoice: number, FinancialProgress: number, PaymentDeviation: number, Date: string },
    calcs?: { Service: number, Date: string, ProgressDeviation: number, Speed30D: number, Speed90D: number, TimeDeviation: number, Speed4Ontime: number, FinishTimeForecast: number, FinishTimeForecast90: number }[],
  };

  constructor(private router: Router,
              private contractService: ContractService,
              private route: ActivatedRoute,
              private authService: AuthService,
              private calculationsService: CalculationsService,
              private hotRegisterer: HotTableRegisterer,
              private tempTransfer: TempTransferService,
              private sharedService: SharedService) {
  }

  ngOnInit() {
    this.lasts = {
      costAssignedReses: [],
      calcs: [],
      serviceCost: [],
      pc: [],
      del: [],
      financial: {
        TotalGrossPayment: 0,
        TotalNetPayment: 0,
        TotalGrossRequest: 0,
        TotalNetRequest: 0,
        TotalInvoice: 0,
        FinancialProgress: 0,
        PaymentDeviation: 0,
        Date: null
      }
    };
    // if (this.authService.userRole) {
    //   if (this.authService.userRole.ID === +this.contract.PM.Id) {
    //     this.isPM = true;
    //     this.checkUserRole = true;
    //   } else {
    //     this.checkUserRole = true;
    //   }
    // }
    //
    //
    // this.authService.userRoleSubject.subscribe(
    //   (userRole: {ID, Account, FullName, IsPM, IsPMOExpert, Id_Importer}) => {
    //     if (userRole.ID === +this.contract.PM.Id) {
    //       this.isPM = true;
    //       this.checkUserRole = true;
    //     } else {
    //       this.checkUserRole = true;
    //     }
    //   }
    // );
    this.sharedService.getContractCurrencies().subscribe(
      (currencies) => {
        this.currencies = currencies;
      }
    );
    this.versionID = 1;
    this.route.queryParams.subscribe(
      (params: any) => {
        if (params.ID && params.ChangeID) {
          this.changeID = +params.ChangeID;
          this.contractID = +params.ID;
          this.contractService.getContract(this.contractID).subscribe(
            (contract: ContractModel) => {
              this.contract = contract;
              this.contractServices = this.contract.Service;
              this.sharedService.getContractServices().subscribe(
                (services) => {
                  this.services = services;
                  for (let i = 0; i < this.contract.Service.length; i++) {
                    const selectedService = services.filter(v => +v.ServiceID === +this.contract.Service[i])[0];
                    if (+selectedService.DeliverableType > 0) {
                      this.deliverableSteps.push(selectedService);
                    }
                  }
                });
            }
          );
          this.contractService.getChange(this.contractID, this.changeID, false).subscribe(
            (change) => {
              this.change = change;
              this.tabIndex = this.change.ChangeItem.sort((a, b) => a - b).map(v => +v)[0];
              console.log(change);
              this.buildChart();
            }
          );
          this.contractService.getAllChangeItems().subscribe(
            (changeItems) => {
              this.changeItems = changeItems;
            }
          );
        }
      });


    this.loopSubject.subscribe(
      (data: { mainPC, uniqRelations, plans, i, floatPC, floatPC90, startIntervalPCDate, startIntervalPCDate90, currentPlanID, floatInterval, floatInterval90, isSpeedCalculationFinished, isSpeedCalculationFinished90, filteredActs, suitablePlan, suitablePlan90, mainSpeed: { Speed, Interval }[], mainSpeed90: { Speed, Interval }[], pcID, calcs: { PCRelation, PCCode, ProgressDeviation, Speed30D, Speed90D, TimeDeviation, Speed4Ontime, FinishTimeForecast, FinishTimeForecast90 } }) => {
        this.contractService.getAllPCsByPCProp(this.contractID, data.plans[data.i].PlanPCProps).subscribe(
          (filteredPlans) => {
            this.minPlanDates.push(filteredPlans[0].Date);
            console.log(filteredPlans);
            console.log(data.plans);
            // Start Speed Calculations
            data.currentPlanID = data.plans[data.i].PlanPCProps;
            if ((+new Date(data.floatPC.Date) > +new Date(filteredPlans[0].Date) && !data.isSpeedCalculationFinished) || ((data.mainSpeed.length === 0) && data.i === data.plans.length - 1)) {
              if (data.startIntervalPCDate > +new Date(filteredPlans[0].Date)) {

                console.log('shit1', data.i);
                data.floatInterval = (((+new Date(data.floatPC.Date)) / 3600000) / 24) - (((+new Date(data.startIntervalPCDate)) / 3600000) / 24);
                data.mainSpeed.push({
                  Speed: this.getSpeed(data.floatPC, filteredPlans, data.filteredActs, data.currentPlanID, data.floatInterval),
                  Interval: data.floatInterval
                });
                data.isSpeedCalculationFinished = true;
              } else {

                data.floatInterval = (((+new Date(data.floatPC.Date)) / 3600000) / 24) - (((+new Date(filteredPlans[0].Date)) / 3600000) / 24);
                console.log('shit2', data.i);
                data.mainSpeed.push({
                  Speed: this.getSpeed(data.floatPC, filteredPlans, data.filteredActs, data.currentPlanID, data.floatInterval),
                  Interval: data.floatInterval
                });
                data.floatPC = {
                  Date: filteredPlans[0].Date,
                  PC: this.calculationsService.getPC(filteredPlans[0].Date, data.filteredActs),
                };

              }
            }
            if ((+new Date(data.floatPC90.Date) > +new Date(filteredPlans[0].Date) && !data.isSpeedCalculationFinished90) || ((data.mainSpeed90.length === 0) && data.i === data.plans.length - 1)) {
              if (data.startIntervalPCDate90 > +new Date(filteredPlans[0].Date)) {

                console.log('shit1', data.i);
                data.floatInterval90 = (((+new Date(data.floatPC90.Date)) / 3600000) / 24) - (((+new Date(data.startIntervalPCDate90)) / 3600000) / 24);
                data.mainSpeed90.push({
                  Speed: this.getSpeed(data.floatPC, filteredPlans, data.filteredActs, data.currentPlanID, data.floatInterval90),
                  Interval: data.floatInterval90
                });
                data.isSpeedCalculationFinished90 = true;
              } else {

                data.floatInterval90 = (((+new Date(data.floatPC90.Date)) / 3600000) / 24) - (((+new Date(filteredPlans[0].Date)) / 3600000) / 24);
                console.log('shit2', data.i);
                data.mainSpeed90.push({
                  Speed: this.getSpeed(data.floatPC90, filteredPlans, data.filteredActs, data.currentPlanID, data.floatInterval90),
                  Interval: data.floatInterval90
                });
                data.floatPC90 = {
                  Date: filteredPlans[0].Date,
                  PC: this.calculationsService.getPC(filteredPlans[0].Date, data.filteredActs),
                };

              }
            }


            // Start TimeDeviation Calculations
            let isFirstPlan = false;
            if (data.i === data.plans.length - 1) {
              isFirstPlan = true;
            }
            let actEqPC = data.mainPC;
            if (data.i !== 0) {
              actEqPC = {
                PC: this.calculationsService.getPC(this.minPlanDates[data.i - 1], data.filteredActs),
                Date: this.minPlanDates[data.i - 1]
              };
            }
            this.plansTimeDeviation.push(this.getTimeDeviation(actEqPC, data.filteredActs, filteredPlans, isFirstPlan));
            if (data.mainSpeed.length === 1) {
              data.calcs.PCRelation = +this.allPCRelations.filter(v => +v.ActPCProp === +data.filteredActs[0].PCProp && +v.PlanPCProps === +filteredPlans[0].PCProp)[0].ID;
              data.suitablePlan = filteredPlans;
              data.calcs.PCCode = data.pcID;
              data.calcs.ProgressDeviation = this.getProgressDeviation(data.mainPC, filteredPlans);
              data.calcs.Speed30D = null;
              // data.calcs.TimeDeviation = this.getTimeDeviation(data.mainPC, data.filteredActs, filteredPlans, true).timeDeviation;
              data.calcs.TimeDeviation = null;
              // data.calcs.Speed4Ontime = this.getSpeed4OnTime(data.mainPC, filteredPlans, data.filteredActs); 8/21/2016
              data.calcs.Speed4Ontime = null;
              data.calcs.FinishTimeForecast = null;
              this.suitablePlans.push(filteredPlans);
              this.finalCounterForWritngDuty++;
            }
            if (data.mainSpeed90.length === 1) {
              data.suitablePlan90 = filteredPlans;
              data.calcs.Speed90D = null;
              data.calcs.FinishTimeForecast90 = null;
            }
            if (data.i === data.plans.length - 1) {
              console.log(data.i, data.plans.length - 1);
              console.log(data, 'mainSpeed');
              data.calcs.Speed30D = this.weightedTotalSpeed(data.mainSpeed);
              data.calcs.Speed90D = this.weightedTotalSpeed(data.mainSpeed90);
              data.calcs.FinishTimeForecast = this.getFinishTimeForecast(data.mainPC, data.suitablePlan, data.filteredActs, data.calcs.Speed30D);
              data.calcs.FinishTimeForecast90 = this.getFinishTimeForecast(data.mainPC, data.suitablePlan90, data.filteredActs, data.calcs.Speed90D);
              this.createActPCCalcs(data.calcs, data.filteredActs[0].PCProp, data.mainPC, data.suitablePlan);
            } else {
              console.log(data.i++);
              this.loopSubject.next({
                mainPC: data.mainPC,
                uniqRelations: data.uniqRelations,
                plans: data.plans,
                i: data.i++,
                floatPC: data.floatPC,
                floatPC90: data.floatPC90,
                currentPlanID: data.currentPlanID,
                startIntervalPCDate: data.startIntervalPCDate,
                startIntervalPCDate90: data.startIntervalPCDate90,
                floatInterval: data.floatInterval,
                floatInterval90: data.floatInterval90,
                isSpeedCalculationFinished: data.isSpeedCalculationFinished,
                isSpeedCalculationFinished90: data.isSpeedCalculationFinished90,
                filteredActs: data.filteredActs,
                suitablePlan: data.suitablePlan,
                suitablePlan90: data.suitablePlan90,
                mainSpeed: data.mainSpeed,
                mainSpeed90: data.mainSpeed90,
                pcID: data.pcID,
                calcs: data.calcs
              });
            }
          }
        );
      }
    );
  }

  createActPCCalcs(calcs: { PCRelation, PCCode, ProgressDeviation, Speed30D, Speed90D, TimeDeviation, Speed4Ontime, FinishTimeForecast, FinishTimeForecast90 }, actPCProp, mainPC, suitablePlan) {
    // const pcLastIndex = this.lasts.pc.findIndex(v => +v.Service === +this.mainActPCProps.filter(v2 => +v2.ID === +actPCProp)[0].Service.results[0]);
    // this.lasts.pc[pcLastIndex].PlanPC = this.calculationsService.getPC(this.lasts.pc[pcLastIndex].Date, suitablePlan);
    // console.log(pcLastIndex, this.lasts.pc[pcLastIndex]);
    // planPC: this.lasts.pc[pcLastIndex].PlanPC,
    const pcCalcs: any = {
      DataAct: calcs.PCCode,
      PCRelation: calcs.PCRelation,
      ProgressDeviation: calcs.ProgressDeviation,
      Speed: calcs.Speed30D,
      Speed90D: calcs.Speed90D,
      TimeDeviation: calcs.TimeDeviation,
      Speed4OnTime: calcs.Speed4Ontime,
      FinishTimeForecast: calcs.FinishTimeForecast,
      FinishTimeForecast90: calcs.FinishTimeForecast90,
      FinishDates: null,
      planPC: null,
      suitablePlan: suitablePlan[0].PCProp
    };
    console.log(pcCalcs);
    this.tempTransfer.getDataFromContextInfo().subscribe(
      (digestValue) => {
        this.tempTransfer.createActPCCalcs(digestValue, this.contractID, pcCalcs).subscribe(
          (rData: any) => {
          }
        );
      }
    );

    // this.lasts.calcs.push({
    //   Service: this.mainActPCProps.filter(v => v.ID === actPCProp)[0].Service.results[0],
    //   Date: mainPC.Date,
    //   ProgressDeviation: calcs.ProgressDeviation,
    //   Speed30D: calcs.Speed30D,
    //   Speed90D: calcs.Speed90D,
    //   TimeDeviation: calcs.TimeDeviation,
    //   Speed4Ontime: calcs.Speed4Ontime,
    //   FinishTimeForecast: calcs.FinishTimeForecast,
    //   FinishTimeForecast90: calcs.FinishTimeForecast90,
    // });
    // if (this.lasts.calcs.length === this.formGp.value.ServicesValue.length) {
    //   this.tempTransfer.getDataFromContextInfo().subscribe(
    //     (digestValue) => {
    //       this.tempTransfer.updateContract(digestValue, this.contractID, this.lasts, 'pc').subscribe();
    //     }
    //   );
    // }
    console.log(this.lasts, 'lasts');
  }

  startSpeedCalc(data: { Date, Services: { Names, Values } }, pc: { ID: number, PCPropID: number, Value: number, Service: number }, shit, planID) {
    // Date: moment(data.Date, 'YYYY/M/D').format('jYYYY/jMM/jDD'),
    console.log(data);
    this.lasts.pc.push({
      Service: pc.Service,
      Date: shit,
      ActPC: pc.Value,
      PlanPC: null,
    });
    console.log(shit);
    this.allPCRelations.sort((a, b) => +new Date(b.PlanDDate) - +new Date(a.PlanDDate));
    // console.log(this.allPCRelations);

    const uniqRelations = Array.from(new Set(this.allPCRelations.map(v => v.ActPCProp)));
    // console.log(uniqRelations);
    // console.log(uniqRelations, 'uniqRelations');
    // for (let i = 0; i < uniqRelations.length; i++) {
    const plans = this.allPCRelations.filter(v => +v.ActPCProp === +pc.PCPropID);
    this.contractService.getAllPCsByPCProp(this.contractID, pc.PCPropID).subscribe(
      (filteredActs) => {
        // console.log(plans, 'plans');
        // console.log(filteredActs, 'filteredActs');
        // console.log({
        //   Date: data.Date,
        //   PC: data.Services.Values[i] / 100
        // }, 'filteredActs');
        // filteredActs.push({
        //   ID: 100000,
        //   PCProp: pc.PCPropID,
        //   Date: shit,
        //   PC: pc.Value,
        // });
        console.log(filteredActs);
        filteredActs.sort((a, b) => +new Date(a.Date) - +new Date(b.Date));

        this.loopSubject.next({
          mainPC: {
            Date: shit,
            PC: pc.Value
          },
          uniqRelations: uniqRelations,
          plans: plans,
          i: 0,
          floatPC: {
            Date: shit,
            PC: pc.Value
          },
          floatPC90: {
            Date: shit,
            PC: pc.Value
          },
          startIntervalPCDate: +new Date(shit) - (this.totalInterval * 3600000 * 24),
          startIntervalPCDate90: +new Date(shit) - (90 * 3600000 * 24),
          floatInterval: this.totalInterval,
          floatInterval90: 90,
          isSpeedCalculationFinished: false,
          isSpeedCalculationFinished90: false,
          filteredActs: filteredActs,
          currentPlanID: null,
          suitablePlan: null,
          suitablePlan90: null,
          mainSpeed: [],
          mainSpeed90: [],
          pcID: pc.ID,
          calcs: {
            PCRelation: null,
            PCCode: null,
            ProgressDeviation: null,
            Speed30D: null,
            Speed90D: null,
            TimeDeviation: null,
            Speed4Ontime: null,
            FinishTimeForecast: null
          }
        });
      });
    // }
    // const plans = this.allPCRelations.filter(v => +v.ActPCProp === +uniqRelations[0]);
    // this.floatInterval = this.totalInterval;
    // this.floatPC = {PC: .15, Date: '07/10/2019'};
    // this.startIntervalPCDate = +new Date(this.floatPC.Date) - (this.totalInterval * 3600000 * 24);
    // console.log(this.startIntervalPCDate);
    // console.log(plans);

    // console.log(this.allPCRelations.filter(v => +v.ActPCProp === +uniqRelations[0]));
    console.log(this.allPCRelations);
    const lastPlanID = this.allPCRelations.filter(v => +v.ActPCProp === +uniqRelations[0])[0].PlanPCProps;
    console.log(lastPlanID);
    // const mainPC = {
    //   Date: data.Date,
    //   PC: data.Services.Values[0] / 100
    // };
    // this.contractService.getAllPCsByPCProp(this.contractID, lastPlanID).subscribe(
    //   (filteredPlans) => {
    //     this.contractService.getAllPCsByPCProp(this.contractID, uniqRelations[0]).subscribe(
    //       (filteredActs) => {
    // console.log(this.getSpeed4OnTime(mainPC, filteredPlans, filteredActs));
    // console.log(filteredPlans);
    // console.log(this.getProgressDeviation(mainPC, filteredPlans));
    // const speed = this.getSpeed(mainPC, filteredPlans, filteredActs, lastPlanID, 30);
    // console.log(this.getSpeed(mainPC, filteredPlans, filteredActs, lastPlanID, 30));
    // console.log(this.getFinishTimeForecast(mainPC, filteredPlans, filteredActs, speed));
    // console.log(this.getTimeDeviation(mainPC, filteredActs, filteredPlans, true));
    // const currentSpeed = this.getSpeed(mainPC, filteredPlans, filteredActs, lastPlanID, 30);
    // if (!currentSpeed) {
    // const plans = this.allPCRelations.filter(v => +v.ActPCProp === +uniqRelations[0]);
    // for (let i = 0; i < plans.length; i++) {
    // const pcDate1 = new Date(d.setDate(d.getDate() - interval));

    // }
    // }
    // }
    // );
    // }
    // );
  }

  getFinishTimeForecast(mainPC, finalDataPlan, finalDataAct, speed) {
    // Start Speed4OnTime
    if (!finalDataPlan) {
      return null;
    }
    console.log(finalDataPlan);
    const maxPlanDate = finalDataPlan[finalDataPlan.length - 1].Date;
    const actPC = mainPC;
    const planEqDate = this.calculationsService.getPCDate(actPC.PC, finalDataPlan);
    const planDuration = +new Date(maxPlanDate) - +planEqDate;
    const actDuration = +new Date(maxPlanDate) - +new Date(actPC.Date);
    const finishTimeForecast = (+planDuration / +speed) + +new Date(actPC.Date);
    if (finishTimeForecast === Infinity) {
      return null;

    } else {
      return new Date(+finishTimeForecast).toISOString().substring(0, 10);
    }
  }

  getSpeed4OnTime(mainPC: { PC, Date }, finalDataPlan, finalDataAct) {
    // Start Speed4OnTime
    const maxPlanDate = finalDataPlan[finalDataPlan.length - 1].Date;
    const actPC = mainPC;
    if (+new Date(actPC.Date) < +new Date(maxPlanDate)) {
      const planEqDate = this.calculationsService.getPCDate(actPC.PC, finalDataPlan);
      const planDuration = +new Date(maxPlanDate) - +planEqDate;
      const actDuration = +new Date(maxPlanDate) - +new Date(actPC.Date);
      const speed4OnTime = +planDuration / +actDuration;
      return speed4OnTime;
    } else {
      return null;
    }
  }

  weightedTotalTimeDeviation(plansTimeDeviation) {
    const sumActDuration = plansTimeDeviation.map(v => v.actDuration).reduce(this.getSum);
    let totalTimeDeviation = 0;
    // console.log(sumActDuration);
    for (let i = 0; i < plansTimeDeviation.length; i++) {
      totalTimeDeviation = totalTimeDeviation + plansTimeDeviation[i].timeDeviation * (plansTimeDeviation[i].actDuration / sumActDuration);
    }
    return totalTimeDeviation;
  }

  weightedTotalSpeed(mainSpeed: { Speed, Interval }[]) {
    if (mainSpeed.length === 0) {
      return null;
    }
    const sumInterval = mainSpeed.map(v => +v.Interval).reduce(this.getSum);
    let totalSpeed = 0;
    // console.log(sumActDuration);
    for (let i = 0; i < mainSpeed.length; i++) {
      totalSpeed = totalSpeed + mainSpeed[i].Speed * (mainSpeed[i].Interval / sumInterval);
    }
    return totalSpeed;
  }

  getTimeDeviation(mainPC: { PC, Date }, finalDataAct, finalDataPlan, isFirstPlan) {
    // Start TimeDeviation
    const minActDate = finalDataAct[0].Date;
    const minPlanDate = finalDataPlan[0].Date;
    // console.log(minActDate, 'minActDate');
    // console.log(minPlanDate, 'minPlanDate');

    let startDate = minPlanDate;
    const actPC = mainPC;
    if ((+new Date(minActDate) < +new Date(minPlanDate)) && isFirstPlan) {
      startDate = minActDate;
    }
    // console.log(startDate, 'startDate', actPC.Date);
    const actDuration = +new Date(actPC.Date) - +new Date(startDate);
    const planEqDate = this.calculationsService.getPCDate(actPC.PC, finalDataPlan);
    // console.log(actDuration, 'actDuration');
    // console.log(planEqDate, 'planEqDate');
    const planDuration = +planEqDate - +new Date(startDate);
    // console.log(planDuration, 'planDuration');
    if (actDuration === 0) {
      return null;
    } else {
      const timeDeviation = (+actDuration - +planDuration) / +planDuration;
      return {
        timeDeviation: timeDeviation,
        actDuration: actDuration
      };
    }
    // console.log('timeDeviation:', timeDeviation);
  }

  getSpeed(mainPC, filteredPlans, filteredActs, lastPlanID, interval) {
    // Start Speed

    const speed = this.calculationsService.getSpeed(mainPC.Date, interval, filteredActs, filteredPlans, lastPlanID, false);
    return speed;
  }


  getProgressDeviation(data, finalDataPlan) {
    // Start progressDeviation
    const progressDeviation = this.calculationsService.progressDeviation(+this.calculationsService.getPC(data.Date, finalDataPlan), +data.PC);
    return progressDeviation;
  }

  getDate(date) {
    return moment(date).format('jYYYY/jMM/jDD');
  }

  onWrite(isFirst = true) {
    if (isFirst) {
      if (this.change.ChangeItem.find(v => v === 6) !== -1) {
        this.writeChangeCost();
      } else {
        for (let i = 0; i < this.change.ChangeItem.length; i++) {
          // if (this.change.ChangeItem[i] === 1) {
          // this.writeChangeCost();
          // }
          if (this.change.ChangeItem[i] === 2) {
            this.writeChangeFinishDate();
          }
          // if (this.change.ChangeItem[i] === 6) {
          //   this.writeChangeCost();
          //   // this.writeChangeService();
          // }
          if (this.change.ChangeItem[i] === 7) {
            this.writeChangeServiceCost();
          }
          if (this.change.ChangeItem[i] === 8) {
            this.writeChangeAssignedCostResourcesDate();
          }
          if (this.change.ChangeItem[i] === 14) {
            this.writeChangeCashFlow();
          }
          if (this.change.ChangeItem[i] === 15) {
            this.writeChangeStakeholder();
          }
        }
      }
    } else {
      for (let i = 0; i < this.change.ChangeItem.length; i++) {
        if (this.change.ChangeItem[i] === 2) {
          this.writeChangeFinishDate();
        }
        if (this.change.ChangeItem[i] === 7) {
          this.writeChangeServiceCost();
        }
        if (this.change.ChangeItem[i] === 8) {
          this.writeChangeAssignedCostResourcesDate();
        }
        if (this.change.ChangeItem[i] === 14) {
          this.writeChangeCashFlow();
        }
        if (this.change.ChangeItem[i] === 15) {
          this.writeChangeStakeholder();
        }
      }
    }
  }

  writeChangeCost() {
    // version Maker
    let contractVersion: { ID, DDate, Basic, CostCode: { ID, Cost }, FinishDateCode: { ID, Date }, PCRelation, DelPropsRev };
    this.contractService.getContractVersion(this.contractID).subscribe(
      (cv) => {
        contractVersion = cv;
        this.tempTransfer.getDataFromContextInfo().subscribe(
          (digestValue) => {
            let eqCost = -1;
            if (this.change.Json.ChangeCost.EqCost) {
              eqCost = this.change.Json.ChangeCost.EqCost;
            }
            const data: { DDate, Cost, EqCost } = {
              Cost: this.change.Json.ChangeCost.Cost,
              EqCost: eqCost,
              DDate: moment(this.change.DDate, 'jYYYY/jMM/jDD').format('YYYY/M/D')
            };
            this.tempTransfer.createCosts(digestValue, this.contractID, data).subscribe(
              (costCode: any) => {
                this.writeChangeService(costCode.d.ID);
                // this.tempTransfer.updateVersion(digestValue, this.contractID, contractVersion.ID, costCode.d.ID, 'cost').subscribe();
              }
            );
          }
        );
      }
    );
  }

  writeChangeFinishDate() {
    let contractVersion: { ID, DDate, Basic, CostCode: { ID, Cost }, FinishDateCode: { ID, Date }, PCRelation, DelPropsRev };
    this.contractService.getContractVersion(this.contractID,).subscribe(
      (cv) => {
        contractVersion = cv;
        this.tempTransfer.getDataFromContextInfo().subscribe(
          (digestValue) => {
            const data: { DDate, FinishDate } = {
              FinishDate: moment(this.change.Json.ChangeFinishDate.Date, 'jYYYY/jMM/jDD').format('YYYY/M/D'),
              DDate: moment(this.change.DDate, 'jYYYY/jMM/jDD').format('YYYY/M/D')
            };
            this.tempTransfer.createFinishDate(digestValue, this.contractID, data).subscribe(
              (finishDate: any) => {
                this.tempTransfer.updateVersion(digestValue, this.contractID, contractVersion.ID, finishDate.d.ID, 'finishDate').subscribe();
              }
            );
          }
        );
      }
    );
  }

  writeChangeService(costCodeID) {
    // version Maker
    let contractVersion: { ID, DDate, Basic, CostCode: { ID, Cost }, FinishDateCode: { ID, Date }, PCRelation, DelPropsRev };
    this.contractService.getContractVersion(this.contractID).subscribe(
      (cv) => {
        console.log(cv);
        contractVersion = cv;
        this.tempTransfer.getDataFromContextInfo().subscribe(
          (digestValue) => {
            const newData: { DDate, Basic, CostCode, FinishDateCode, PCRelation, DelPropsRev } = {
              DDate: contractVersion.DDate,
              Basic: contractVersion.Basic,
              CostCode: costCodeID,
              FinishDateCode: contractVersion.FinishDateCode.ID,
              PCRelation: contractVersion.PCRelation,
              DelPropsRev: contractVersion.DelPropsRev,
            };
            this.tempTransfer.createVersion(digestValue, this.contractID, newData).subscribe(
              (version: any) => {
                this.contractService.getContractBasic(this.contractID, contractVersion.Basic).subscribe(
                  (basic) => {
                    let currency = basic.Currency.Id;
                    if (this.change.Json.ChangeCost) {
                      if (this.change.Json.ChangeCost.Currency) {
                        currency = this.currencies.filter(v => v.Id === this.change.Json.ChangeCost.Currency)[0].currencyID;
                      }
                    }
                    const mainBasicData: { Title, ShortTitle, Number, Subject_Contract, StartDate, GuaranteePeriod, Unit, SubUnit, Currency, PMOExpert, PM, Contractor, RaiPart, Importer, Standards, Service, Zone, ContractKind, VersionCode } = {
                      Title: basic.Title,
                      ShortTitle: basic.ShortTitle,
                      Number: basic.Number,
                      Subject_Contract: basic.Subject,
                      StartDate: basic.StartDate,
                      GuaranteePeriod: basic.GuaranteePeriod,
                      Unit: basic.Unit.Id,
                      SubUnit: basic.SubUnit,
                      Currency: currency,
                      PMOExpert: basic.PMOExpert.Id,
                      PM: basic.PM.Id,
                      Contractor: basic.Contractor.Id,
                      RaiPart: basic.RaiPart.Id,
                      Importer: basic.Importer.Id,
                      Standards: basic.Standards,
                      Service: this.change.Json.ChangeService.Service,
                      Zone: [basic.Zone.Id],
                      ContractKind: basic.Kind,
                      VersionCode: version.d.ID,
                    };
                    this.tempTransfer.createBasic(digestValue, this.contractID, mainBasicData, false).subscribe(
                      (newBasic: any) => {
                        this.tempTransfer.updateVersion(digestValue, this.contractID, version.d.ID, newBasic.d.ID, 'basic').subscribe(
                          () => {
                            this.onWrite(false);
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  }

  writeChangeServiceCost() {
    let contractVersion: { ID, DDate, Basic, CostCode: { ID, Cost }, FinishDateCode: { ID, Date }, PCRelation, DelPropsRev };
    this.contractService.getContractVersion(this.contractID,).subscribe(
      (cv) => {
        contractVersion = cv;
        this.tempTransfer.getDataFromContextInfo().subscribe(
          (digestValue) => {
            for (let i = 0; i < this.change.Json.ChangeServiceCost.Services.length; i++) {
              const data: { CostCode, DDate, Service, Cost } = {
                Cost: this.change.Json.ChangeServiceCost.Costs[i],
                CostCode: contractVersion.CostCode.ID,
                Service: this.change.Json.ChangeServiceCost.Services[i],
                DDate: moment(this.change.DDate, 'jYYYY/jMM/jDD').format('YYYY/M/D')
              };
              this.tempTransfer.createServiceCosts(digestValue, this.contractID, data).subscribe();
            }
          }
        );
      }
    );
    console.log('ajab');
  }

  writeChangeAssignedCostResourcesDate() {
    let contractVersion: { ID, DDate, Basic, CostCode: { ID, Cost }, FinishDateCode: { ID, Date }, PCRelation, DelPropsRev };
    this.contractService.getContractVersion(this.contractID,).subscribe(
      (cv) => {
        contractVersion = cv;
        this.tempTransfer.getDataFromContextInfo().subscribe(
          (digestValue) => {
            for (let i = 0; i < this.change.Json.ChangeAssignedCost.CostResources.length; i++) {
              const data: { CostCode, DDate, CostResource, Cost } = {
                Cost: this.change.Json.ChangeAssignedCost.Costs[i],
                CostCode: contractVersion.CostCode.ID,
                CostResource: this.change.Json.ChangeAssignedCost.CostResources[i],
                DDate: moment(this.change.DDate, 'jYYYY/jMM/jDD').format('YYYY/M/D')
              };
              this.tempTransfer.createAssignedCostReses(digestValue, this.contractID, data).subscribe();
            }
          }
        );
      }
    );
  }

  writeChangeTotalValue() {

  }

  onChangeClicked() {
    const actData: { ID: number, PCPropID: number, Value: number, Service: number } = {
      ID: 35,
      PCPropID: 2,
      Value: 0.20,
      Service: 7,
    };
    this.contractService.getAllPCRelations(this.contractID).subscribe(
      (allPCRelations) => {
        this.allPCRelations = allPCRelations;
        console.log(this.allPCRelations);
        this.startSpeedCalc(null, {ID: actData.ID, PCPropID: actData.PCPropID, Value: actData.Value, Service: actData.Service}, null, 136);
      }
    );
    // this.writeChangePC();
  }

  writeChangePC() {
    const hotInstance: any = this.hotRegisterer.getInstance(this.instance);
    const tableData: any[] = hotInstance.getData();
    console.log(tableData);
    const tableDates: string[] = tableData.map(v => v[0]);
    console.log(tableDates);
    this.sharedService.getDataFromContextInfo().subscribe(
      (digestValue) => {
        this.contractService.getAllPCProps(this.contractID).subscribe(
          (pcProps) => {
            this.contractService.getAllPCRelations(this.contractID).subscribe(
              (pcRelations) => {
                console.log(pcRelations);
                const filtredPCProps = pcProps.filter(v => {
                  if (v.Kind === 'P' && +this.services.filter(v2 => +v2.ServiceID === +v.Service.results[0])[0].PCType > 0) {
                    return v;
                  }
                });
                console.log(filtredPCProps);
                console.log(this.services);
                let tableCounter = 1;
                for (let i = 0; i < filtredPCProps.length; i++) {
                  const mainPCProp: { Service, Kind, Number, RevNumber, DDate, FinishDateCode, ScaledFrom } = {
                    Service: filtredPCProps[i].Service.results[0],
                    Kind: 'P',
                    Number: '2',
                    RevNumber: 1,
                    DDate: filtredPCProps[i].DDate,
                    FinishDateCode: 1,
                    ScaledFrom: null
                  };
                  this.tempTransfer.createPCProps(digestValue, this.contractID, mainPCProp).subscribe(
                    (newPCProp: any) => {
                      console.log(newPCProp);
                      console.log(tableCounter);
                      for (let j = 0; j < tableDates.length; j++) {
                        if (tableData[j][tableCounter] !== null && tableData[j][tableCounter] !== '') {
                          const mainPC: { PCProp, Date, PC } = {
                            PCProp: newPCProp.d.ID,
                            Date: moment(tableDates[j], 'jYYYY/jMM/jDD').format('YYYY/M/D'),
                            PC: tableData[j][tableCounter]
                          };
                          this.tempTransfer.createPCData(digestValue, this.contractID, mainPC).subscribe(
                            () => {
                            }
                          );
                        }
                        if (j === tableDates.length - 1) {
                          tableCounter = tableCounter + 2;
                        }
                      }
                      const mainPCRelation: { ActPCProp, PlanPCProps } = {
                        ActPCProp: pcRelations.filter(v => v.PlanPCProps === filtredPCProps[i].ID)[0].ActPCProp,
                        PlanPCProps: newPCProp.d.ID
                      };
                      this.tempTransfer.createPCRelations(digestValue, this.contractID, mainPCRelation).subscribe();
                    }
                  );
                }
              });
          }
        );
      });
  }

  writeChangeCashFlow() {
    let contractVersion: { ID, DDate, Basic, CostCode: { ID, Cost }, FinishDateCode: { ID, Date }, PCRelation, DelPropsRev };
    this.contractService.getContractVersion(this.contractID,).subscribe(
      (cv) => {
        contractVersion = cv;
        this.tempTransfer.getDataFromContextInfo().subscribe(
          (digestValue) => {
            const planData: { DDate, CostCode, FinishDateCode } = {
              FinishDateCode: contractVersion.FinishDateCode.ID,
              DDate: moment(this.change.DDate, 'jYYYY/jMM/jDD').format('YYYY/M/D'),
              CostCode: contractVersion.CostCode.ID
            };
            this.tempTransfer.createCashFlowPlansProp(digestValue, this.contractID, planData).subscribe(
              (cashFlowPlansProp: any) => {
                for (let i = 0; i < this.change.Json.ChangeCashFlow.Dates.length; i++) {
                  const data: { CashFlowPlansPropCode, Date, Cost } = {
                    CashFlowPlansPropCode: cashFlowPlansProp.d.ID,
                    Date: moment(this.change.Json.ChangeCashFlow.Dates[i], 'jYYYY/jMM/jDD').format('YYYY/M/D'),
                    Cost: this.change.Json.ChangeCashFlow.Values[i],
                  };
                  this.tempTransfer.createCashFlowPlans(digestValue, this.contractID, data).subscribe();
                }
              }
            );
          }
        );
      }
    );
  }

  writeChangeStakeholder() {
    let contractVersion: { ID, DDate, Basic, CostCode: { ID, Cost }, FinishDateCode: { ID, Date }, PCRelation, DelPropsRev };
    this.contractService.getContractVersion(this.contractID,).subscribe(
      (cv) => {
        contractVersion = cv;
        this.tempTransfer.getDataFromContextInfo().subscribe(
          (digestValue) => {
            for (let i = 0; i < this.change.Json.ChangeStakeHolderPillar.Data.length; i++) {
              const data: { OrgName, Role, AgentName, AgentPosition, PhoneNumber, LocationAddress, Email, IsPillar, DDate } = {
                OrgName: this.change.Json.ChangeStakeHolderPillar.Data[i].OragnizationName_StakeholdersCon,
                Role: this.change.Json.ChangeStakeHolderPillar.Data[i].Role_StakeholdersContract,
                AgentName: this.change.Json.ChangeStakeHolderPillar.Data[i].AgentName_StakeholdersContract,
                AgentPosition: this.change.Json.ChangeStakeHolderPillar.Data[i].Id_ContractAgentPostions,
                PhoneNumber: this.change.Json.ChangeStakeHolderPillar.Data[i].pish_PhoneNumber_StakeholdersContract
                  + '-' + this.change.Json.ChangeStakeHolderPillar.Data[i].PhoneNumber_StakeholdersContract + '-(داخلی)-'
                  + this.change.Json.ChangeStakeHolderPillar.Data[i].int_PhoneNumber_StakeholdersContract,
                LocationAddress: this.change.Json.ChangeStakeHolderPillar.Data[i].Address_StakeholdersContract,
                Email: this.change.Json.ChangeStakeHolderPillar.Data[i].Email_StakeholdersContract,
                IsPillar: true,
                DDate: moment(this.change.DDate, 'jYYYY/jMM/jDD').format('YYYY/M/D')
              };
              this.tempTransfer.createStakeHolders(digestValue, this.contractID, data).subscribe();
            }
            for (let i = 0; i < this.change.Json.ChangeStakeHolderNotPillar.Data.length; i++) {
              const data: { OrgName, Role, AgentName, AgentPosition, PhoneNumber, LocationAddress, Email, IsPillar, DDate } = {
                OrgName: this.change.Json.ChangeStakeHolderNotPillar.Data[i].OragnizationName_StakeholdersCon,
                Role: this.change.Json.ChangeStakeHolderNotPillar.Data[i].Role_StakeholdersContract,
                AgentName: this.change.Json.ChangeStakeHolderNotPillar.Data[i].AgentName_StakeholdersContract,
                AgentPosition: this.change.Json.ChangeStakeHolderNotPillar.Data[i].Id_ContractAgentPostions,
                PhoneNumber: this.change.Json.ChangeStakeHolderNotPillar.Data[i].pish_PhoneNumber_StakeholdersContract
                  + '-' + this.change.Json.ChangeStakeHolderNotPillar.Data[i].PhoneNumber_StakeholdersContract + '-(داخلی)-'
                  + this.change.Json.ChangeStakeHolderNotPillar.Data[i].int_PhoneNumber_StakeholdersContract,
                LocationAddress: this.change.Json.ChangeStakeHolderNotPillar.Data[i].Address_StakeholdersContract,
                Email: this.change.Json.ChangeStakeHolderNotPillar.Data[i].Email_StakeholdersContract,
                IsPillar: false,
                DDate: moment(this.change.DDate, 'jYYYY/jMM/jDD').format('YYYY/M/D')
              };
              this.tempTransfer.createStakeHolders(digestValue, this.contractID, data).subscribe();
            }
          }
        );
      }
    );
  }

  stepChange(id: number) {
    // console.log(this.change.ChangeItem.map(v => v)[this.change.ChangeItem.length - 1], id);
    if (this.currentUnlockedIndex === id || id < this.tabIndex) {
      this.tabIndex = id;
    }
    // if (this.change.ChangeItem.map(v => v)[this.change.ChangeItem.length - 1] === id) {
    //   this.tabIndex = 100;
    // }
    // if ()
  }

  onCheckAllowed(id: number) {
    if (id === 13) {
      return this.change.ChangeItem.filter(v => +v === +id || +v === 12).length > 0;
    } else if (id === 10) {
      return this.change.ChangeItem.filter(v => +v === +id || +v === 11).length > 0;
    } else if (id === 100) {
      return 100;
    } else {
      return this.change.ChangeItem.filter(v => +v === +id).length > 0;
    }
  }

  styleObject(id: number) {
    const styles: any = {};
    // if (this.tabIndex === id) {
    //   styles.background = 'rgba(216, 222, 242, 0.94)';
    // }
    if (id !== this.currentUnlockedIndex) {
      styles.cursor = 'not-allowed';
      styles.opacity = '0.5';
    }

    if (id < this.tabIndex || this.tabIndex === id) {
      styles.background = 'rgba(31, 47, 100, 0.94)';
      styles.color = '#e1e2ea';
      styles.opacity = '1';
    }
    return styles;
  }

  onClickButton() {
    this.router.navigate(['request'], {queryParams: {ContractID: this.contractID}, queryParamsHandling: 'merge'});
  }

  onChangeTabIndex() {
    this.change.ChangeItem.sort((a, b) => a - b);
    const foundedIndex = this.change.ChangeItem.findIndex(v => +v === +this.tabIndex);
    console.log(foundedIndex);
    if (this.change.ChangeItem[this.change.ChangeItem.length - 1] === this.change.ChangeItem[foundedIndex]) {
      this.tabIndex = 100;
    } else {
      if (this.change.ChangeItem[foundedIndex + 1] === 11) {
        this.tabIndex = this.change.ChangeItem[foundedIndex + 2];
      } else {
        this.tabIndex = this.change.ChangeItem[foundedIndex + 1];
      }
    }
    console.log(this.tabIndex);
  }


  buildChart() {
    const percent = 50;
    const text = 'chart';
    const color = '#8300ffb8';
    this.chartOptions = {
      chart: {
        renderTo: 'container',
        type: 'pie',
        height: 200
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
        size: '100%',
        innerSize: '90%',
        showInLegend: false,
        dataLabels: {
          enabled: false
        }
      }]
    };
    this.chart = new Chart(this.chartOptions);
  }

  getSum(total, num) {
    return +total + +num;
  }
}
