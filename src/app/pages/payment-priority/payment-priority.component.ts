import { Component, OnInit } from '@angular/core';
import { ContractModel } from '../../shared/models/contractModels/contract.model';
import { ContractService } from '../../shared/services/contract.service';
import { Router } from '@angular/router';
import { SharedService } from '../../shared/services/shared.service';
import * as moment from 'jalali-moment';

@Component({
  selector: 'app-payment-priority',
  templateUrl: './payment-priority.component.html',
  styleUrls: ['./payment-priority.component.scss']
})
export class PaymentPriorityComponent implements OnInit {
  searchTab1 = '';
  searchTab2 = '';
  contracts: ContractModel[] = [];
  filtredContracts: ContractModel[] = [];
  selectedContract: ContractModel;
  tab1Contracts: ContractModel[] = [];
  tab2Contracts: ContractModel[] = [];
  filtredTab1Contracts: ContractModel[] = [];
  filtredTab2Contracts: ContractModel[] = [];
  tabIndex = 0;
  paymentPriorityKinds: { ID, Title }[] = [];
  paymentPriorityCriteriaWeights: { ID, Title, PaymentPriorityKind, Weight }[] = [];
  paymentPriorityCriteriaWeights1: { ID, Title, PaymentPriorityKind, Weight }[] = [];
  paymentPriorityCriteriaWeights2: { ID, Title, PaymentPriorityKind, Weight }[] = [];
  paymentPriorityCriteriaScores: { ID, LowerBound, LowerBoundCriteria, PaymentPriorityCriteria, UpperBoundCriteria, UpperBound, Score }[] = [];
  tab1ContractsScores = [];
  tab2ContractsScores = [];
  criteriaAndScore: {
    C1?: { ID: number, Value: number, Weight: number, Score: number },
    C2?: { ID: number, Value: number, Weight: number, Score: number },
    C6?: { ID: number, Value: number, Weight: number, Score: number },
    C4?: { ID: number, Value: number, Weight: number, Score: number },
    C7?: { ID: number, Value: number, Weight: number, Score: number },
    Score?: number,
    Contract: ContractModel
  }[] = [];
  criteriaAndScore2: {
    C1?: { ID: number, Value: number, Weight: number, Score: number },
    C2?: { ID: number, Value: number, Weight: number, Score: number },
    C3?: { ID: number, Value: number, Weight: number, Score: number },
    C4?: { ID: number, Value: number, Weight: number, Score: number },
    C5?: { ID: number, Value: number, Weight: number, Score: number },
    Score?: number,
    Contract: ContractModel
  }[] = [];
  checkToStartCounter = 0;
  today = {
    en: null,
    fa: null
  };
  isChecked = false;
  spinnerChecking = 0;

  constructor(private contractService: ContractService,
              private router: Router,
              private sharedService: SharedService) {
  }

  ;ngOnInit() {
    if (this.sharedService.todayData) {
      this.today.en = this.sharedService.todayData;
      const mainDate = moment(this.sharedService.todayData, 'YYYY/M/D');
      this.today.fa = mainDate.format('jYYYY/jM/jD');
    }
    this.sharedService.today.subscribe(
      (data: any) => {
        this.today.en = data;
        const mainDate = moment(this.sharedService.todayData, 'YYYY/M/D');
        this.today.fa = mainDate.format('jYYYY/jM/jD');
      }
    );
    console.log(this.sharedService.todayData);
    this.sharedService.getAllPaymentPriorityKinds().subscribe(
      (data) => {
        this.paymentPriorityKinds = data;
        this.checkToStart();
        console.log(data);
      }
    );
    this.sharedService.getAllPaymentPriorityCriteriaWeights().subscribe(
      (data) => {
        this.paymentPriorityCriteriaWeights = data;
        this.paymentPriorityCriteriaWeights1 = this.paymentPriorityCriteriaWeights.filter(v => v.PaymentPriorityKind === 1);
        this.paymentPriorityCriteriaWeights2 = this.paymentPriorityCriteriaWeights.filter(v => v.PaymentPriorityKind === 2);
        this.checkToStart();
        console.log(data);
      }
    );
    this.sharedService.getAllPaymentPriorityCriteriaScores().subscribe(
      (data) => {
        this.paymentPriorityCriteriaScores = data;
        this.checkToStart();
        console.log(data);
      }
    );
    this.contractService.getAllContracts().subscribe(
      (contracts) => {
        this.contracts = contracts;
        this.filtredContracts = contracts;
        this.contracts.filter(v => {
          if (v.Service.findIndex(v2 => +v2 === 1 || +v2 === 2 || +v2 === 3)) {
            this.tab1Contracts.push(v);
          } else {
            this.tab2Contracts.push(v);
          }
        });
        this.filtredTab1Contracts = this.tab1Contracts;
        this.filtredTab2Contracts = this.tab2Contracts;
        this.checkToStart();
        console.log(this.contracts);
        console.log(this.tab1Contracts);
        console.log(this.tab2Contracts);
      });
  }

