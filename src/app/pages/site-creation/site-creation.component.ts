import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {SharedService} from '../../shared/services/shared.service';
import {TempTransferService} from '../../shared/services/temp-transfer.service';
import {StepFormsDataList} from '../../shared/models/stepFormModels/stepFormsData.model';
import * as moment from 'jalali-moment';
import {ContractServicesList} from '../../shared/models/contractServices.model';
import {CalculationsService} from '../../shared/services/calculations.service';
import {Subject} from 'rxjs/index';
import {UnitsList} from '../../shared/models/units.model';
import {assertNotNull} from '@angular/compiler/src/output/output_ast';

export class ContractDataModel {
  constructor(public Costs?: { ID: number },
              public ServiceCosts?: { ID: number }[],
              public FinishDates?: { ID: number },
              public CashFlowPlansProp?: { ID: number },
              public DelItems?: { ID: number },
              public Basic?: { ID: number },
              public PCRelations?: { ID: number }[],
              public DelPropsRev?: { ID: number }[]) {
  }
}

@Component({
  selector: 'app-site-creation',
  templateUrl: './site-creation.component.html',
  styleUrls: ['./site-creation.component.scss']
})

export class SiteCreationComponent implements OnInit {
  tempID = 33;
  services: ContractServicesList[] = [];
  contractData: ContractDataModel;
  interval = 30;
  createFinishDateSubject = new Subject();
  createCostsSubject = new Subject();
  createServiceCostsSubject = new Subject();
  createCashFlowPlansPropSubject = new Subject();
  createDelItemsSubject = new Subject();
  createDelPropsRevsSubject = new Subject();
  createPCRelationsSubject = new Subject();
  createBasicSubject = new Subject();
  versionCheck = 0;
  delCounts = 0;
  @Input() contractID: number;
  @Input() isPreContract: boolean;
  @Input() stepFormsData: StepFormsDataList;
  lasts: {
    costAssignedReses: { ResID: number, Cost: number }[],
    serviceCost: { Service: number, Cost: number }[],
    pc: { Service: number, Date: string, ActPC: number, PlanPC: number }[],
    del: { Del: number, Op: number, TotalVal: number, Date: string, ActSum: number, PlanSum: number }[],
    financial?: { TotalGrossPayment: number, TotalNetPayment: number, TotalGrossRequest: number, TotalNetRequest: number, TotalInvoice: number, FinancialProgress: number, PaymentDeviation: number, Date: string, LastPaymentDate, LastRequestDate },
    calcs?: { Service: number, Date: string, ProgressDeviation: number, Speed30D: number, Speed90D: number, TimeDeviation: number, Speed4Ontime: number, FinishTimeForecast: number, FinishTimeForecast90: number }[],
  };
  mainLastFinancialDate = null;
  pcCalcsTemp = [];
  importerRoleForDate: any = 3;
  financialCounter = 0;

  // pre-contract

  constructor(private router: Router,
              private sharedService: SharedService,
              private tempTransfer: TempTransferService,
              private calculationsService: CalculationsService,) {
  }

  ngOnInit() {
    if (this.stepFormsData.contractsForm.PMId_User.Id === this.stepFormsData.contractsForm.Id_Importer) {
      this.importerRoleForDate = 'PM';
    }
    if (this.isPreContract) {
      this.lasts = {
        costAssignedReses: [],
        calcs: [],
        serviceCost: [],
        pc: [],
        del: [],
        financial: {
          TotalGrossPayment: null,
          TotalNetPayment: null,
          TotalGrossRequest: null,
          TotalNetRequest: null,
          TotalInvoice: null,
          FinancialProgress: null,
          PaymentDeviation: null,
          Date: null,
          LastPaymentDate: null, LastRequestDate: null
        }
      };
    } else {
      if (this.stepFormsData.financialRequests.length > 0 || this.stepFormsData.financialPayments.length > 0) {
        this.lasts = {
          costAssignedReses: [],
          calcs: [],
          serviceCost: [],
          pc: [],
          del: [],
          financial: {
            TotalGrossPayment: null,
            TotalNetPayment: null,
            TotalGrossRequest: null,
            TotalNetRequest: null,
            TotalInvoice: null,
            FinancialProgress: null,
            PaymentDeviation: null,
            Date: null,
            LastPaymentDate: null, LastRequestDate: null
          }
        };
      } else {
        this.lasts = {
          costAssignedReses: [],
          calcs: [],
          serviceCost: [],
          pc: [],
          del: [],
          financial: {
            TotalGrossPayment: null,
            TotalNetPayment: null,
            TotalGrossRequest: null,
            TotalNetRequest: null,
            TotalInvoice: null,
            FinancialProgress: null,
            PaymentDeviation: null,
            Date: null,
            LastPaymentDate: null, LastRequestDate: null
          }
        };
      }
    }

    this.transferSite();
    // this.sharedService.getDataJson(this.tempID)
    //   .subscribe(
    //     (data: StepFormsDataList) => {
    //       this.stepFormsData = data;
    //       console.log(this.stepFormsData);
    //       this.createContract();
    //       // this.transferSite();
    //     });
  }

