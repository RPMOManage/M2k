import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService } from '../../../shared/services/contract.service';
import { SharedService } from '../../../shared/services/shared.service';
import { ContractDutiesModel } from '../../../shared/models/contractModels/contractDuties.model';
import * as Highcharts from 'highcharts';
import { Chart } from 'angular-highcharts';
import { ContractModel } from '../../../shared/models/contractModels/contract.model';
import { MAT_DIALOG_DATA } from '@angular/material';
import * as moment from 'jalali-moment';

@Component({
  selector: 'app-card-duty',
  templateUrl: './card-duty.component.html',
  styleUrls: ['./card-duty.component.scss']
})
export class CardDutyComponent implements OnInit {
  chart;
  chartOptions;
  contractID: number;
  typeID: number;
  dutyID: number;
  startDate = '1397/11/07';
  finishDate = '1397/11/14';
  duties: ContractDutiesModel[] = [];
  duty: ContractDutiesModel;
  filteredDutyCalenders: {ID, Title, StartDate, FinishDate, DutyType: {ID, Title}, DataEntryStartDate, DataEntryFinishDate, IsDefualt}[];
  contract: ContractModel;
  currentDutyCalender: { ID, Title, StartDate, FinishDate, DutyType: { ID, Title }, DataEntryStartDate, DataEntryFinishDate, IsDefualt };
  isReadOnly: boolean;
  dutyDoneTitle = '';
  dutyApprovementTitle = '';
  today = '';
  isPM;

  constructor(private router: Router,
              private contractService: ContractService,
              private route: ActivatedRoute,
              private sharedService: SharedService,
              @Inject(MAT_DIALOG_DATA) public passedData: {dutyType, contractID, mainDuty, isReadOnly, today, isPM, dutyDoneTitle, dutyApprovementTitle}) {
  }

  ngOnInit() {
    this.isPM = this.passedData.isPM;
    this.contractID = +this.passedData.contractID;
    this.dutyID = +this.passedData.mainDuty.Id;
    this.router.navigate(['contract'], { queryParams: { DutyID: this.dutyID }, queryParamsHandling: 'merge'});
    this.typeID = +this.passedData.dutyType;
    this.isReadOnly = this.passedData.isReadOnly;
    this.dutyDoneTitle = this.passedData.dutyDoneTitle;
    this.dutyApprovementTitle = this.passedData.dutyApprovementTitle;
    this.today = this.passedData.today;
    // this.route.queryParams.subscribe(
    //   (params: any) => {
        // if (params.ContractID && params.Type && params.Duty) {
        //   this.contractID = +params.ContractID;
          // this.typeID = +params.Type;
          // this.dutyID = +params.Duty;
          this.contractService.getContract(this.contractID).subscribe(
            (contract) => {
              this.contract = contract;
            }
          );
          this.contractService.getContractDuties(this.contractID).subscribe(
            (duties: ContractDutiesModel[]) => {
              this.duties = duties;
              this.duty = this.duties.filter(v => v.Id === this.dutyID)[0];
              const dutyCalenderIds = this.duties.map(v => v.DutyCalenderId);
              this.contractService.getDutyCalenders().subscribe(
                (dutyCalenders) => {
                  this.filteredDutyCalenders = dutyCalenders.filter(v => {
                    if (+v.DutyType.ID === +this.typeID && dutyCalenderIds.findIndex(v2 => +v2 === +v.ID) !== -1) {
                      return v;
                    }
                  });
                  this.currentDutyCalender = this.filteredDutyCalenders.filter(v => v.ID === this.duty.DutyCalenderId)[0];
                }
              );
              this.buildChart();
            });
        // }
      // });
  }

  calDates() {
    const a = moment(this.passedData.today.fa);
    const b = moment(this.currentDutyCalender.FinishDate);
    return b.diff(a, 'days');
  }

  buildChart() {
    const percent = 50;
    const text = 'chart';
    const color = '#8300ffb8';
    this.chartOptions = {
      chart: {
        renderTo: 'container',
        type: 'pie',
        height: 200
      },
      title: {
        text: ''
      },
      plotOptions: {
        pie: {
          colors: [color],
          shadow: false
        }
      },
      series: [{
        name: text,
        data: [
          ['پیشرفت | درصد', percent],
          {
            'name': 'Incomplete',
            'y': 100 - percent,
            'color': 'rgba(0,0,0,0)'
          }
        ],
        size: '100%',
        innerSize: '90%',
        showInLegend: false,
        dataLabels: {
          enabled: false
        }
      }]
    };
    this.chart = new Chart(this.chartOptions);
  }
}
