import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { VersionList } from '../models/buildSiteModels/version.model';
import { PlanActPCsList } from '../models/buildSiteModels/PlanActPCs.model';
import * as moment from 'jalali-moment';
import { isUndefined } from 'util';
import { PlanActsPCPropList } from '../models/buildSiteModels/planActsPCProp.model';
import { map } from 'rxjs/internal/operators';

@Injectable()
export class CalculationsService {
  constructor(private http: HttpClient) {
  }

  progressDeviation(plan, act) {
    if (plan === 0) {
      return 0;
    }
    return (plan - act) / plan;
  }

  findVersion(reportDate: string) {
    let mainData: VersionList;
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PO/TempTransfer2/_api/web/lists/getbytitle(\'Versions\')/items',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results[0];
        // console.log(data);
        mainData = {
          Code: data.Code,
          DDate: data.DDate,
          PlanPCPropCodes: data.PlanPCPropCodes,
          ActPCPropCodes: data.ActPCPropCodes,
          DelItemsCodes: data.DelItemsCodes,
          DelPlanPropCodes: data.DelPlanPropCodes,
          DelActPropCodes: data.DelActPropCodes,
          LastCode: data.LastCode,
          LastFDate: data.LastFDate,
          LastActPCs: data.LastActPCs,
          LastActDelItemVals: data.LastActDelItemVals,
        };
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  getSpeed(pcDate, interval, filteredActs: { ID, PCProp: any, Date, PC }[], filteredPlans: { ID, PCProp: any, Date, PC }[], planCode, isWizard = true) {
    const actPC = this.getPC(pcDate, filteredActs);
    const sdP = filteredPlans.filter(a => {
      if (a.PCProp.ID) {
        return a.PCProp.ID === planCode;
      } else {
        return a.PCProp === planCode;
      }
    });
    const eqPlanDate = this.getPCDate(actPC, sdP);
    // console.log(eqPlanDate);
    const pcDateByMilliseconds = new Date(pcDate);
    const pcDateAfterIntervalCalc = new Date(pcDateByMilliseconds.setDate(pcDateByMilliseconds.getDate() - interval));
    if (isWizard) {
      if (+new Date(pcDateAfterIntervalCalc) < +new Date(filteredActs[0].Date)) {
        // console.log(filteredActs[0].Date, pcDate, interval, (+new Date(pcDate) - +new Date(filteredActs[0].Date)) / 3600000 / 24);
        // console.log((+new Date(pcDate) - +new Date(filteredActs[0].Date)) / 3600000 / 24);
        const newInterval = (+new Date(pcDate) - +new Date(filteredActs[0].Date)) / 3600000 / 24;
        let newSpeed;
        if (newInterval !== 0) {
          newSpeed = this.getSpeed(pcDate, (+new Date(pcDate) - +new Date(filteredActs[0].Date)) / 3600000 / 24, filteredActs, filteredPlans, planCode, true);
          // console.log(newSpeed);
        } else {
          return null;
        }
        if (newSpeed) {
          return newSpeed;
        } else {
          return null;
        }
      }
    } else {
      if (+new Date(pcDateAfterIntervalCalc) < +new Date(filteredPlans[0].Date)) {
        return null;
      }
    }

    // console.log(+pcDate1);
    const actPC1 = this.getPC(+pcDateAfterIntervalCalc, filteredActs);
    const eq1PlanDate = this.getPCDate(actPC1, sdP);
    // console.log(eq1PlanDate);
    // console.log(eqPlanDate);
    // console.log(+new Date(pcDate));
    // console.log(+new Date(pcDate1));
    // console.log(new Date(pcDate1).toISOString());
    // console.log(new Date(+eq1PlanDate).toISOString());
    const speed = (+eqPlanDate - +eq1PlanDate) / (+new Date(pcDate) - +new Date(pcDateAfterIntervalCalc));
    // console.log(speed, 'SPEED');
    return speed;
  }

  getSuitablePlanPropCode(pcDate, papcpFiltered: PlanActsPCPropList[]) {
    const pa = papcpFiltered.filter(a => new Date(a.DDate) <= new Date(pcDate));
    return pa[pa.length - 1];
  }

  getPCDate(PC, filteredByPlanActPropCode: { ID, PCProp: any, Date, PC }[]) {
    const index = filteredByPlanActPropCode.filter(a => +a.PC === +PC);
    if (index.length === 1) {
      // return [index[0].Date, index[0].Date];
      return +new Date(index[0].Date);
    } else if (index.length > 1) {
      // return [index[0].Date, index[index.length - 1].Date];
      return (+new Date(index[index.length - 1].Date) - +new Date(index[0].Date)) / 2;
    }
    const p1 = filteredByPlanActPropCode.filter(a => +a.PC > +PC);
    const p2 = filteredByPlanActPropCode.filter(a => +a.PC < +PC);
    const p2s = p1.sort((n1, n2) => +n1.PC - +n2.PC)[0];
    const p1s = p2.sort((n1, n2) => +n1.PC - +n2.PC)[p2.length - 1];
    // console.log(p1s);
    // console.log(p2s);
    // console.log(PC);
    if (!p1s || p1s === undefined) {
      return +new Date(filteredByPlanActPropCode[0].Date);
    }
    if (!p2s || p2s === undefined) {
      return +new Date(filteredByPlanActPropCode[filteredByPlanActPropCode.length - 1].Date);
    }
    const dx = (((+PC - +p1s.PC) / (+p2s.PC - +p1s.PC)) * (+new Date(p2s.Date) - +new Date(p1s.Date))) + +new Date(p1s.Date);
    return +new Date(dx);
  }

  getPC(pcDate, filteredByPlanActPropCode: { ID, PCProp, Date, PC }[]) {
    // console.log(filteredByPlanActPropCode);
    // console.log(pcDate);
    const index = filteredByPlanActPropCode.findIndex(a => +new Date(a.Date) === +new Date(pcDate));
    if (index > 0 && filteredByPlanActPropCode[index].PC) {
      return filteredByPlanActPropCode[index].PC;
    }
    const d = filteredByPlanActPropCode.filter(a => new Date(a.Date) > new Date(pcDate));
    const g = filteredByPlanActPropCode.filter(a => new Date(a.Date) < new Date(pcDate));
    const sortedD = d.sort((n1, n2) => +new Date(n1.Date) - +new Date(n2.Date));
    const sortedG = g.sort((n1, n2) => +new Date(n1.Date) - +new Date(n2.Date));

    let d1 = sortedG[g.length - 1];
    let d2 = sortedD[0];
    // console.log(d1);
    // console.log(d2);

    if (d1) {
      let d1Counter = 1;
      while (d1.PC === null && d1Counter < sortedG.length - 1) {
        d1Counter++;
        d1 = sortedG[g.length - d1Counter];
        if (!d1) {
          d1 = sortedG[g.length - d1Counter + 1];
          break;
        }
        // console.log(d1);
      }
      if (d1.PC === null) {
        d1.PC = 0;
      }
    }

    if (d2) {
      if (d2.PC === '') {
        return 1;
      }
      let d2Counter = 0;
      while (d2.PC === null && d2Counter < sortedD.length - 1) {
        d2Counter++;
        d2 = sortedD[d2Counter];
        if (!d2) {
          d2 = sortedD[d2Counter - 1];
          break;
        }
        // console.log(d2);
      }

      if (d2.PC === null) {
        d2.PC = 1;
      }
    } else {
      return 1;
    }


    // console.log(d);
    // console.log(g);
    // console.log(pcDate);
    // console.log(index);
    // console.log(filteredByPlanActPropCode);
    // console.log(d2);
    // console.log(d2);

    if (d1) {
      if (isUndefined(d2)) {
        return d1.PC;
      }
    }


    if (isUndefined(d1)) {
      return 0;
    }
    const dxDate = new Date(pcDate);
    const d1Date = new Date(d1.Date);
    const d2Date = new Date(d2.Date);
    return (((+dxDate - +d1Date) / (+d2Date - +d1Date)) * (d2.PC - d1.PC)) + d1.PC;
  }

  PlanActPCs(pcDate: string, planActPropCode: string = 'V01AC01') {
    const mainData: PlanActPCsList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      // 'http://pmo.rai.ir/PO/TempTransfer2/_api/web/lists/getbytitle(\'PlanActPCs\')/items?$filter=substringof(\'AC\',PlanActPropCode)',
      // 'http://pmo.rai.ir/PO/TempTransfer2/_api/web/lists/getbytitle(\'PlanActPCs\')/items?$filter=PlanActPropCode eq \'' + planActPropCode + '\'',
      // 'http://pmo.rai.ir/PO/TempTransfer2/_api/web/lists/getbytitle(\'PlanActPCs\')/items?$filter=Date1 > \'2/25/2018\'',
      'http://pmo.rai.ir/PO/TempTransfer2/_api/web/lists/getbytitle(\'PlanActPCs\')/items?$orderby=Date1',
      {headers: headers}
    ).pipe(map((response: Response) => {
        // console.log(response);
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          // console.log(data[i]);
          let date = data[i].Date1.substr(0, 10).split('-');
          date = date[0] + '/' + date[1] + '/' + (+date[2] + 1);
          // data[i].Date1 = data[i].Date1.replace('T', ' ');
          // data[i].Date1 = data[i].Date1.replace('Z', '');
          // console.log(moment(data[i].Date1, 'YYYY/M/D HH:mm:ss')
          // moment(data[i].Date1, 'YYYY/M/D HH:mm:ss').locale('fa').format('YYYY/M/D'),
          //   .locale('fa')
          //   .format('YYYY/M/D'));
          // [+date[0], +date[1], +date[2].substr(0, 2) + 1],
          mainData.push(
            new PlanActPCsList(
              data[i].PlanActPropCode,
              data[i].Index,
              date,
              data[i].PC
            )
          );
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }

  PlansActsPCProp(pcDate: string, planActPropCode: string = 'V01AC01') {
    const mainData: PlanActsPCPropList[] = [];
    let headers = new HttpHeaders();
    headers = headers.set('ACCEPT', 'application/json;odata=verbose');
    return this.http.get(
      'http://pmo.rai.ir/PO/TempTransfer2/_api/web/lists/getbytitle(\'PlansActsPCProp\')/items?$orderby=DDate',
      {headers: headers}
    ).pipe(map((response: Response) => {
        const data = (<any>response).d.results;
        for (let i = 0; i < data.length; i++) {
          let DDate = data[i].DDate.substr(0, 10).split('-');
          DDate = DDate[0] + '/' + DDate[1] + '/' + (+DDate[2] + 1);

          let SDate = data[i].SDate.substr(0, 10).split('-');
          SDate = SDate[0] + '/' + SDate[1] + '/' + (+SDate[2] + 1);

          let FDate = data[i].FDate.substr(0, 10).split('-');
          FDate = FDate[0] + '/' + FDate[1] + '/' + (+FDate[2] + 1);
          mainData.push(
            new PlanActsPCPropList(
              data[i].Code,
              DDate,
              SDate,
              FDate
            )
          );
        }
        // console.log(mainData);
        return mainData;
      }
    ));
  }
}
