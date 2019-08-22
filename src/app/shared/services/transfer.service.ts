import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';
import { OldContractList } from '../models/transferModels/oldContract.model';
import { UnitsList } from '../models/units.model';
import { StepFormsDataList } from '../models/stepFormModels/stepFormsData.model';
import { ContractServicesList } from '../models/contractServices.model';
import { TransferDataBaseList } from '../models/transferModels/transferDataBase.model';
import { TransferWeekProgressList } from '../models/transferModels/transferWeekProgress.model';
import { TransferTempContractList } from '../models/transferModels/transferTempContract.model';
import { TransferDeliverablesList } from '../models/transferModels/transferDeliverables.model';
import { TransferOperationalIndList } from '../models/transferModels/transferOperationalInd.model';
import { DeliverablesList } from '../models/Deliverables.model';
import { OperationTypesList } from '../models/operationTypes.model';
import { OldContractDBNonProjectList } from '../models/transferModels/oldContractDBNonProject.model';
import { TransferContractCostTimeTrackingList } from '../models/transferModels/transferContractCostTimeTracking.model';
import { TransferSelectCostResourceList } from '../models/transferModels/transferSelectCostResource.model';
import { TransferProcurmentCDBItemsList } from '../models/transferModels/transferProcurmentCDBItems.model';
import { TransferProcurmentActPlanList } from '../models/transferModels/transferProcurmentActPlan.model';
import { TransferContractExtensionList } from '../models/transferModels/transferContractExtension.model';

@Injectable({
  providedIn: 'root'
})
export class TransferService {
  stepFormsData = new StepFormsDataList();
  public today = new Subject();
  public todayData: any;

  constructor(private http: HttpClient) {
  }

