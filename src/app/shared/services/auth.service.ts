import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CurrentUserList } from '../models/currentUser.model';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  token = null;
  private userData;
  private currentUsers;
  public currentUser = new Subject();
  public userRole;
  public userRoleSubject = new Subject();

  constructor(private http: HttpClient,
              private route: ActivatedRoute,
              private sharedService: SharedService) {
  }

  isPM(pmId: number, projectId: number) {
    // let mainData;
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PO/_api/web/lists/getbytitle(\'TempContracts\')/items?$filter=AccountUser_PM/Id eq ' + pmId + ' and ID eq ' + projectId,
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results[0];
        if (!data) {
          return Observable.throw(false);
        }
        // mainData = {
        //   PossibleUnitIds_PM: data.PossibleUnitIds_PM,
        // };
      }
    ));
  }

  isAccessible(userId: number, contractID: number, userRole: number, userImporterId?: string) {
    let url: string;
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    if (userRole === 0) {
      url = 'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'TempContracts\')/items?$filter=ID eq \'' + contractID + '\'' + ' and ImporterUserId eq \'' + userImporterId + '\'';
    } else if (userRole === 1) {
      url = 'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'TempContracts\')/items?$filter=ID eq \'' + contractID + '\'' + ' and PMUser eq \'' + userId + '\'';
    } else if (userRole === 2) {
      url = 'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'TempContracts\')/items?$filter=ID eq \'' + contractID + '\'' + ' and PMOExpertId eq \'' + userId + '\'';
    } else if (userRole === 3) {
      url = 'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'TempContracts\')/items?$filter=ID eq \'' + contractID + '\'';
    }
    return this.http.get(
      url,
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results[0];
        if (userRole === 0 && data.ImporterApproved) {
          this.sharedService.isReadOnly = true;
        } else if (userRole === 0 && !data.ImporterApproved) {
          this.sharedService.isReadOnly = false;
        }
        if (!data) {
          return Observable.throw(false);
        }
        // mainData = {
        //   PossibleUnitIds_PM: data.PossibleUnitIds_PM,
        // };
      }
    ));
  }

  isPM2(pmId: number, projectId: number) {
    // let mainData;
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PO/_api/web/lists/getbytitle(\'TempContracts\')/items?$filter=AccountUser_PM/Id eq ' + pmId + ' and ID eq ' + projectId,
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results[0];
        return Observable.throw(false);
        // mainData = {
        //   PossibleUnitIds_PM: data.PossibleUnitIds_PM,
        // };
      }
    ));
  }


  checkPMs() {
    return this.getCurrentUser().pipe(map(
      (userData) => {
        return this.isPM2(22, 355).pipe(map(
          (pmData) => {
            if (!pmData) {
              return Observable.throw(false);
            }
            // if (pmData) {
            //   console.log(pmData);
            //   return true;
            // } else {
            //   console.log('is Not PM');
            // }
          }
          )
        );
      }
      )
    );
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
        this.currentUsers = mainData;
        return mainData;
      }
    ));
  }

  getUserRole(account: number) {
    let mainData;
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'Users\')/items?$filter=AccountId eq ' + account,
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results[0];
        mainData = {
          ID: data.ID,
          Account: account,
          FullName: data.Title,
          IsPM: data.IsPM,
          IsPMOExpert: data.IsPMOExpert,
          Id_Importer: data.ImporterId,
        };
        this.userRole = mainData;
        this.userRoleSubject.next(this.userRole);
        return mainData;
      }
    ));
  }

  checkParams() {
    return this.route;
  }

  isAuthenticated() {
    return this.token != null;
  }
}
