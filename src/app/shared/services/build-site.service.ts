import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GetUserList } from '../models/buildSiteModels/getUser.model';
import { UserService } from './user.service';
import { SiteGroupsList } from '../models/buildSiteModels/siteGroups.model';
import { map } from 'rxjs/internal/operators';

@Injectable()
export class BuildSiteService {

  constructor(private http: HttpClient,
              private userService: UserService) {
  }


  getMainSiteGroups() {
    const mainData: SiteGroupsList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      // 'http://pmo.rai.ir/PO/_api/web/roleassignments/groups?$filter=startswith(Title,%20%27Test%27)%20eq%20true',
      'http://rpmo.rai.ir/PWA/_api/web/roleassignments/groups',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          mainData.push(
            new SiteGroupsList(
              data[i].Id,
              data[i].LoginName,
              data[i].Title,
              null
            )
          );
        }
        // console.log(data);
        return mainData;
      }
    ));
  }

  getSiteGroups(siteName, type) {
    let condition = '';
    if (siteName !== '') {
      condition = '(startswith(LoginName,\'' + type + '\') eq true)';
      condition = condition + ' and (startswith(OwnerTitle,\'م\') eq false) and (startswith(OwnerTitle,\'Web\') eq false)';
    } else {
      condition = 'Id gt 100';
    }
    const mainData: SiteGroupsList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      // 'http://pmo.rai.ir/PO/_api/web/roleassignments/groups?$filter=startswith(Title,%20%27Test%27)%20eq%20true',
      'http://rpmo.rai.ir/PWA/' + siteName + '/_api/web/roleassignments/groups?$filter=' + condition,
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          this.getImporterGroupUsers(data[i].Id).subscribe(
            (info) => {
              mainData.push(
                new SiteGroupsList(
                  data[i].Id,
                  data[i].LoginName,
                  data[i].Title,
                  info
                )
              );
            });
        }
        return mainData;
      }
    ));
  }

  getImporterGroupUsers(id) {
    const mainData: GetUserList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://rpmo.rai.ir/PWA/_api/web/sitegroups(' + id + ')/users',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          this.userService.getUserInformation(data[i].Id).subscribe(
            (info) => {
              mainData.push(
                new GetUserList(
                  data[i].Id,
                  data[i].LoginName,
                  data[i].Title,
                  info
                )
              );
            },
            () => {
              mainData.push(
                new GetUserList(
                  data[i].Id,
                  data[i].LoginName,
                  data[i].Title,
                  null
                )
              );
            });

        }
        return mainData;
      }
    ));
  }

  // assignUserToGroup(DigestValue) {
  //   const headers = new HttpHeaders({
  //     'X-RequestDigest': DigestValue,
  //     'content-type': 'application/json;odata=verbose',
  //     'accept': 'application/json;odata=verbose',
  //   });
  //   return this.http.post(
  //     'http://pmo.rai.ir/PO/api_test77/_api/web/roleassignments/addroleassignment(principalid=135, roledefid=1073741826)',
  //     '',
  //     {headers: headers}
  //   ).pipe(map((response: Response) => {
  //       console.log(response, 'changed data of api test');
  //     }
  //   ));
  // }

  removeGroup(DigestValue, groupID: number, siteName: number) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
      'X-HTTP-Method': 'DELETE',
    });
    return this.http.post(
      'http://rpmo.rai.ir/PWA/' + siteName + '/_api/web/roleassignments(' + groupID + ')',
      '',
      {headers: headers}
    ).pipe(map((response: Response) => {
        console.log(response, 'changed data of api test');
      }
    ));
  }

  removeGroupListItem(DigestValue, groupID: number, TableName: string, itemID: number) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
      'X-HTTP-Method': 'DELETE',
    });
    return this.http.post(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'' + TableName + '\')/items(\'' + itemID + '\')/roleassignments(' + groupID + ')',
      '',
      {headers: headers}
    ).pipe(map((response: Response) => {
        console.log(response, 'changed data of api test');
      }
    ));
  }

  roleAssignment(DigestValue, id, siteName, type) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    let roleCode = '1073741826';
    if (type === 'Writers') {
      roleCode = '1073741827';
    }
    return this.http.post(
      'http://rpmo.rai.ir/PWA/' + siteName + '/_api/web/roleassignments/addroleassignment(principalid=' + id + ', roledefid=' + roleCode + ')',
      '',
      {headers: headers}
    ).pipe(map((response: Response) => {
        // console.log(response, 'changed data of api test');
      }
    ));
  }

  roleAssignmentListItem(DigestValue, id, type, TableName: string, itemID: number) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    let roleCode = '1073741826';
    if (type === 'Writers') {
      roleCode = '1073741827';
    }
    return this.http.post(
      'http://rpmo.rai.ir/PWA/_api/web/lists/getbytitle(\'' + TableName + '\')/items(\'' + itemID + '\')/roleassignments/addroleassignment(principalid=' + id + ', roledefid=' + roleCode + ')',
      '',
      {headers: headers}
    ).pipe(map((response: Response) => {
        // console.log(response, 'changed data of api test');
      }
    ));
  }

  buildSite(DigestValue, siteName) {
    const headers = new HttpHeaders({
      'X-RequestDigest': DigestValue,
      'content-type': 'application/json;odata=verbose',
      'accept': 'application/json;odata=verbose',
    });
    const json = JSON.stringify(
      {
        'parameters':
          {
            'Name': siteName.toString(),
            'Description': 'Created from PowerShell using REST API'
          }
      }
    );
    // console.log(json);
    return this.http.post(
      'http://rpmo.rai.ir/PWA/_api/ProjectServer/Projects/add',
      json,
      {headers: headers}
    ).pipe(map((response: Response) => {
        // console.log(response, 'changed data of api test');
      }
    ));
  }

  // buildNormalSite(DigestValue) {
  //   const headers = new HttpHeaders({
  //     'X-RequestDigest': DigestValue,
  //     'content-type': 'application/json;odata=verbose',
  //     'accept': 'application/json;odata=verbose',
  //   });
  //   const json =  JSON.stringify(
  //     {
  //       'parameters':
  //         {
  //           '__metadata':
  //             {'type': 'SP.WebInfoCreationInformation'},
  //           'Url': 'RestSubWeb', 'Title': 'RestSubWeb',
  //           'Description': 'REST created web', 'UseUniquePermissions': false
  //         }
  //     }
  //   );
  //   console.log(json);
  //   return this.http.post(
  //     'http://pmo.rai.ir/PO/_api/web/webinfos/add',
  //     json,
  //     {headers: headers}
  //     ).map(
  //     (response: Response) => {
  //       console.log(response, 'changed data of api test');
  //     }
  //   );
  // }
}