  createContract() {
    this.sharedService.getAllUnits().subscribe(
      (units: UnitsList[]) => {
        this.sharedService.getContractServices().subscribe(
          (services) => {
            this.sharedService.getContractCurrencies().subscribe(
              (currencies) => {
                this.services = services;
                const data: { Title, ShortTitle, Number, Subject_Contract, StartDate, GuaranteePeriod, Unit, SubUnit, Currency, PMOExpert, PM, Contractor, RaiPart, Importer, Standards, Service, Zone, ContractKind, Cost, VersionCode, Del_Last, FinishDate } = {
                  Title: this.stepFormsData.contractsForm.FullTitle_Contract,
                  ShortTitle: this.stepFormsData.contractsForm.ShortTitle_Contract,
                  Number: this.stepFormsData.contractsForm.Number_Contract,
                  Subject_Contract: this.stepFormsData.contractsForm.Subject_Contract,
                  StartDate: moment(this.stepFormsData.contractsForm.StartDate_Contract, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
                  GuaranteePeriod: this.stepFormsData.contractsForm.GuaranteePeriod,
                  Unit: this.stepFormsData.contractsForm.Id_Unit,
                  SubUnit: this.stepFormsData.contractsForm.Id_SubUnit,
                  Currency: currencies.filter(v => v.Id === this.stepFormsData.contractsForm.Id_Currency)[0].currencyID,
                  PMOExpert: units.filter(v => v.Id === this.stepFormsData.contractsForm.Id_Unit)[0].DefaultPMOExpertId_User,
                  PM: this.stepFormsData.contractsForm.PMId_User.Id,
                  Contractor: this.stepFormsData.contractsForm.Id_Contractor.Id,
                  RaiPart: this.stepFormsData.contractsForm.SignatoryRaiParts,
                  Importer: this.stepFormsData.contractsForm.Id_Importer,
                  Standards: this.stepFormsData.contractsForm.Standards_Contract,
                  Service: this.stepFormsData.contractsForm.ContractServices.map(v => +this.services.filter(v2 => v2.Id === v)[0].ServiceID),
                  Zone: null,
                  ContractKind: 1,
                  Cost: +this.stepFormsData.contractsForm.Cost_Costs,
                  VersionCode: 1,
                  Del_Last: null,
                  FinishDate: null
                };
                // console.log(data);
                this.tempTransfer.getDataFromContextInfo().subscribe(
                  (digestValue) => {
                    this.tempTransfer.createContract(digestValue, <any>data).subscribe(
                      (rData: any) => {
                        this.contractID = rData.d.Id;
                      }
                    );
                  }
                );
              });
          });
      }
    );
  }

  transferSite() {
    this.contractData = new ContractDataModel();
    this.contractData.DelPropsRev = [];
    this.contractData.PCRelations = [];
    this.contractData.ServiceCosts = [];
    this.createFinishDate();
    this.createFinishDateSubject.subscribe(
      () => {
        this.createCosts();
        this.createDeliverables();
        if (!this.isPreContract) {
          this.createPCs();
        }
        this.createVersion();
      }
    );
    this.createCostsSubject.subscribe(
      () => {
        this.createServiceCosts();
        this.createAssignedCostReses();
        this.createCashFlowPlansProp();


        // Not in chain
        this.createStakeHolders();
        if (!this.isPreContract) {
          if (this.stepFormsData.financialRequests) {
            if (this.stepFormsData.financialRequests.length > 0) {
              this.createFinacialRequests();
            }
          }
          if (this.stepFormsData.financialPayments) {
            if (this.stepFormsData.financialPayments.length > 0) {
              this.createFinacialPayments();
            }
          }
        }

        this.createBasic();


        // Version
        this.createVersion();
      }
    );
    this.createCashFlowPlansPropSubject.subscribe(
      () => {
        this.createCashFlowPlans();
      }
    );
    this.createDelItemsSubject.subscribe(
      () => {
      }
    );
    this.createPCRelationsSubject.subscribe(
      () => {
        this.createVersion();
      }
    );
    this.createDelPropsRevsSubject.subscribe(
      () => {
        this.createVersion();
      }
    );
    this.createBasicSubject.subscribe(
      () => {
        this.createVersion();
      }
    );
    // if (this.stepFormsData.contractsForm.IsFinancial === null) {
    // }
  }

  createVersion() {
    console.log(this.pcCalcsTemp);
    console.log(this.versionCheck);
    // console.log(this.contractData);
    let isValid = false;
    if (this.isPreContract) {
      if (this.versionCheck === 4) {
        isValid = true;
      }
    } else {
      if (this.stepFormsData.financialRequests || this.stepFormsData.financialPayments) {
        if (!this.stepFormsData.financialPayments && this.stepFormsData.financialRequests) {
          if (this.versionCheck === 5 && this.financialCounter === this.stepFormsData.financialRequests.length) {
            isValid = true;
          }
        } else if (!this.stepFormsData.financialRequests && this.stepFormsData.financialPayments) {
          if (this.versionCheck === 5 && this.financialCounter === this.stepFormsData.financialPayments.length) {
            isValid = true;
          }
        } else if (this.versionCheck === 5 && this.financialCounter === this.stepFormsData.financialPayments.length + this.stepFormsData.financialRequests.length) {
          isValid = true;
        }
      }
    }

    if (isValid) {
      const data: { DDate, Basic, CostCode, FinishDateCode, PCRelation, DelPropsRev } = {
        DDate: moment(this.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
        Basic: this.contractData.Basic.ID,
        CostCode: this.contractData.Costs.ID,
        FinishDateCode: this.contractData.FinishDates.ID,
        PCRelation: this.contractData.PCRelations.map(v => v.ID),
        DelPropsRev: this.contractData.DelPropsRev.map(v => v.ID),
      };
      this.tempTransfer.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.tempTransfer.createVersion(digestValue, this.contractID, data, this.isPreContract).subscribe(
            (rData: any) => {
              const importerDates = this.stepFormsData.finalApprovalForm.filter(v => {
                if (v.role !== 'PM' && v.role !== 'PMOExpert' && v.isApproved) {
                  return v;
                }
              });
              if (!this.isPreContract) {
                if (this.stepFormsData.financialRequests.length > 0 || this.stepFormsData.financialPayments.length > 0) {
                  console.log(this.lasts.financial);
                  let lastRequestDate = null;
                  if (this.lasts.financial.LastRequestDate) {
                    lastRequestDate = this.lasts.financial.LastRequestDate.sort((a, b) => +new Date(b) - +new Date(a))[0];
                    this.lasts.financial.LastRequestDate = moment(lastRequestDate).format('jYYYY/jM/jD');
                  }
                  let lastPaymentDate = null;
                  if (this.lasts.financial.LastPaymentDate) {
                    lastPaymentDate = this.lasts.financial.LastPaymentDate.sort((a, b) => +new Date(b) - +new Date(a))[0];
                    this.lasts.financial.LastPaymentDate = moment(lastPaymentDate).format('jYYYY/jM/jD');
                  }
                  let date = lastRequestDate;
                  if (+new Date(lastPaymentDate) > +new Date(lastRequestDate)) {
                    date = lastPaymentDate;
                  }
                  // this.lasts.financial.Date = importerDates[importerDates.length - 1].date;
                  this.lasts.financial.Date = moment(date).format('jYYYY/jM/jD');
                  this.lasts.financial.PaymentDeviation = (this.lasts.financial.TotalNetRequest - +this.lasts.financial.TotalNetPayment) / this.lasts.financial.TotalNetRequest;
                  this.lasts.financial.FinancialProgress = +this.lasts.financial.TotalInvoice / +this.stepFormsData.contractsForm.Cost_Costs;
                  const uniqueItems = Array.from(new Set(this.pcCalcsTemp.map(v => +v.Service)));
                  console.log(this.pcCalcsTemp.sort((a, b) => +a.PC - +b.PC));
                  console.log(uniqueItems);
                  for (let i = 0; i < uniqueItems.length; i++) {
                    const financialLasts = this.pcCalcsTemp.sort((a, b) => +a.PC - +b.PC).filter(v => +v.Service === +uniqueItems[i]);
                    const financialLast = financialLasts[financialLasts.length - 1];
                    console.log(financialLast);
                    // if (financialLast) {
                    this.lasts.calcs.push({
                      Service: uniqueItems[i],
                      Date: importerDates[importerDates.length - 1].date,
                      ProgressDeviation: financialLast.ProgressDeviation,
                      Speed30D: financialLast.Speed,
                      TimeDeviation: financialLast.TimeDeviation,
                      Speed4Ontime: financialLast.Speed4OnTime,
                      FinishTimeForecast: financialLast.FinishTimeForecast,
                      FinishTimeForecast90: financialLast.FinishTimeForecast90,
                      Speed90D: financialLast.Speed90D
                    });
                    // }
                  }
                } else {
                  const uniqueItems = Array.from(new Set(this.pcCalcsTemp.map(v => +v.Service)));
                  for (let i = 0; i < uniqueItems.length; i++) {
                    const financialLasts = this.pcCalcsTemp.sort((a, b) => +a.PC - +b.PC).filter(v => +v.Service === +uniqueItems[i]);
                    const financialLast = financialLasts[financialLasts.length - 1];
                    this.lasts.calcs.push({
                      Service: uniqueItems[i],
                      Date: importerDates[importerDates.length - 1].date,
                      ProgressDeviation: financialLast.ProgressDeviation,
                      Speed30D: financialLast.Speed,
                      TimeDeviation: financialLast.TimeDeviation,
                      Speed4Ontime: financialLast.Speed4OnTime,
                      FinishTimeForecast: financialLast.FinishTimeForecast,
                      FinishTimeForecast90: financialLast.FinishTimeForecast90,
                      Speed90D: financialLast.Speed90D
                    });
                  }
                }
              }

              // console.clear();
              console.log(this.pcCalcsTemp);
              console.log('Done!', this.lasts, 'lasts');
              this.tempTransfer.getDataFromContextInfo().subscribe(
                (dg) => {
                  this.tempTransfer.updateContract(dg, this.contractID, this.lasts).subscribe(
                    () => {
                      this.sharedService.updateDataJsonPMO(data, +this.sharedService.stepFormsData.contractsForm.Code_Contract).subscribe(
                        () => {
                          this.router.navigate(['/contract'], {queryParams: {'ID': this.contractID}});
                        }
                      );
                    }
                  );
                }
              );
              // this.createBasic(rData.d.Id, totalValue, kinds[i], zones, delData, delDate);
              // this.contractData.DelItems = {ID: rData.d.Id};
            }
          );
        }
      );
    }
  }

