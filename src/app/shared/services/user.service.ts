import { Injectable } from '@angular/core';
import { UserList } from '../models/user.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CurrentUserList } from '../models/currentUser.model';
import { PositionList } from '../models/position.model';
import { EducationLevelList } from '../models/educationLevel.model';
import { RaiPartsList } from '../models/raiParts.model';
import { ContractorsList } from '../models/contractors.model';
import { ImporterList } from '../models/importer.model';
import { UserNameList } from '../models/userName.model';
import { map } from 'rxjs/internal/operators';
import { Subject } from 'rxjs/index';

@Injectable()
export class UserService {
  public user2 = new Subject();
  public user = new Subject();
  public currentUser = new Subject();
  public userData: any;


  constructor(private http: HttpClient) { }

  getUserInformation(account: number) {
    let mainData: UserList;
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://قpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Users\')/items?$filter=Account_User/Id eq ' + account,
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results[0];
        mainData = {
          Id: data.ID,
          Birthday: data.Birthday_User,
          Account: account,
          FullName: data.FullName_User,
          Gender: data.Gender_User,
          JobTitle: data.JobTitle_User,
          Major: data.Major_User,
          Experience: data.Experience_User,
          ExperienceModifiedDate: data.ExperienceModifiedDate_User,
          MobileNumber: data.MobileNumber_User,
          PhoneNumber: data.PhoneNumber_User,
          Email: data.Email_User,
          Address: data.Address_User,
          ActivityScope: data.ActivityScope_User,
          IsPM: data.IsPM_User,
          IsPMOExpert: data.IsPMOExpert_User,
          JobLocationId: data.JobLocationId_User,
          Id_Position: data.Id_Position,
          Id_Importer: data.Id_Importer,
          Id_EducationLevel: data.Id_EducationLevel,
        };
        this.user2.next(mainData);
        this.userData = mainData;
        return mainData;
      }
    ));
  }

  getImporter(id: string) {
    let mainData: ImporterList;
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PO/References/_api/web/lists/getbytitle(\'Importers\')/items?$filter=Id_Importer eq \'' + id + '\'',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results[0];
        mainData = {
          Id: data.Id_Importer,
          Name: data.Name_Importer,
          UnitIds: data.PossibleUnitIds_Importer.split(';')
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
      'http://pmo.rai.ir/PO/_api/Web/CurrentUser',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d;
        mainData = {
          Id: data.Id,
          LoginName: data.LoginName,
          IsSiteAdmin: data.IsSiteAdmin
      };
        this.currentUser.next(mainData);
        return mainData;
      }
    ));
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

  postDataToUsers(DigestValue: any, formData) {
      const headers = new HttpHeaders({
        'X-RequestDigest': DigestValue,
        'content-type': 'application/json;odata=verbose',
        'accept': 'application/json;odata=verbose',
      });
      const body = { '__metadata': { 'type': 'SP.Data.UsersListItem' },
        Birthday_User: formData.Birthday,
        Account_UserId: formData.Account,
        FullName_User: formData.FullName,
        Gender_User: formData.Gender,
        JobTitle_User: formData.JobTitle,
        Major_User: formData.Major,
        Experience_User: formData.Experience,
        // ExperienceModifiedDate_User: formData.ExperienceModifiedDate,
        MobileNumber_User: formData.MobileNumber,
        PhoneNumber_User: formData.PhoneNumber,
        Email_User: formData.Email,
        Address_User: formData.Address,
        ActivityScope_User: formData.ActivityScope,
        JobLocationId_User: formData.JobLocationId,
        Id_Position: formData.Id_Position,
        Id_EducationLevel: formData.Id_EducationLevel};
      return this.http.post(
        'http://pmo.rai.ir/PO/_api/web/lists/getbytitle(\'Users\')/items',
        body,
        {headers: headers}
      );
  }

  getPositions() {
    const mainData: PositionList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PO/References/_api/web/lists/getbytitle(\'Positions\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new PositionList(
              data[i].Id_Position,
              data[i].Name_Position
            )
          );
        }
        return mainData;
      }
    ));
  }

  getEducationLevels() {
    const mainData: EducationLevelList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PO/References/_api/web/lists/getbytitle(\'EducationLevels\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new EducationLevelList(
              data[i].Id_EducationLevel,
              data[i].Name_EducationLevel
            )
          );
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
      'http://pmo.rai.ir/PO/References/_api/web/lists/getbytitle(\'RaiParts\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new RaiPartsList(
              data[i].Id_RaiPart,
              data[i].Name_RaiPart
            )
          );
        }
        return mainData;
      }
    ));
  }

  getContractors() {
    const mainData: ContractorsList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PO/References/_api/web/lists/getbytitle(\'Contractors\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new ContractorsList(
              data[i].Id_Contractor,
              data[i].Name_Contractor
            )
          );
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  addContract(DigestValue: any, formData, lastId) {
    let id;
    id = lastId;
    id = id.replace('Co', '');
    id = 'Co' + (+id + 1);
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    const body = { '__metadata': { 'type': 'SP.Data.ContractorsListItem' },
      Id_Contractor: id,
      Name_Contractor: formData.ContractorName,
      PersonalityType_Contractors: formData.ContractorType,
      PhoneNumber_Contractor: formData.ContractorPhoneNumber,
      Address_Contractor: formData.ContractorAddress
    };
    return this.http.post(
      'http://pmo.rai.ir/PO/References/_api/web/lists/getbytitle(\'Contractors\')/items',
      body,
      {headers: headers}
    );
  }

  getLastContractor() {
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PO/_api/web/lists/getbytitle(\'Users\')/items?$top=1&$select=Id_Contractor&$orderby=Created desc',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results[0].Id_Contractor;
        return data;
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
  //             data[i].FullName_User
  //           )
  //         );
  //       }
  //       this.user.next(mainData);
  //       return mainData;
  //     }
  //   ));
  // }
}
