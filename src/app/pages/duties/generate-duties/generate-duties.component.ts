import { Component, Input, OnInit } from '@angular/core';
import { ContractService } from '../../../shared/services/contract.service';
import { SharedService } from '../../../shared/services/shared.service';
import { ContractModel } from '../../../shared/models/contractModels/contract.model';
import * as moment from 'jalali-moment';

@Component({
  selector: 'app-generate-duties',
  templateUrl: './generate-duties.component.html',
  styleUrls: ['./generate-duties.component.scss']
})
export class GenerateDutiesComponent implements OnInit {
  dutyCalenders: { ID, Title, StartDate, DutyType: { ID, Title }, DataEntryStartDate, DataEntryFinishDate, IsDefualt, FinishDate }[] = [];
  today = '';
  @Input() contractID: number;
  contract: ContractModel;
  counter = 0;
  dutyTypes: { ID, Title, Services }[] = [];
  lastImporterDate: string;

  constructor(private contractService: ContractService,
              private sharedService: SharedService) {
  }

  ngOnInit() {
    let importerDates;
    importerDates = this.sharedService.stepFormsData.finalApprovalForm.filter(v => {
      // if (v.role !== 'PM' && v.role !== 'PMOExpert' && v.isApproved) {
      //   return v;
      // }
      if (v.isApproved) {
        return v;
      }
    });
    this.lastImporterDate = importerDates[importerDates.length - 1].date;

    if (this.sharedService.todayData) {
      this.today = this.sharedService.todayData;
      console.log(this.today);
      this.contractService.getContract(this.contractID).subscribe(
        (contract) => {
          this.contract = contract;
          this.contractService.getDutyCalenders(moment(this.lastImporterDate, 'jYYYY/jMM/jDD').format('YYYY/M/D'), moment(this.contract.FinishDate, 'jYYYY/jMM/jDD').format('YYYY/M/D')).subscribe(
            (dutyCalenders) => {
              this.dutyCalenders = dutyCalenders;
              console.log(this.dutyCalenders);
              this.getData();
            }
          );
        }
      );
    }
    this.sharedService.today.subscribe(
      (today) => {
        this.today = <any>today;
        console.log(this.today);
        this.contractService.getContract(this.contractID).subscribe(
          (contract) => {
            this.contract = contract;
            this.contractService.getDutyCalenders(moment(this.lastImporterDate, 'jYYYY/jMM/jDD').format('YYYY/M/D'), moment(this.contract.FinishDate, 'jYYYY/jMM/jDD').format('YYYY/M/D')).subscribe(
              (dutyCalenders) => {
                this.dutyCalenders = dutyCalenders;
                console.log(this.dutyCalenders);
                this.getData();
              }
            );
          }
        );
      }
    );
    this.contractService.getDutyTypes().subscribe(
      (dutyTypes) => {
        this.dutyTypes = dutyTypes;
        console.log(this.dutyTypes);
        this.getData();
      }
    );
  }

  getData() {
    this.counter++;
    if (this.counter === 2) {
      let mainDutyTypes = [];
      for (let i = 0; i < this.contract.Service.length; i++) {
        this.dutyTypes.filter(v => {
          if (v.Services.includes(this.contract.Service[i])) {
            mainDutyTypes.push(v.ID);
          }
        });
      }

      mainDutyTypes = Array.from(new Set(mainDutyTypes));
      console.log(mainDutyTypes);
      this.sharedService.getDataFromContextInfo().subscribe(
        (digestValue) => {
          for (let i = 0; i < mainDutyTypes.length; i++) {
            this.dutyCalenders.filter(v => {
              if (+v.DutyType.ID === mainDutyTypes[i] && +new Date(v.FinishDate) >= +new Date(this.lastImporterDate)) {
                console.log(1);
                if (v.DutyType.ID === 3) {
                  console.log(2);
                  if (!this.sharedService.stepFormsData.contractsForm.IsFinancial) {
                    this.contractService.sendToContractDuties(digestValue, 'Duties', this.contractID, v.ID).subscribe(
                      () => {
                        console.log('Done');
                      }
                    );
                  }
                } else {
                  console.log(3);
                  this.contractService.sendToContractDuties(digestValue, 'Duties', this.contractID, v.ID).subscribe(
                    () => {
                      console.log('Done');
                    }
                  );
                }
              }
            });
          }
        });
    }
  }
}
