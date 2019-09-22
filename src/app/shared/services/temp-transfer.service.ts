import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {SharedService} from './shared.service';
import {StepContractFormList} from '../models/stepFormModels/stepContractForm.model';
import {StepStackHoldersFormList} from '../models/stepFormModels/stepStackHoldersForm.model';
import {StepProgressPlansFormList} from '../models/stepFormModels/stepProgressPlansForm.model';
import {StepDeliverablesFormList} from '../models/stepFormModels/stepDeliverablesForm.model';
import {StepCashFlowPlanFormList} from '../models/stepFormModels/stepCashFlowPlanForm.model';
import {StepAssignedCostResourcesFormList} from '../models/stepFormModels/stepAssignedCostResourcesForm.model';
import * as moment from 'jalali-moment';
import {ShamsiToMiladiPipe} from '../pipes/shamsi-to-miladi.pipe';
import {map} from 'rxjs/internal/operators';

@Injectable()
export class TempTransferService {
  stepFormsData: {
    contractsForm: StepContractFormList,
    stackHoldersForm: StepStackHoldersFormList[],
    stackHoldersForm2: StepStackHoldersFormList[],
    progressPlansForm: StepProgressPlansFormList,
    deliverablesForm: StepDeliverablesFormList[],
    cashFlowPlanForm: StepCashFlowPlanFormList,
    assignedCostResourcesForm: StepAssignedCostResourcesFormList
  };

  constructor(private http: HttpClient,
              private sharedService: SharedService,
              private shamsiToMiladiPipe: ShamsiToMiladiPipe) {
  }


