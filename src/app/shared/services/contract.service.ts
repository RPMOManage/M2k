import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BasicModel} from '../models/contractModels/basic.model';
import {map} from 'rxjs/operators';
import * as moment from 'jalali-moment';
import {ContractModel} from '../models/contractModels/contract.model';
import {ContractAssignedCostResModel} from '../models/contractModels/contractAssignedCostRes.model';
import {ContractCashFlowPlanModel} from '../models/contractModels/contractCashFlowPlan.model';
import {ContractStakeHolderModel} from '../models/contractModels/contractStakeHolder.model';
import {ContractPCModel} from '../models/contractModels/contractPC.model';
import {ContractDutiesModel} from '../models/contractModels/contractDuties.model';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  constructor(private http: HttpClient) {
  }

  sendDataToPCs(DigestValue, contractCode: number, pc: { PCProp, PC, Date }) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    const body = {
      '__metadata': {'type': 'SP.Data.PCsListItem'},
      'PCPropId': pc.PCProp,
      'PC': pc.PC,
      'Date1': pc.Date
    };
    return this.http.post(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'PCs\')/items',
      body,
      {headers: headers}
    );
  }

  updateChanges(DigestValue, contractCode: number, change: { ID, Date, ChangeItem, ImporterApproved, PMApproved, Json, DDate, Description }) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
      'IF-MATCH': '*',
      'X-HTTP-Method': 'MERGE'
    });
    let body;
    body = {
      '__metadata': {'type': 'SP.Data.ChangesListItem'},
      'Json': JSON.stringify(change.Json),
    };
    return this.http.post(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'Changes\')/items(' + change.ID + ')',
      body,
      {headers: headers}
    );
  }

  getContractDel(contractCode: number) {
    const mainData: { ID, Date, Value, DelPropsRev, Zone }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'Dels\')/items?$select=ID,Date1,Value1,DelPropsRev/ID,ZoneId&$top=10000&$expand=DelPropsRev&$Orderby=Date1 asc',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let Date = null;
          if (data[i].Date1) {
            Date = moment(data[i].Date1, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          mainData[i] = {
            ID: data[i].ID,
            Date: Date,
            Value: data[i].Value1,
            DelPropsRev: data[i].DelPropsRev.results[0].ID,
            Zone: data[i].ZoneId.results,
          };
        }
        return mainData;
      }
    ));
  }

  getContractDelProps(contractCode: number) {
    const mainData: { ID, DelItem: { ID, Title }, Kind }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'DelProps\')/items?$select=ID,Kind,DelItem/ID,DelItem/Title&$expand=DelItem',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData[i] = {
            ID: data[i].ID,
            DelItem: {
              ID: data[i].DelItem.ID,
              Title: data[i].DelItem.Title,
            },
            Kind: data[i].Kind,
          };
        }
        return mainData;
      }
    ));
  }

  getPCProps(contractCode: number) {
    const mainData: { ID, Service, Kind }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'PCProps\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let Date = null;
          if (data[i].Date1) {
            Date = moment(data[i].Date1, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          mainData[i] = {
            ID: data[i].ID,
            Service: data[i].Service1Id.results[0],
            Kind: data[i].Kind,
          };
        }
        return mainData;
      }
    ));
  }

  getPCs(contractCode: number) {
    const mainData: { ID, PCProp, Date, PC }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'PCs\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let Date = null;
          if (data[i].Date1) {
            Date = moment(data[i].Date1, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          mainData[i] = {
            ID: data[i].ID,
            PCProp: data[i].PCPropId,
            Date: Date,
            PC: data[i].PC,
          };
        }
        return mainData;
      }
    ));
  }

  getAllCashFlowPlans(contractCode: number, cashFlowPlansPropCode: number) {
    const mainData: { ID, cashFlowPlansPropCode, Date, Cost }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'CashFlowPlans\')/items?$filter=CashFlowPlansPropCodeId eq ' + cashFlowPlansPropCode + '&$Orderby=Date1 asc',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let Date = null;
          if (data[i].Date1) {
            Date = moment(data[i].Date1, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          mainData[i] = {
            ID: data[i].ID,
            cashFlowPlansPropCode: data[i].CashFlowPlansPropCodeId,
            Date: Date,
            Cost: data[i].Cost,
          };
        }
        return mainData;
      }
    ));
  }

  getAllOfCashFlowPlans(contractCode: number) {
    const mainData: { ID, cashFlowPlansPropCode, Date, Cost }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'CashFlowPlans\')/items?$Orderby=Date1 asc',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let Date = null;
          if (data[i].Date1) {
            Date = moment(data[i].Date1, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          mainData[i] = {
            ID: data[i].ID,
            cashFlowPlansPropCode: data[i].CashFlowPlansPropCodeId,
            Date: Date,
            Cost: data[i].Cost,
          };
        }
        return mainData;
      }
    ));
  }

  getAllCashFlowPlansProp(contractCode: number) {
    const mainData: { ID, Cost, DDate, FinishDate }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'CashFlowPlansProp\')/items?$select=ID,DDate,CostCode/Cost,FinishDateCode/FinishDate&$expand=CostCode,FinishDateCode',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let DDate = null;
          if (data[i].DDate) {
            DDate = moment(data[i].DDate, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          let FinishDate = null;
          if (data[i].FinishDateCode.results[0].FinishDate) {
            FinishDate = moment(data[i].FinishDateCode.results[0].FinishDate, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          mainData[i] = {
            ID: data[i].ID,
            Cost: data[i].CostCode.results[0].Cost,
            DDate: DDate,
            FinishDate: FinishDate,
          };
        }
        return mainData;
      }
    ));
  }

  getAssignedCostResources(contractCode: number) {
    const mainData: { ID, DDate, CostResource, Cost }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'AssignedCostReses\')/items?$select=ID,DDate,CostResourceId,Cost&$Orderby=DDate desc',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let DDate = null;
          if (data[i].DDate) {
            DDate = moment(data[i].DDate, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          mainData[i] = {
            ID: data[i].ID,
            DDate: DDate,
            CostResource: data[i].CostResourceId,
            Cost: data[i].Cost,
          };
        }
        return mainData;
      }
    ));
  }

  getFinishDates(contractCode: number, versionID: number) {
    const mainData: { ID, DDate, FinishDate }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'Versions\')/items?$filter=ID eq ' + versionID + '&$select=ID,FinishDateCode/ID,FinishDateCode/DDate,FinishDateCode/FinishDate&$expand=FinishDateCode',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results[0];
        for (let i = 0; i < data.FinishDateCode.results.length; i++) {
          let DDate = null;
          if (data.FinishDateCode.results[i].DDate) {
            DDate = moment(data.FinishDateCode.results[i].DDate, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          let FinishDate = null;
          if (data.FinishDateCode.results[i].FinishDate) {
            FinishDate = moment(data.FinishDateCode.results[i].FinishDate, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          mainData[i] = {
            ID: data.FinishDateCode.results[i].ID,
            DDate: DDate,
            FinishDate: FinishDate,
          };
        }
        return mainData;
      }
    ));
  }

  getAllFinishDates(contractCode: number) {
    const mainData: { ID, DDate, FinishDate }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'Versions\')/items?$select=ID,FinishDateCode/ID,FinishDateCode/DDate,FinishDateCode/FinishDate&$expand=FinishDateCode',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results[0];
        for (let i = 0; i < data.FinishDateCode.results.length; i++) {
          let DDate = null;
          if (data.FinishDateCode.results[i].DDate) {
            DDate = moment(data.FinishDateCode.results[i].DDate, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          let FinishDate = null;
          if (data.FinishDateCode.results[i].FinishDate) {
            FinishDate = moment(data.FinishDateCode.results[i].FinishDate, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          mainData[i] = {
            ID: data.FinishDateCode.results[i].ID,
            DDate: DDate,
            FinishDate: FinishDate,
          };
        }
        return mainData;
      }
    ));
  }

  getPCRelationsFromVersion(contractCode: number, versionID: number) {
    const mainData = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'Versions\')/items?$filter=ID eq ' + versionID + '&$select=ID,PCRelationId',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results[0];
        for (let i = 0; i < data.PCRelationId.results.length; i++) {
          mainData[i] = data.PCRelationId.results[i];
        }
        return mainData;
      }
    ));
  }

  getAllPCProps(contractCode: number) {
    const mainData: { ID, Service, DDate, Kind?: string }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'PCProps\')/items?$select=ID,Service1Id,DDate,Kind',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData[i] = {
            ID: data[i].ID,
            Service: data[i].Service1Id,
            DDate: data[i].DDate,
            Kind: data[i].Kind,
          };
        }
        return mainData;
      }
    ));
  }

  getAllPCsByPCProp(contractCode: number, PCPropID: number) {
    const mainData: { ID, PCProp, Date, PC }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'PCs\')/items?$filter=PCPropId eq ' + PCPropID + '&$orderby=Date1 asc',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let Date = null;
          if (data[i].Date1) {
            Date = moment(data[i].Date1, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          mainData[i] = {
            ID: data[i].ID,
            PCProp: data[i].PCPropId,
            Date: Date,
            PC: data[i].PC
          };
        }
        return mainData;
      }
    ));
  }

  getAllActPCCalcs(contractCode: number) {
    const mainData: { ID, PCRelationId, PCCodeId, Speed30D, Speed90D, TimeDeviation, ProgressDeviation, Speed4Ontime, FinishTimeForecast_Speed30D, FinishTimeForecast_Speed90D0, PlanPC, SuitablePlanPropId }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'ActPCCalcs\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let FinishTimeForecast_Speed30D = null;
          if (data[i].FinishTimeForecast_Speed30D) {
            FinishTimeForecast_Speed30D = moment(data[i].FinishTimeForecast_Speed30D, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          let FinishTimeForecast_Speed90D0 = null;
          if (FinishTimeForecast_Speed90D0) {
            FinishTimeForecast_Speed90D0 = moment(FinishTimeForecast_Speed90D0, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          mainData[i] = {
            ID: data[i].ID,
            PCRelationId: data[i].PCRelationId,
            PCCodeId: data[i].PCCodeId,
            Speed30D: data[i].Speed30D,
            Speed90D: data[i].Speed90D,
            TimeDeviation: data[i].TimeDeviation,
            ProgressDeviation: data[i].ProgressDeviation,
            Speed4Ontime: data[i].Speed4Ontime,
            FinishTimeForecast_Speed30D: FinishTimeForecast_Speed30D,
            FinishTimeForecast_Speed90D0: FinishTimeForecast_Speed90D0,
            PlanPC: data[i].PlanPC,
            SuitablePlanPropId: data[i].SuitablePlanPropId
          };
        }
        return mainData;
      }
    ));
  }

  getAllOfPCsByPCProp(contractCode: number) {
    const mainData: { ID, PCProp, Date, PC }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'PCs\')/items?$orderby=Date1 asc',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData[i] = {
            ID: data[i].ID,
            PCProp: data[i].PCPropId,
            Date: data[i].Date1,
            PC: data[i].PC
          };
        }
        return mainData;
      }
    ));
  }

  getAllPCRelations(contractCode: number) {
    const mainData: { ID, ActPCProp, PlanPCProps, PlanDDate }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'PCRelations\')/items?$select=ID,ActPCPropId,PlanPCProps/ID,PlanPCProps/DDate&$expand=PlanPCProps',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData[i] = {
            ID: data[i].ID,
            ActPCProp: data[i].ActPCPropId,
            PlanPCProps: data[i].PlanPCProps.results[0].ID,
            PlanDDate: data[i].PlanPCProps.results[0].DDate
          };
        }
        return mainData;
      }
    ));
  }

  getCostCode(contractCode: number, versionID: number) {
    const mainData: { ID, DDate, EqCost, Cost }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'Versions\')/items?$filter=ID eq ' + versionID + '&$select=ID,CostCode/ID,CostCode/DDate,CostCode/EqCost,CostCode/Cost&$expand=CostCode',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results[0];
        for (let i = 0; i < data.CostCode.results.length; i++) {
          let DDate = null;
          if (data.CostCode.results[i].DDate) {
            DDate = moment(data.CostCode.results[i].DDate, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          mainData[i] = {
            ID: data.CostCode.results[i].ID,
            DDate: DDate,
            EqCost: data.CostCode.results[i].EqCost,
            Cost: data.CostCode.results[i].Cost
          };
        }
        return mainData;
      }
    ));
  }

  getContractVersion(contractCode: number) {
    let mainData: { ID, DDate, Basic, CostCode: { ID, Cost }, FinishDateCode: { ID, Date }, PCRelation, DelPropsRev };
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'Versions\')/items?$select=ID,DDate,PCRelationId,DelPropsRevId,BasicId,CostCode/ID,CostCode/Cost,FinishDateCode/ID,FinishDateCode/FinishDate&$expand=CostCode,FinishDateCode&$Orderby=ID desc&$top=1',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results[0];
        // let DDate = null;
        // if (data.DDate) {
        //   DDate = moment(data.DDate, 'YYYY/M/D').format('jYYYY/jMM/jDD');
        // }
        mainData = {
          ID: data.ID,
          DDate: data.DDate,
          Basic: data.BasicId.results[0],
          CostCode: {
            ID: data.CostCode.results[0].ID,
            Cost: data.CostCode.results[0].Cost
          },
          FinishDateCode: {
            ID: data.FinishDateCode.results[0].ID,
            Date: data.FinishDateCode.results[0].FinishDate,
          },
          PCRelation: data.PCRelationId.results,
          DelPropsRev: data.DelPropsRevId.results,
        };
        return mainData;
      }
    ));
  }

  getAllVersions(contractCode: number) {
    let mainData: { ID, DDate, Basic, CostCode: { ID, Cost }, FinishDateCode: { ID, Date }, PCRelation, DelPropsRev }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'Versions\')/items?$select=ID,DDate,PCRelationId,DelPropsRevId,BasicId,CostCode/ID,CostCode/Cost,FinishDateCode/ID,FinishDateCode/FinishDate&$expand=CostCode,FinishDateCode&$Orderby=ID desc',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let DDate = null;
          if (data[i].DDate) {
            DDate = moment(data[i].DDate, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          let FinishDate = null;
          if (data[i].FinishDateCode.results[0].FinishDate) {
            FinishDate = moment(data[i].FinishDateCode.results[0].FinishDate, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          mainData[i] = {
            ID: data[i].ID,
            DDate: DDate,
            Basic: data[i].BasicId.results[0],
            CostCode: {
              ID: data[i].CostCode.results[0].ID,
              Cost: data[i].CostCode.results[0].Cost
            },
            FinishDateCode: {
              ID: data[i].FinishDateCode.results[0].ID,
              Date: FinishDate,
            },
            PCRelation: data[i].PCRelationId.results,
            DelPropsRev: data[i].DelPropsRevId.results,
          };
        }
        return mainData;
      }
    ));
  }

  sendDataToChanges(DigestValue: any, data, dDate, description, listName: string, contractCode) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    const body = {
      '__metadata': {'type': 'SP.Data.' + listName + 'ListItem'},
      'ChangeItemId': {'results': data},
      'ImporterApproved': false,
      'PMApproved': false,
      'DDate': dDate,
      'Desc': description,
      'Json': '{"ChangeCost":null,"ChangeAssignedCost":null,"ChangeFinishDate":null,"ChangeCashFlow":null,"ChangeService":null,"ChangeServiceCost":null,"ChangeStakeHolderPillar":null,"ChangeStakeHolderNotPillar":null, "ChangeTotalValue": null}'
    };
    return this.http.post(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'' + listName + '\')/items',
      body,
      {headers: headers}
    );
  }

  getChange(contractCode: number, changeID: number, isLast: boolean) {
    let mainData: any;
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    let url;
    if (isLast) {
      mainData = [];
      url = 'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'Changes\')/items?$Orderby=DDate desc';
    } else {
      url = 'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'Changes\')/items?$filter=ID eq ' + changeID;
    }
    if (changeID === null) {
      mainData = [];
      url = 'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'Changes\')/items?$Orderby=DDate desc';
    }
    return this.http.get(
      url,
      {headers: headers}
    ).pipe(map((response: Response) => {
        if (isLast && changeID !== null) {
          const data = (<any>response).d.results;
          for (let i = 0; i < data.length; i++) {
            let DDate = null;
            if (data[i].DDate) {
              DDate = moment(data[i].DDate, 'YYYY/M/D').format('jYYYY/jMM/jDD');
            }
            mainData[i] = {
              ID: data[i].ID,
              Date: data[i].Date1,
              ChangeItem: data[i].ChangeItemId.results,
              ImporterApproved: data[i].ImporterApproved,
              PMApproved: data[i].PMApproved,
              Json: JSON.parse(data[i].Json),
              DDate: DDate,
              Description: data[i].Description
            };
          }
        } else if (!isLast && changeID !== null) {
          const data = (<any>response).d.results[0];
          let DDate = null;
          if (data.DDate) {
            DDate = moment(data.DDate, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          mainData = {
            ID: data.ID,
            Date: data.Date1,
            ChangeItem: data.ChangeItemId.results,
            ImporterApproved: data.ImporterApproved,
            PMApproved: data.PMApproved,
            Json: JSON.parse(data.Json),
            DDate: DDate,
            Description: data.Description
          };
        } else if (!isLast && changeID === null) {
          const data = (<any>response).d.results;
          for (let i = 0; i < data.length; i++) {
            let DDate = null;
            if (data[i].DDate) {
              DDate = moment(data[i].DDate, 'YYYY/M/D').format('jYYYY/jMM/jDD');
            }
            mainData[i] = {
              ID: data[i].ID,
              Date: data[i].Date1,
              ChangeItem: data[i].ChangeItemId.results,
              ImporterApproved: data[i].ImporterApproved,
              PMApproved: data[i].PMApproved,
              Json: JSON.parse(data[i].Json),
              DDate: DDate,
              Description: data[i].Description
            };
          }
        }
        return mainData;
      }
    ));
  }

  getAllChangeItems() {
    const mainData: { ID, Title, Order, ChangeCategory, ChangeItem, VersionMaker }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'ChangeItems\')/items?$filter=IsActive1 eq 1&$Orderby=Order1',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push({
            ID: data[i].ID,
            Title: data[i].Title,
            Order: data[i].Order1,
            ChangeCategory: data[i].ChangeCategoryId,
            ChangeItem: data[i].ChangeItemId.results,
            VersionMaker: data[i].VersionMaker
          });
        }
        return mainData;
      }
    ));
  }

  getAllChangeCategories() {
    const mainData: { ID, Title }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'ChangeCategories\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push({
            ID: data[i].ID,
            Title: data[i].Title
          });
        }
        return mainData;
      }
    ));
  }

  getDutyTypes() {
    const mainData: { ID, Title, Services }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'DutyTypes\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push({
            ID: data[i].ID,
            Title: data[i].Title,
            Services: data[i].Service1Id.results
          });
        }
        return mainData;
      }
    ));
  }

  getDutyCalenders(today?: string, finishDate?: string) {
    const mainData: { ID, Title, StartDate, FinishDate, DutyType: { ID, Title }, DataEntryStartDate, DataEntryFinishDate, IsDefualt }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    let url;
    if (today && finishDate) {
      url = 'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'DutyCalender\')/items?$filter=FinishDate gt \'' + today + '\' and StartDate1 lt \'' + finishDate + '\' and IsDefault ne false&$OrderBy=FinishDate asc&$top=10000';
    } else {
      url = 'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'DutyCalender\')/items?$OrderBy=FinishDate asc&$top=10000';
    }
    return this.http.get(
      url,
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let StartDate = null;
          if (data[i].StartDate1) {
            StartDate = moment(data[i].StartDate1, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          let FinishDate = null;
          if (data[i].FinishDate) {
            FinishDate = moment(data[i].FinishDate, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          let DataEntryStartDate = null;
          if (data[i].DataEntryStartDate) {
            DataEntryStartDate = moment(data[i].DataEntryStartDate, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          let DataEntryFinishDate = null;
          if (data[i].DataEntryFinishDate) {
            DataEntryFinishDate = moment(data[i].DataEntryFinishDate, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          mainData.push({
            ID: data[i].ID,
            Title: data[i].Title,
            StartDate: StartDate,
            FinishDate: FinishDate,
            DutyType: {
              ID: data[i].DutyTypeId,
              Title: null
            },
            DataEntryStartDate: DataEntryStartDate,
            DataEntryFinishDate: DataEntryFinishDate,
            IsDefualt: data[i].IsDefault,
          });
        }
        return mainData;
      }
    ));
  }

  getAllFinancialRequests(contractID: number) {
    const mainData: { ID, FiscalYear, FinancialRequestTypeId, LetterDate, Date, VoucherNum, VoucherDescription, GrossAmount, Deposits, PayableInsurance, Tax, PrepaidDepreciation, MaterialPrepaidDepreciation, Fine, TotalDeductions, VAT, EmployerInsurance, TreasuryBillsProfit, NetAmount, OtherDeductions }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'FinancialRequests\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push({
            ID: data[i].ID,
            FiscalYear: data[i].FiscalYear,
            FinancialRequestTypeId: data[i].FinancialRequestType,
            LetterDate: data[i].LetterDate,
            Date: data[i].Date,
            VoucherNum: data[i].VoucherNum,
            VoucherDescription: data[i].VoucherDescription,
            GrossAmount: data[i].GrossAmount,
            Deposits: data[i].Deposits,
            PayableInsurance: data[i].PayableInsurance,
            Tax: data[i].Tax,
            PrepaidDepreciation: data[i].PrepaidDepreciation,
            MaterialPrepaidDepreciation: data[i].MaterialPrepaidDepreciation,
            Fine: data[i].Fine,
            TotalDeductions: data[i].TotalDeductions,
            VAT: data[i].VAT,
            EmployerInsurance: data[i].EmployerInsurance,
            TreasuryBillsProfit: data[i].TreasuryBillsProfit,
            NetAmount: data[i].NetAmount,
            OtherDeductions: data[i].OtherDeductions,
          });
        }
        return mainData;
      }
    ));
  }

  getAllFinancialPayments(contractID: number) {
    const mainData: { ID, FiscalYear, FinancialRequestTypeId, LetterDate, Date, VoucherNum, VoucherDescription, GrossAmount, Deposits, PayableInsurance, Tax, PrepaidDepreciation, MaterialPrepaidDepreciation, Fine, TotalDeductions, VAT, EmployerInsurance, TreasuryBillsProfit, NetAmount, OtherDeductions, CostResource, FinancialPaymentType }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'FinancialRequests\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push({
            ID: data[i].ID,
            FiscalYear: data[i].FiscalYear,
            FinancialRequestTypeId: data[i].FinancialRequestType,
            LetterDate: data[i].LetterDate,
            Date: data[i].Date,
            VoucherNum: data[i].VoucherNum,
            VoucherDescription: data[i].VoucherDescription,
            GrossAmount: data[i].GrossAmount,
            Deposits: data[i].Deposits,
            PayableInsurance: data[i].PayableInsurance,
            Tax: data[i].Tax,
            PrepaidDepreciation: data[i].PrepaidDepreciation,
            MaterialPrepaidDepreciation: data[i].MaterialPrepaidDepreciation,
            Fine: data[i].Fine,
            TotalDeductions: data[i].TotalDeductions,
            VAT: data[i].VAT,
            EmployerInsurance: data[i].EmployerInsurance,
            TreasuryBillsProfit: data[i].TreasuryBillsProfit,
            NetAmount: data[i].NetAmount,
            OtherDeductions: data[i].OtherDeductions,
            CostResource: data[i].CostResourceId,
            FinancialPaymentType: data[i].FinancialPaymentTypeId,
          });
        }
        return mainData;
      }
    ));
  }

  getAllDutiesFinancialGrossAmounts(contractID: number) {
    const mainData: { ID, Json }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'Duties\')/items?$filter=DutyApprovementStatus eq 3',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push({
            ID: data[i].ID,
            Json: JSON.parse(data[i].Json),
          });
        }
        return mainData;
      }
    ));
  }

  getAllFinancialGrossAmountsASC(contractID: number, tableName: string) {
    const mainData: { ID, GrossAmount, FinancialRequestType, Date }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'' + tableName + '\')/items?$Orderby=Date1 asc',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let Date = null;
          if (data[i].Date1) {
            Date = moment(data[i].Date1).format('jYYYY/jMM/jDD');
          }
          mainData.push({
            ID: data[i].ID,
            GrossAmount: data[i].GrossAmount,
            FinancialRequestType: data[i].FinancialRequestTypeId,
            Date: Date
          });
        }
        return mainData;
      }
    ));
  }

  getAllFinancialGrossAmounts(contractID: number, tableName: string) {
    const mainData: { ID, GrossAmount, FinancialRequestType, Date }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'' + tableName + '\')/items?$Orderby=Date1 desc',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let Date = null;
          if (data[i].Date1) {
            Date = moment(data[i].Date1).format('jYYYY/jMM/jDD');
          }
          mainData.push({
            ID: data[i].ID,
            GrossAmount: data[i].GrossAmount,
            FinancialRequestType: data[i].FinancialRequestTypeId,
            Date: Date
          });
        }
        return mainData;
      }
    ));
  }

  getDels(contractID: number) {
    const mainData: { ID, DelPropsRev, Date, Zone, Value }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'Dels\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let Date = null;
          if (data[i].Date1) {
            Date = moment(data[i].Date1, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          mainData.push({
            ID: data[i].ID,
            DelPropsRev: data[i].DelPropsRevId.results[0],
            Date: Date,
            Zone: data[i].ZoneId.results[0],
            Value: data[i].Value1,
          });
        }
        return mainData;
      }
    ));
  }

  getAllDelProps(contractID: number) {
    const mainData: { ID, DelItem, Kind }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'DelProps\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push({
            ID: data[i].ID,
            DelItem: data[i].DelItemId,
            Kind: data[i].Kind,
          });
        }
        return mainData;
      }
    ));
  }

  getAllDelPropsRevs(contractID: number) {
    const mainData: { ID, DelProp, RevNumber, DDate }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'DelPropsRevs\')/items?$Orderby=DDate desc',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push({
            ID: data[i].ID,
            DelProp: data[i].DelPropId,
            RevNumber: data[i].RevNumber,
            DDate: data[i].DDate,
          });
        }
        return mainData;
      }
    ));
  }

  getAllDelItems(contractID: number) {
    const mainData: { ID, Deliverable: { ID, Title }, OperationType: { ID, Title } }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'DelItems\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push({
            ID: data[i].ID,
            Deliverable: {
              ID: data[i].DeliverableId,
              Title: null
            },
            OperationType: {
              ID: data[i].OperationTypeId.results[0],
              Title: null
            },
          });
        }
        return mainData;
      }
    ));
  }

  getAllServiceCosts(contractID: number) {
    const mainData: { ID, CostCode, DDate, Service: { ID, Title }, Cost }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'ServiceCosts\')/items?$Orderby=DDate desc',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let DDate = null;
          if (data[i].DDate) {
            DDate = moment(data[i].DDate, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          mainData.push({
            ID: data[i].ID,
            CostCode: data[i].CostCodeId.results[0],
            DDate: DDate,
            Service: {
              ID: data[i].Service1Id.results[0],
              Title: null
            },
            Cost: data[i].Cost
          });
        }
        return mainData;
      }
    ));
  }

  getAllCosts(contractID: number) {
    const mainData: { ID, Cost, DDate, EqCost }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'Costs\')/items?$Orderby=DDate desc',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let DDate = null;
          if (data[i].DDate) {
            DDate = moment(data[i].DDate, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          mainData.push({
            ID: data[i].ID,
            Cost: data[i].Cost,
            DDate: DDate,
            EqCost: data[i].EqCost,
          });
        }
        return mainData;
      }
    ));
  }

  updateContractDutiesDel(DigestValue, listName, contractID: number, dutyID: number, data: { Date, DelItem, Zone, Value }, today) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
      'IF-MATCH': '*',
      'X-HTTP-Method': 'MERGE'
    });
    const body = {
      '__metadata': {'type': 'SP.Data.' + listName + 'ListItem'},
      'Json': JSON.stringify(data),
      'DutyApprovementStatusId': 3,
      'DutyDoneStatusId': 2,
      'ImporterDoneDate': today
    };
    return this.http.post(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'' + listName + '\')/items(' + dutyID + ')',
      body,
      {headers: headers}
    );
  }

  sendToContractDuties(DigestValue, listName, contractID: number, calenderID: number) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    const body = {
      '__metadata': {'type': 'SP.Data.' + listName + 'ListItem'},
      'DutyCalenderIdId': calenderID,
      'DutyDoneStatusId': 3,
    };
    return this.http.post(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'' + listName + '\')/items',
      body,
      {headers: headers}
    );
  }

  updateContractDuties(DigestValue, listName, contractID: number, dutyID: number, data, today, dutyApprovementStatus, dutyDoneStatus, isPM, ImporterDoneDate, isPCDate = false) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
      'IF-MATCH': '*',
      'X-HTTP-Method': 'MERGE'
    });
    let body;
    if (isPM) {
      // if (isPCDate) {
      //   data.Date = data.Date = moment(data.Date).format('jYYYY/jMM/jDD');
      // }
      if (ImporterDoneDate) {
        body = {
          '__metadata': {'type': 'SP.Data.' + listName + 'ListItem'},
          'Json': JSON.stringify(data),
          'DutyApprovementStatusId': dutyApprovementStatus,
          'PMApprovedDate': today,
        };
      } else {
        body = {
          '__metadata': {'type': 'SP.Data.' + listName + 'ListItem'},
          'Json': JSON.stringify(data),
          'DutyApprovementStatusId': dutyApprovementStatus,
          'DutyDoneStatusId': dutyDoneStatus,
          'ImporterDoneDate': today,
          'PMApprovedDate': today,
        };
      }
    } else {
      body = {
        '__metadata': {'type': 'SP.Data.' + listName + 'ListItem'},
        'Json': JSON.stringify(data),
        'DutyApprovementStatusId': dutyApprovementStatus,
        'DutyDoneStatusId': dutyDoneStatus,
        'ImporterDoneDate': today
      };
    }
    return this.http.post(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'' + listName + '\')/items(' + dutyID + ')',
      body,
      {headers: headers}
    );
  }

  getDutyApprovementStatuses() {
    const mainData2: { ID, Title }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'DutyApprovementStatuses\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData2[i] = {
            ID: data[i].ID,
            Title: data[i].Title,
          };
        }
        return mainData2;
      }
    ));
  }

  getDutyDoneStatuses() {
    const mainData2: { ID, Title }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'DutyDoneStatuses\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData2[i] = {
            ID: data[i].ID,
            Title: data[i].Title,
          };
        }
        return mainData2;
      }
    ));
  }

  getContractDuties(contractID: number) {
    const mainData2 = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'Duties\')/items?$top=10000',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let importerDate = null;
          // if (data[i].ID === 159) {
          //   const m = moment(data[i].ImporterDoneDate);
          // if (m.isValid()) {
          //   m.locale('fa');
          //   console.log(m.format("YYYY/MM/DD"));
          // }
          // }
          if (data[i].ImporterDoneDate) {
            importerDate = moment(data[i].ImporterDoneDate).format('jYYYY/jMM/jDD');
          }
          if (data[i].ID === 159) {
            console.log(importerDate);
          }
          let pmApprovedDate = null;
          if (data[i].PMApprovedDate) {
            pmApprovedDate = moment(data[i].PMApprovedDate).format('jYYYY/jMM/jDD');
          }
          mainData2.push(
            new ContractDutiesModel(
              data[i].ID,
              +data[i].DutyCalenderIdId,
              data[i].DutyDoneStatusId,
              importerDate,
              pmApprovedDate,
              +data[i].DutyApprovementStatusId,
              JSON.parse(data[i].Json),
            )
          );
        }
        return mainData2;
      }
    ));
  }

  getPCRelations(contractID: number, pcPropId: number) {
    const mainData: ContractPCModel[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'PCs\')/items?$filter=PCPropId eq ' + pcPropId + '&$select=ID,PCProp/ID,Date1,PC&$expand=PCProp',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new ContractPCModel(
              data[i].ID,
              data[i].PCPropId,
              moment(data[i].Date1, 'YYYY/M/D').format('jYYYY/jMM/jDD'),
              +data[i].PC * 10000,
            )
          );
        }
        return mainData;
      }
    ));
  }

  getDashboardContractPCs(contractID: number, pcProps) {
    pcProps = pcProps.join();
    pcProps = pcProps.replace(/,/g, '\') or (PCPropId eq \'');
    const mainData: ContractPCModel[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'PCs\')/items?$filter=((PCPropId  eq \'' + pcProps + '\'))&$select=ID,PCPropId,Date1,PC&$top=10000&$Orderby=Date1 asc',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let date;
          if (data[i].Date1) {
            date = moment(data[i].Date1).format('jYYYY/jMM/jDD');
          }
          mainData.push(
            new ContractPCModel(
              data[i].ID,
              data[i].PCPropId,
              date,
              +data[i].PC,
            )
          );
        }
        return mainData;
      }
    ));
  }

  getContractPCs(contractID: number, pcPropId: number) {
    const mainData: ContractPCModel[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'PCs\')/items?$filter=PCPropId eq ' + pcPropId + '&$select=ID,PCProp/ID,Date1,PC&$expand=PCProp',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new ContractPCModel(
              data[i].ID,
              data[i].PCPropId,
              moment(data[i].Date1, 'YYYY/M/D').format('jYYYY/jMM/jDD'),
              +data[i].PC * 10000,
            )
          );
        }
        return mainData;
      }
    ));
  }

  getContractStakeHolders(contractID: number) {
    const mainData: ContractStakeHolderModel[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'StakeHolders\')/items?$select=ID,OrgName,Role_StakeHolder,AgentName,AgentPositionId,PhoneNumber,LocationAddress,Email,IsPillar',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let DDate = null;
          if (data[i].DDate) {
            DDate = moment(data[i].DDate, 'YYYY/M/D').format('jYYYY/jMM/jDD');
          }
          mainData.push(
            new ContractStakeHolderModel(
              data[i].ID,
              data[i].OrgName,
              data[i].Role_StakeHolder,
              data[i].AgentName,
              {
                Id: data[i].AgentPositionId,
                Title: null,
              },
              data[i].PhoneNumber,
              data[i].LocationAddress,
              data[i].Email,
              data[i].IsPillar,
              DDate,
            )
          );
        }
        return mainData;
      }
    ));
  }

  getContractCashFlowPlans(contractID: number, cashFlowPlanCode: number) {
    const mainData: ContractCashFlowPlanModel[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'CashFlowPlans\')/items?$filter=CashFlowPlansPropCodeId eq ' + cashFlowPlanCode + '&$select=ID,CashFlowPlansPropCodeId,Date1,Cost',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new ContractCashFlowPlanModel(
              data[i].Id,
              data[i].CashFlowPlansPropCodeId,
              moment(data[i].Date1, 'YYYY/M/D').format('jYYYY/jMM/jDD'),
              data[i].Cost,
            )
          );
        }
        return mainData;
      }
    ));
  }

  getContractAssignedCostReses(contractID: number) {
    const mainData: ContractAssignedCostResModel[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'AssignedCostReses\')/items?$select=ID,DDate,Cost,CostResourceId,CostCode/ID,CostCode/Cost&$expand=CostCode',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new ContractAssignedCostResModel(
              data[i].Id,
              {
                Id: data[i].CostCode.ID,
                Cost: data[i].CostCode.Cost
              },
              moment(data[i].DDate, 'YYYY/M/D').format('jYYYY/jMM/jDD'),
              {
                Id: data[i].CostResourceId,
                Title: null
              },
              data[i].Cost,
            )
          );
        }
        return mainData;
      }
    ));
  }

  getAllContracts() {
    const mainData: ContractModel[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Contracts\')/items?$filter=IsActive1 ne false&$select=ID,LastVersion,Title,ShortTitle,Service1Id,StartDate1,Standards,Number,IsActive1,FinishDate,DDate,Cost,PC_Last,Del_Last,ServiceCost_Last,AssignedCostReses_Last,PCCalcs_Last,Financial_Last,Unit/ID,Unit/Title,SubUnit/ID,SubUnit/Title,Currency/ID,Currency/Title,Contractor/ID,Contractor/Title,PM/ID,PM/Title,PMOExpert/ID,PMOExpert/Title,Importer/ID,Importer/Title,RaiPart/ID,RaiPart/Title,Zone/ID,Zone/Title,ContractKind/Title&$expand=Unit,SubUnit,Contractor,Currency,PM,PMOExpert,Importer,RaiPart,Zone,ContractKind',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let lastPC = null;
          let isActive = 'غیر فعال';
          if (data[i].IsActive1) {
            isActive = 'فعال';
          }
          if (data[i].PC_Last) {
            lastPC = JSON.parse(data[i].PC_Last);
          }
          let delLast = null;
          if (data[i].Del_Last) {
            delLast = JSON.parse(data[i].Del_Last);
          }
          let serviceCosLast = null;
          if (data[i].ServiceCost_Last) {
            serviceCosLast = JSON.parse(data[i].ServiceCost_Last);
          }
          let assignedCostResesLast = null;
          if (data[i].AssignedCostReses_Last) {
            assignedCostResesLast = JSON.parse(data[i].AssignedCostReses_Last);
          }
          let pcCalcsLast = null;
          if (data[i].PCCalcs_Last) {
            pcCalcsLast = JSON.parse(data[i].PCCalcs_Last);
          }
          let financialLast = null;
          if (data[i].Financial_Last) {
            financialLast = JSON.parse(data[i].Financial_Last);
          }
          mainData[i] = {
            Id: data[i].ID,
            VersionCode: data[i].LastVersion,
            Title: data[i].Title,
            ShortTitle: data[i].ShortTitle,
            IsActive: isActive,
            Service: data[i].Service1Id.results,
            Kind: data[i].ContractKind.Title,
            Number: data[i].Number,
            Subject: data[i].Subject,
            StartDate: moment(data[i].StartDate1, 'YYYY/M/D').format('jYYYY/jMM/jDD'),
            GuaranteePeriod: data[i].GuaranteePeriod,
            Unit: {
              Id: data[i].Unit.results[0].ID,
              Title: data[i].Unit.results[0].Title,
            },
            SubUnit: {
              Id: data[i].SubUnit.ID,
              Title: data[i].SubUnit.Title,
            },
            Currency: {
              Id: data[i].Currency,
              Title: data[i].Currency,
            },
            PMOExpert: {
              Id: data[i].PMOExpert.ID,
              Title: data[i].PMOExpert.Title,
            },
            PM: {
              Id: data[i].PM.ID,
              Title: data[i].PM.Title,
            },
            Contractor: {
              Id: data[i].Contractor.ID,
              Title: data[i].Contractor.Title,
            },
            RaiPart: {
              Id: data[i].RaiPart.ID,
              Title: data[i].RaiPart.Title,
            },
            Importer: {
              Id: data[i].Importer.ID,
              Title: data[i].Importer.Title,
            },
            Zone: null,
            Standards: data[i].Standards,
            FinishDate: moment(data[i].FinishDate, 'YYYY/M/D').format('jYYYY/jMM/jDD'),
            Cost: data[i].Cost,
            LastPC: lastPC,
            DelLast: delLast,
            AssignedCostResesLast: assignedCostResesLast,
            ServiceCosLast: serviceCosLast,
            PCCalcsLast: pcCalcsLast,
            FinancialLast: financialLast,
            DeclareDate: moment(data[i].DDate, 'YYYY/M/D').format('jYYYY/jMM/jDD'),
          };
          mainData[i].Zone = data[i].Zone.results.map(v => {
            return {
              Id: v.ID,
              Title: v.Title,
            };
          });
        }
        return mainData;
      }
    ));
  }

  getContract(contractID: number) {
    let mainData: ContractModel;
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Contracts\')/items?$filter=ID eq ' + contractID + '&$select=ID,LastVersion,Number,Title,ShortTitle,Service1Id,ComptrollerContractCode,StartDate1,FinishDate,DDate,Cost,PC_Last,Del_Last,ServiceCost_Last,AssignedCostReses_Last,PCCalcs_Last,Financial_Last,Unit/ID,Unit/Title,SubUnit/ID,SubUnit/Title,Contractor/ID,Contractor/Title,PM/ID,PM/Title,Importer/ID,Importer/Title,Zone/ID,Zone/Title&$expand=Unit,SubUnit,Contractor,PM,Importer,Zone',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results[0];
        let lastPC = null;
        if (data.PC_Last) {
          lastPC = JSON.parse(data.PC_Last);
        }
        let delLast = null;
        if (data.Del_Last) {
          delLast = JSON.parse(data.Del_Last);
        }
        let serviceCosLast = null;
        if (data.ServiceCost_Last) {
          serviceCosLast = JSON.parse(data.ServiceCost_Last);
        }
        let assignedCostResesLast = null;
        if (data.AssignedCostReses_Last) {
          assignedCostResesLast = JSON.parse(data.AssignedCostReses_Last);
        }
        let pcCalcsLast = null;
        if (data.PCCalcs_Last) {
          pcCalcsLast = JSON.parse(data.PCCalcs_Last);
        }
        let financialLast = null;
        if (data.Financial_Last) {
          financialLast = JSON.parse(data.Financial_Last);
        }
        mainData = {
          Id: data.ID,
          VersionCode: data.LastVersion,
          Title: data.Title,
          ShortTitle: data.ShortTitle,
          Service: data.Service1Id.results,
          Kind: null,
          Number: data.Number,
          Subject: null,
          StartDate: moment(data.StartDate1, 'YYYY/M/D').format('jYYYY/jMM/jDD'),
          GuaranteePeriod: null,
          Unit: {
            Id: data.Unit.results[0].ID,
            Title: data.Unit.results[0].Title,
          },
          SubUnit: {
            Id: data.SubUnit.ID,
            Title: data.SubUnit.Title,
          },
          Currency: null,
          PMOExpert: null,
          PM: {
            Id: data.PM.ID,
            Title: data.PM.Title,
          },
          Contractor: {
            Id: data.Contractor.ID,
            Title: data.Contractor.Title,
          },
          RaiPart: null,
          Importer: {
            Id: data.Importer.ID,
            Title: data.Importer.Title,
          },
          Zone: data.Zone.results,
          Standards: null,
          FinishDate: moment(data.FinishDate, 'YYYY/M/D').format('jYYYY/jMM/jDD'),
          Cost: data.Cost,
          DeclareDate: moment(data.DDate, 'YYYY/M/D').format('jYYYY/jMM/jDD'),
          LastPC: lastPC,
          DelLast: delLast,
          AssignedCostResesLast: assignedCostResesLast,
          ServiceCosLast: serviceCosLast,
          PCCalcsLast: pcCalcsLast,
          FinancialLast: financialLast,
          ComptrollerContractCode: data.ComptrollerContractCode,
        };
        return mainData;
      }
    ));
  }

  getContractBasic(contractID: number, basicID: number) {
    let mainData: BasicModel;
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'Basics\')/items(\'' + basicID + '\')',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d;
        mainData = {
          Id: data.ID,
          VersionCode: data.VersionCodeId,
          Title: data.Title,
          ShortTitle: data.ShortTitle,
          Service: {
            Id: data.Service1Id.results[0],
            Title: null
          },
          Kind: data.ContractKindId,
          Number: data.Number,
          Subject: data.Subject_Contract,
          StartDate: data.StartDate1,
          GuaranteePeriod: data.GuaranteePeriod,
          Unit: {
            Id: data.UnitId.results[0],
            Title: null
          },
          SubUnit: data.SubUnitId,
          Currency: {
            Id: data.CurrencyId,
            Title: null
          },
          PMOExpert: {
            Id: data.PMOExpertId,
            Title: null
          },
          PM: {
            Id: data.PMId,
            Title: null
          },
          Contractor: {
            Id: data.ContractorId,
            Title: null
          },
          RaiPart: {
            Id: data.RaiPartId,
            Title: null
          },
          Importer: {
            Id: data.ImporterId,
            Title: null
          },
          Zone: {
            Id: data.ZoneId.results[0],
            Title: null
          },
          Standards: data.Standards,
        };
        return mainData;
      }
    ));
  }

  getBasics(contractID: number,) {
    const mainData: BasicModel[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'Basics\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new BasicModel(
              data[i].ID,
              data[i].VersionCodeId,
              data[i].Title,
              data[i].ShortTitle,
              {
                Id: data[i].Service1Id.results[0],
                Title: null
              },
              data[i].ContractKindId,
              data[i].Number,
              data[i].Subject_Contract,
              moment(data[i].StartDate1, 'YYYY/M/D').format('jYYYY/jM/jD'),
              data[i].GuaranteePeriod,
              data[i].UnitId.results[0],
              data[i].SubUnitId,
              {
                Id: data[i].CurrencyId,
                Title: null
              },
              {
                Id: data[i].PMOExpertId,
                Title: null
              },
              {
                Id: data[i].PMId,
                Title: null
              },
              {
                Id: data[i].ContractorId,
                Title: null
              },
              {
                Id: data[i].RaiPartId,
                Title: null
              },
              {
                Id: data[i].ImporterId,
                Title: null
              },
              {
                Id: data[i].ZoneId.results[0],
                Title: null
              },
              data[i].Standards,
            )
          );
        }
        return mainData;
      }
    ));
  }

  addZeroToMonth(month) {
    if (+month < 10) {
      return '0' + month;
    } else {
      return month;
    }
  }
}
