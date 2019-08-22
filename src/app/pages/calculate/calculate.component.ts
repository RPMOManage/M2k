import { Component, OnInit } from '@angular/core';
import { CalculationsService } from '../../shared/services/calculations.service';
import { PlanActPCsList } from '../../shared/models/buildSiteModels/PlanActPCs.model';
import * as moment from 'jalali-moment';
import { PlanActsPCPropList } from '../../shared/models/buildSiteModels/planActsPCProp.model';
import { SharedService } from '../../shared/services/shared.service';

@Component({
  selector: 'app-calculate',
  templateUrl: './calculate.component.html',
  styleUrls: ['./calculate.component.scss']
})
export class CalculateComponent implements OnInit {
  pcDate = '1397/9/26';
  interval = 30;
  // pcDate = [2018, 2, 25];
  pc = 0.004;
  filteredByPlanActPropCode;
  data;
  actualCode = 'V01AED01';
  planCode = 80;
  speed;

  constructor(private calculationsService: CalculationsService,
              private sharedService: SharedService) {
  }

  ngOnInit() {
    // this.sharedService.getAllPCs().subscribe(
    //   (data: { ID, PCProp, Date, PC }[]) => {
    //     console.log(data);

        // Start progressDeviation
        // const finalDataPlan = data.filter(v => v.PCProp === 80);
        // const finalDataAct = data.filter(v => {
        //   if (v.PCProp === 81) {
        //     const final = this.calculationsService.progressDeviation(+this.calculationsService.getPC(v.Date, finalDataPlan), +v.PC);
        //     console.log(final * 100, v.Date, v.PC, ' | ', +this.calculationsService.getPC(v.Date, finalDataPlan));
        //   }
        // });

        // Start Speed
        // const finalData = data.filter(v => v.PCProp === 80 || v.PCProp === 81);
        // const finalDataPlan = data.filter(v => v.PCProp === 80);
        // const finalDataAct = data.filter(v => v.PCProp === 81);
        // for (let i = 0; i < finalDataAct.length; i++) {
        //   this.speed = this.calculationsService.getSpeed(finalDataAct[i].Date, this.interval, finalDataAct, finalData, this.planCode);
        //   console.log(this.speed, ' | ', finalDataAct[i].Date, finalDataAct[i].PC);
        // }


        // Start TimeDeviation

    //   }
    // );






    const PropCode: PlanActPCsList[] = [
      {Date: '11/14/2018', PC: 0, PlanActPropCode: '', Index: ''},
      {Date: '11/21/2018', PC: 10, PlanActPropCode: '', Index: ''},
      {Date: '12/21/2018', PC: 20, PlanActPropCode: '', Index: ''},
      {Date: '1/20/2019', PC: 30, PlanActPropCode: '', Index: ''},
      {Date: '2/19/2019', PC: 35, PlanActPropCode: '', Index: ''},
      {Date: '3/20/2019', PC: 45, PlanActPropCode: '', Index: ''},
      {Date: '4/20/2019', PC: 50, PlanActPropCode: '', Index: ''},
      {Date: '5/21/2019', PC: 52, PlanActPropCode: '', Index: ''},
      {Date: '6/21/2019', PC: 59, PlanActPropCode: '', Index: ''},
      {Date: '7/22/2019', PC: 62, PlanActPropCode: '', Index: ''},
      {Date: '8/22/2019', PC: 69, PlanActPropCode: '', Index: ''},
      {Date: '9/22/2019', PC: 75, PlanActPropCode: '', Index: ''},
      {Date: '10/22/2019', PC: 85, PlanActPropCode: '', Index: ''},
      {Date: '11/21/2019', PC: 90, PlanActPropCode: '', Index: ''},
      {Date: '12/21/2019', PC: 96, PlanActPropCode: '', Index: ''},
      {Date: '1/15/2020', PC: 100, PlanActPropCode: ' ', Index: ''}
    ];

    const calcPropCode = PropCode.filter(v => v.Date === this.pcDate)[0];
    // console.log(moment('2018/2/19', 'YYYY/M/D')
    //   .locale('fa')
    //   .format('YYYY/M/D HH:mm:ss'));
    const m = moment('1396/7/22', 'jYYYY/jM/jD');
    const md = moment('1396/12/29', 'jYYYY/jM/jD');
    // console.log(m.minutes());
    // console.log(moment.duration(md.diff(m)).asDays());
    // const fff = moment('2018, 2, 19');
    // const ddd = moment('2018, 3, 20');
    // console.log(fff.diff(ddd, 'days'));
    // console.log(moment.duration(fff.diff(ddd)).asDays());
    this.calculationsService.PlansActsPCProp('').subscribe(
      (data: PlanActsPCPropList[]) => {
        // const papcpFiltered = data.filter(a => a.Code === 'V01AC01' || a.Code === 'V01AT01' || a.Code === 'V01P01C01');
        const papcpFiltered = data;

        // console.log(this.calculationsService.getSuitablePlanPropCode(this.pcDate, papcpFiltered), 'getSuitablePlanPropCode');
      }
    );
    this.calculationsService.PlanActPCs('').subscribe(
      (data: PlanActPCsList[]) => {
        // const f = d.filter(a => a.PlanActPropCode.includes('C') && a.PlanActPropCode.includes('A'));

        /////// global ///////
        const f = data.filter(a => a.PlanActPropCode === this.actualCode);
        const filteredByPlanActPropCode = f;
        this.filteredByPlanActPropCode = filteredByPlanActPropCode;
        this.data = data;
        // this.calculationsService.getSpeed(this.pcDate, this.interval, filteredByPlanActPropCode, data);
        this.speed = this.calculationsService.getSpeed(this.pcDate, this.interval, this.filteredByPlanActPropCode, this.data, this.planCode);


        /////// getPC ///////
        // console.log(this.calculationsService.getPC(this.pcDate, filteredByPlanActPropCode), 'PCx');

        /////// getPCDate ///////
        // console.log(this.calculationsService.getPCDate(this.pc, filteredByPlanActPropCode), 'PCDatEx');


        // const d222 = new Date(dx);
        // this.calculationsService.getPC().subscribe();
      }
    );
  }

  onChange(e) {
    this.filteredByPlanActPropCode = this.data.filter(a => a.PlanActPropCode === this.actualCode);
    this.speed = this.calculationsService.getSpeed(this.pcDate, this.interval, this.filteredByPlanActPropCode, this.data, this.planCode);

  }

}