  createVersion(DigestValue: any, id: number, data: { DDate, Basic, CostCode, FinishDateCode, PCRelation, DelPropsRev }, isPreContract = false) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    let body;
    let url;
    // console.log(data);
    if (isPreContract) {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/pre-contract/_api/web/lists/getbytitle(\'Versions\')/items';
      body = {
        '__metadata': {'type': 'SP.Data.VersionsListItem'},
        DDate: data.DDate,
        BasicId: {'results': [data.Basic]},
        CostCodeId: {'results': [data.CostCode]},
        FinishDateCodeId: {'results': [data.FinishDateCode]},
        PCRelationId: {'results': data.PCRelation},
        DelPropsRevId: {'results': data.DelPropsRev},
      };
    } else {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/_api/web/lists/getbytitle(\'Versions\')/items';
      body = {
        '__metadata': {'type': 'SP.Data.VersionsListItem'},
        DDate: data.DDate,
        BasicId: {'results': [data.Basic]},
        CostCodeId: {'results': [data.CostCode]},
        FinishDateCodeId: {'results': [data.FinishDateCode]},
        PCRelationId: {'results': data.PCRelation},
        DelPropsRevId: {'results': data.DelPropsRev},
      };
    }

    return this.http.post(
      url,
      body,
      {headers: headers}
    );
  }


  updateVersion(DigestValue, contractCode: number, versionCode: number, data: any, type: string) {
    let body;
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
      'IF-MATCH': '*',
      'X-HTTP-Method': 'MERGE'
    });
    if (type === 'cost') {
      body = {
        '__metadata': {'type': 'SP.Data.VersionsListItem'},
        'CostCodeId ': {'results': [data]},

      };
    }
    if (type === 'basic') {
      body = {
        '__metadata': {'type': 'SP.Data.VersionsListItem'},
        'BasicId': {'results': [data]},
      };
    }
    if (type === 'finishDate') {
      body = {
        '__metadata': {'type': 'SP.Data.VersionsListItem'},
        'FinishDateCodeId': {'results': [data]},
      };
    }
    return this.http.post(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'Versions\')/items(\'' + versionCode + '\')',
      body,
      {headers: headers}
    );
  }

  updateContract(DigestValue: any, id, data: any, type?: string) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
      'IF-MATCH': '*',
      'X-HTTP-Method': 'MERGE'
    });
    let body;
    if (type === 'pc') {
      console.log(data);
      // data.calcs.Date = moment(data.calcs.Date, 'YYYY/M/D').format('jYYYY/jMM/jDD');
      body = {
        '__metadata': {'type': 'SP.Data.ContractsListItem'},
        'PCCalcs_Last': JSON.stringify(data.calcs),
        'PC_Last': JSON.stringify(data.pc),
      };
    } else if (type === 'del') {
      body = {
        '__metadata': {'type': 'SP.Data.ContractsListItem'},
        'Del_Last': JSON.stringify(data.del),
      };
    } else if (type === 'finance') {
      // data.calcs.Date = moment(data.financial.Date).format('jYYYY/jMM/jDD');
      // data.calcs.Date = moment(data.financial.LastPaymentDate).format('jYYYY/jMM/jDD');
      // data.calcs.Date = moment(data.financial.LastRequestDate).format('jYYYY/jMM/jDD');
      body = {
        '__metadata': {'type': 'SP.Data.ContractsListItem'},
        'Financial_Last': JSON.stringify(data.financial),
      };
    } else {
      body = {
        '__metadata': {'type': 'SP.Data.ContractsListItem'},
        'Json': JSON.stringify(this.stepFormsData),
        'PC_Last': JSON.stringify(data.pc),
        'PCCalcs_Last': JSON.stringify(data.calcs),
        'Financial_Last': JSON.stringify(data.financial),
        'ServiceCost_Last': JSON.stringify(data.serviceCost),
        'Del_Last': JSON.stringify(data.del),
        'AssignedCostReses_Last': JSON.stringify(data.costAssignedReses)
      };
    }


    // console.log(body);
    return this.http.post(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Contracts\')/items(' + id + ')',
      body,
      {headers: headers}
    );
  }

  createContract(DigestValue: any, data: { Title, ShortTitle, Number, Subject_Contract, StartDate, DDate, GuaranteePeriod, Unit, SubUnit, Currency, PMOExpert, PM, Contractor, RaiPart, Importer, Standards, Service, Zone, ContractKind, Cost, VersionCode, Del_Last, FinishDate,
    OperationType, Goal, Demandant, ExecutePriority, TenderType, TenderOrganizer, DeclareForecst, StartDateForecast, FinishDateForecast, DocSendDateForecast, MinutesSignDateForecast, WinnerDateForecast, CreationDate, ContractStatus?: any}, isPreContract = false) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    // console.log(data);
    let body;
    console.log(data.Importer);
    if (isPreContract) {
      body = {
        '__metadata': {'type': 'SP.Data.ContractsListItem'},
        Title: data.Title,
        ShortTitle: data.ShortTitle,
        Number: data.Number,
        Subject_Contract: data.Subject_Contract,
        StartDate1: data.StartDate,
        DDate: data.DDate,
        GuaranteePeriod: data.GuaranteePeriod,
        UnitId: {'results': [data.Unit]},
        SubUnitId: data.SubUnit,
        CurrencyId: data.Currency,
        PMOExpertId: data.PMOExpert,
        PMId: data.PM,
        RaiPartId: data.RaiPart,
        ImporterId: data.Importer,
        Standards: data.Standards,
        Service1Id: {'results': data.Service},
        ZoneId: {'results': data.Zone},
        ContractKindId: data.ContractKind,
        LastVersion: data.VersionCode,
        Cost: data.Cost,
        FinishDate: data.FinishDate,
        OperationTypeId: {'results': [data.OperationType]},
        Goal1Id: data.Goal,
        DemandantId: data.Demandant,
        ExecutePriority: data.ExecutePriority,
        ContractStatusId: data.ContractStatus,
        TenderTypeId: data.TenderType,
        TenderOrganizerId: data.TenderOrganizer,
        DeclareDateForecast: data.DeclareForecst,
        StartDateForecast: data.StartDateForecast,
        FinishDateForecast: data.FinishDateForecast,
        DocSendDateForecast: data.DocSendDateForecast,
        MinutesSignDateForecast: data.MinutesSignDateForecast,
        WinnerDateForecast: data.WinnerDateForecast,
        CreationDate: data.CreationDate,
      };
    } else {
      body = {
        '__metadata': {'type': 'SP.Data.ContractsListItem'},
        Title: data.Title,
        ShortTitle: data.ShortTitle,
        Number: data.Number,
        Subject_Contract: data.Subject_Contract,
        StartDate1: data.StartDate,
        DDate: data.DDate,
        GuaranteePeriod: data.GuaranteePeriod,
        UnitId: {'results': [data.Unit]},
        SubUnitId: data.SubUnit,
        CurrencyId: data.Currency,
        PMOExpertId: data.PMOExpert,
        PMId: data.PM,
        ContractorId: data.Contractor,
        RaiPartId: data.RaiPart,
        ImporterId: data.Importer,
        Standards: data.Standards,
        Service1Id: {'results': data.Service},
        ZoneId: {'results': data.Zone},
        ContractKindId: data.ContractKind,
        LastVersion: data.VersionCode,
        Cost: data.Cost,
        FinishDate: data.FinishDate,
        OperationTypeId: {'results': [data.OperationType]},
        Goal1Id: data.Goal,
        DemandantId: data.Demandant,
        ExecutePriority: data.ExecutePriority,
        ContractStatusId: data.ContractStatus,
      };
    }
    return this.http.post(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Contracts\')/items',
      body,
      {headers: headers}
    );
  }

  createBasic(DigestValue: any, id: number, data: { Title, ShortTitle, Number, Subject_Contract, StartDate, GuaranteePeriod, Unit, SubUnit, Currency, PMOExpert, PM, Contractor, RaiPart, Importer, Standards, Service, Zone, ContractKind, VersionCode,
    OperationType, Goal, Demandant, ExecutePriority, TenderType, TenderOrganizer, DeclareForecst, StartDateForecast, FinishDateForecast, DocSendDateForecast, MinutesSignDateForecast, WinnerDateForecast, CreationDate }, isFirst = true, isPreContract = false) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    // console.log(data);
    let versionID = 1;
    if (!isFirst) {
      versionID = data.VersionCode;
    }
    let body;
    let url;
    if (isPreContract) {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/pre-contract/_api/web/lists/getbytitle(\'Basics\')/items';
    } else {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/_api/web/lists/getbytitle(\'Basics\')/items';
    }
    body = {
      '__metadata': {'type': 'SP.Data.BasicsListItem'},
      Title: data.Title,
      ShortTitle: data.ShortTitle,
      Number: data.Number,
      Subject_Contract: data.Subject_Contract,
      StartDate1: data.StartDate,
      GuaranteePeriod: data.GuaranteePeriod,
      UnitId: {'results': [data.Unit]},
      SubUnitId: data.SubUnit,
      CurrencyId: data.Currency,
      PMOExpertId: data.PMOExpert,
      PMId: data.PM,
      ContractorId: data.Contractor,
      RaiPartId: data.RaiPart,
      ImporterId: data.Importer,
      Standards: data.Standards,
      Service1Id: {'results': data.Service},
      ContractKindId: data.ContractKind,
      VersionCodeId: versionID,
      ZoneId: {'results': data.Zone},
      OperationTypeId: {'results': [data.OperationType]},
      Goal1Id: data.Goal,
      DemandantId: data.Demandant,
      ExecutePriority: data.ExecutePriority,
      TenderTypeId: data.TenderType,
      TenderOrganizerId: data.TenderOrganizer,
      DeclareDateForecast: data.DeclareForecst,
      StartDateForecast: data.StartDateForecast,
      FinishDateForecast: data.FinishDateForecast,
      DocSendDateForecast: data.DocSendDateForecast,
      MinutesSignDateForecast: data.MinutesSignDateForecast,
      WinnerDateForecast: data.WinnerDateForecast,
      CreationDate: data.CreationDate,
    };
    return this.http.post(
      url,
      body,
      {headers: headers}
    );
  }

  createPCData(DigestValue: any, id: number, data: { PCProp, Date, PC }) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    // console.log(data);
    const body = {
      '__metadata': {'type': 'SP.Data.PCsListItem'},
      PCPropId: data.PCProp,
      Date1: data.Date,
      PC: data.PC,
    };
    return this.http.post(
      'http://rpmo.rai.ir/PWA/' + id + '/_api/web/lists/getbytitle(\'PCs\')/items',
      body,
      {headers: headers}
    );
  }

  createActPCCalcs(DigestValue: any, id: number, data: any) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    // console.log(data);
    const body = {
      '__metadata': {'type': 'SP.Data.ActPCCalcsListItem'},
      PCRelationId: {'results': [data.PCRelation]},
      PCCodeId: data.DataAct,
      Speed30D: data.Speed,
      Speed90D: data.Speed90D,
      TimeDeviation: data.TimeDeviation,
      ProgressDeviation: data.ProgressDeviation,
      Speed4Ontime: data.Speed4OnTime,
      FinishTimeForecast_Speed30D: data.FinishTimeForecast,
      FinishTimeForecast_Speed90D0: data.FinishTimeForecast90,
      PlanPC: data.planPC,
      SuitablePlanPropId: data.suitablePlan,
    };
    return this.http.post(
      'http://rpmo.rai.ir/PWA/' + id + '/_api/web/lists/getbytitle(\'ActPCCalcs\')/items',
      body,
      {headers: headers}
    );
  }

  createPCRelations(DigestValue: any, id: number, data: { ActPCProp, PlanPCProps }) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    // console.log(data);
    const body = {
      '__metadata': {'type': 'SP.Data.PCRelationsListItem'},
      ActPCPropId: data.ActPCProp,
      PlanPCPropsId: {'results': [data.PlanPCProps]},
    };
    return this.http.post(
      'http://rpmo.rai.ir/PWA/' + id + '/_api/web/lists/getbytitle(\'PCRelations\')/items',
      body,
      {headers: headers}
    );
  }

  createPCProps(DigestValue: any, id: number, data: { Service, Kind, Number, RevNumber, DDate, FinishDateCode, ScaledFrom }) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    // console.log(data);
    const body = {
      '__metadata': {'type': 'SP.Data.PCPropsListItem'},
      Service1Id: {'results': [data.Service]},
      Kind: data.Kind,
      Number: data.Number,
      RevNumber: data.RevNumber,
      DDate: data.DDate,
      FinishDateCodeId: {'results': [data.FinishDateCode]},
    };
    return this.http.post(
      'http://rpmo.rai.ir/PWA/' + id + '/_api/web/lists/getbytitle(\'PCProps\')/items',
      body,
      {headers: headers}
    );
  }

  createDels(DigestValue: any, id: number, data: { Date, Zone, Value, DelPropsRev }, isPreContract = false) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    // console.log(data);
    let body;
    let url;
    if (isPreContract) {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/pre-contract/_api/web/lists/getbytitle(\'Dels\')/items';
    } else {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/_api/web/lists/getbytitle(\'Dels\')/items';
    }
    if (data.Zone) {
      body = {
        '__metadata': {'type': 'SP.Data.DelsListItem'},
        DelPropsRevId: {'results': [data.DelPropsRev]},
        Date1: data.Date,
        ZoneId: {'results': [data.Zone]},
        Value1: data.Value,
      };
    } else {
      body = {
        '__metadata': {'type': 'SP.Data.DelsListItem'},
        DelPropsRevId: {'results': [data.DelPropsRev]},
        Date1: data.Date,
        Value1: data.Value,
      };
    }
    return this.http.post(
      url,
      body,
      {headers: headers}
    );
  }

  createDelPropsRevs(DigestValue: any, id: number, data: { DelProp, RevNumber, DDate, FinishDateCode, TotalValue }, isPreContract = false) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    let url;
    if (isPreContract) {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/pre-contract/_api/web/lists/getbytitle(\'DelPropsRevs\')/items';
    } else {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/_api/web/lists/getbytitle(\'DelPropsRevs\')/items';
    }
    const body = {
      '__metadata': {'type': 'SP.Data.DelPropsRevsListItem'},
      DelPropId: data.DelProp,
      RevNumber: data.RevNumber,
      DDate: data.DDate,
      FinishDateCodeId: {'results': [data.FinishDateCode]},
      TotalValue: data.TotalValue,
    };
    return this.http.post(
      url,
      body,
      {headers: headers}
    );
  }

  createDelProps(DigestValue: any, id: number, data: { DelItem, Kind }, isPreContract = false) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    let url;
    if (isPreContract) {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/pre-contract/_api/web/lists/getbytitle(\'DelProps\')/items';
    } else {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/_api/web/lists/getbytitle(\'DelProps\')/items';
    }
    const body = {
      '__metadata': {'type': 'SP.Data.DelPropsListItem'},
      DelItemId: data.DelItem,
      Kind: data.Kind,
    };
    return this.http.post(
      url,
      body,
      {headers: headers}
    );
  }

  createDelItems(DigestValue: any, id: number, data: { Deliverable, OperationType }, isPreContract = false) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    let url;
    if (isPreContract) {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/pre-contract/_api/web/lists/getbytitle(\'DelItems\')/items';
    } else {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/_api/web/lists/getbytitle(\'DelItems\')/items';
    }
    const body = {
      '__metadata': {'type': 'SP.Data.DelItemsListItem'},
      DeliverableId: data.Deliverable,
      OperationTypeId: {'results': [data.OperationType]},
    };
    return this.http.post(
      url,
      body,
      {headers: headers}
    );
  }

  createFinancialPayments(DigestValue: any, id: number, data: { FiscalYear, FinancialRequestType, LetterDate, Date, VoucherNum, VoucherDescription, GrossAmount, Deposits, PayableInsurance, Tax, PrepaidDepreciation, MaterialPrepaidDepreciation, Fine, TotalDeductions, VAT, EmployerInsurance, TreasuryBillsProfit, NetAmount, CostResource, FinancialPaymentType, OtherDeductions }) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    const body = {
      '__metadata': {'type': 'SP.Data.FinancialPaymentsListItem'},
      FiscalYear: data.FiscalYear,
      FinancialRequestTypeId: data.FinancialRequestType,
      LetterDate: data.LetterDate,
      Date1: data.Date,
      VoucherNum: data.VoucherNum,
      VoucherDescription: data.VoucherDescription,
      GrossAmount: data.GrossAmount,
      Deposits: data.Deposits,
      PayableInsurance: data.PayableInsurance,
      Tax: data.Tax,
      PrepaidDepreciation: data.PrepaidDepreciation,
      MaterialPrepaidDepreciation: data.MaterialPrepaidDepreciation,
      Fine: data.Fine,
      TotalDeductions: data.TotalDeductions,
      VAT: data.VAT,
      EmployerInsurance: data.EmployerInsurance,
      TreasuryBillsProfit: data.TreasuryBillsProfit,
      NetAmount: data.NetAmount,
      CostResourceId: data.CostResource,
      FinancialPaymentTypeId: data.FinancialPaymentType,
      OtherDeductions: data.OtherDeductions,
    };
    return this.http.post(
      'http://rpmo.rai.ir/PWA/' + id + '/_api/web/lists/getbytitle(\'FinancialPayments\')/items',
      body,
      {headers: headers}
    );
  }

  createFinancialRequests(DigestValue: any, id: number, data: { FiscalYear, FinancialRequestType, LetterDate, Date, VoucherNum, VoucherDescription, GrossAmount, Deposits, PayableInsurance, Tax, PrepaidDepreciation, MaterialPrepaidDepreciation, Fine, TotalDeductions, VAT, EmployerInsurance, TreasuryBillsProfit, NetAmount, OtherDeductions }) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    const body = {
      '__metadata': {'type': 'SP.Data.FinancialRequestsListItem'},
      FiscalYear: data.FiscalYear,
      FinancialRequestTypeId: data.FinancialRequestType,
      LetterDate: data.LetterDate,
      Date1: data.Date,
      VoucherNum: data.VoucherNum,
      VoucherDescription: data.VoucherDescription,
      GrossAmount: data.GrossAmount,
      Deposits: data.Deposits,
      PayableInsurance: data.PayableInsurance,
      Tax: data.Tax,
      PrepaidDepreciation: data.PrepaidDepreciation,
      MaterialPrepaidDepreciation: data.MaterialPrepaidDepreciation,
      Fine: data.Fine,
      TotalDeductions: data.TotalDeductions,
      VAT: data.VAT,
      EmployerInsurance: data.EmployerInsurance,
      TreasuryBillsProfit: data.TreasuryBillsProfit,
      NetAmount: data.NetAmount,
      OtherDeductions: data.OtherDeductions,
    };
    return this.http.post(
      'http://rpmo.rai.ir/PWA/' + id + '/_api/web/lists/getbytitle(\'FinancialRequests\')/items',
      body,
      {headers: headers}
    );
  }

  createStakeHolders(DigestValue: any, id: number, data: { OrgName, Role, AgentName, AgentPosition, PhoneNumber, LocationAddress, Email, IsPillar, DDate }, isPreContract = false) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    let url;
    if (isPreContract) {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/pre-contract/_api/web/lists/getbytitle(\'StakeHolders\')/items';
    } else {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/_api/web/lists/getbytitle(\'StakeHolders\')/items';
    }
    const body = {
      '__metadata': {'type': 'SP.Data.StakeHoldersListItem'},
      OrgName: data.OrgName,
      Role_StakeHolder: data.Role,
      AgentName: data.AgentName,
      AgentPositionId: data.AgentPosition,
      PhoneNumber: data.PhoneNumber,
      LocationAddress: data.LocationAddress,
      Email: data.Email,
      IsPillar: data.IsPillar,
      DDate: data.DDate
    };
    return this.http.post(
      url,
      body,
      {headers: headers}
    );
  }

  createAssignedCostReses(DigestValue: any, id: number, data: { CostCode, DDate, CostResource, Cost }, isPreContract = false) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    let url;
    if (isPreContract) {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/pre-contract/_api/web/lists/getbytitle(\'AssignedCostReses\')/items';
    } else {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/_api/web/lists/getbytitle(\'AssignedCostReses\')/items';
    }
    const body = {
      '__metadata': {'type': 'SP.Data.AssignedCostResesListItem'},
      CostCodeId: {'results': [data.CostCode]},
      DDate: data.DDate,
      CostResourceId: data.CostResource,
      Cost: data.Cost,
    };
    return this.http.post(
      url,
      body,
      {headers: headers}
    );
  }

  createServiceCosts(DigestValue: any, id: number, data: { CostCode, DDate, Service, Cost }, isPreContract = false) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    let url;
    if (isPreContract) {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/pre-contract/_api/web/lists/getbytitle(\'ServiceCosts\')/items';
    } else {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/_api/web/lists/getbytitle(\'ServiceCosts\')/items';
    }
    const body = {
      '__metadata': {'type': 'SP.Data.ServiceCostsListItem'},
      CostCodeId: {'results': [data.CostCode]},
      DDate: data.DDate,
      Service1Id: {'results': [data.Service]},
      Cost: data.Cost,
    };
    return this.http.post(
      url,
      body,
      {headers: headers}
    );
  }

  createCashFlowPlans(DigestValue: any, id: number, data: { CashFlowPlansPropCode, Date, Cost }, isPreContract = false) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    let url;
    if (isPreContract) {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/pre-contract/_api/web/lists/getbytitle(\'CashFlowPlans\')/items';
    } else {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/_api/web/lists/getbytitle(\'CashFlowPlans\')/items';
    }
    const body = {
      '__metadata': {'type': 'SP.Data.CashFlowPlansListItem'},
      CashFlowPlansPropCodeId: data.CashFlowPlansPropCode,
      Date1: data.Date,
      Cost: data.Cost,
    };
    return this.http.post(
      url,
      body,
      {headers: headers}
    );
  }

  createCashFlowPlansProp(DigestValue: any, id: number, data: { DDate, CostCode, FinishDateCode }, isPreContract = false) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    let url;
    if (isPreContract) {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/pre-contract/_api/web/lists/getbytitle(\'CashFlowPlansProp\')/items';
    } else {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/_api/web/lists/getbytitle(\'CashFlowPlansProp\')/items';
    }
    const body = {
      '__metadata': {'type': 'SP.Data.CashFlowPlansPropListItem'},
      DDate: data.DDate,
      CostCodeId: {'results': [data.CostCode]},
      FinishDateCodeId: {'results': [data.FinishDateCode]},
    };
    return this.http.post(
      url,
      body,
      {headers: headers}
    );
  }

  createCosts(DigestValue: any, id: number, data: { DDate, Cost, EqCost }, isPreContract = false) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    let url;
    if (isPreContract) {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/pre-contract/_api/web/lists/getbytitle(\'Costs\')/items';
    } else {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/_api/web/lists/getbytitle(\'Costs\')/items';
    }
    const body = {
      '__metadata': {'type': 'SP.Data.CostsListItem'},
      DDate: data.DDate,
      Cost: data.Cost,
      EqCost: data.EqCost,
    };
    return this.http.post(
      url,
      body,
      {headers: headers}
    );
  }

  createFinishDate(DigestValue: any, id: number, data: { DDate, FinishDate }, isPreContract = false) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    let url;
    if (isPreContract) {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/pre-contract/_api/web/lists/getbytitle(\'FinishDates\')/items';
    } else {
      url = 'http://rpmo.rai.ir/PWA/' + id + '/_api/web/lists/getbytitle(\'FinishDates\')/items';
    }
    const body = {
      '__metadata': {'type': 'SP.Data.FinishDatesListItem'},
      DDate: data.DDate,
      FinishDate: data.FinishDate,
    };
    return this.http.post(
      url,
      body,
      {headers: headers}
    );
  }

  getDataFromContextInfo() {
    const headers = new HttpHeaders({'ACCEPT': 'application/json;odata=verbose'});
    return this.http.post(
      'http://rpmo.rai.ir/PWA/_api/contextinfo',
      '',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.GetContextWebInformation.FormDigestValue;
        return data;
      }
    ));
  }


  ////////////////////// OLd Service ////////////////////////////////////
  ////////////////////// OLd Service ////////////////////////////////////
  ////////////////////// OLd Service ////////////////////////////////////
  ////////////////////// OLd Service ////////////////////////////////////
  ////////////////////// OLd Service ////////////////////////////////////


  deleteItemsFromList(DigestValue, itemID: number, siteName: string, listName: string) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
      'IF-MATCH': '*',
      'X-HTTP-Method': 'DELETE'
    });
    return this.http.post(
      'http://pmo.rai.ir/PO/' + siteName + '/_api/web/lists/getbytitle(\'' + listName + '\')/items(' + itemID + ')',
      '',
      {headers: headers}
    );
  }

  getItemsFromList(siteName: number, listName: string, isPreContract = false) {
    let mainData;
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    let url = 'http://rpmo.rai.ir/PWA/' + siteName + '/_api/web/lists/getbytitle(\'' + listName + '\')/items';
    if (isPreContract) {
      url = 'http://rpmo.rai.ir/PWA/' + siteName + '/pre-contract/_api/web/lists/getbytitle(\'' + listName + '\')/items';
    }
    return this.http.get(
      url,
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        mainData = data.map(v => v.ID);
        return mainData;
      }
    ));
  }

  postDataToVersions(DigestValue: any, Code: string, CostCode: string, PlanPCPropCodes, ActPCPropCodes, DelItemsCodes, DelPlanPropCodes, DelActPropCodes, LastActPCs, LastActDelItemVals) {
    const finalDate = moment(this.sharedService.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jM/jD').format('YYYY/MM/DD');
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    const body = {
      '__metadata': {'type': 'SP.Data.VersionsListItem'},
      Code: Code,
      DDate: finalDate,
      CostCodes: JSON.stringify([CostCode]),
      PlanPCPropCodes: JSON.stringify(PlanPCPropCodes),
      ActPCPropCodes: JSON.stringify(ActPCPropCodes),
      DelItemsCodes: JSON.stringify(DelItemsCodes),
      DelPlanPropCodes: JSON.stringify(DelPlanPropCodes),
      DelActPropCodes: JSON.stringify(DelActPropCodes),
      LastCost: JSON.stringify(this.sharedService.stepFormsData.contractsForm.Cost_Costs),
      LastFDate: JSON.stringify(this.sharedService.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs),
      LastActPCs: JSON.stringify(LastActPCs),
      LastActDelItemVals: JSON.stringify(LastActDelItemVals)
    };
    return this.http.post(
      'http://pmo.rai.ir/PO/TempTransfer2/_api/web/lists/getbytitle(\'Versions\')/items',
      body,
      {headers: headers}
    ).pipe(map((response: Response) => {
        console.log(response, 'Versions Transfered');
      }
    ));
  }

  postDataToPlanActPCs(DigestValue: any, Code: string, Index, Date: string, PC) {
    const finalDate = moment(Date, 'jYYYY/jM/jD').format('YYYY/MM/DD');
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    const body = {
      '__metadata': {'type': 'SP.Data.PlanActPCsListItem'},
      PlanActPropCode: Code,
      Index: Index.toString,
      Date1: finalDate,
      PC: PC
    };
    return this.http.post(
      'http://pmo.rai.ir/PO/TempTransfer2/_api/web/lists/getbytitle(\'PlanActPCs\')/items',
      body,
      {headers: headers}
    ).pipe(map((response: Response) => {
        console.log(response, 'PlansActsPCProp Transfered');
      }
    ));
  }

  postDataToPlansActsPCProp(DigestValue: any, Code: string, SDate: string, FDate: string) {
    const finalDDate = moment(this.sharedService.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jM/jD').format('YYYY/MM/DD');

    const finalSDate = moment(SDate, 'jYYYY/jM/jD').format('YYYY/MM/DD');

    const finalFDate = moment(FDate, 'jYYYY/jM/jD').format('YYYY/MM/DD');

    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    const body = {
      '__metadata': {'type': 'SP.Data.PlansActsPCPropListItem'},
      Code: Code,
      DDate: finalDDate,
      SDate: finalSDate,
      FDate: finalFDate
    };
    return this.http.post(
      'http://pmo.rai.ir/PO/TempTransfer2/_api/web/lists/getbytitle(\'PlansActsPCProp\')/items',
      body,
      {headers: headers}
    ).pipe(map((response: Response) => {
        // console.log(response, 'PlansActsPCProp Transfered');
      }
    ));
  }

  postDelPlanAct(DigestValue: any, date, Code: string, delPlanActPropCode: string, zoneId, Val: number) {
    console.log(date, Code, delPlanActPropCode, zoneId, Val);
    const finalDDate = moment(date, 'jYYYY/jM/jD').format('YYYY/MM/DD');
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    const body = {
      '__metadata': {'type': 'SP.Data.DelPlanActListItem'},
      DelItemCode: Code,
      DelPlanActPropCode: delPlanActPropCode,
      Date1: finalDDate,
      ZoneId: zoneId,
      Val: Val
    };
    return this.http.post(
      'http://pmo.rai.ir/PO/TempTransfer2/_api/web/lists/getbytitle(\'DelPlanAct\')/items',
      body,
      {headers: headers}
    ).pipe(map((response: Response) => {
        // console.log(response, 'AssignedCostReses Transfered');
      }
    ));
  }

  postDelPlanActProp(DigestValue: any, Code: string, delPlanActPropCode: string, totalVal: number) {
    const finalDDate = moment(this.sharedService.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jM/jD').format('YYYY/MM/DD');
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    const body = {
      '__metadata': {'type': 'SP.Data.DelPlanActPropListItem'},
      Code: Code,
      DelItemCode: delPlanActPropCode,
      TotalVal: totalVal,
      DDate: finalDDate
    };
    return this.http.post(
      'http://pmo.rai.ir/PO/TempTransfer2/_api/web/lists/getbytitle(\'DelPlanActProp\')/items',
      body,
      {headers: headers}
    ).pipe(map((response: Response) => {
        // console.log(response, 'AssignedCostReses Transfered');
      }
    ));
  }

  postDataToDelItems(DigestValue: any, i: number, j: number, Code: string) {
    console.log(Code);
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    const body = {
      '__metadata': {'type': 'SP.Data.DelItemsListItem'},
      Code: Code,
      DelId: this.sharedService.stepFormsData.deliverablesForm[i].name_Deliverable[j].Id,
      OperationTypeId: this.sharedService.stepFormsData.deliverablesForm[i].operationTypes_deliverables[j].Id
    };
    return this.http.post(
      'http://pmo.rai.ir/PO/TempTransfer2/_api/web/lists/getbytitle(\'DelItems\')/items',
      body,
      {headers: headers}
    ).pipe(map((response: Response) => {
        // console.log(response, i, 'AssignedCostReses Transfered');
      }
    ));
  }

  postDataToServiceCosts(DigestValue: any, Code: string, serviceId: string, cost: number) {
    const finalDDate = moment(this.sharedService.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jM/jD').format('YYYY/MM/DD');
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    const body = {
      '__metadata': {'type': 'SP.Data.ServiceCostsListItem'},
      CostCode: Code,
      DDate: finalDDate,
      ServiceId: serviceId,
      Cost: cost
    };
    return this.http.post(
      'http://pmo.rai.ir/PO/TempTransfer2/_api/web/lists/getbytitle(\'ServiceCosts\')/items',
      body,
      {headers: headers}
    ).pipe(map((response: Response) => {
        // console.log(response, 'AssignedCostReses Transfered');
      }
    ));
  }

  postDataToCosts(DigestValue: any, Code: string) {
    const finalDDate = moment(this.sharedService.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jM/jD').format('YYYY/MM/DD');
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    const body = {
      '__metadata': {'type': 'SP.Data.CostsListItem'},
      Code: Code,
      DDate: finalDDate,
      Cost: this.sharedService.stepFormsData.contractsForm.Cost_Costs
    };
    return this.http.post(
      'http://pmo.rai.ir/PO/TempTransfer2/_api/web/lists/getbytitle(\'Costs\')/items',
      body,
      {headers: headers}
    ).pipe(map((response: Response) => {
        // console.log(response, 'AssignedCostReses Transfered');
      }
    ));
  }

  postDataToCashFlowPlans(DigestValue: any, i: number, Code: string) {
    const finalDDate = moment(this.sharedService.stepFormsData.cashFlowPlanForm.date[i], 'jYYYY/jM/jD').format('YYYY/MM/DD');
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    const body = {
      '__metadata': {'type': 'SP.Data.CashFlowPlansListItem'},
      Code: Code,
      Date1: finalDDate,
      Amount: +this.sharedService.stepFormsData.cashFlowPlanForm.data[i]
    };
    return this.http.post(
      'http://pmo.rai.ir/PO/TempTransfer2/_api/web/lists/getbytitle(\'CashFlowPlans\')/items',
      body,
      {headers: headers}
    ).pipe(map((response: Response) => {
        // console.log(response, i, 'AssignedCostReses Transfered');
      }
    ));
  }

  postDataToCashFlowPlansProp(DigestValue: any, CostCode: string, Code: string) {
    const finalDDate = moment(this.sharedService.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jM/jD').format('YYYY/MM/DD');
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    const body = {
      '__metadata': {'type': 'SP.Data.CashFlowPlansPropListItem'},
      CostCode: CostCode,
      Code: Code,
      DDate: finalDDate
    };
    return this.http.post(
      'http://pmo.rai.ir/PO/TempTransfer2/_api/web/lists/getbytitle(\'CashFlowPlansProp\')/items',
      body,
      {headers: headers}
    ).pipe(map((response: Response) => {
        // console.log(response, 'AssignedCostReses Transfered');
      }
    ));
  }

  postDataToAssignedCostReses(DigestValue: any, i, CostCode: string) {
    const finalDDate = moment(this.sharedService.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jM/jD').format('YYYY/MM/DD');
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    const body = {
      '__metadata': {'type': 'SP.Data.AssignedCostResesListItem'},
      CostCode: CostCode,
      DDate: finalDDate,
      CostResId: this.sharedService.stepFormsData.assignedCostResourcesForm.CostResources[i],
      Cost: this.sharedService.stepFormsData.assignedCostResourcesForm.hobbies[i]
    };
    return this.http.post(
      'http://pmo.rai.ir/PO/TempTransfer2/_api/web/lists/getbytitle(\'AssignedCostReses\')/items',
      body,
      {headers: headers}
    ).pipe(map((response: Response) => {
        // console.log(response, i, 'AssignedCostReses Transfered');
      }
    ));
  }

  postDataToStakeholders(DigestValue: any, i, stackHoldersForm, isPillar) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    let Role = stackHoldersForm[i].Role_StakeholdersContract;
    if (Role === 'سایر') {
      Role = stackHoldersForm[i].Role_Other_StakeholdersContract;
    }
    const body = {
      '__metadata': {'type': 'SP.Data.StakeholdersListItem'},
      OrgName: stackHoldersForm[i].OragnizationName_StakeholdersCon,
      Role1: Role,
      AgentName: stackHoldersForm[i].AgentName_StakeholdersContract,
      AgentPosId: stackHoldersForm[i].Id_ContractAgentPostions,
      PhoneNumber: stackHoldersForm[i].PhoneNumber_StakeholdersContract,
      Address: stackHoldersForm[i].Address_StakeholdersContract,
      Email: stackHoldersForm[i].Email_StakeholdersContract,
      IsPillar: isPillar
    };
    return this.http.post(
      'http://pmo.rai.ir/PO/TempTransfer2/_api/web/lists/getbytitle(\'Stakeholders\')/items',
      body,
      {headers: headers}
    ).pipe(map((response: Response) => {
        // console.log(response, i, 'Stakeholders Transfered');
      }
    ));
  }
}
