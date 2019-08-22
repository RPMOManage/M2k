import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { RaiPartsModel } from '../models/kms/RaiParts.model';
import { CurrentUserModel } from '../models/kms/CurrentUser.model';
import { PositionModel } from '../models/kms/Position.model';
import { EducationLevelModel } from '../models/kms/EducationLevel.model';
import { UserProfileDataModel } from '../models/kms/UserProfileData.model';
import { Subject } from 'rxjs/index';
import { ContractorModel } from '../models/kms/Contractor.model';
import * as moment from 'jalali-moment';

@Injectable({
  providedIn: 'root',
})
export class KmsService {
  public userProfileDataSubject = new Subject();
  userProfileData: UserProfileDataModel;
  selectedTabSubject = new Subject();
  todayFaSubject = new Subject();
  todayFa: string;

  constructor(private http: HttpClient) {
  }

  createUserProfileData(DigestValue: any, data, isComplete: boolean) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    let raiPart = null;
    let contractor = null;
    if (+data.JobLocation === 1) {
      raiPart = data.JobLocationList;
    } else {
      contractor = data.JobLocationList;
    }
    const body = {
      '__metadata': {'type': 'SP.Data.UsersListItem'},
      'Title': data.Title,
      'Account\Id': data.Account,
      'Experience': +data.Experience,
      'Email': data.Email,
      'PositionId': data.Position,
      'EducationlevelId': data.EducationLevel,
      'Gen': data.Gender,
      'JobTitle1': data.JobTitle,
      'Major': data.Major,
      'MobileNumber': data.MobileNumber,
      'PhoneNumber': data.PhoneNumber,
      'LocationAddress': data.Address,
      'ActivityScope': data.ActivityScope,
      'RaiPartId': raiPart,
      'ContractorId': contractor,
      'IsComplete': isComplete,
      'Birth': moment(data.BirthDate, 'jYYYY/jM/jD').format('YYYY/M/D'),
    };
    return this.http.post(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Users\')/items',
      body,
      {headers: headers}
    );
  }

  updateUserProfileData(DigestValue: any, data, id: number, isComplete: boolean) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
      'IF-MATCH': '*',
      'X-HTTP-Method': 'MERGE'
    });
    let raiPart = null;
    let contractor = null;
    if (+data.JobLocation === 1) {
      raiPart = data.JobLocationList;
    } else {
      contractor = data.JobLocationList;
    }
    const body = {
      '__metadata': {'type': 'SP.Data.UsersListItem'},
      'Title': data.Title,
      'Account\Id': data.Account,
      'Experience': +data.Experience,
      'Email': data.Email,
      'PositionId': data.Position,
      'EducationlevelId': data.EducationLevel,
      'Gen': data.Gender,
      'JobTitle1': data.JobTitle,
      'Major': data.Major,
      'MobileNumber': data.MobileNumber,
      'PhoneNumber': data.PhoneNumber,
      'LocationAddress': data.Address,
      'ActivityScope': data.ActivityScope,
      'RaiPartId': raiPart,
      'ContractorId': contractor,
      'IsComplete': isComplete,
      'Birth': moment(data.BirthDate, 'jYYYY/jM/jD').format('YYYY/M/D'),
    };
    return this.http.post(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Users\')/items(' + id + ')',
      body,
      {headers: headers}
    );
  }

  getDataFromContextInfo() {
    const headers = new HttpHeaders({'ACCEPT': 'application/json;odata=verbose'});
    return this.http.post(
      'http://rpmo.rai.ir/PWA/kms/_api/contextinfo',
      '',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.GetContextWebInformation.FormDigestValue;
        return data;
      }
    ));
  }

  getUserProfileData(id: number) {
    let mainData: UserProfileDataModel;
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Users\')/items?$filter=AccountId eq ' + id + '&$select=ID,Title,Email,Experience,RaiPartId,PositionId,EducationlevelId,ContractorId,Gen,MobileNumber,JobTitle1,PhoneNumber,LocationAddress,ActivityScope,Major,Birth,IsComplete&$top=1000',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results[0];
        if (!data) {
        } else {
          let date = null;
          if (data.Birth) {
            date = moment(data.Birth, 'YYYY/M/D').format('jYYYY/jM/jD');
            // console.log(date);
            const splitedDate = date.split('/');
            date = splitedDate[0] + '/' + this.addZeroToMonth(splitedDate[1]) + '/' + this.addZeroToMonth(splitedDate[1]);
          }
          mainData = {
            ID: data.ID,
            Title: data.Title,
            Experience: data.Experience,
            Email: data.Email,
            RaiPart: data.RaiPartId,
            Contractor: data.ContractorId,
            EducationLevel: data.EducationlevelId,
            Position: data.PositionId,
            Gender: data.Gen,
            MobileNumber: data.MobileNumber,
            JobTitle: data.JobTitle1,
            PhoneNumber: data.PhoneNumber,
            Address: data.LocationAddress,
            ActivityScope: data.ActivityScope,
            Major: data.Major,
            BirthDate: date,
            IsComplete: data.IsComplete
          };
        }
        this.userProfileDataSubject.next(mainData);
        this.userProfileData = mainData;
        return mainData;
      }
    ));
  }

  getCurrentUser() {
    let mainData: CurrentUserModel = null;
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/kms/_api/Web/CurrentUser',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d;
        mainData = {
          Id: data.Id,
          LoginName: data.LoginName,
          IsSiteAdmin: data.IsSiteAdmin
        };
        return mainData;
      }
    ));
  }

  getAllRaiParts() {
    const mainData: RaiPartsModel[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'RaiParts\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new RaiPartsModel(
              data[i].ID,
              data[i].Title,
            )
          );
        }
        return mainData;
      }
    ));
  }

  getAllContractors() {
    const mainData: ContractorModel[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Contractors\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new ContractorModel(
              data[i].ID,
              data[i].Title,
            )
          );
        }
        return mainData;
      }
    ));
  }

  getAllPositions() {
    const mainData: PositionModel[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Positions\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new PositionModel(
              data[i].ID,
              data[i].Title,
            )
          );
        }
        return mainData;
      }
    ));
  }

  getAllEducationLevels() {
    const mainData: EducationLevelModel[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'EducationLevels\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new EducationLevelModel(
              data[i].ID,
              data[i].Title,
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