  createBasic() {
    this.sharedService.getContractServices().subscribe(
      (services) => {
        this.sharedService.getContractCurrencies().subscribe(
          (currencies) => {
            this.services = services;
            let contractor = null;
            let Number = null;
            let DeclareForecst = null;
            let StartDateForecast = null;
            let FinishDateForecast = null;
            let DocSendDateForecast = null;
            let MinutesSignDateForecast = null;
            let WinnerDateForecast = null;
            let CreationDate = null;
            if (!this.isPreContract) {
              contractor = this.stepFormsData.contractsForm.Id_Contractor.Id;
              Number = this.stepFormsData.contractsForm.Number_Contract;
            } else {
              DeclareForecst = moment(this.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jM/jD').format('MM/DD/YYYY');
              StartDateForecast = moment(this.stepFormsData.contractsForm.StartDate_Contract, 'jYYYY/jM/jD').format('MM/DD/YYYY');
              FinishDateForecast = moment(this.stepFormsData.contractsForm.FinishDate_Contract, 'jYYYY/jM/jD').format('MM/DD/YYYY');
              DocSendDateForecast = moment(this.stepFormsData.contractsForm.DocToComptroller, 'jYYYY/jM/jD').format('MM/DD/YYYY');
              MinutesSignDateForecast = moment(this.stepFormsData.contractsForm.SigningRecall, 'jYYYY/jM/jD').format('MM/DD/YYYY');
              WinnerDateForecast = moment(this.stepFormsData.contractsForm.WinnerDeclare, 'jYYYY/jM/jD').format('MM/DD/YYYY');
              CreationDate = moment(this.stepFormsData.contractsForm.CreationDate, 'jYYYY/jM/jD').format('MM/DD/YYYY');
            }
            const data: {
              Title, ShortTitle, Number, Subject_Contract, StartDate, GuaranteePeriod, Unit, SubUnit, Currency, PMOExpert, PM, Contractor, RaiPart, Importer, Standards, Service, Zone, ContractKind, VersionCode,
              OperationType, Goal, Demandant, ExecutePriority, TenderType, TenderOrganizer, DeclareForecst, StartDateForecast, FinishDateForecast, DocSendDateForecast, MinutesSignDateForecast, WinnerDateForecast, CreationDate
            } = {
              Title: this.stepFormsData.contractsForm.FullTitle_Contract,
              ShortTitle: this.stepFormsData.contractsForm.ShortTitle_Contract,
              Number: Number,
              Subject_Contract: this.stepFormsData.contractsForm.Subject_Contract,
              StartDate: moment(this.stepFormsData.contractsForm.StartDate_Contract, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
              GuaranteePeriod: this.stepFormsData.contractsForm.GuaranteePeriod,
              Unit: this.stepFormsData.contractsForm.Id_Unit,
              SubUnit: this.stepFormsData.contractsForm.Id_SubUnit,
              Currency: currencies.filter(v => v.Id === this.stepFormsData.contractsForm.Id_Currency)[0].currencyID,
              PMOExpert: this.stepFormsData.contractsForm.PMOExpertId_User,
              PM: this.stepFormsData.contractsForm.PMId_User.Id,
              Contractor: contractor,
              RaiPart: this.stepFormsData.contractsForm.SignatoryRaiParts,
              Importer: this.stepFormsData.contractsForm.Id_Importer,
              Standards: this.stepFormsData.contractsForm.Standards_Contract,
              Service: this.stepFormsData.contractsForm.ContractServices.map(v => +this.services.filter(v2 => v2.Id === v)[0].ServiceID),
              Zone: this.sharedService.stepFormsData.contractsForm.Zones,
              ContractKind: 1,
              VersionCode: 1,
              OperationType: this.stepFormsData.contractsForm.OperationType,
              Goal: this.stepFormsData.contractsForm.Goal,
              Demandant: this.stepFormsData.contractsForm.Demandant,
              ExecutePriority: this.stepFormsData.contractsForm.OperationalPriority,
              TenderType: this.stepFormsData.contractsForm.TenderType,
              TenderOrganizer: this.stepFormsData.contractsForm.TenderOrganizer,
              DeclareForecst: DeclareForecst,
              StartDateForecast: StartDateForecast,
              FinishDateForecast: FinishDateForecast,
              DocSendDateForecast: DocSendDateForecast,
              MinutesSignDateForecast: MinutesSignDateForecast,
              WinnerDateForecast: WinnerDateForecast,
              CreationDate: CreationDate,
            };
            // console.log(data);
            this.tempTransfer.getDataFromContextInfo().subscribe(
              (digestValue) => {
                this.tempTransfer.createBasic(digestValue, this.contractID, data, true, this.isPreContract).subscribe(
                  (rData: any) => {
                    this.contractData.Basic = {ID: rData.d.Id};
                    this.versionCheck++;
                    this.createBasicSubject.next(true);
                  }
                );
              }
            );
          });
      });
  }

  createActPCCalcs() {
    console.log('actPCCALC');
    // this.contractData.FinishDates = {ID: 4};
    this.sharedService.getAllPCProps(this.contractID).subscribe(
      (pcProps: { ID, Service }[]) => {
        this.sharedService.getAllPCs(pcProps, this.contractID).subscribe(
          (data: { ID, PCProp: { ID, Kind, Service }, Date, PC }[]) => {
            // console.log(data);
            this.sharedService.getAllPCRelations(this.contractID).subscribe(
              (pcRelations) => {
                console.log(pcRelations);
                for (let i = 0; i < pcRelations.length; i++) {
                  const finalData = data.filter(v => v.PCProp.ID === pcRelations[i].PlanPCProps || v.PCProp.ID === pcRelations[i].ActPCProp);
                  const finalDataPlan = data.filter(v => v.PCProp.ID === pcRelations[i].PlanPCProps);
                  const finalDataAct = data.filter(v => v.PCProp.ID === pcRelations[i].ActPCProp);
                  console.log(finalDataAct);
                  // this.getProgressDeviation(data, finalDataPlan, pcRelations, i);
                  const importerDates = this.stepFormsData.finalApprovalForm.filter(v => {
                    if (v.role !== 'PM' && v.role !== 'PMOExpert' && v.isApproved) {
                      return v;
                    }
                  });
                  for (let j = 0; j < finalDataAct.length; j++) {
                    // ProgressDeviation: this.getProgressDeviation({
                    //   PC: finalDataAct[j].PC,
                    //   Date: importerDates[importerDates.length - 1].date
                    // }, finalDataPlan),
                    // +this.calculationsService.getPC(finalDataAct[j].Date, finalDataPlan)
                    const pcCalcs2: { DataAct, PCRelation, ProgressDeviation, Speed, TimeDeviation, Speed4OnTime, FinishTimeForecast, FinishDates, Service, PC, Speed90D, FinishTimeForecast90, planPC, suitablePlan } = {
                      DataAct: finalDataAct[j].ID,
                      PCRelation: this.contractData.PCRelations[i].ID,
                      ProgressDeviation: this.getProgressDeviation(finalDataAct[j], finalDataPlan),
                      Speed: this.getSpeed(pcRelations, i, j, finalData, finalDataAct, this.interval),
                      Speed90D: this.getSpeed(pcRelations, i, j, finalData, finalDataAct, 90),
                      TimeDeviation: this.getTimeDeviation(j, finalDataPlan, finalDataAct),
                      Speed4OnTime: this.getSpeed4OnTime(j, finalDataPlan, finalDataAct),
                      FinishTimeForecast: null,
                      FinishDates: this.contractData.FinishDates.ID,
                      Service: finalDataAct[j].PCProp.Service,
                      PC: finalDataAct[j].PC,
                      FinishTimeForecast90: null,
                      planPC: +this.calculationsService.getPC(finalDataAct[j].Date, finalDataPlan),
                      suitablePlan: finalDataPlan[0].PCProp.ID,
                    };
                    pcCalcs2.FinishTimeForecast = this.getFinishTimeForecast(j, finalDataPlan, finalDataAct, pcCalcs2.Speed);
                    pcCalcs2.FinishTimeForecast90 = this.getFinishTimeForecast(j, finalDataPlan, finalDataAct, pcCalcs2.Speed90D);
                    this.pcCalcsTemp.push(pcCalcs2);
                    if (i === pcRelations.length - 1 && j === finalDataAct.length - 1) {
                      console.log('shotoo');
                      this.versionCheck++;
                      this.createPCRelationsSubject.next(true);
                    }
                  }
                  for (let j = 0; j < finalDataAct.length; j++) {
                    console.log(2);
                    const pcCalcs: { DataAct, PCRelation, ProgressDeviation, Speed, TimeDeviation, Speed4OnTime, FinishTimeForecast, FinishDates, Speed90D, FinishTimeForecast90, planPC, suitablePlan } = {
                      DataAct: finalDataAct[j].ID,
                      PCRelation: this.contractData.PCRelations[i].ID,
                      ProgressDeviation: this.getProgressDeviation(finalDataAct[j], finalDataPlan),
                      Speed: this.getSpeed(pcRelations, i, j, finalData, finalDataAct, this.interval),
                      Speed90D: this.getSpeed(pcRelations, i, j, finalData, finalDataAct, 90),
                      TimeDeviation: this.getTimeDeviation(j, finalDataPlan, finalDataAct),
                      Speed4OnTime: this.getSpeed4OnTime(j, finalDataPlan, finalDataAct),
                      FinishTimeForecast: null,
                      FinishDates: this.contractData.FinishDates.ID,
                      FinishTimeForecast90: null,
                      planPC: +this.calculationsService.getPC(finalDataAct[j].Date, finalDataPlan),
                      suitablePlan: finalDataPlan[0].PCProp.ID,
                    };
                    pcCalcs.FinishTimeForecast = this.getFinishTimeForecast(j, finalDataPlan, finalDataAct, pcCalcs.Speed);
                    pcCalcs.FinishTimeForecast90 = this.getFinishTimeForecast(j, finalDataPlan, finalDataAct, pcCalcs.Speed90D);
                    this.tempTransfer.getDataFromContextInfo().subscribe(
                      (digestValue) => {
                        this.tempTransfer.createActPCCalcs(digestValue, this.contractID, pcCalcs).subscribe(
                          (rData: any) => {
                          }
                        );
                      }
                    );
                    // this.getSpeed(pcRelations, i, j, finalData, finalDataAct, this.interval);
                    // this.getSpeed(pcRelations, i, j, finalData, finalDataAct, 90);
                    // this.getTimeDeviation(j, finalDataPlan, finalDataAct);
                    // this.getSpeed4OnTime(j, finalDataPlan, finalDataAct);
                    // if (i === pcRelations.length - 1 && j === finalDataAct.length - 1) {
                    //   console.log('shotoo');
                    //   this.versionCheck++;
                    //   this.versionCheck++;
                    //   this.versionCheck++;
                    //   this.createPCRelationsSubject.next(true);
                    // }
                  }
                }
                // console.log('pcCalcs', pcCalcs);
              }
            );
          }
        );
      }
    );
  }

  getProgressDeviation(data, finalDataPlan) {
    // Start progressDeviation
    const progressDeviation = this.calculationsService.progressDeviation(+this.calculationsService.getPC(data.Date, finalDataPlan), +data.PC);
    return progressDeviation;
    // console.log(progressDeviation);
  }

  getSpeed(pcRelations, i, j, finalData, finalDataAct, interval) {
    // Start Speed
    const speed = this.calculationsService.getSpeed(finalDataAct[j].Date, interval, finalDataAct, finalData, pcRelations[i].PlanPCProps);
    return speed;
    // console.log('Speed:', speed);
  }

  getTimeDeviation(j, finalDataPlan, finalDataAct) {
    // Start TimeDeviation
    const minActDate = finalDataAct[0].Date;
    const minPlanDate = finalDataPlan[0].Date;
    let startDate = minActDate;
    const actPC = finalDataAct[j];
    if (+new Date(minPlanDate) < +new Date(minActDate)) {
      startDate = minPlanDate;
    }
    const actDuration = +new Date(actPC.Date) - +new Date(startDate);
    const planEqDate = this.calculationsService.getPCDate(actPC.PC, finalDataPlan);
    const planDuration = +planEqDate - +new Date(startDate);
    if (actDuration === 0) {
      return null;
    } else {
      const timeDeviation = (+actDuration - +planDuration) / +planDuration;
      return timeDeviation;
    }
    // console.log('timeDeviation:', timeDeviation);
  }

  getSpeed4OnTime(j, finalDataPlan, finalDataAct) {
    // Start Speed4OnTime
    const maxPlanDate = finalDataPlan[finalDataPlan.length - 1].Date;
    const actPC = finalDataAct[j];
    if (+new Date(actPC.Date) < +new Date(maxPlanDate)) {
      const planEqDate = this.calculationsService.getPCDate(actPC.PC, finalDataPlan);
      const planDuration = +new Date(maxPlanDate) - +planEqDate;
      const actDuration = +new Date(maxPlanDate) - +new Date(actPC.Date);
      const speed4OnTime = +planDuration / +actDuration;
      return speed4OnTime;
    } else {
      return null;
    }
    // console.log('speed4OnTime:', speed4OnTime);
  }

  getFinishTimeForecast(j, finalDataPlan, finalDataAct, speed) {
    // Start Speed4OnTime
    const maxPlanDate = finalDataPlan[finalDataPlan.length - 1].Date;
    const actPC = finalDataAct[j];
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

  createPCs() {
    const pcPropsData: { ID, Kind, Service }[] = [];
    let counter = 0;
    this.sharedService.getContractServices().subscribe(
      (services) => {
        this.services = services;
        // this.contractData.FinishDates = {ID: 4};
        if (this.stepFormsData.progressPlansForm.date) {
          for (let i = 0; i < this.stepFormsData.progressPlansForm.data.length; i++) {
            if (this.stepFormsData.progressPlansForm.data.length < 3) {
              i = 1;
            }
            for (let j = 0; j < 2; j++) {
              let kind = 'P';
              if (j === 1) {
                kind = 'A';
              }
              const data: { Service, Kind, Number, RevNumber, DDate, FinishDateCode, ScaledFrom } = {
                Service: +this.services.filter(v => v.Id === this.stepFormsData.progressPlansForm.data[i].ServiceId)[0].ServiceID,
                Kind: kind,
                Number: '1',
                RevNumber: 1,
                DDate: moment(this.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
                FinishDateCode: this.contractData.FinishDates.ID,
                ScaledFrom: null,
              };
              if (this.stepFormsData.progressPlansForm.data.length === 2) {
                if (i === 1) {
                  this.tempTransfer.getDataFromContextInfo().subscribe(
                    (digestValue) => {
                      this.tempTransfer.createPCProps(digestValue, this.contractID, data).subscribe(
                        (rData: any) => {
                          pcPropsData.push({
                            ID: rData.d.ID,
                            Kind: rData.d.Kind,
                            Service: rData.d.Service1Id.results[0],
                          });
                          counter++;
                          if (+counter === 2) {
                            this.createPCRelations(pcPropsData);
                            this.createPCsData(pcPropsData);
                          }
                        }
                      );
                    }
                  );
                }
              } else {
                this.tempTransfer.getDataFromContextInfo().subscribe(
                  (digestValue) => {
                    this.tempTransfer.createPCProps(digestValue, this.contractID, data).subscribe(
                      (rData: any) => {
                        pcPropsData.push({
                          ID: rData.d.ID,
                          Kind: rData.d.Kind,
                          Service: rData.d.Service1Id.results[0],
                        });
                        counter++;
                        if (+counter === +this.stepFormsData.progressPlansForm.data.length * 2) {
                          this.createPCRelations(pcPropsData);
                          this.createPCsData(pcPropsData);
                        }
                      }
                    );
                  }
                );
              }
            }
          }
        } else {
          this.versionCheck++;
          this.versionCheck++;
        }
      });
  }

  createPCsData(pcPropsData: { ID, Kind, Service }[]) {
    console.log('akab', pcPropsData);
    for (let i = 0; i < this.stepFormsData.progressPlansForm.data.length; i++) {
      if (this.stepFormsData.progressPlansForm.data.length === 2) {
        if (i === 1) {
          console.log('shitty');
          const mainService = +this.services.filter(v => v.Id === this.stepFormsData.progressPlansForm.data[i].ServiceId)[0].ServiceID;
          for (let j = 0; j < this.stepFormsData.progressPlansForm.data[i - 1].act.length; j++) {
            const p: { PCProp, Date, PC } = {
              PCProp: pcPropsData.filter(v => {
                if (+v.Service === +mainService && v.Kind === 'P') {
                  return v;
                }
              })[0].ID,
              Date: moment(this.stepFormsData.progressPlansForm.date[j], 'jYYYY/jM/jD').format('MM/DD/YYYY'),
              PC: this.stepFormsData.progressPlansForm.data[i - 1].plan[j],
            };
            const a: { PCProp, Date, PC } = {
              PCProp: pcPropsData.filter(v => {
                if (+v.Service === +mainService && v.Kind === 'A') {
                  return v;
                }
              })[0].ID,
              Date: moment(this.stepFormsData.progressPlansForm.date[j], 'jYYYY/jM/jD').format('MM/DD/YYYY'),
              PC: this.stepFormsData.progressPlansForm.data[i - 1].act[j],
            };
            if (a.PC !== '' && a.PC !== null && a.PC !== undefined) {
              this.tempTransfer.getDataFromContextInfo().subscribe(
                (digestValue) => {
                  this.tempTransfer.createPCData(digestValue, this.contractID, a).subscribe(
                    (rData: any) => {
                    }
                  );
                }
              );
            }
            if (p.PC !== '' && p.PC !== null && p.PC !== undefined) {
              this.tempTransfer.getDataFromContextInfo().subscribe(
                (digestValue) => {
                  this.tempTransfer.createPCData(digestValue, this.contractID, p).subscribe(
                    (rData: any) => {
                    }
                  );
                }
              );
            }
          }
        }
      } else {
        const mainService = +this.services.filter(v => v.Id === this.stepFormsData.progressPlansForm.data[i].ServiceId)[0].ServiceID;
        for (let j = 0; j < this.stepFormsData.progressPlansForm.data[i].act.length; j++) {
          const p: { PCProp, Date, PC } = {
            PCProp: pcPropsData.filter(v => {
              if (+v.Service === +mainService && v.Kind === 'P') {
                return v;
              }
            })[0].ID,
            Date: moment(this.stepFormsData.progressPlansForm.date[j], 'jYYYY/jM/jD').format('MM/DD/YYYY'),
            PC: this.stepFormsData.progressPlansForm.data[i].plan[j],
          };
          const a: { PCProp, Date, PC } = {
            PCProp: pcPropsData.filter(v => {
              if (+v.Service === +mainService && v.Kind === 'A') {
                return v;
              }
            })[0].ID,
            Date: moment(this.stepFormsData.progressPlansForm.date[j], 'jYYYY/jM/jD').format('MM/DD/YYYY'),
            PC: this.stepFormsData.progressPlansForm.data[i].act[j],
          };
          if (a.PC !== '' && a.PC !== null && a.PC !== undefined) {
            this.tempTransfer.getDataFromContextInfo().subscribe(
              (digestValue) => {
                this.tempTransfer.createPCData(digestValue, this.contractID, a).subscribe(
                  (rData: any) => {
                  }
                );
              }
            );
          }
          if (p.PC !== '' && p.PC !== null && p.PC !== undefined) {
            this.tempTransfer.getDataFromContextInfo().subscribe(
              (digestValue) => {
                this.tempTransfer.createPCData(digestValue, this.contractID, p).subscribe(
                  (rData: any) => {
                  }
                );
              }
            );
          }
        }
      }
    }
  }

  createPCRelations(pcPropsData: { ID, Kind, Service }[]) {
    console.log('pcRel', pcPropsData);
    for (let i = 0; i < pcPropsData.length / 2; i++) {
      const serviceM = Array.from(new Set(pcPropsData.map(v => v.Service)));
      const data: { ActPCProp, PlanPCProps } = {
        ActPCProp: pcPropsData.filter(v => {
          if (v.Service === serviceM[i] && v.Kind === 'A') {
            return v;
          }
        })[0].ID,
        PlanPCProps: pcPropsData.filter(v => {
          if (v.Service === serviceM[i] && v.Kind === 'P') {
            return v;
          }
        })[0].ID,
      };
      this.tempTransfer.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.tempTransfer.createPCRelations(digestValue, this.contractID, data).subscribe(
            (rData: any) => {
              // console.log(rData);
              this.contractData.PCRelations.push({ID: rData.d.Id});
              if (i === (pcPropsData.length / 2) - 1) {
                // console.log(this.contractData.PCRelations, 'PC Relations');
                this.createActPCCalcs();
              }
            }
          );
        }
      );
    }
  }

  createDelItems() {
    // const data: { Deliverable, OperationType }[] = [];
    this.delCounts = this.delCounts + this.stepFormsData.deliverablesForm.length;
    for (let i = 0; i < this.stepFormsData.deliverablesForm.length; i++) {
      if (this.stepFormsData.deliverablesForm[i].name_Deliverable) {
        for (let j = 0; j < this.stepFormsData.deliverablesForm[i].name_Deliverable.length; j++) {
          const data: { Deliverable, OperationType } = {
            Deliverable: +this.stepFormsData.deliverablesForm[i].name_Deliverable[j].Id,
            OperationType: +this.stepFormsData.deliverablesForm[i].operationTypes_deliverables[j].Id,
          };
          const importerDates: any = this.stepFormsData.finalApprovalForm.filter(v => {
            if (v.role !== 'PM' && v.role !== 'PMOExpert' && v.isApproved) {
              return v;
            }
          });
          // console.log(this.stepFormsData.deliverablesForm[i].data[j], 'ajabz');
          let lastDel: any = [];
          let actSum = 0;
          let planSum = 0;
          for (let fn1 = 0; fn1 < this.stepFormsData.deliverablesForm[i].data[j].length / 2; fn1++) {
            this.stepFormsData.deliverablesForm[i].data[j][(fn1 * 2) + 1].filter((v, index) => {
              if (v !== '' && v !== null && v !== undefined && v !== 0) {
                actSum = actSum + v;
                lastDel.push(importerDates[importerDates.length - 1].date);
              }
            });
          }
          let lastDate2 = null;
          lastDel = lastDel.sort((a, b) => +new Date(a) > +new Date(b));
          if (lastDel[lastDel.length - 1]) {
            lastDate2 = importerDates[importerDates.length - 1].date;
            for (let fn1 = 0; fn1 < this.stepFormsData.deliverablesForm[i].data[j].length / 2; fn1++) {
              this.stepFormsData.deliverablesForm[i].data[j][fn1 * 2].filter((v, index) => {
                if (v !== '' && v !== null && v !== undefined && v !== 0 && +new Date(this.stepFormsData.deliverablesForm[i].date[j][index]) <= +new Date(lastDate2)) {
                  planSum = planSum + v;
                }
              });
            }
          } else {
            for (let fn1 = 0; fn1 < this.stepFormsData.deliverablesForm[i].data[j].length / 2; fn1++) {
              this.stepFormsData.deliverablesForm[i].data[j][fn1 * 2].filter((v, index) => {
                if (v !== '' && v !== null && v !== undefined && v !== 0 && +new Date(this.stepFormsData.deliverablesForm[i].date[j][index]) <= +new Date(importerDates)) {
                  planSum = planSum + v;
                }
              });
            }
            lastDate2 = importerDates[importerDates.length - 1].date;
          }


          // console.log(lastDel[lastDel.length - 1], 'ajabz');

          this.lasts.del.push({
            Del: +this.stepFormsData.deliverablesForm[i].name_Deliverable[j].Id,
            Op: +this.stepFormsData.deliverablesForm[i].operationTypes_deliverables[j].Id,
            TotalVal: +this.stepFormsData.deliverablesForm[i].value_Deliverable[j],
            Date: importerDates[importerDates.length - 1].date,
            ActSum: actSum,
            PlanSum: planSum,
          });
          this.tempTransfer.getDataFromContextInfo().subscribe(
            (digestValue) => {
              this.tempTransfer.createDelItems(digestValue, this.contractID, data, this.isPreContract).subscribe(
                (rData: any) => {
                  this.contractData.DelItems = {ID: rData.d.Id};
                  this.createDelItemsSubject.next(true);
                  this.createDelProps(rData.d.Id, this.stepFormsData.deliverablesForm[i].value_Deliverable[j], this.stepFormsData.deliverablesForm[i].zone_deliverables[j], this.stepFormsData.deliverablesForm[i].data[j], this.stepFormsData.deliverablesForm[i].date[j]);
                }
              );
            }
          );
        }
      }
    }
  }

  createDelProps(id: number, totalValue: any, zones: any, delData: any, delDate: any) {
    const data: { DelItem, Kind }[] = [];
    const kinds = ['A', 'P'];
    for (let i = 0; i < kinds.length; i++) {
      data.push({
        DelItem: id,
        Kind: kinds[i]
      });
      this.tempTransfer.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.tempTransfer.createDelProps(digestValue, this.contractID, data[i], this.isPreContract).subscribe(
            (rData: any) => {
              this.createDelPropsRevs(rData.d.Id, totalValue, kinds[i], zones, delData, delDate);
              // this.contractData.DelItems = {ID: rData.d.Id};
            }
          );
        }
      );
    }
  }

