import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {CurrencyList} from '../models/currency.model';
import {map} from 'rxjs/operators';
import {StepFormsDataList} from '../models/stepFormModels/stepFormsData.model';
import {Subject} from 'rxjs/index';
import {CostResourcesList} from '../models/costResources.model';
import {SubUnitsList} from '../models/subUnits.model';
import {UserList} from '../models/user.model';
import {CurrentUserList} from '../models/currentUser.model';
import {ImporterList} from '../models/importer.model';
import {PMsList} from '../models/PMs.model';
import {UserNameList} from '../models/userName.model';
import {UnitsList} from '../models/units.model';
import {ContractServicesList} from '../models/contractServices.model';
import {ZonesList} from '../models/zones.model';
import {DeliverablesList} from '../models/Deliverables.model';
import {OperationTypesList} from '../models/operationTypes.model';
import {AgentPositionsList} from '../models/agentPositions.model';
import {ContractTypesList} from '../models/contractTypes.model';
import * as moment from 'jalali-moment';
import {CurrenciesList} from '../models/currencies.model';
import {ContractorsList} from '../models/contractors.model';
import {RaiPartsList} from '../models/raiParts.model';
import {ComptrollerContractsList} from '../models/comptrollerContracts.model';
import {StepDeliverablesFormList} from '../models/stepFormModels/stepDeliverablesForm.model';
import {toBase64String} from '@angular/compiler/src/output/source_map';
import {FinancialModel} from '../models/transferModels/Financial.model';
import {FinancialRequestTypeModel} from '../models/FinancialRequestType.model';
import {ContractComptrollerModel} from '../models/ContractComptroller.model';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  stepFormsData = new StepFormsDataList();
  public stepForms = new Subject<any>();
  public deliverableValsTemp: { Date: any[], Data: any[], ServiceId: string, DelId: string }[] = [];
  public currentUser = new Subject();
  public currentUser2: CurrentUserList;
  public user = new Subject();
  public user2 = new Subject();
  public userData: any;
  public deliverableChange = new Subject();
  public today = new Subject();
  public todayData: any;
  public contractServicesSubject = new Subject();
  public creatingDeliverables = new Subject();
  public zones = new Subject();
  public stepLocks = false;
  public stepLocksSubject = new Subject();
  isReadOnly = false;
  public newCost: number;
  public newCostSubject = new Subject();
  public newDate = new Subject();
  public tablesDirty = {
    cashFlowPlan: false,
    planActsProp: false
  };
  stepsDirty = {
    contractForm: false,
    costAssignedResourcesForm: false,
    stakeHoldersForms: false,
    planActsProp: false,
    cashFlow: false,
    deliverable: false
  };
  public isFinancialSubject = new Subject();
  public isProgressSubject1 = new Subject();
  public isFinancial = false;
  public isProgress = false;
  isApproved = {
    pm: true,
    expert: true,
    importer: true
  };
  userMainRole = null;
  tempContractImporter = '';
  tk = 'cmFpbHdheXNcbW9vc2F2aV9tOnp4Y1pYQyAyMg==';

  public firstTimeSteps = new Subject();

  constructor(private http: HttpClient) {
  }

  getProjecs() {
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/ProjectServer/Projects',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        return data;
      }
    ));
  }

  getAllTempContracts() {
    const mainData: { ID, Title, ImporterApprovedPre, PMApprovedPre, PMUserId, ImporterUserId, PMOExpertId, ImporterId, PMApproved, ImporterApproved, Code, Created, Importer?: number, Types?: number }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'TempContracts\')/items?$filter=IsActive1 ne false&$select=ID,Title,ImporterApprovedPre,PMApprovedPre,PMUserId,Types,PMOExpertId,ImporterId,PMApproved,ImporterApproved,Code,Created,ImporterUser/Title,ImporterUser/ID&$expand=ImporterUser&$top=10000&$OrderBy=ID desc',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          if (data[i].PMUserId !== null && data[i].ImporterUser !== null && data[i].PMOExpertId !== null && data[i].ImporterId !== null) {
            mainData.push({
              ID: data[i].ID,
              Title: data[i].Title,
              ImporterApprovedPre: data[i].ImporterApprovedPre,
              PMApprovedPre: data[i].PMApprovedPre,
              PMUserId: data[i].PMUserId,
              ImporterUserId: data[i].ImporterUser.ID,
              PMOExpertId: data[i].PMOExpertId,
              ImporterId: data[i].ImporterUser.Title,
              PMApproved: data[i].PMApproved,
              ImporterApproved: data[i].ImporterApproved,
              Code: data[i].Code,
              Created: moment(data[i].Created, 'YYYY/M/D').format('jYYYY/jM/jD'),
              Importer: data[i].ImporterId,
              Types: data[i].Types,
            });
          }
        }
        return mainData;
      }
    ));
  }

  getDDD() {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
    // const data = {Authorization: 'Basic cmFpbHdheXNcbW9vc2F2aV9tOnp4Y1pYQyAz', url: 'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Contracts\')/items'};
    const formData = {
      url: 'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Contracts\')/items',
      Authorization: 'Basic cmFpbHdheXNcbW9vc2F2aV9tOnp4Y1pYQyAz'
    };
    const postData = 'email=' + JSON.stringify(formData);
    return this.http.post(
      'http://rpmo.rai.ir:7070',
      postData,
      {headers: headers},
    ).pipe(map((response: Response) => {
        const data2 = (<any>response).value;
        return data2;
      }
    ));
  }

  breakInheritence(DigestValue: any, tableName: string, itemID: number) {
    let url;
    if (itemID) {
      url = 'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'' + tableName + '\')/items(' + itemID + ')/breakroleinheritance(copyRoleAssignments=true, clearSubscopes=true)';
    } else {
      url = 'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'' + tableName + '\')/items/breakroleinheritance(copyRoleAssignments=true, clearSubscopes=true)';
    }
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    return this.http.post(
      url,
      '',
      {headers: headers}
    );
  }

  addContractor(DigestValue: any, Data: any) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    const body = {
      '__metadata': {'type': 'SP.Data.ContractorsListItem'},
      'PersonalityType': Data.contractorType,
      'LocationAddress': Data.contractorAddress,
      'PhoneNumber': Data.contractorPish_PhoneNumber + '-' + Data.contractorPhoneNumber + '-(داخلی)-' + Data.contractorInt_PhoneNumber,
      'Title': Data.contractorName,
    };
    return this.http.post(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Contractors\')/items',
      body,
      {headers: headers}
    );
  }

  getPMName(id: number) {
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Users\')/items?$filter=ID eq ' + id,
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results[0];
        return data.Title;
      }
    ));
  }

  getPMId(id: number) {
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'PMs\')/items?$filter=ID eq ' + id,
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results[0];
        return data.User1Id;
      }
    ));
  }

  getAllPaymentPriorityCriteriaScores() {
    const mainData: { ID, LowerBound, LowerBoundCriteria, PaymentPriorityCriteria, UpperBoundCriteria, UpperBound, Score }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'PaymentPriorityCriteriaScores\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData[i] = {
            ID: data[i].ID,
            LowerBound: data[i].LowerBound,
            LowerBoundCriteria: data[i].LowerBoundCriteria,
            PaymentPriorityCriteria: data[i].PaymentPriorityCriteriaId,
            UpperBoundCriteria: data[i].UpperBoundCriteria,
            UpperBound: data[i].UpperBound,
            Score: data[i].Score,
          };
        }
        return mainData;
      }
    ));
  }

  getSlideShows() {
    const mainData: { ID, Title, IsActive, URL }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'SlideShows\')/items?$filter=IsActive1 ne false',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData[i] = {
            ID: data[i].ID,
            Title: data[i].Title,
            IsActive: data[i].IsActive1,
            URL: data[i].URL.Url,
          };
        }
        return mainData;
      }
    ));
  }

  getAllPaymentPriorityCriteriaWeights() {
    const mainData: { ID, Title, PaymentPriorityKind, Weight }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'PaymentPriorityCriteriaWeights\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData[i] = {
            ID: data[i].ID,
            Title: data[i].Title,
            PaymentPriorityKind: data[i].PaymentPriorityKindId,
            Weight: data[i].Weight,
          };
        }
        return mainData;
      }
    ));
  }

  getAllPaymentPriorityKinds() {
    const mainData: { ID, Title }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'PaymentPriorityKinds\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData[i] = {
            ID: data[i].ID,
            Title: data[i].Title,
          };
        }
        return mainData;
      }
    ));
  }

  getAllImporters() {
    const mainData2: ImporterList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Importers\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData2.push(
            new ImporterList(
              data[i].ID,
              data[i].Title,
              data[i].UnitId.results,
            )
          );
        }
        // console.log(mainData2);
        return mainData2;
      }
    ));
  }

  getBatch(DigestValue) {
    const mainData = null;
    const headers = new HttpHeaders({
      'Authorization': 'Basic cmFpbHdheXNcbW9vc2F2aV9tOnp4Y1pYQyAyMg==',
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    const body = '{ __batchRequests: [' +
      '{ requestUri: http://rpmo.rai.ir/PWT/_api/web/lists/getbytitle(\'Test\')/items", method: "GET" }' +
      ',{ requestUri: http://rpmo.rai.ir/PWT/_api/web/lists/getbytitle(\'Test2\')/items", method: "GET" }]}';
    return this.http.post(
      'http://rpmo.rai.ir/PWT/_api/$batch',
      body,
      {headers: headers}
    ).pipe(map((response: Response) => {
        return mainData;
      }
    ));
  }

  getDataFromContextInfoPWT() {
    const headers = new HttpHeaders({
      'Authorization': 'Basic cmFpbHdheXNcbW9vc2F2aV9tOnp4Y1pYQyAyMg==',
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
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

  getSnap(mabdaMaghsad: string) {
    const headers = new HttpHeaders({
      'Authorization': '7ed2f9258fef51c2baf25bccfa06f2031539096073',
      'content-type': 'application/json',
    });
    return this.http.post(
      'https://web-api.snapp.ir/api/v1/ride/price',
      mabdaMaghsad,
      {headers: headers}
    ).pipe(map((response: any) => {
        return response;
      }
    ));
  }

  getTap30(mabdaMaghsad: string) {
    const headers = new HttpHeaders({
      'x-authorization': 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjo0MDc5MzYwLCJyb2xlIjoiUEFTU0VOR0VSIiwiY2l0eSI6IlRFSFJBTiIsImRldmljZVR5cGUiOiJBTkRST0lEIn0sImlhdCI6MTUzOTA5NDM5MCwiYXVkIjoiZG9yb3Noa2U6YXBwIiwiaXNzIjoiZG9yb3Noa2U6c2VydmVyIiwic3ViIjoiZG9yb3Noa2U6dG9rZW4ifQ.WEATqDxLGjOZJmA76mj88ShWtS4d4xmVrSbiSoZ7IUxi_Ycg4FVjQO0ZfuRqQ-IK23PxPqcG3bojLY70vOFWfA',
      'content-type': 'application/json',
    });
    return this.http.post(
      'https://tap33.me/api/v2.1/ride/preview',
      mabdaMaghsad,
      {headers: headers}
    ).pipe(map((response: any) => {
        return response.data;
      }
    ));
  }


  getTestListFromPWT() {
    // const mainData: ComptrollerContractsList[] = [];
    const base64 = btoa('moosavi_m:zxcZXC 222');
    console.log(base64, 'base64');
    const headers = new HttpHeaders({
      'Authorization': 'Basic cmFpbHdheXNcbW9vc2F2aV9tOnp4Y1pYQyAyMg==',
      'Content-Type': 'application/json',
    });
    // const headers = new HttpHeaders({
    //   'x-authorization': 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjo0MDc5MzYwLCJyb2xlIjoiUEFTU0VOR0VSIiwiY2l0eSI6IlRFSFJBTiIsImRldmljZVR5cGUiOiJBTkRST0lEIn0sImlhdCI6MTUzOTA5NDM5MCwiYXVkIjoiZG9yb3Noa2U6YXBwIiwiaXNzIjoiZG9yb3Noa2U6c2VydmVyIiwic3ViIjoiZG9yb3Noa2U6dG9rZW4ifQ.WEATqDxLGjOZJmA76mj88ShWtS4d4xmVrSbiSoZ7IUxi_Ycg4FVjQO0ZfuRqQ-IK23PxPqcG3bojLY70vOFWfA',
    //   'content-type': 'application/json',
    // });
    // let headers = new HttpHeaders();
    // headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/_api/web/currentUser',
      {headers: headers}
    ).pipe(map((response: Response) => {
        // const data = (<any>response).d.results;
        // for (let i = 0; i < data.length; i++) {
        //   mainData.push(
        //     new ComptrollerContractsList(
        //       data[i].Code,
        //       moment(data[i].DDate, 'YYYY/M/D').format('jYYYY/jM/jD'),
        //       data[i].Subject_Contract,
        //       data[i].Name_Contractor,
        //       data[i].OrganName,
        //       data[i].Name_Unit
        //     )
        //   );
        // }
        return response;
      }
    ));
  }

  getAllPCRelations(contractID) {
    const mainData: { ID, ActPCProp, PlanPCProps }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'PCRelations\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push({
            ID: data[i].ID,
            ActPCProp: data[i].ActPCPropId,
            PlanPCProps: data[i].PlanPCPropsId.results[0],
          });
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  getAllPCProps(contractID) {
    const mainData: { ID, Service }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'PCProps\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push({
            ID: data[i].ID,
            Service: data[i].Service1Id.results[0],
          });
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  getAllPCs(pcProps: { ID, Service }[], contractID) {
    const mainData: { ID, PCProp, Date, PC }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractID + '/_api/web/lists/getbytitle(\'PCs\')/items?$select=ID,PCPropId,Date1,PC,PCProp/ID,PCProp/Kind&$expand=PCProp&$OrderBy=Date1 asc',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push({
            ID: data[i].ID,
            PCProp: {
              ID: data[i].PCProp.ID,
              Kind: 'P',
              Service: pcProps.filter(v => v.ID === data[i].PCProp.ID)[0].Service
            },
            Date: data[i].Date1.substring(0, 10),
            PC: data[i].PC
          });
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  // getComptrollerContracts() {
  //   const mainData: ComptrollerContractsList[] = [];
  //   let headers = new HttpHeaders();
  //   headers = headers.set('ACCEPT', 'application/json;odata=verbose');
  //   return this.http.get(
  //     'http://pmo.rai.ir/PO/_api/web/lists/getbytitle(\'ComptrollerContracts\')/items',
  //     {headers: headers}
  //   ).pipe(map((response: Response) => {
  //       const data = (<any>response).d.results;
  //       for (let i = 0; i < data.length; i++) {
  //         mainData.push(
  //           new ComptrollerContractsList(
  //             data[i].Code,
  //             moment(data[i].DDate, 'YYYY/M/D').format('jYYYY/jM/jD'),
  //             data[i].Subject_Contract,
  //             data[i].Name_Contractor,
  //             data[i].OrganName,
  //             data[i].Name_Unit
  //           )
  //         );
  //       }
  //       // console.log(mainData);
  //       return mainData;
  //     }
  //   ));
  // }

  // sendDataToComptrollerContracts(DigestValue: any, Data: ComptrollerContractsList) {
  //   const headers = new HttpHeaders({
  //     'X-RequestDigest': DigestValue,
  //     'content-type': 'application/json;odata=verbose',
  //     'accept': 'application/json;odata=verbose',
  //   });
  //   const body = {
  //     '__metadata': {'type': 'SP.Data.ComptrollerContractsListItem'},
  //     'Code': Data.Code,
  //     'DDate': Data.DDate.substring(0, 10),
  //     'Subject_Contract': Data.Subject,
  //     'Name_Contractor': Data.Name,
  //     'OrganName': Data.OrganName,
  //     'Name_Unit': Data.Name
  //   };
  //   return this.http.post(
  //     'http://pmo.rai.ir/PO/_api/web/lists/getbytitle(\'ComptrollerContracts\')/items',
  //     body,
  //     {headers: headers}
  //   );
  // }

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

  changeFirstTimeSteps() {
    this.firstTimeSteps.next(true);
  }

  changeStepLocks(type: boolean) {
    this.stepLocks = type;
    this.stepLocksSubject.next(type);
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
      'Code_TempContract': this.stepFormsData.contractsForm.Code_Contract
    };
    return this.http.post(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'TempContracts\')/items(' + id + ')',
      body,
      {headers: headers}
    );
  }

  // getContractId() {
  //   let headers = new HttpHeaders();
  //   headers = headers.set('ACCEPT', 'application/json;odata=verbose');
  //   return this.http.get(
  //     'http://pmo.rai.ir/PO/_api/web/lists/getbytitle(\'TempContracts\')/items?select=Code_TempContract&$top=1&$orderby=Created desc',
  //     {headers: headers}
  //   ).pipe(map((response: Response) => {
  //       const data = (<any>response).d.results;
  //       // mainData = data;
  //       // data[0].DefaultPMOExpertId_User
  //       return data[0].ID;
  //     }
  //   ));
  // }

  sendDataJson(DigestValue: any, isPreContract?: boolean) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    let body;
    const pmUser: any = this.stepFormsData.contractsForm.PMId_User;
    if (isPreContract) {
      body = {
        '__metadata': {'type': 'SP.Data.TempContractsListItem'},
        'JsonPre': JSON.stringify(this.stepFormsData),
        'Title': this.stepFormsData.contractsForm.FullTitle_Contract,
        'PMUserId': pmUser.User.ID,
        'ImporterUserId': this.userData.Id,
        'PMOExpertId': this.stepFormsData.contractsForm.PMOExpertId_User,
        'ImporterId': this.stepFormsData.contractsForm.Id_Importer
      };
    } else {
      body = {
        '__metadata': {'type': 'SP.Data.TempContractsListItem'},
        'Json': JSON.stringify(this.stepFormsData),
        'Title': this.stepFormsData.contractsForm.FullTitle_Contract,
        'PMUserId': pmUser.User.ID,
        'ImporterUserId': this.userData.Id,
        'PMOExpertId': this.stepFormsData.contractsForm.PMOExpertId_User,
        'ImporterId': this.stepFormsData.contractsForm.Id_Importer,
        'PMApprovedPre': true,
        'ImporterApprovedPre': true
      };
    }
    return this.http.post(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'TempContracts\')/items',
      body,
      {headers: headers}
    );
  }

  updateDataJson(DigestValue: any, id, isFinal: boolean, code = null, isPreContract = false) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
      'IF-MATCH': '*',
      'X-HTTP-Method': 'MERGE'
    });
    // console.log(this.userData);
    let body;
    const pmUser: any = this.stepFormsData.contractsForm.PMId_User;
    if (isPreContract) {
      // console.log(pmUser);
      if (code === null) {
        if (pmUser.User.ID === this.userData.Id && this.stepFormsData.contractsForm.Id_Importer === this.userData.Id_Importer) {
          if (isFinal) {
            console.log(1);
            body = {
              '__metadata': {'type': 'SP.Data.TempContractsListItem'},
              'JsonPre': JSON.stringify(this.stepFormsData),
              'PMUserId': pmUser.User.ID,
              'PMApprovedPre': isFinal,
              'ImporterApprovedPre': isFinal
            };
          } else {
            console.log(2);
            body = {
              '__metadata': {'type': 'SP.Data.TempContractsListItem'},
              'JsonPre': JSON.stringify(this.stepFormsData),
              'PMUserId': pmUser.User.ID,
              'ImporterUserId': this.userData.Id,
              'PMOExpertId': this.stepFormsData.contractsForm.PMOExpertId_User,
              'ImporterId': this.stepFormsData.contractsForm.Id_Importer,
              'ImporterApprovedPre': isFinal,
              'Title': this.stepFormsData.contractsForm.FullTitle_Contract
            };
          }
        } else if (this.stepFormsData.contractsForm.Id_Importer === this.userData.Id_Importer) {
          console.log(3);
          body = {
            '__metadata': {'type': 'SP.Data.TempContractsListItem'},
            'JsonPre': JSON.stringify(this.stepFormsData),
            'PMUserId': pmUser.User.ID,
            'ImporterUserId': this.userData.Id,
            'PMOExpertId': this.stepFormsData.contractsForm.PMOExpertId_User,
            'ImporterId': this.stepFormsData.contractsForm.Id_Importer,
            'ImporterApprovedPre': isFinal,
            'Title': this.stepFormsData.contractsForm.FullTitle_Contract
          };
        } else if (pmUser.User.ID === this.userData.Id) {
          if (isFinal) {
            console.log(4);
            body = {
              '__metadata': {'type': 'SP.Data.TempContractsListItem'},
              'JsonPre': JSON.stringify(this.stepFormsData),
              'PMUserId': pmUser.User.ID,
              'PMApprovedPre': isFinal
            };
          } else {
            console.log(5);
            body = {
              '__metadata': {'type': 'SP.Data.TempContractsListItem'},
              'JsonPre': JSON.stringify(this.stepFormsData),
              'PMUserId': pmUser.User.ID,
              'PMApprovedPre': isFinal,
              'ImporterApprovedPre': isFinal
            };
          }
        } else if (this.stepFormsData.contractsForm.PMOExpertId_User === this.userData.Id) {
          if (!isFinal) {
            console.log(6);
            body = {
              '__metadata': {'type': 'SP.Data.TempContractsListItem'},
              'JsonPre': JSON.stringify(this.stepFormsData),
              'PMUserId': pmUser.User.ID,
              'PMApprovedPre': isFinal,
              'ImporterApprovedPre': isFinal
            };
          } else {
            console.log(7);
            body = {
              '__metadata': {'type': 'SP.Data.TempContractsListItem'},
              'JsonPre': JSON.stringify(this.stepFormsData),
            };
          }
        }
      } else {
        console.log(8);
        body = {
          '__metadata': {'type': 'SP.Data.TempContractsListItem'},
          'Code': code
        };
      }
      if (!body) {
        console.log(8);
        body = {
          '__metadata': {'type': 'SP.Data.TempContractsListItem'},
          'JsonPre': JSON.stringify(this.stepFormsData),
        };
      }
      console.log(body);
    } else {
      // console.log(pmUser);
      if (code === null) {
        if (pmUser.User.ID === this.userData.Id && this.stepFormsData.contractsForm.Id_Importer === this.userData.Id_Importer) {
          if (isFinal) {
            console.log(1);
            body = {
              '__metadata': {'type': 'SP.Data.TempContractsListItem'},
              'Json': JSON.stringify(this.stepFormsData),
              'PMUserId': pmUser.User.ID,
              'PMApproved': isFinal,
              'ImporterApproved': isFinal
            };
          } else {
            console.log(2);
            body = {
              '__metadata': {'type': 'SP.Data.TempContractsListItem'},
              'Json': JSON.stringify(this.stepFormsData),
              'PMUserId': pmUser.User.ID,
              'ImporterUserId': this.userData.Id,
              'PMOExpertId': this.stepFormsData.contractsForm.PMOExpertId_User,
              'ImporterId': this.stepFormsData.contractsForm.Id_Importer,
              'ImporterApproved': isFinal,
              'Title': this.stepFormsData.contractsForm.FullTitle_Contract
            };
          }
        } else if (this.stepFormsData.contractsForm.Id_Importer === this.userData.Id_Importer) {
          console.log(3);
          body = {
            '__metadata': {'type': 'SP.Data.TempContractsListItem'},
            'Json': JSON.stringify(this.stepFormsData),
            'PMUserId': pmUser.User.ID,
            'ImporterUserId': this.userData.Id,
            'PMOExpertId': this.stepFormsData.contractsForm.PMOExpertId_User,
            'ImporterId': this.stepFormsData.contractsForm.Id_Importer,
            'ImporterApproved': isFinal,
            'Title': this.stepFormsData.contractsForm.FullTitle_Contract
          };
        } else if (pmUser.User.ID === this.userData.Id) {
          if (isFinal) {
            console.log(4);
            body = {
              '__metadata': {'type': 'SP.Data.TempContractsListItem'},
              'Json': JSON.stringify(this.stepFormsData),
              'PMUserId': pmUser.User.ID,
              'PMApproved': isFinal
            };
          } else {
            console.log(5);
            body = {
              '__metadata': {'type': 'SP.Data.TempContractsListItem'},
              'Json': JSON.stringify(this.stepFormsData),
              'PMUserId': pmUser.User.ID,
              'PMApproved': isFinal,
              'ImporterApproved': isFinal
            };
          }
        } else if (this.stepFormsData.contractsForm.PMOExpertId_User === this.userData.Id) {
          if (!isFinal) {
            console.log(6);
            body = {
              '__metadata': {'type': 'SP.Data.TempContractsListItem'},
              'Json': JSON.stringify(this.stepFormsData),
              'PMUserId': pmUser.User.ID,
              'PMApproved': isFinal,
              'ImporterApproved': isFinal
            };
          } else {
            console.log(7);
            body = {
              '__metadata': {'type': 'SP.Data.TempContractsListItem'},
              'Json': JSON.stringify(this.stepFormsData),
            };
          }
        }
      } else {
        console.log(8);
        body = {
          '__metadata': {'type': 'SP.Data.TempContractsListItem'},
          'Code': code
        };
      }
      if (!body) {
        console.log(8);
        body = {
          '__metadata': {'type': 'SP.Data.TempContractsListItem'},
          'Json': JSON.stringify(this.stepFormsData),
        };
      }
      console.log(body);
    }

    return this.http.post(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'TempContracts\')/items(' + id + ')',
      body,
      {headers: headers}
    );
  }

  getUserRole(account: number) {
    let mainData;
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Users\')/items?$filter=Account/Id eq ' + account,
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results[0];
        mainData = {
          Account: account,
          FullName: data.Title,
          IsPM: data.IsPm,
          IsPMOExpert: data.IsPMOExpert,
          Id_Importer: data.ImporterId,
        };
        return mainData;
      }
    ));
  }

  getTodayDateFromContextInfo() {
    const headers = new HttpHeaders({'ACCEPT': 'application/json;odata=verbose'});
    return this.http.post(
      'http://rpmo.rai.ir/PWA/_api/contextinfo',
      '',
      {headers: headers}
    ).pipe(map((response: Response) => {
        let data = (<any>response).d.GetContextWebInformation.FormDigestValue;
        const first = data.substring(data.length - 50).split(',')[1];
        data = new Date(first).toISOString().substring(0, 10);
        this.todayData = data;
        // this.todayData = '2019-04-28';
        this.today.next(data);
        return data;
      }
    ));
  }

  getAllContractsComptrollerCode() {
    const mainData: ContractComptrollerModel[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'contracts\')/items?$select=ID,ComptrollerContractCode,Title,Cost&$top=10000',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 2; i < data.length; i++) {
          mainData.push(
            new ContractComptrollerModel(
              data[i].ID,
              data[i].Title,
              data[i].ComptrollerContractCode,
              data[i].Cost
            )
          );
        }
        console.log(mainData);
        return mainData;
      }
    ));
  }

  getFinancialRequests(tableName: string, contractCode, ComptrollerCode) {
    const mainData: FinancialModel[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'' + tableName + '\')/items?&$select=ID,FiscalYear,FinancialRequestTypeId,LetterDate,Date1,VoucherNum,VoucherDescription,GrossAmount,Deposits,PayableInsurance,Tax,PrepaidDepreciation,MaterialPrepaidDepreciation,Fine,TotalDeductions,VAT,EmployerInsurance,TreasuryBillsProfit,NetAmount&$top=1000',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let letterDate = '';
          let date1 = '';
          if (data[i].LetterDate) {
            letterDate = moment(data[i].LetterDate, 'YYYY/M/D').add(1, 'day').format('jYYYY/jM/jD');
            const splitedDate = letterDate.split('/');
            letterDate = splitedDate[0] + '/' + this.addZeroToMonth(splitedDate[1]) + '/' + this.addZeroToMonth(splitedDate[2]);
          }
          if (data[i].Date1) {
            date1 = moment(data[i].Date1, 'YYYY/M/D').add(1, 'day').format('jYYYY/jM/jD');
            const splitedDate = date1.split('/');
            date1 = splitedDate[0] + '/' + this.addZeroToMonth(splitedDate[1]) + '/' + this.addZeroToMonth(splitedDate[2]);
          }
          mainData.push(
            new FinancialModel(
              data[i].ID,
              data[i].FiscalYear,
              {
                ID: data[i].FinancialRequestTypeId,
                Title: null
              },
              letterDate,
              date1,
              data[i].VoucherNum,
              data[i].VoucherDescription,
              data[i].GrossAmount,
              data[i].Deposits,
              data[i].PayableInsurance,
              data[i].Tax,
              data[i].PrepaidDepreciation,
              data[i].MaterialPrepaidDepreciation,
              data[i].Fine,
              data[i].TotalDeductions,
              data[i].VAT,
              data[i].EmployerInsurance,
              data[i].TreasuryBillsProfit,
              data[i].NetAmount,
              null,
              null,
              undefined,
              ComptrollerCode,
            )
          );
        }
        console.log(mainData);
        return mainData;
      }
    ));
  }

  sendFinancialRequests(DigestValue: any, data: FinancialModel, listName: string, contractCode) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    let letterDate = null;
    let Date1 = null;
    let body = null;
    if (data.LetterDate !== '') {
      letterDate = moment(data.LetterDate, 'jYYYY/jM/jD').format('YYYY/M/D');
    }
    if (data.Date1 !== '') {
      Date1 = moment(data.Date1, 'jYYYY/jM/jD').format('YYYY/M/D');
    }
    if (listName === 'FinancialPayments') {
      body = {
        '__metadata': {'type': 'SP.Data.' + listName + 'ListItem'},
        'FiscalYear': data.FiscalYear,
        'FinancialRequestTypeId': data.FinancialRequestType.ID,
        'LetterDate': letterDate,
        'Date1': Date1,
        'VoucherNum': data.VoucherNum,
        'VoucherDescription': data.VoucherDescription,
        'GrossAmount': data.GrossAmount,
        'Deposits': data.Deposits,
        'PayableInsurance': data.PayableInsurance,
        'Tax': data.Tax,
        'CostResourceId': data.CostResource,
        'FinancialPaymentTypeId': data.PaymentType,
        'PrepaidDepreciation': data.PrepaidDepreciation,
        'MaterialPrepaidDepreciation': data.MaterialPrepaidDepreciation,
        'Fine': data.Fine,
        'TotalDeductions': data.TotalDeductions,
        'VAT': data.VAT,
        'EmployerInsurance': data.EmployerInsurance,
        'TreasuryBillsProfit': data.TreasuryBillsProfit,
        'NetAmount': data.NetAmount
      };
    } else {
      body = {
        '__metadata': {'type': 'SP.Data.' + listName + 'ListItem'},
        'FiscalYear': data.FiscalYear,
        'FinancialRequestTypeId': data.FinancialRequestType.ID,
        'LetterDate': letterDate,
        'Date1': Date1,
        'VoucherNum': data.VoucherNum,
        'VoucherDescription': data.VoucherDescription,
        'GrossAmount': data.GrossAmount,
        'Deposits': data.Deposits,
        'PayableInsurance': data.PayableInsurance,
        'Tax': data.Tax,
        'PrepaidDepreciation': data.PrepaidDepreciation,
        'MaterialPrepaidDepreciation': data.MaterialPrepaidDepreciation,
        'Fine': data.Fine,
        'TotalDeductions': data.TotalDeductions,
        'VAT': data.VAT,
        'EmployerInsurance': data.EmployerInsurance,
        'TreasuryBillsProfit': data.TreasuryBillsProfit,
        'NetAmount': data.NetAmount
      };
    }
    return this.http.post(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'' + listName + '\')/items',
      body,
      {headers: headers}
    );
  }


  deleteItem(DigestValue, listName: string, id: number, contractCode) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
      'IF-MATCH': '*',
      'X-HTTP-Method': 'DELETE'
    });
    return this.http.post(
      'http://rpmo.rai.ir/PWA/' + contractCode + '/_api/web/lists/getbytitle(\'' + listName + '\')/items(' + id + ')',
      '',
      {headers: headers}
    );
  }

  getContractors() {
    const mainData: ContractorsList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Contractors\')/items?$filter=PersonalityType ne \'0\'&$top=1000',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new ContractorsList(
              data[i].ID,
              data[i].Title
            )
          );
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  getAllComptrollerData(date: string, fileName: string) {
    const mainData: FinancialModel[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_layouts/15/download.aspx?SourceUrl=/pwa/ComptrollerDocs/payments_requests/' + fileName + '.json',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = <any>response;
        if (fileName === 'Payments') {
          for (let i = 0; i < data.length; i++) {
            mainData[i] = {
              ID: null,
              FiscalYear: data[i].FiscalYear,
              FinancialRequestType: {
                ID: data[i].PaymentType,
                Title: null
              },
              LetterDate: data[i].LetterDate,
              Date1: data[i].ApprovedDate,
              VoucherNum: data[i].VoucherNum.toString(),
              VoucherDescription: data[i].VoucherDescription,
              GrossAmount: +data[i].GrossAmount,
              Deposits: +data[i].Deposits,
              PayableInsurance: +data[i].PayableInsurance,
              Tax: +data[i].Tax,
              PrepaidDepreciation: +data[i].PrepaidDepreciation,
              MaterialPrepaidDepreciation: data[i].MaterialPrepaidDepreciation,
              Fine: +data[i].Fine,
              TotalDeductions: +data[i].TotalDeductions,
              VAT: +data[i].VAT,
              EmployerInsurance: +data[i].EmployerInsurance,
              TreasuryBillsProfit: +data[i].TreasuryBillsProfit,
              NetAmount: +data[i].NetAmount,
              OtherDeductions: null,
              CostResource: data[i].CostReasourceId,
              PaymentType: data[i].PaymentType2,
              contractCode: data[i].ContractNum.toString(),
            };
          }
        } else {
          for (let i = 0; i < data.length; i++) {
            mainData[i] = {
              ID: null,
              FiscalYear: data[i].FiscalYear,
              FinancialRequestType: {
                ID: data[i].RequestType,
                Title: null
              },
              LetterDate: data[i].LetterDate,
              Date1: data[i].ApprovedDate,
              VoucherNum: data[i].VoucherNum.toString(),
              VoucherDescription: data[i].VoucherDescription,
              GrossAmount: +data[i].GrossAmount,
              Deposits: +data[i].Deposits,
              PayableInsurance: +data[i].PayableInsurance,
              Tax: +data[i].Tax,
              PrepaidDepreciation: +data[i].PrepaidDepreciation,
              MaterialPrepaidDepreciation: data[i].MaterialPrepaidDepreciation,
              Fine: +data[i].Fine,
              TotalDeductions: +data[i].TotalDeductions,
              VAT: +data[i].VAT,
              EmployerInsurance: +data[i].EmployerInsurance,
              TreasuryBillsProfit: +data[i].TreasuryBillsProfit,
              NetAmount: +data[i].NetAmount,
              OtherDeductions: null,
              CostResource: null,
              PaymentType: null,
              contractCode: data[i].ContractNum.toString(),
            };
          }
        }

        console.log(fileName, mainData);
        // console.log(response);
        return mainData;
      }
    ));
  }

  // getContractTypes() {
  //   const mainData: ContractTypesList[] = [];
  //   let headers = new HttpHeaders();
  //   headers = headers.set('ACCEPT', 'application/json;odata=verbose');
  //   return this.http.get(
  //     'http://pmo.rai.ir/PO/References/_api/web/lists/getbytitle(\'ContractTypes\')/items',
  //     {headers: headers}
  //   ).pipe(map((response: Response) => {
  //       const data = (<any>response).d.results;
  //       for (let i = 0; i < data.length; i++) {
  //         mainData.push(
  //           new ContractTypesList(
  //             data[i].Id_ContractType,
  //             data[i].Name_ContractType,
  //             data[i].DeliverableType,
  //             data[i].PCType,
  //           )
  //         );
  //       }
  //       // console.log(mainData);
  //       return mainData;
  //     }
  //   ));
  // }

  getAgentPositions() {
    const mainData: AgentPositionsList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'AgentPositions\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new AgentPositionsList(
              data[i].ID,
              data[i].Title,
            )
          );
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  getAllFinancialPaymentTypes() {
    const mainData: FinancialRequestTypeModel[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'FinancialPaymentTypes\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new FinancialRequestTypeModel(
              data[i].ID,
              data[i].Title,
              JSON.parse(data[i].ComptrollerTitle)
            )
          );
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  getAllFinancialRequestTypes() {
    const mainData: FinancialRequestTypeModel[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'FinancialRequestTypes\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new FinancialRequestTypeModel(
              data[i].ID,
              data[i].Title,
              data[i].ComptrollerTitle
            )
          );
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  getOperationTypes() {
    const mainData: OperationTypesList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'OperationTypes\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new OperationTypesList(
              data[i].ID,
              data[i].Title,
            )
          );
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  getDeliverables(UnitId, serviceId) {
    // console.log(serviceId);
    const mainData: DeliverablesList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    // 'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Deliverables\')/items?' +
    // '$filter=(substringof(\'' + UnitId + '\',PossibleUnitIds_Deliverable) or substringof(\'0\',PossibleUnitIds_Deliverable)) and substringof(\'' + serviceId + '\',Id_ContractService)',
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Deliverables\')/items?&$select=ID,Title,MeasureUnit,UnitId,OperationTypeId,Service1/Code,Service1/DeliverableType&$expand=Service1&$OrderBy=Created desc&$top=10000',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new DeliverablesList(
              data[i].ID,
              data[i].Title,
              data[i].MeasureUnit,
              data[i].UnitId.results,
              data[i].OperationTypeId.results.join().split(','),
              data[i].Service1.results[0].Code,
              data[i].Service1.results[0].DeliverableType,
            )
          );
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  getZones() {
    const mainData: ZonesList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Zones\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new ZonesList(
              data[i].ID,
              data[i].Title,
            )
          );
        }
        this.zones.next(mainData);
        return mainData;
      }
    ));
  }

  getGoals() {
    const mainData: { Id, Name }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Goals\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData[i] = {
            Id: data[i].ID,
            Name: data[i].Title
          };
        }
        return mainData;
      }
    ));
  }

  getDemandants() {
    const mainData: { Id, Name }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Demandants\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData[i] = {
            Id: data[i].ID,
            Name: data[i].Title
          };
        }
        return mainData;
      }
    ));
  }

  getTenderTypes() {
    const mainData: { Id, Name }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'TenderTypes\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData[i] = {
            Id: data[i].ID,
            Name: data[i].Title
          };
        }
        return mainData;
      }
    ));
  }

  getTenderOrganizers() {
    const mainData: { Id, Name }[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'TenderOrganizers\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData[i] = {
            Id: data[i].ID,
            Name: data[i].Title
          };
        }
        return mainData;
      }
    ));
  }

  getRaiParts() {
    const mainData: RaiPartsList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'RaiParts\')/items?$orderby=Sorting asc',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new ZonesList(
              data[i].ID,
              data[i].Title,
            )
          );
        }
        return mainData;
      }
    ));
  }

  getContractServices() {
    const mainData: ContractServicesList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Services\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new ContractServicesList(
              data[i].Code,
              data[i].Title,
              data[i].DeliverableType,
              data[i].PCType,
              data[i].ID,
            )
          );
        }
        return mainData;
      }
    ));
  }

  // getUnits(importerId) {
  //   // importerId = importerId.join();
  //   // importerId = importerId.replace(/,/g, '\') or (Id_Unit eq \'');
  //   const mainData: UnitsList[] = [];
  //   let headers = new HttpHeaders();
  //   headers = headers.set('ACCEPT', 'application/json;odata=verbose');
  //   return this.http.get(
  //     'http://pmo.rai.ir/PO/References/_api/web/lists/getbytitle(\'Units\')/items?$select=DefaultPMOExpertId_User/Id,Id_Unit,Name_Unit&$expand=DefaultPMOExpertId_User',
  //     {headers: headers}
  //   ).pipe(map((response: Response) => {
  //       const data = (<any>response).d.results;
  //       for (let i = 0; i < data.length; i++) {
  //         mainData.push(
  //           new UnitsList(
  //             data[i].Id_Unit,
  //             data[i].Name_Unit,
  //             data[i].DefaultPMOExpertId_User
  //           )
  //         );
  //       }
  //       return mainData;
  //     }
  //   ));
  // }

  getAllUnits() {
    const mainData: UnitsList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Units\')/items?$select=ID,DefaultPMOExpertId,Title',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new UnitsList(
              data[i].ID,
              data[i].Title,
              data[i].DefaultPMOExpertId
            )
          );
        }
        return mainData;
      }
    ));
  }

  // getUserName(account: any) {
  //   const Ids = account;
  //   account = account.join();
  //   account = account.replace(/,/g, ' or Account_User/Id eq ');
  //   const mainData: UserNameList[] = [];
  //   let headers = new HttpHeaders();
  //   headers = headers.set('ACCEPT', 'application/json;odata=verbose');
  //   return this.http.get(
  //     'http://pmo.rai.ir/PO/_api/web/lists/getbytitle(\'Users\')/items?$filter=Account_User/Id eq ' + account,
  //     {headers: headers}
  //   ).pipe(map((response: Response) => {
  //       const data = (<any>response).d.results;
  //       for (let i = 0; i < data.length; i++) {
  //         mainData.push(
  //           new UserNameList(
  //             Ids[i],
  //             data[i].FullName_User,
  //           )
  //         );
  //       }
  //       this.user.next(mainData);
  //       return mainData;
  //     }
  //   ));
  // }

  getPMs() {
    // pms = pms.join();
    // pms = pms.replace(/,/g, '\',PossibleUnitIds_PM) or substringof(\'');
    const mainData: PMsList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'PMs\')/items?$select=ID,UnitId,User1/ID,User1/Title&$expand=User1',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new PMsList(
              data[i].ID,
              {
                ID: data[i].User1.ID,
                Title: data[i].User1.Title,
              },
              data[i].UnitId.results,
            ));
        }
        return mainData;
      }
    ));
  }

  getImporter(id: string) {
    let mainData: ImporterList;
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Importers\')/items?$filter=ID eq \'' + id + '\'',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results[0];
        mainData = {
          Id: data.ID,
          Name: data.Title,
          UnitIds: data.UnitId.results
        };
        // this.user.next(mainData);
        return mainData;
      }
    ));
  }

  getCurrentUser() {
    let mainData: CurrentUserList = null;
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/Web/CurrentUser',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d;
        mainData = {
          Id: data.Id,
          LoginName: data.LoginName,
          IsSiteAdmin: data.IsSiteAdmin
        };
        this.currentUser2 = mainData;
        this.currentUser.next(mainData);
        return mainData;
      }
    ));
  }

  getUserInformation(account: number) {
    let mainData: UserList;
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Users\')/items?$filter=Account/Id eq ' + account,
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results[0];
        mainData = {
          Id: data.ID,
          Birthday: data.Birth,
          Account: account,
          FullName: data.Title,
          Gender: data.Gen,
          JobTitle: data.JobTitle1,
          Major: data.Major,
          Experience: data.Experience,
          ExperienceModifiedDate: data.ExperienceModifiedDate,
          MobileNumber: data.MobileNumber,
          PhoneNumber: data.PhoneNumber,
          Email: data.Email,
          Address: data.LocationAddress,
          ActivityScope: data.ActivityScope,
          IsPM: data.IsPM,
          IsPMOExpert: data.IsPMOExpert,
          JobLocationId: null,
          Id_Position: data.PositionId,
          Id_Importer: data.ImporterId,
          Id_EducationLevel: data.EducationlevelId,
        };
        this.user2.next(mainData);
        this.userData = mainData;
        return mainData;
      }
    ));
  }

  getSubUnits() {
    const mainData: SubUnitsList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'SubUnits\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new SubUnitsList(
              data[i].ID,
              data[i].Title,
              data[i].UnitId.results,
            )
          );
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  getCostResources() {
    const mainData: CostResourcesList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'CostResources\')/items?$orderby=Sorting asc',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new CostResourcesList(
              data[i].ID,
              data[i].Title,
              JSON.parse(data[i].ComptrollerTitle)
            )
          );
        }
        return mainData;
      }
    ));
  }

  getDataJson(ContractID: any, isPreContract?: boolean) {
    this.stepFormsData = {};
    let url;
    if (isPreContract) {
      url = 'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'TempContracts\')/items?$filter=ID eq \'' + ContractID + '\'&$select=ID,ImporterApprovedPre,PMApprovedPre,PMOExpertId,Importer/Title,JsonPre&$expand=Importer&$top=1';
    } else {
      url = 'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'TempContracts\')/items?$filter=ID eq \'' + ContractID + '\'&$select=ID,ImporterApproved,PMApproved,PMOExpertId,Importer/Title,Json&$expand=Importer&$top=1';
    }
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      url,
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results[0];
        let json;
        if (isPreContract) {
          json = JSON.parse(data.JsonPre);
          this.isApproved.importer = data.ImporterApprovedPre;
          this.isApproved.pm = data.PMApprovedPre;
        } else {
          json = JSON.parse(data.Json);
          this.isApproved.importer = data.ImporterApproved;
          this.isApproved.pm = data.PMApproved;
        }
        this.isApproved.expert = data.PMOExpertId;
        this.tempContractImporter = data.Importer.Title;
        this.stepFormsData.deliverablesForm = {};
        if (json.contractsForm) {
          this.stepFormsData.contractsForm = json.contractsForm;
          this.stepFormsData.contractsForm.OldProjectId = data.OldCode;
        }
        this.stepFormsData.stackHoldersForm = json.stackHoldersForm;
        this.stepFormsData.stackHoldersForm2 = json.stackHoldersForm2;
        this.stepFormsData.assignedCostResourcesForm = json.assignedCostResourcesForm;
        if (json.progressPlansForm) {
          this.stepFormsData.progressPlansForm = json.progressPlansForm;
        }
        if (json.cashFlowPlanForm) {
          this.stepFormsData.cashFlowPlanForm = json.cashFlowPlanForm;
        }
        if (json.deliverablesForm) {
          this.stepFormsData.deliverablesForm = json.deliverablesForm;
        }
        if (json.newJson) {
          this.stepFormsData.newJson = json.newJson;
        }
        if (json.financialRequests) {
          this.stepFormsData.financialRequests = json.financialRequests;
        }
        if (json.financialPayments) {
          this.stepFormsData.financialPayments = json.financialPayments;
        }
        if (json.finalApprovalForm) {
          this.stepFormsData.finalApprovalForm = json.finalApprovalForm;
        }
        if (data.ID) {
          this.stepFormsData.contractsForm.Code_Contract = data.ID;
        }
        // console.log(this.stepFormsData);
        this.stepForms.next(this.stepFormsData);
        return this.stepFormsData;
      }
    ));
  }

  getContractCurrencies() {
    const mainData: CurrencyList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Currencies\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
      const data = (<any>response).d.results;
      for (let i = 0; i < data.length; i++) {
        mainData.push(
          new CurrencyList(
            data[i].Code,
            data[i].Title,
            data[i].ID
          )
        );
      }
      return mainData;
    }));
  }

  monthNameToNum(monthname) {
    const months = [
      'january', 'february', 'march', 'april', 'may',
      'jun', 'july', 'august', 'september',
      'october', 'november', 'december'
    ];
    const month = months.indexOf(monthname.toLowerCase());
    return month ? month + 1 : 0;
  }

  addZeroToMonth(month) {
    if (+month < 10) {
      return '0' + month;
    } else {
      return month;
    }
  }
}