  checkToStart() {
    this.checkToStartCounter++;
    if (this.checkToStartCounter === 4) {
      this.calculateTab1Score();
      this.calculateTab2Score();
    }
  }

  calculateTab1Score() {
    const totalWeight = this.paymentPriorityCriteriaWeights.filter(v => v.PaymentPriorityKind === 1).map(v => v.Weight).reduce(this.getSum);
    console.log(totalWeight, 2);
    let mainService = 7;
    for (let i = 0; i < this.tab2Contracts.length; i++) {
      if (this.tab2Contracts[i].PCCalcsLast.length === 1) {
        mainService = this.tab2Contracts[i].PCCalcsLast[0].Service;
      } else if (this.tab2Contracts[i].PCCalcsLast.length === 0) {
        mainService = null;
      }
      if (mainService) {
        const mainPCCalcLast = this.tab2Contracts[i].PCCalcsLast.filter(v => v.Service === mainService)[0];
        const mainPCLast = this.tab2Contracts[i].LastPC.filter(v => v.Service === mainService)[0];
        this.criteriaAndScore2.push({
          C1: {
            ID: 1,
            Value: mainPCCalcLast.Speed90D,
            Weight: this.paymentPriorityCriteriaWeights.filter(v => v.ID === 1)[0].Weight / totalWeight,
            Score: 0,
          },
          Score: 0,
          Contract: this.tab2Contracts[i]
        });
        this.paymentPriorityCriteriaScores.filter(v => {
          if (+v.PaymentPriorityCriteria === +this.criteriaAndScore2[i].C1.ID) {
            if (this.getScore(v.LowerBound, v.LowerBoundCriteria, this.criteriaAndScore2[i].C1, v.UpperBoundCriteria, v.UpperBound)) {
              this.criteriaAndScore2[i].C1.Score = v.Score;
            }
          }
        });
        this.criteriaAndScore2[i].C2 = {
          ID: 2,
          Value: mainPCLast.ActPC / (this.tab2Contracts[i].FinancialLast.TotalGrossPayment / this.tab2Contracts[i].Cost),
          Weight: this.paymentPriorityCriteriaWeights.filter(v => v.ID === 2)[0].Weight / totalWeight,
          Score: 0
        };
        this.paymentPriorityCriteriaScores.filter(v => {
          if (v.PaymentPriorityCriteria === this.criteriaAndScore2[i].C2.ID) {
            if (this.getScore(v.LowerBound, v.LowerBoundCriteria, this.criteriaAndScore2[i].C2, v.UpperBoundCriteria, v.UpperBound)) {
              this.criteriaAndScore2[i].C2.Score = v.Score;
            }
          }
        });
        this.criteriaAndScore2[i].C4 = {
          ID: 4,
          Value: (((+new Date(mainPCLast.Date) - +new Date(this.tab2Contracts[i].StartDate)) / (mainPCLast.ActPC)) - (+new Date(mainPCLast.Date) - +new Date(this.tab2Contracts[i].StartDate))) / 86400000,
          Weight: this.paymentPriorityCriteriaWeights.filter(v => v.ID === 4)[0].Weight / totalWeight,
          Score: 0
        };
        this.paymentPriorityCriteriaScores.filter(v => {
          if (v.PaymentPriorityCriteria === this.criteriaAndScore2[i].C4.ID) {
            if (this.getScore(v.LowerBound, v.LowerBoundCriteria, this.criteriaAndScore2[i].C4, v.UpperBoundCriteria, v.UpperBound)) {
              this.criteriaAndScore2[i].C4.Score = v.Score;
            }
          }
        });
      }


      this.criteriaAndScore2[i].C3 = {
        ID: 3,
        Value: this.tab2Contracts[i].FinancialLast.TotalNetRequest / this.tab2Contracts[i].FinancialLast.TotalNetPayment,
        Weight: this.paymentPriorityCriteriaWeights.filter(v => v.ID === 3)[0].Weight / totalWeight,
        Score: 0
      };
      this.paymentPriorityCriteriaScores.filter(v => {
        if (v.PaymentPriorityCriteria === this.criteriaAndScore2[i].C3.ID) {
          if (this.getScore(v.LowerBound, v.LowerBoundCriteria, this.criteriaAndScore2[i].C3, v.UpperBoundCriteria, v.UpperBound)) {
            this.criteriaAndScore2[i].C3.Score = v.Score;
          }
        }
      });

      this.criteriaAndScore2[i].C5 = {
        ID: 5,
        Value: (+new Date(this.today.fa) - +new Date(this.tab2Contracts[i].FinancialLast.LastPaymentDate)) / 3600000 / 24,
        Weight: this.paymentPriorityCriteriaWeights.filter(v => v.ID === 5)[0].Weight / totalWeight,
        Score: 0
      };
      this.paymentPriorityCriteriaScores.filter(v => {
        if (v.PaymentPriorityCriteria === this.criteriaAndScore2[i].C5.ID) {
          if (this.getScore(v.LowerBound, v.LowerBoundCriteria, this.criteriaAndScore2[i].C5, v.UpperBoundCriteria, v.UpperBound)) {
            this.criteriaAndScore2[i].C5.Score = v.Score;
          }
        }
      });
      this.criteriaAndScore2[i].Score =
        (this.criteriaAndScore2[i].C1.Score * this.criteriaAndScore2[i].C1.Weight) +
        (this.criteriaAndScore2[i].C2.Score * this.criteriaAndScore2[i].C2.Weight) +
        (this.criteriaAndScore2[i].C3.Score * this.criteriaAndScore2[i].C3.Weight) +
        (this.criteriaAndScore2[i].C4.Score * this.criteriaAndScore2[i].C4.Weight) +
        (this.criteriaAndScore2[i].C5.Score * this.criteriaAndScore2[i].C5.Weight);
    }
    this.criteriaAndScore2 = this.criteriaAndScore2.sort((a, b) => b.Score - a.Score);
    this.isChecked = true;
    this.spinnerChecking++;
    console.log(this.criteriaAndScore2);
  }