  createDelPropsRevs(id: number, totalValue: any, kind: string, zones: any, delData: any, delDate: any) {
    // this.contractData.FinishDates = {ID: 4};
    let data: { DelProp, RevNumber, DDate, FinishDateCode, TotalValue };
    data = {
      DelProp: id,
      RevNumber: 1,
      DDate: moment(this.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
      FinishDateCode: this.contractData.FinishDates.ID,
      TotalValue: +totalValue,
    };
    if (kind === 'A') {
      data.TotalValue = null;
    }
    this.tempTransfer.getDataFromContextInfo().subscribe(
      (digestValue) => {
        this.tempTransfer.createDelPropsRevs(digestValue, this.contractID, data, this.isPreContract).subscribe(
          (rData: any) => {
            this.contractData.DelPropsRev.push({ID: rData.d.Id});
            this.delCounts++;
            if (this.stepFormsData.deliverablesForm.length * 2 === this.delCounts) {
              this.versionCheck++;
              this.createDelPropsRevsSubject.next(true);
            }
            this.createDels(rData.d.Id, zones, delData, delDate, {delPropsRevs: rData.d.Id, kind: kind});
            // this.contractData.DelItems = {ID: rData.d.Id};
          }
        );
      }
    );
  }

  createDels(id: number, zones: any, delData: any, delDate: any, delRevKind) {
    // const data: { Date, Zone, Value, DelPropsRev }[] = [];
    let counter = 0;
    // console.log(delData, 'delData');
    if (delRevKind.kind === 'A') {
      for (let i = 0; i < delData.length; i++) {
        if (i % 2 !== 0) {
          for (let j = 0; j < delData[i].length; j++) {
            if (delData[i][j] !== '' && delData[i][j] !== null && delData[i][j] !== undefined && delData[i][j] !== 0) {
              let mainZones = null;
              if (zones) {
                mainZones = zones[counter];
              }
              const data2: { Date, Zone, Value, DelPropsRev } = {
                Date: moment(delDate[j], 'jYYYY/jM/jD').format('MM/DD/YYYY'),
                Zone: mainZones,
                Value: delData[i][j],
                DelPropsRev: delRevKind.delPropsRevs,
              };
              this.tempTransfer.getDataFromContextInfo().subscribe(
                (digestValue) => {
                  this.tempTransfer.createDels(digestValue, this.contractID, data2, this.isPreContract).subscribe(
                    (rData: any) => {
                      // this.contractData.DelItems = {ID: rData.d.Id};
                    }
                  );
                }
              );
            }
          }
          counter++;
        }
      }
    } else {
      for (let i = 0; i < delData.length; i++) {
        if (i % 2 === 0) {
          for (let j = 0; j < delData[i].length; j++) {
            if (delData[i][j] !== '' && delData[i][j] !== null && delData[i][j] !== undefined && delData[i][j] !== 0) {
              let mainZones = null;
              if (zones) {
                mainZones = zones[counter];
              }
              const data2: { Date, Zone, Value, DelPropsRev } = {
                Date: moment(delDate[j], 'jYYYY/jM/jD').format('MM/DD/YYYY'),
                Zone: mainZones,
                Value: delData[i][j],
                DelPropsRev: delRevKind.delPropsRevs,
              };
              this.tempTransfer.getDataFromContextInfo().subscribe(
                (digestValue) => {
                  this.tempTransfer.createDels(digestValue, this.contractID, data2, this.isPreContract).subscribe(
                    (rData: any) => {
                      // this.contractData.DelItems = {ID: rData.d.Id};
                    }
                  );
                }
              );
            }
          }
          counter++;
        }
      }
    }
    // for (let i = 0; i < zones.length; i++) {
    //   console.log(delData[(i * 2)]);
    //   for (let j = 0; j < delData[(i * 2)].length; j++) {
    //     console.log(delData[(i * 2)][j]);
    //     data.push({
    //       Date: moment(delDate[j], 'jYYYY/jM/jD').format('MM/DD/YYYY'),
    //       Zone: zones[i],
    //       Value: delData[(i * 2)][j],
    //       DelPropsRev: id,
    //     });
    //     counter++;
    //     this.tempTransfer.getDataFromContextInfo().subscribe(
    //       (digestValue) => {
    //         this.tempTransfer.createDels(digestValue, this.contractID, data[counter - 1]).subscribe(
    //           (rData: any) => {
    //             // this.contractData.DelItems = {ID: rData.d.Id};
    //           }
    //         );
    //       }
    //     );
    //   }
    // for (let j = 0; j < delData[(i * 2)].length; j++) {
    //
    // }
    // }
  }

  createDeliverables() {
    this.createDelItems();
  }

  createFinacialPayments() {
    const data: { FiscalYear, FinancialRequestType, LetterDate, Date, VoucherNum, VoucherDescription, GrossAmount, Deposits, PayableInsurance, Tax, PrepaidDepreciation, MaterialPrepaidDepreciation, Fine, TotalDeductions, VAT, EmployerInsurance, TreasuryBillsProfit, NetAmount, CostResource, FinancialPaymentType, OtherDeductions }[] = [];
    this.lasts.financial.LastPaymentDate = [];
    for (let i = 0; i < this.stepFormsData.financialPayments.length; i++) {
      if (this.mainLastFinancialDate) {
        if (+new Date(this.stepFormsData.financialPayments[i].Date1) >= +new Date(this.mainLastFinancialDate)) {
          this.mainLastFinancialDate = moment(this.stepFormsData.financialPayments[i].Date1, 'jYYYY/jM/jD').format('MM/DD/YYYY');
        }
      } else {
        this.mainLastFinancialDate = moment(this.stepFormsData.financialPayments[i].Date1, 'jYYYY/jM/jD').format('MM/DD/YYYY');
      }
      let financialRequestType = null;
      if (this.stepFormsData.financialPayments[i].FinancialRequestType) {
        financialRequestType = +this.stepFormsData.financialPayments[i].FinancialRequestType.ID;
      }
      data.push({
        FiscalYear: +this.stepFormsData.financialPayments[i].FiscalYear,
        FinancialRequestType: financialRequestType,
        LetterDate: moment(this.stepFormsData.financialPayments[i].LetterDate, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
        Date: moment(this.stepFormsData.financialPayments[i].Date1, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
        VoucherNum: this.stepFormsData.financialPayments[i].VoucherNum,
        VoucherDescription: this.stepFormsData.financialPayments[i].VoucherDescription,
        GrossAmount: +this.stepFormsData.financialPayments[i].GrossAmount,
        Deposits: +this.stepFormsData.financialPayments[i].Deposits,
        PayableInsurance: +this.stepFormsData.financialPayments[i].PayableInsurance,
        Tax: +this.stepFormsData.financialPayments[i].Tax,
        PrepaidDepreciation: +this.stepFormsData.financialPayments[i].PrepaidDepreciation,
        MaterialPrepaidDepreciation: +this.stepFormsData.financialPayments[i].MaterialPrepaidDepreciation,
        Fine: +this.stepFormsData.financialPayments[i].Fine,
        TotalDeductions: +this.stepFormsData.financialPayments[i].TotalDeductions,
        VAT: +this.stepFormsData.financialPayments[i].VAT,
        EmployerInsurance: +this.stepFormsData.financialPayments[i].EmployerInsurance,
        TreasuryBillsProfit: +this.stepFormsData.financialPayments[i].TreasuryBillsProfit,
        NetAmount: +this.stepFormsData.financialPayments[i].NetAmount,
        CostResource: +this.stepFormsData.financialPayments[i].CostResource,
        FinancialPaymentType: +this.stepFormsData.financialPayments[i].PaymentType,
        OtherDeductions: +this.stepFormsData.financialPayments[i].OtherDeductions,
      });
      console.log(data);
      this.lasts.financial.LastPaymentDate.push(data[i].Date);
      this.tempTransfer.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.lasts.financial.TotalGrossPayment = this.lasts.financial.TotalGrossPayment + +this.stepFormsData.financialPayments[i].GrossAmount;
          this.lasts.financial.TotalNetPayment = this.lasts.financial.TotalNetPayment + +this.stepFormsData.financialPayments[i].NetAmount;
          this.financialCounter++;
          this.tempTransfer.createFinancialPayments(digestValue, this.contractID, data[i]).subscribe();
        }
      );
    }
  }

  createFinacialRequests() {
    const data: { FiscalYear, FinancialRequestType, LetterDate, Date, VoucherNum, VoucherDescription, GrossAmount, Deposits, PayableInsurance, Tax, PrepaidDepreciation, MaterialPrepaidDepreciation, Fine, TotalDeductions, VAT, EmployerInsurance, TreasuryBillsProfit, NetAmount, OtherDeductions }[] = [];
    let totalInvoice = 0;
    this.lasts.financial.LastRequestDate = [];
    for (let i = 0; i < this.stepFormsData.financialRequests.length; i++) {
      if (this.stepFormsData.financialRequests[i].FinancialRequestType.ID === 1) {
        totalInvoice = totalInvoice + this.stepFormsData.financialRequests[i].GrossAmount;
      }
      if (this.mainLastFinancialDate) {
        if (+new Date(this.stepFormsData.financialRequests[i].Date1) >= +new Date(this.mainLastFinancialDate)) {
          this.mainLastFinancialDate = moment(this.stepFormsData.financialRequests[i].Date1, 'jYYYY/jM/jD').format('MM/DD/YYYY');
        }
      } else {
        this.mainLastFinancialDate = moment(this.stepFormsData.financialRequests[i].Date1, 'jYYYY/jM/jD').format('MM/DD/YYYY');
      }
      data.push({
        FiscalYear: +this.stepFormsData.financialRequests[i].FiscalYear,
        FinancialRequestType: +this.stepFormsData.financialRequests[i].FinancialRequestType.ID,
        LetterDate: moment(this.stepFormsData.financialRequests[i].LetterDate, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
        Date: moment(this.stepFormsData.financialRequests[i].Date1, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
        VoucherNum: this.stepFormsData.financialRequests[i].VoucherNum,
        VoucherDescription: this.stepFormsData.financialRequests[i].VoucherDescription,
        GrossAmount: +this.stepFormsData.financialRequests[i].GrossAmount,
        Deposits: +this.stepFormsData.financialRequests[i].Deposits,
        PayableInsurance: +this.stepFormsData.financialRequests[i].PayableInsurance,
        Tax: +this.stepFormsData.financialRequests[i].Tax,
        PrepaidDepreciation: +this.stepFormsData.financialRequests[i].PrepaidDepreciation,
        MaterialPrepaidDepreciation: +this.stepFormsData.financialRequests[i].MaterialPrepaidDepreciation,
        Fine: +this.stepFormsData.financialRequests[i].Fine,
        TotalDeductions: +this.stepFormsData.financialRequests[i].TotalDeductions,
        VAT: +this.stepFormsData.financialRequests[i].VAT,
        EmployerInsurance: +this.stepFormsData.financialRequests[i].EmployerInsurance,
        TreasuryBillsProfit: +this.stepFormsData.financialRequests[i].TreasuryBillsProfit,
        NetAmount: +this.stepFormsData.financialRequests[i].NetAmount,
        OtherDeductions: +this.stepFormsData.financialRequests[i].OtherDeductions,
      });
      console.log(data);
      this.lasts.financial.LastRequestDate.push(data[i].Date);
      this.tempTransfer.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.lasts.financial.TotalGrossRequest = this.lasts.financial.TotalGrossRequest + +this.stepFormsData.financialRequests[i].GrossAmount;
          this.lasts.financial.TotalNetRequest = this.lasts.financial.TotalNetRequest + +this.stepFormsData.financialRequests[i].NetAmount;
          this.lasts.financial.TotalInvoice = totalInvoice;
          this.financialCounter++;
          this.tempTransfer.createFinancialRequests(digestValue, this.contractID, data[i]).subscribe();
        }
      );
    }
  }

  createCashFlowPlans() {
    // this.contractData.CashFlowPlansProp = {ID: 2};
    const data: { CashFlowPlansPropCode, Date, Cost }[] = [];
    for (let i = 0; i < this.stepFormsData.cashFlowPlanForm.date.length; i++) {
      if (this.stepFormsData.cashFlowPlanForm.data[i] !== null && this.stepFormsData.cashFlowPlanForm.data[i] !== undefined) {
        data.push({
          CashFlowPlansPropCode: this.contractData.CashFlowPlansProp.ID,
          Date: moment(this.stepFormsData.cashFlowPlanForm.date[i], 'jYYYY/jM/jD').format('MM/DD/YYYY'),
          Cost: +this.stepFormsData.cashFlowPlanForm.data[i],
        });
        this.tempTransfer.getDataFromContextInfo().subscribe(
          (digestValue) => {
            this.tempTransfer.createCashFlowPlans(digestValue, this.contractID, data[i], this.isPreContract).subscribe(
              (rData: any) => {
              }
            );
          }
        );
      }
    }
  }

  createCashFlowPlansProp() {
    // this.contractData.Costs = {ID: 13};
    // this.contractData.FinishDates = {ID: 4};
    const data: { DDate, CostCode, FinishDateCode } = {
      DDate: moment(this.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
      CostCode: +this.contractData.Costs.ID,
      FinishDateCode: +this.contractData.FinishDates.ID
    };
    this.tempTransfer.getDataFromContextInfo().subscribe(
      (digestValue) => {
        this.tempTransfer.createCashFlowPlansProp(digestValue, this.contractID, data, this.isPreContract).subscribe(
          (rData: any) => {
            this.contractData.CashFlowPlansProp = {ID: rData.d.ID};
            this.createCashFlowPlansPropSubject.next(true);
            // console.log(data.d.ID);
          }
        );
      }
    );
  }

  createStakeHolders() {
    // this.contractData.Costs = {ID: 13};
    const data: { OrgName, Role, AgentName, AgentPosition, PhoneNumber, LocationAddress, Email, IsPillar, DDate }[] = [];
    for (let i = 0; i < this.stepFormsData.stackHoldersForm.length; i++) {
      data.push({
        OrgName: this.stepFormsData.stackHoldersForm[i].OragnizationName_StakeholdersCon,
        Role: this.stepFormsData.stackHoldersForm[i].Role_StakeholdersContract,
        AgentName: this.stepFormsData.stackHoldersForm[i].AgentName_StakeholdersContract,
        AgentPosition: +this.stepFormsData.stackHoldersForm[i].Id_ContractAgentPostions,
        PhoneNumber: this.stepFormsData.stackHoldersForm[i].pish_PhoneNumber_StakeholdersContract + '-' + this.stepFormsData.stackHoldersForm[i].PhoneNumber_StakeholdersContract + '-(داخلی)-' + this.stepFormsData.stackHoldersForm[i].int_PhoneNumber_StakeholdersContract,
        LocationAddress: this.stepFormsData.stackHoldersForm[i].Address_StakeholdersContract,
        Email: this.stepFormsData.stackHoldersForm[i].Email_StakeholdersContract,
        IsPillar: true,
        DDate: moment(this.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
      });
      this.tempTransfer.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.tempTransfer.createStakeHolders(digestValue, this.contractID, data[i], this.isPreContract).subscribe();
        }
      );
    }
    const dataNotPillar: { OrgName, Role, AgentName, AgentPosition, PhoneNumber, LocationAddress, Email, IsPillar, DDate }[] = [];
    for (let i = 0; i < this.stepFormsData.stackHoldersForm2.length; i++) {
      dataNotPillar.push({
        OrgName: this.stepFormsData.stackHoldersForm2[i].OragnizationName_StakeholdersCon,
        Role: this.stepFormsData.stackHoldersForm2[i].Role_StakeholdersContract,
        AgentName: this.stepFormsData.stackHoldersForm2[i].AgentName_StakeholdersContract,
        AgentPosition: +this.stepFormsData.stackHoldersForm2[i].Id_ContractAgentPostions,
        PhoneNumber: this.stepFormsData.stackHoldersForm2[i].pish_PhoneNumber_StakeholdersContract + '-' + this.stepFormsData.stackHoldersForm[i].PhoneNumber_StakeholdersContract + '-(داخلی)-' + this.stepFormsData.stackHoldersForm[i].int_PhoneNumber_StakeholdersContract,
        LocationAddress: this.stepFormsData.stackHoldersForm2[i].Address_StakeholdersContract,
        Email: this.stepFormsData.stackHoldersForm2[i].Email_StakeholdersContract,
        IsPillar: false,
        DDate: moment(this.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
      });
      this.tempTransfer.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.tempTransfer.createStakeHolders(digestValue, this.contractID, dataNotPillar[i], this.isPreContract).subscribe();
        }
      );
    }
  }