  getDataFromContractExtension(projectID: number) {
    const mainData: TransferContractExtensionList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/pwa/report/_api/web/lists(guid\'E90777E3-106A-464F-A2CA-962C70353037\')/items?$filter=Project_x0020_ID eq '
      + projectID +
      '&$orderby=OData__x062a__x0627__x0631__x06cc__x062e__x0020__x062a__x0645__x062f__x06cc__x062f_ asc&$top=300',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
      // console.log(data);
      for (let i = 0; i < data.length; i++) {
          mainData.push(
            new TransferContractExtensionList(
              +data[i].Project_x0020_ID,
              +data[i].OData__x0645__x0628__x0644__x063a__x0020__x0642__x0631__x0627__x0631__x062f__x0627__x062f_,
              data[i].OData__x062a__x0627__x0631__x06cc__x062e__x0020__x062a__x0645__x062f__x06cc__x062f_.substring(0, 10),
              data[i].OData__x062a__x0627__x0631__x06cc__x062e__x0020__x067e__x0627__x06cc__x0627__x0646__x0020__x0637__x0628__x0642__x0020__x062a__x0645__x062f__x06cc__x062f__x0020__x0642__x0631__x0627__x0631__x062f__x0627__x062f_.substring(0, 10)
            )
          );
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  getDataFromOperationTypes() {
    const mainData: OperationTypesList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PO/References/_api/web/lists/getbytitle(\'OperationTypes\')/items?$top=300',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
      for (let i = 0; i < data.length; i++) {
        mainData.push(
          new OperationTypesList(
            data[i].Id_OperationType,
            data[i].Name_OperationType,
          )
        );
      }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  getDataFromDeliverables() {
    const mainData: DeliverablesList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PO/References/_api/web/lists/getbytitle(\'Deliverables\')/items?$top=300',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
      for (let i = 0; i < data.length; i++) {
        mainData.push(
          new DeliverablesList(
            data[i].Id_Deliverable,
            data[i].Name_Deliverable,
            data[i].MeasureUnit_Deliverable,
            data[i].PossibleUnitIds_Deliverable,
            data[i].PossibleOperationTypes_Deliverab.split(';'),
            data[i].Id_ContractService,
          )
        );
      }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  getDataFromOperational_IndList() {
    const mainData: TransferOperationalIndList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PWA/Report/_api/web/lists(guid\'ABE86726-A7D1-436E-A41D-6DAB00E5C959\')/items?$top=300',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
      for (let i = 0; i < data.length; i++) {
          mainData.push(
            new TransferOperationalIndList(
              +data[i].IndCode,
              data[i].Delivarable_ID,
              data[i].Operation_ID
            )
          );
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  getDataFromProcurement_Schedul(projectID: string) {
    const mainData: TransferProcurmentActPlanList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PWA/Report/_api/web/lists/getbytitle(\'procurment_Schedul\')/items?$filter=CDB_ID/Contract_Code eq \'' + projectID + '\'' +
      '&$select=CDB_ID/Id,Deliver_Date1,Deliver_Amount_Plan' +
      '&$expand=CDB_ID&$orderby=Deliver_Date1 asc&$top=1000',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new TransferProcurmentActPlanList(
              data[i].CDB_ID.Id,
              (data[i].Deliver_Date1).substring(0, 10),
              +data[i].Deliver_Amount_Plan
            )
          );
        }
        console.log(mainData);
        return mainData;
      }
    ));
  }

  getDataFromProcurement_Actual(projectID: string) {
    const mainData: TransferProcurmentActPlanList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PWA/Report/_api/web/lists/getbytitle(\'procurment_Actual\')/items?$filter=CDB_ID/Contract_Code eq \'' + projectID + '\'' +
      '&$select=CDB_ID/Id,Deliver_Date1,Deliver_Amount' +
      '&$expand=CDB_ID&$orderby=Deliver_Date1 asc&$top=1000',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new TransferProcurmentActPlanList(
              data[i].CDB_ID.Id,
              (data[i].Deliver_Date1).substring(0, 10),
              +data[i].Deliver_Amount
            )
          );
        }
        console.log(mainData);
        return mainData;
      }
    ));
  }

  getDataFromProcurement_CDB_Items(projectID: string) {
    const mainData: TransferProcurmentCDBItemsList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PWA/Report/_api/web/lists/getbytitle(\'Procurment_CDB_Items\')/items?$filter=Contract_Code eq \'' + projectID + '\'' +
      '&$select=Contract_Code,ID,Del_ID,Op_ID,Procur_ID/Del_ID,Procur_ID/Op_ID,Amount' +
      '&$expand=Procur_ID&$top=1000',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new TransferProcurmentCDBItemsList(
              data[i].Contract_Code,
              +data[i].ID,
              data[i].Del_ID,
              data[i].Op_ID,
              data[i].Procur_ID.Del_ID,
              data[i].Procur_ID.Op_ID,
              +data[i].Amount
            )
          );
        }
        console.log(mainData);
        return mainData;
      }
    ));
  }

  getDataFromDeliverableActList(projectID: number) {
    const mainData: TransferDeliverablesList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PWA/Report/_api/web/lists/getbytitle(\'DeliverableActList\')/items?$filter=PrjID eq ' + projectID + '&$top=300',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new TransferDeliverablesList(
              +data[i].PrjID,
              +data[i].Deliverables,
              +data[i].Zone,
              +data[i].Quantity,
              +data[i].Year,
              +data[i].Month,
            )
          );
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  getDataFromDeliverablePlanDB(projectID: number) {
    const mainData: TransferDeliverablesList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PWA/Report/_api/web/lists/getbytitle(\'DeliverablePlanDB\')/items?$filter=_x006a_o48 eq ' + projectID + '&$top=300',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new TransferDeliverablesList(
              +data[i]._x006a_o48,
              +data[i].g4va,
              +data[i].pvkt,
              +data[i].medx,
              +data[i].lsvh,
              +data[i].h4ku,
            )
          );
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  getAllDataFromTempContract() {
    const mainData: TransferTempContractList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PO/_api/web/lists/getbytitle(\'TempContracts\')/items?$select=Code_TempContract,OldProjectId&$top=3000',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          const oldProjectId = data[i].OldProjectId;
          if (oldProjectId !== 0) {
            mainData.push(
              new TransferTempContractList(
                data[i].Code_TempContract,
                oldProjectId,
              )
            );
          }
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  getTodayDateFromContextInfo() {
    const headers = new HttpHeaders({'ACCEPT': 'application/json;odata=verbose'});
    return this.http.post(
      'http://pmo.rai.ir/PO/_api/contextinfo',
      '',
      {headers: headers}
    ).pipe(map((response: Response) => {
        let data = (<any>response).d.GetContextWebInformation.FormDigestValue;
        const first = data.substring(data.length - 50).split(',')[1];
        data = new Date(first).toISOString().substring(0, 10);
        this.todayData = data;
        this.today.next(data);
        return data;
      }
    ));
  }

  getDataFromWeekProgress(projectID: number) {
    const mainData: TransferWeekProgressList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/pwa/report/_api/web/lists(guid\'91D09252-FA05-469E-8BE1-763F0C383AEF\')/items?$filter=Project_x0020_ID eq '
      + projectID +
      '&$select=Project_x0020_ID,Year0,Date,Week_x0020_Num0,OData__x067e__x06cc__x0634__x0631__x0641__x062a__x0020__x0648__x0627__x0642__x0639__x06cc_,OData__x067e__x06cc__x0634__x0631__x0641__x062a__x0020__x0628__x0631__x0646__x0627__x0645__x0647__x0020__x0627__x06cc_0' +
      '&$orderby=Year0,Date,Week_x0020_Num0 asc&$top=300',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new TransferWeekProgressList(
              +data[i].Project_x0020_ID,
              data[i].Year0,
              data[i].Date,
              data[i].Week_x0020_Num0,
              data[i].OData__x067e__x06cc__x0634__x0631__x0641__x062a__x0020__x0648__x0627__x0642__x0639__x06cc_,
              data[i].OData__x067e__x06cc__x0634__x0631__x0641__x062a__x0020__x0628__x0631__x0646__x0627__x0645__x0647__x0020__x0627__x06cc_0
            )
          );
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  getDataFromDataBaseList(projectID: number) {
    const mainData: TransferDataBaseList[] = [];
    const mainDataForProgressPlan2: TransferDataBaseList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/pwa/report/_api/web/lists/getbytitle(\'DataBase\')/items?$filter=ProjectID eq '
      + projectID +
      '&$select=ProjectID,ProgressPlan2,OData__x0633__x0627__x0644_,OData__x0645__x0627__x0647_,OData__x0648__x0627__x0642__x0639__x06,OData__x0628__x0631__x0646__x0627__x06,OData__x062c__x0631__x06cc__x0627__x06' +
      '&$orderby=_x0633__x0627__x0644_,_x0645__x0627__x0647_ asc&$top=300',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        let isActHoundred = false;
        let isPlanHoundred = false;
        for (let i = 0; i < data.length; i++) {
          let act = data[i].OData__x0648__x0627__x0642__x0639__x06;
          let plan = data[i].OData__x0628__x0631__x0646__x0627__x06;
          if (+act === 1) {
            if (isActHoundred) {
              act = null;
            } else {
              isActHoundred = true;
            }
          }
          if (+plan === 1) {
            if (isPlanHoundred) {
              plan = null;
            } else {
              isPlanHoundred = true;
            }
          }
          mainData.push(
            new TransferDataBaseList(
              +data[i].ProjectID,
              data[i].OData__x0633__x0627__x0644_,
              data[i].OData__x0645__x0627__x0647_,
              act,
              plan,
              +data[i].OData__x062c__x0631__x06cc__x0627__x06
            )
          );
          mainDataForProgressPlan2.push(
            new TransferDataBaseList(
              +data[i].ProjectID,
              data[i].OData__x0633__x0627__x0644_,
              data[i].OData__x0645__x0627__x0647_,
              act,
              plan,
              +data[i].OData__x062c__x0631__x06cc__x0627__x06,
              +data[i].ProgressPlan2
            )
          );
        }
        // console.log(mainData);
        return {
          DataBase: mainData,
          DataBaseForProgressPlan2: mainDataForProgressPlan2
        };
      }
    ));
  }

  updateDataContractID(DigestValue: any, id) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
      'IF-MATCH': '*',
      'X-HTTP-Method': 'MERGE'
    });
    const body = {
      '__metadata': {'type': 'SP.Data.TempContractsListItem'},
      'Code_TempContract': 'TC' + id
    };
    console.log(body);
    return this.http.post(
      'http://pmo.rai.ir/PO/_api/web/lists/getbytitle(\'TempContracts\')/items(' + id + ')',
      body,
      {headers: headers}
    );
  }

  getContractId() {
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PO/_api/web/lists/getbytitle(\'TempContracts\')/items?select=Code_TempContract&$top=1&$orderby=Created desc',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        console.log(data);
        // mainData = data;
        // data[0].DefaultPMOExpertId_User
        return data[0].ID;
      }
    ));
  }

  sendDataJson(DigestValue: any, data, tempJsonData) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    const body = {
      '__metadata': {'type': 'SP.Data.TempContractsListItem'},
      'Json_TempContract': JSON.stringify(tempJsonData),
      'ImporterId_TempContract': data.ImporterId,
      'PMOExpertId_TempContract\Id': data.PMOExpertId,
      'OldProjectId': data.ProjectId.toString()
    };
    console.log(body);
    return this.http.post(
      'http://pmo.rai.ir/PO/_api/web/lists/getbytitle(\'TempContracts\')/items',
      body,
      {headers: headers}
    );
  }

  getDataFromContextInfo() {
    const headers = new HttpHeaders({'ACCEPT': 'application/json;odata=verbose'});
    return this.http.post(
      'http://pmo.rai.ir/PO/_api/contextinfo',
      '',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.GetContextWebInformation.FormDigestValue;
        return data;
      }
    ));
  }

  getContractServices() {
    const mainData: ContractServicesList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PO/References/_api/web/lists/getbytitle(\'ContractServices\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new ContractServicesList(
              data[i].Id_ContractService,
              data[i].Name_ContractService,
              data[i].DeliverableType,
              data[i].PCType,
            )
          );
        }
        return mainData;
      }
    ));
  }

  getUnits() {
    const mainData: UnitsList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PO/References/_api/web/lists/getbytitle(\'Units\')/items?$select=DefaultPMOExpertId_User/Id,Id_Unit,OldEPMName&$expand=DefaultPMOExpertId_User',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new UnitsList(
              data[i].Id_Unit,
              data[i].OldEPMName,
              data[i].DefaultPMOExpertId_User.Id
            )
          );
        }
        return mainData;
      }
    ));
  }

  getAllContractsFromContract_Cost_Time_Tracking() {
    const mainData: TransferContractCostTimeTrackingList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PWA/Report/_api/web/lists/getbytitle(\'Contract_cost_time_tracking\')/items?' +
      '$select=Contract_Code,vm5x,OData__x0064_276,contract_cost' +
      '&$orderby=vm5x asc&$top=1000',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let declareDate = data[i].vm5x;
          let finishDate = data[i].OData__x0064_276;
          if (declareDate !== null) {
            declareDate =  declareDate.substring(0, 10);
          }
          if (finishDate !== null) {
            finishDate = finishDate.substring(0, 10);
          }
          mainData.push(
            new TransferContractCostTimeTrackingList(
              data[i].Contract_Code,
              declareDate,
              finishDate,
              +data[i].contract_cost,
            )
          );
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  getAllContractsFromContracts_DB() {
    const mainData: OldContractDBNonProjectList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PWA/Report/_api/web/lists/getbytitle(\'Contract_DB\')/items?' +
      '$select=MC_ID/MC_ID,Contract_Code,unit_id_New/Unit_Id,Sub_Units_ID_New/Sub_Units_ID,Default_Service_Id,Contract_Title,Contract_Number,Contract_Start_dateNew,Currency_idNew/currency_id,Contract_Subject' +
      '&$expand=MC_ID,Currency_idNew,unit_id_New,Sub_Units_ID_New&$top=1000',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new OldContractDBNonProjectList(
              +data[i].MC_ID.MC_ID,
              data[i].Contract_Code,
              'Un' + +data[i].unit_id_New.Unit_Id,
              data[i].Sub_Units_ID_New.Sub_Units_ID,
              data[i].Default_Service_Id,
              data[i].Contract_Title,
              data[i].Contract_Number,
              null, // contractNumber 2
              (data[i].Contract_Start_dateNew).substring(0, 10),
              null, // finishDate
              data[i].Currency_idNew.currency_id,
              null, // contractCost
              null,
              data[i].Contract_Subject,
              null
            )
          );
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  getAllContractsFromSelectCostResource() {
    const mainData: TransferSelectCostResourceList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PWA/Report/_api/web/lists/getbytitle(\'select_cost_resource\')/items?' +
      '$select=LinkTitle,Cost_source_ID_New/CostResource_ID' +
      '&$expand=Cost_source_ID_New&$top=1000',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new TransferSelectCostResourceList(
              data[i].LinkTitle,
              data[i].Cost_source_ID_New.CostResource_ID,
            )
          );
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  getAllContractsFromContractsDB() {
    const mainData: OldContractList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PWA/Report/_api/web/lists/getbytitle(\'ContractsDB\')/items?' +
      '$select=McID,ProjectID,CostResource_ID,Content,OData__x0627__x062f__x0627__x0631__x0647__x0020__x06a9__x0644_,SubUnit_ID,DefaultServices,OData__x0639__x0646__x0648__x0627__x0646__x0020__x0642__x0631__x0627__x0631__x062f__x0627__x062f_,OData__x0634__x0645__x0627__x0631__x0647__x0020__x0642__x0631__x0627__x0631__x062f__x0627__x062f_,Contractor_Id,OData__x062a__x0627__x0631__x06cc__x062e__x0020__x0634__x0631__x0648__x0639__x0020__x0642__x0631__x0627__x0631__x062f__x0627__x062f_,OData__x062a__x0627__x0631__x06cc__x062e__x0020__x067e__x0627__x06cc__x0627__x0646__x0020__x0642__x0631__x0627__x0631__x062f__x0627__x062f_,OData__x0648__x0627__x062d__x062f__x0020__x0627__x0631__x0632_,OData__x0645__x0628__x0644__x063a__x0020__x0642__x0631__x0627__x0631__x062f__x0627__x062f_' +
      '&$top=1000',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let costResource_ID = data[i].CostResource_ID;
          if (costResource_ID !== null) {
            costResource_ID = costResource_ID.split(';');
          } else {
            costResource_ID = [];
          }
          mainData.push(
            new OldContractList(
              +data[i].McID,
              +data[i].ProjectID,
              data[i].OData__x0627__x062f__x0627__x0631__x0647__x0020__x06a9__x0644_,
              data[i].SubUnit_ID,
              data[i].DefaultServices,
              data[i].OData__x0639__x0646__x0648__x0627__x0646__x0020__x0642__x0631__x0627__x0631__x062f__x0627__x062f_,
              data[i].OData__x0634__x0645__x0627__x0631__x0647__x0020__x0642__x0631__x0627__x0631__x062f__x0627__x062f_,
              data[i].Contractor_Id,
              (data[i].OData__x062a__x0627__x0631__x06cc__x062e__x0020__x0634__x0631__x0648__x0639__x0020__x0642__x0631__x0627__x0631__x062f__x0627__x062f_).substring(0, 10),
              (data[i].OData__x062a__x0627__x0631__x06cc__x062e__x0020__x067e__x0627__x06cc__x0627__x0646__x0020__x0642__x0631__x0627__x0631__x062f__x0627__x062f_).substring(0, 10),
              data[i].OData__x0648__x0627__x062d__x062f__x0020__x0627__x0631__x0632_,
              data[i].OData__x0645__x0628__x0644__x063a__x0020__x0642__x0631__x0627__x0631__x062f__x0627__x062f_,
              costResource_ID,
              data[i].Content,
              null
            )
          );
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }
}