  calculateTab2Score() {
    const totalWeight = this.paymentPriorityCriteriaWeights.filter(v => v.PaymentPriorityKind === 2).map(v => v.Weight).reduce(this.getSum);
    let mainService = 7;
    for (let i = 0; i < this.tab1Contracts.length; i++) {
      if (this.tab1Contracts[i].PCCalcsLast.length === 1) {
        mainService = this.tab1Contracts[i].PCCalcsLast[0].Service;
      } else if (this.tab1Contracts[i].PCCalcsLast.length === 0) {
        mainService = null;
      }
      if (mainService) {
        const mainPCCalcLast = this.tab1Contracts[i].PCCalcsLast.filter(v => v.Service === mainService)[0];
        const mainPCLast = this.tab1Contracts[i].LastPC.filter(v => v.Service === mainService)[0];
        this.criteriaAndScore.push({
          C6: {
            ID: 6,
            Value: mainPCCalcLast.Speed90D,
            Weight: this.paymentPriorityCriteriaWeights.filter(v => v.ID === 6)[0].Weight / totalWeight,
            Score: 0
          },
          Score: 0,
          Contract: this.tab1Contracts[i]
        });
        console.log(this.criteriaAndScore);
        this.paymentPriorityCriteriaScores.filter(v => {
          if (+v.PaymentPriorityCriteria === +this.criteriaAndScore[i].C6.ID) {
            if (this.getScore(v.LowerBound, v.LowerBoundCriteria, this.criteriaAndScore[i].C6, v.UpperBoundCriteria, v.UpperBound)) {
              this.criteriaAndScore[i].C6.Score = v.Score;
            }
          }
        });
        this.criteriaAndScore[i].C7 = {
          ID: 7,
          Value: (+new Date(this.today.fa) - +new Date(this.tab1Contracts[i].FinancialLast.LastPaymentDate)) / 3600000 / 24,
          Weight: this.paymentPriorityCriteriaWeights.filter(v => v.ID === 7)[0].Weight / totalWeight,
          Score: 0
        };
        this.paymentPriorityCriteriaScores.filter(v => {
          if (v.PaymentPriorityCriteria === this.criteriaAndScore[i].C7.ID) {
            if (this.getScore(v.LowerBound, v.LowerBoundCriteria, this.criteriaAndScore[i].C7, v.UpperBoundCriteria, v.UpperBound)) {
              this.criteriaAndScore[i].C7.Score = v.Score;
            }
          }
        });
        this.criteriaAndScore[i].Score =
          (this.criteriaAndScore[i].C6.Score * this.criteriaAndScore[i].C6.Weight) +
          (this.criteriaAndScore[i].C7.Score * this.criteriaAndScore[i].C7.Weight);
      }

    }
    this.criteriaAndScore = this.criteriaAndScore.sort((a, b) => b.Score - a.Score);
    this.isChecked = true;
    this.spinnerChecking++;
    console.log(this.criteriaAndScore);
  }