  createAssignedCostReses() {
    // this.contractData.Costs = {ID: 13};
    const data: { CostCode, DDate, CostResource, Cost }[] = [];
    for (let i = 0; i < this.stepFormsData.assignedCostResourcesForm.CostResources.length; i++) {
      data.push({
        CostCode: this.contractData.Costs.ID,
        DDate: moment(this.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
        CostResource: +this.stepFormsData.assignedCostResourcesForm.CostResources[i],
        Cost: +this.stepFormsData.assignedCostResourcesForm.hobbies[i],
      });
      this.lasts.costAssignedReses.push({
        Cost: +this.stepFormsData.assignedCostResourcesForm.hobbies[i],
        ResID: +this.stepFormsData.assignedCostResourcesForm.CostResources[i],
      });
      this.tempTransfer.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.tempTransfer.createAssignedCostReses(digestValue, this.contractID, data[i], this.isPreContract).subscribe(
            (rData: any) => {
            }
          );
        }
      );
    }
  }

  createServiceCosts() {
    this.sharedService.getContractServices().subscribe(
      (services) => {
        this.services = services;
        console.log('shit0');
        if (this.stepFormsData.progressPlansForm.date) {
          for (let i = 0; i < this.stepFormsData.progressPlansForm.data.length; i++) {
            console.log('shit');
            const importerDates = this.stepFormsData.finalApprovalForm.filter(v => {
              if (v.role !== 'PM' && v.role !== 'PMOExpert' && v.isApproved) {
                return v;
              }
            });
            let actPCData;
            let pcData;
            let actPC;
            if (this.stepFormsData.progressPlansForm.data.length === 2) {
              if (i === 1) {
                actPCData = this.stepFormsData.progressPlansForm.data[i - 1];
                pcData = [];
                actPC = 0;
                if (actPCData) {
                  for (let k = 0; k < actPCData.act.length; k++) {
                    pcData.push({
                      ID: k,
                      PCProp: null,
                      Date: this.stepFormsData.progressPlansForm.date[k],
                      PC: actPCData.plan[k],
                    });
                    if (actPCData.act[k] > actPC) {
                      actPC = actPCData.act[k];
                    }
                  }
                }
              }
            } else {
              actPCData = this.stepFormsData.progressPlansForm.data[i];
              pcData = [];
              actPC = 0;
              if (actPCData) {
                for (let k = 0; k < actPCData.act.length; k++) {
                  pcData.push({
                    ID: k,
                    PCProp: null,
                    Date: this.stepFormsData.progressPlansForm.date[k],
                    PC: actPCData.plan[k],
                  });
                  if (actPCData.act[k] > actPC) {
                    actPC = actPCData.act[k];
                  }
                }
              }
            }
            if (this.stepFormsData.progressPlansForm.data.length === 2) {
              if (i === 1) {
                this.lasts.pc.push({
                  Date: moment(importerDates[importerDates.length - 1].date, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
                  Service: +this.services.filter(v => v.Id === this.stepFormsData.progressPlansForm.data[i].ServiceId)[0].ServiceID,
                  PlanPC: this.calculationsService.getPC(importerDates[importerDates.length - 1].date, pcData),
                  ActPC: actPC,
                });
              }
            } else {
              this.lasts.pc.push({
                Date: moment(importerDates[importerDates.length - 1].date, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
                Service: +this.services.filter(v => v.Id === this.stepFormsData.progressPlansForm.data[i].ServiceId)[0].ServiceID,
                PlanPC: this.calculationsService.getPC(importerDates[importerDates.length - 1].date, pcData),
                ActPC: actPC,
              });
            }
            // console.log(this.lasts);
          }
        }
        // this.contractData.Costs = {ID: 13};
        const data: { CostCode, DDate, Service, Cost }[] = [];
        const importerDates = this.stepFormsData.finalApprovalForm.filter(v => {
          if (v.role !== 'PM' && v.role !== 'PMOExpert' && v.isApproved) {
            return v;
          }
        });
        for (let i = 0; i < this.stepFormsData.contractsForm.ContractServices.length; i++) {
          data.push({
            CostCode: this.contractData.Costs.ID,
            DDate: moment(this.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
            Service: +this.services.filter(v => v.Id === this.stepFormsData.contractsForm.ContractServices[i])[0].ServiceID,
            Cost: +this.stepFormsData.contractsForm.Costs[i],
          });
          this.lasts.serviceCost.push({
            Cost: +this.stepFormsData.contractsForm.Costs[i],
            Service: +this.services.filter(v => v.Id === this.stepFormsData.contractsForm.ContractServices[i])[0].ServiceID,
          });

          // actPCData = this.stepFormsData.progressPlansForm.data.filter(v => v.ServiceId === this.stepFormsData.contractsForm.ContractServices[i])[0];
          //  for (let k = 0; k < actPCData.act.length; k++) {
          //    if (actPCData.act[k] > actPC) {
          //      actPC = actPCData.act[k];
          //    }
          //  }
          this.tempTransfer.getDataFromContextInfo().subscribe(
            (digestValue) => {
              this.tempTransfer.createServiceCosts(digestValue, this.contractID, data[i], this.isPreContract).subscribe(
                (rData: any) => {
                  this.contractData.ServiceCosts.push({ID: rData.d.ID});
                  this.createServiceCostsSubject.next(true);
                }
              );
            }
          );
        }
      }
    );
  }

  createCosts() {
    const data: { DDate, Cost, EqCost } = {
      DDate: moment(this.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
      Cost: +this.stepFormsData.contractsForm.Cost_Costs,
      EqCost: this.stepFormsData.contractsForm.Cost_EqCosts
    };
    this.tempTransfer.getDataFromContextInfo().subscribe(
      (digestValue) => {
        this.tempTransfer.createCosts(digestValue, this.contractID, data, this.isPreContract).subscribe(
          (rData: any) => {
            this.contractData.Costs = {ID: rData.d.ID};
            this.versionCheck++;
            this.createCostsSubject.next(true);
            // console.log(data.d.ID);
          }
        );
      }
    );
  }

  createFinishDate() {
    const data: { DDate, FinishDate } = {
      DDate: moment(this.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
      FinishDate: moment(this.stepFormsData.contractsForm.FinishDate_Contract, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
    };
    this.tempTransfer.getDataFromContextInfo().subscribe(
      (digestValue) => {
        this.tempTransfer.createFinishDate(digestValue, this.contractID, data, this.isPreContract).subscribe(
          (rData: any) => {
            this.contractData.FinishDates = {ID: rData.d.ID};
            this.versionCheck++;
            this.createFinishDateSubject.next(true);
          }
        );
      }
    );
  }
}