  getScore(lb, lbC, criteria: { ID, Value, Weight }, ubC, ub) {
    let firstRule = false;
    let secondRule = false;
    if (lbC === '<=') {
      firstRule = (lb <= criteria.Value);
    } else if (lbC === '<') {
      firstRule = (lb < criteria.Value);
    }
    if (ubC === '<=') {
      secondRule = (criteria.Value <= ub);
    } else if (ubC === '<') {
      secondRule = (criteria.Value < ub);
    }
    if (firstRule && secondRule) {
      return true;
    } else {
      return null;
    }
  }

  onSearchTab(id) {
    if (id === 1) {
      if (this.searchTab1 === '') {
        this.filtredTab1Contracts = this.tab1Contracts;
      } else {
        this.filtredTab1Contracts = this.tab1Contracts.filter(v => v.Title.includes(this.searchTab1) || v.Id.toString().includes(this.searchTab1));
      }
    } else {
      if (this.searchTab2 === '') {
        this.filtredTab2Contracts = this.tab2Contracts;
      } else {
        this.filtredTab2Contracts = this.tab2Contracts.filter(v => v.Title.includes(this.searchTab2) || v.Id.toString().includes(this.searchTab2));
      }
    }
  }

  onClickPage(Name: any) {
    if (Name === 'duties') {
      this.router.navigate(['/duties']);
    } else if (Name === 'changes') {
      this.router.navigate(['/changes']);
    } else if (Name === 'dashboard') {
      this.router.navigate(['/contracts']);
    } else {
      this.router.navigate(['/contract'], {queryParams: {ID: Name}, queryParamsHandling: 'merge'});
    }
  }

  getSum(total, num) {
    return +total + +num;
  }
}
