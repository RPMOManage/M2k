import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService } from '../../../../shared/services/contract.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { FinancialModel } from '../../../../shared/models/transferModels/Financial.model';
import { FinancialRequestTypeModel } from '../../../../shared/models/FinancialRequestType.model';
import { CostResourcesList } from '../../../../shared/models/costResources.model';
import { MatDialog, MatDialogRef, MatTableDataSource } from '@angular/material';
import { FinancialFormComponent } from '../../../../pages/new-contract-stepper/financial-form/financial-form.component';
import { AlertsService } from '../../../../shared/services/alerts.service';
import { ContractDutiesModel } from '../../../../shared/models/contractModels/contractDuties.model';
import { ContractModel } from '../../../../shared/models/contractModels/contract.model';
import * as moment from 'jalali-moment';
import { TempTransferService } from '../../../../shared/services/temp-transfer.service';

@Component({
  selector: 'app-financial-duty',
  templateUrl: './financial-duty.component.html',
  styleUrls: ['./financial-duty.component.scss']
})
export class FinancialDutyComponent implements OnInit {
  @Input() duties: ContractDutiesModel[] = [];
  @Input() duty: ContractDutiesModel;
  @Input() contractID: number;
  @Input() typeID: number;
  @Input() filteredDutyCalenders: { ID, Title, StartDate, DutyType: { ID, Title }, DataEntryStartDate, DataEntryFinishDate, IsDefualt }[];
  @Input() currentDutyCalender: { ID, Title, StartDate, FinishDate, DutyType: { ID, Title }, DataEntryStartDate, DataEntryFinishDate, IsDefualt };
  @Input() contract: ContractModel;
  @Input() isPM;
  @Input() today;
  @Input() isReadOnly: boolean;
  financialData: FinancialModel[] = [];
  displayedColumns: string[] = ['ID', 'RequestType', 'ApprovedDate', 'GrossAmount', 'NetAmount', 'Edit'];
  requestsDataSource: any = [];
  paymentsDataSource: any = [];
  tabIndex = 0;
  financialRequestTypes: FinancialRequestTypeModel[] = [];
  financialPaymentTypes: FinancialRequestTypeModel[] = [];
  costResources: CostResourcesList[] = [];
  isChecked = false;
  isAppChecked = false;
  lasts: {
    costAssignedReses: { ResID: number, Cost: number }[],
    serviceCost: { Service: number, Cost: number }[],
    pc: { Service: number, Date: string, ActPC: number, PlanPC: number }[],
    del: { Del: number, Op: number, TotalVal: number, Date: string, ActSum: number, PlanSum: number }[],
    financial?: any,
    calcs?: { Service: number, Date: string, ProgressDeviation: number, Speed30D: number, TimeDeviation: number, Speed4Ontime: number, FinishTimeForecast: number }[],
  };
  lastCounter = 0;
  isNetAmountValid = false;
  isGrossAmountValid = false;

  constructor(private sharedService: SharedService,
              private alertsService: AlertsService,
              private dialog: MatDialog,
              private dialogRef: MatDialogRef<FinancialDutyComponent>,
              private contractService: ContractService,
              private tempTransfer: TempTransferService) {
  }


  ngOnInit() {
    this.lasts = {
      costAssignedReses: [],
      calcs: [],
      serviceCost: [],
      pc: [],
      del: [],
      financial: {
        TotalGrossPayment: 0,
        TotalNetPayment: 0,
        TotalGrossRequest: 0,
        TotalNetRequest: 0,
        TotalInvoice: 0,
        FinancialProgress: 0,
        PaymentDeviation: 0,
        LastPaymentDate: null,
        LastRequestDate: null,
        Date: null,
      }
    };
    if (this.duty.DutyApprovementStatus === 1) {
      this.isReadOnly = false;
      this.isAppChecked = true;
      this.isReadOnly = true;
    }
    console.log(this.isReadOnly);
    if ((this.duty.DutyApprovementStatus === 1 || this.duty.DutyApprovementStatus === 3) && !this.duty.Json) {
      this.isChecked = true;
    }
    if (this.duty.Json) {
      this.financialData = this.duty.Json.financialRequests;
      this.requestsDataSource = new MatTableDataSource(this.financialData);
    }

    if (this.duty.Json) {
      this.financialData = this.duty.Json.financialPayments;
      this.paymentsDataSource = new MatTableDataSource(this.financialData);
    }

    this.sharedService.getCostResources().subscribe(
      (data: CostResourcesList[]) => {
        this.costResources = data;
      }
    );

    this.sharedService.getAllFinancialRequestTypes().subscribe(
      (data: FinancialRequestTypeModel[]) => {
        this.financialRequestTypes = data;
      }
    );
    this.sharedService.getAllFinancialPaymentTypes().subscribe(
      (data: FinancialRequestTypeModel[]) => {
        this.financialPaymentTypes = data;
      }
    );
  }

  createFinacialRequests(financialRequests: { FiscalYear, FinancialRequestType, LetterDate, Date1, VoucherNum, VoucherDescription, GrossAmount, Deposits, PayableInsurance, Tax, PrepaidDepreciation, MaterialPrepaidDepreciation, Fine, TotalDeductions, VAT, EmployerInsurance, TreasuryBillsProfit, NetAmount, OtherDeductions }[]) {
    const data: { FiscalYear, FinancialRequestType, LetterDate, Date, VoucherNum, VoucherDescription, GrossAmount, Deposits, PayableInsurance, Tax, PrepaidDepreciation, MaterialPrepaidDepreciation, Fine, TotalDeductions, VAT, EmployerInsurance, TreasuryBillsProfit, NetAmount, OtherDeductions }[] = [];
    let totalInvoice = 0;
    for (let i = 0; i < financialRequests.length; i++) {
      if (financialRequests[i].FinancialRequestType.ID === 1) {
        totalInvoice = totalInvoice + financialRequests[i].GrossAmount;
      }
      data.push({
        FiscalYear: +financialRequests[i].FiscalYear,
        FinancialRequestType: +financialRequests[i].FinancialRequestType.ID,
        LetterDate: moment(financialRequests[i].LetterDate, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
        Date: moment(financialRequests[i].Date1, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
        VoucherNum: financialRequests[i].VoucherNum,
        VoucherDescription: financialRequests[i].VoucherDescription,
        GrossAmount: +financialRequests[i].GrossAmount,
        Deposits: +financialRequests[i].Deposits,
        PayableInsurance: +financialRequests[i].PayableInsurance,
        Tax: +financialRequests[i].Tax,
        PrepaidDepreciation: +financialRequests[i].PrepaidDepreciation,
        MaterialPrepaidDepreciation: +financialRequests[i].MaterialPrepaidDepreciation,
        Fine: +financialRequests[i].Fine,
        TotalDeductions: +financialRequests[i].TotalDeductions,
        VAT: +financialRequests[i].VAT,
        EmployerInsurance: +financialRequests[i].EmployerInsurance,
        TreasuryBillsProfit: +financialRequests[i].TreasuryBillsProfit,
        NetAmount: +financialRequests[i].NetAmount,
        OtherDeductions: +financialRequests[i].OtherDeductions,
      });
      console.log(data);
      this.tempTransfer.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.tempTransfer.createFinancialRequests(digestValue, this.contractID, data[i]).subscribe();
        }
      );
    }
  }

  createFinacialPayments(financialPayments: { FiscalYear, FinancialRequestType, LetterDate, Date1, VoucherNum, VoucherDescription, GrossAmount, Deposits, PayableInsurance, Tax, PrepaidDepreciation, MaterialPrepaidDepreciation, Fine, TotalDeductions, VAT, EmployerInsurance, TreasuryBillsProfit, NetAmount, CostResource, PaymentType, OtherDeductions }[]) {
    const data: { FiscalYear, FinancialRequestType, LetterDate, Date, VoucherNum, VoucherDescription, GrossAmount, Deposits, PayableInsurance, Tax, PrepaidDepreciation, MaterialPrepaidDepreciation, Fine, TotalDeductions, VAT, EmployerInsurance, TreasuryBillsProfit, NetAmount, CostResource, FinancialPaymentType, OtherDeductions }[] = [];
    for (let i = 0; i < financialPayments.length; i++) {
      let financialRequestType = null;
      if (financialPayments[i].FinancialRequestType) {
        financialRequestType = +financialPayments[i].FinancialRequestType.ID;
      }
      data.push({
        FiscalYear: +financialPayments[i].FiscalYear,
        FinancialRequestType: financialRequestType,
        LetterDate: moment(financialPayments[i].LetterDate, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
        Date: moment(financialPayments[i].Date1, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
        VoucherNum: financialPayments[i].VoucherNum,
        VoucherDescription: financialPayments[i].VoucherDescription,
        GrossAmount: +financialPayments[i].GrossAmount,
        Deposits: +financialPayments[i].Deposits,
        PayableInsurance: +financialPayments[i].PayableInsurance,
        Tax: +financialPayments[i].Tax,
        PrepaidDepreciation: +financialPayments[i].PrepaidDepreciation,
        MaterialPrepaidDepreciation: +financialPayments[i].MaterialPrepaidDepreciation,
        Fine: +financialPayments[i].Fine,
        TotalDeductions: +financialPayments[i].TotalDeductions,
        VAT: +financialPayments[i].VAT,
        EmployerInsurance: +financialPayments[i].EmployerInsurance,
        TreasuryBillsProfit: +financialPayments[i].TreasuryBillsProfit,
        NetAmount: +financialPayments[i].NetAmount,
        CostResource: +financialPayments[i].CostResource,
        FinancialPaymentType: +financialPayments[i].PaymentType,
        OtherDeductions: +financialPayments[i].OtherDeductions,
      });
      this.tempTransfer.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.tempTransfer.createFinancialPayments(digestValue, this.contractID, data[i]).subscribe();
        }
      );
    }
  }

  onAddFinancial(element, isNew: boolean, type) {
    const dialogRef = this.dialog.open(FinancialFormComponent, {
      width: '1000px',
      height: '800px',
      data: {
        data: element,
        isNew: isNew,
        tabIndex: type,
        isDuty: true,
        contract: this.contract,
        duty: this.duty,
        isDutyReadOnly: this.isReadOnly,
        today: this.today
      },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (type === 0) {
        this.financialData = this.duty.Json.financialRequests;
        this.requestsDataSource = new MatTableDataSource(this.financialData);
      } else {
        this.financialData = this.duty.Json.financialPayments;
        this.paymentsDataSource = new MatTableDataSource(this.financialData);
      }
      console.log(this.duty.Json);
      console.log(this.financialData);
    });
  }

  onDeleteFinancial(element, formTabIndex) {
    let gPSum = 0;
    let nPSum = 0;
    let gRSum = 0;
    let nRSum = 0;
    if (formTabIndex === 0) {
      if (this.duty.Json.financialRequests) {
        this.duty.Json.financialRequests.filter(v => {
          if (+element.ID !== +v.ID) {
            gRSum = +gRSum + +v.GrossAmount;
          }
        });
        this.duty.Json.financialRequests.filter(v => {
          if (+element.ID !== +v.ID) {
            nRSum = +nRSum + +v.NetAmount;
          }
        });
      }
      if (this.duty.Json.financialPayments) {
        this.duty.Json.financialPayments.filter(v => {
          gPSum = +gPSum + +v.GrossAmount;
        });
        this.duty.Json.financialPayments.filter(v => {
          nPSum = +nPSum + +v.NetAmount;
        });
      }
    }
    nPSum = +nPSum + +this.contract.FinancialLast.TotalNetPayment;
    gPSum = +gPSum + +this.contract.FinancialLast.TotalGrossPayment;
    nRSum = +nRSum + +this.contract.FinancialLast.TotalNetRequest;
    gRSum = +gRSum + +this.contract.FinancialLast.TotalGrossRequest;
    if (formTabIndex === 0) {
      console.log(nPSum, 'F nPSum');
      console.log(nRSum, 'F nRSum');
      console.log(gRSum, 'F gRSum');
      console.log(gPSum, 'F gPSum');
      if (nPSum <= nRSum) {
        this.isNetAmountValid = true;
      } else {
        this.isNetAmountValid = false;
      }
      if (gPSum <= gRSum) {
        this.isGrossAmountValid = true;
      } else {
        this.isGrossAmountValid = false;
      }
    }
    if ((this.isNetAmountValid && this.isGrossAmountValid) || formTabIndex === 1) {
      this.alertsService.alertsRemove().then((result) => {
        if (result.value === true) {
          if (formTabIndex === 0) {
            const index = this.duty.Json.financialRequests.findIndex(v => v.ID === element.ID);
            this.duty.Json.financialRequests.splice(index, 1);
            this.financialData = this.duty.Json.financialRequests;
            this.requestsDataSource = new MatTableDataSource(this.financialData);
          } else {
            const index = this.duty.Json.financialPayments.findIndex(v => v.ID === element.ID);
            this.duty.Json.financialPayments.splice(index, 1);
            this.financialData = this.duty.Json.financialPayments;
            this.paymentsDataSource = new MatTableDataSource(this.financialData);
          }
          // this.sharedService.getDataFromContextInfo().subscribe(
          //   (digestValue) => {
          //     this.sharedService.updateDataJson(digestValue, +this.sharedService.stepFormsData.contractsForm.Code_Contract, false).subscribe(
          //       () => {
          //         // this.dataSource = new MatTableDataSource(this.financialData);
          //       }
          //     );
          //   }
          // );
        }
      });
    } else {
      let text = '<p>مجموع مبلغ سند های درخواستی باید بزرگتر یا مساوی مجموع مبلغ سند های پرداختی باشد(خالص یا ناخالص)!</p>';
      this.alertsService.alertsWrongContractForm(text).then((result) => {
        if (result.value) {
        }
      });
    }
  }

  onChangeAppChecked() {
    this.isAppChecked = !this.isAppChecked;
  }

  onChangeChecked(e) {
    this.isChecked = !this.isChecked;
  }

  onSubmitClick() {
    let dutyDoneStatus = 2;
    let dutyApprovementStatus = 3;

    if (this.isPM && this.isAppChecked) {
      dutyApprovementStatus = 1;
      this.updateLast();
    }
    if (this.isChecked) {
      if (+new Date(this.today) < +new Date(this.currentDutyCalender.FinishDate)) {
        dutyDoneStatus = 1;
      }
      this.duty.Json = null;
      this.sharedService.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.sharedService.getTodayDateFromContextInfo().subscribe(
            () => {
              if (this.isPM) {
              }
              this.contractService.updateContractDuties(digestValue, 'Duties', this.contractID, this.duty.Id, this.duty.Json, this.today.en, dutyApprovementStatus, dutyDoneStatus, this.isPM, this.duty.ImporterDoneDate).subscribe(
                () => {
                  this.dialogRef.close();
                }
              );
            }
          );
        }
      );
    } else {
      if (this.duty.Json) {
        if (this.duty.Json.financialPayments.length > 0 || this.duty.Json.financialRequests.length > 0) {
          if (+new Date(this.today) < +new Date(this.currentDutyCalender.FinishDate)) {
            dutyDoneStatus = 1;
          }
          if (this.isPM && this.isAppChecked) {
            this.createFinacialRequests(this.duty.Json.financialRequests);
            this.createFinacialPayments(this.duty.Json.financialPayments);
          }

          this.sharedService.getDataFromContextInfo().subscribe(
            (digestValue) => {
              this.sharedService.getTodayDateFromContextInfo().subscribe(
                () => {
                  if (this.isPM) {
                  }
                  this.contractService.updateContractDuties(digestValue, 'Duties', this.contractID, this.duty.Id, this.duty.Json, this.today.en, dutyApprovementStatus, dutyDoneStatus, this.isPM, this.duty.ImporterDoneDate).subscribe(
                    () => {
                      this.dialogRef.close();
                    }
                  );
                }
              );
            }
          );
        } else {
          this.alertsService.alertsWrong2('اطلاعات دارای اشکال هستند!');
        }
      } else {
        this.alertsService.alertsWrong2('اطلاعات دارای اشکال هستند!');
      }
    }
  }

  updateLast() {
    let totalInvoice = 0;
    this.lasts.financial = this.contract.FinancialLast;
    if (this.duty.Json) {
      if (this.duty.Json.financialRequests.length !== 0) {
        for (let i = 0; i < this.duty.Json.financialRequests.length; i++) {
          if (this.duty.Json.financialRequests[i].FinancialRequestType.ID === 1) {
            totalInvoice = totalInvoice + this.duty.Json.financialRequests[i].GrossAmount;
          }
        }
        this.lasts.financial.TotalInvoice = totalInvoice + this.contract.FinancialLast.TotalInvoice;
        this.lasts.financial.FinancialProgress = +((totalInvoice + this.contract.FinancialLast.TotalInvoice) / this.contract.Cost);
        const totalGrossRequest = +(this.duty.Json.financialRequests.map(v => v.GrossAmount).reduce(this.getSum) + this.contract.FinancialLast.TotalGrossRequest);
        this.lasts.financial.TotalGrossRequest = totalGrossRequest;
        this.lasts.financial.TotalNetRequest = +(this.duty.Json.financialRequests.map(v => v.NetAmount).reduce(this.getSum) + this.contract.FinancialLast.TotalNetRequest);
        this.contractService.getAllFinancialGrossAmounts(this.contractID, 'FinancialRequests').subscribe(
          (data: { ID, GrossAmount, FinancialRequestType, Date }[]) => {
            let lastRequestDate = this.duty.Json.financialRequests.map(v => v.Date1).sort((a, b) => +new Date(b) - +new Date(a))[0];
            const tempLastRequestDate = data.map(v => v.Date).sort((a, b) => +new Date(b) - +new Date(a))[0];
            if (+new Date(tempLastRequestDate) > +new Date(lastRequestDate)) {
              lastRequestDate = tempLastRequestDate;
            }
            this.lasts.financial.LastRequestDate = lastRequestDate;
            console.log(lastRequestDate);
            console.log(data);
            this.updateWithCounter();
          }
        );
      }
      if (this.duty.Json.financialPayments.length !== 0) {
        const totalGrossPayment = +(this.duty.Json.financialPayments.map(v => v.GrossAmount).reduce(this.getSum) + this.contract.FinancialLast.TotalGrossPayment);
        this.lasts.financial.TotalInvoice = totalInvoice + this.contract.FinancialLast.TotalInvoice;
        this.lasts.financial.TotalGrossPayment = totalGrossPayment;
        this.lasts.financial.TotalNetPayment = +(this.duty.Json.financialPayments.map(v => v.NetAmount).reduce(this.getSum) + this.contract.FinancialLast.TotalNetPayment);
        this.contractService.getAllFinancialGrossAmounts(this.contractID, 'FinancialPayments').subscribe(
          (data: { ID, GrossAmount, FinancialRequestType, Date }[]) => {
            let lastPaymentDate = this.duty.Json.financialPayments.map(v => v.Date1).sort((a, b) => +new Date(b) - +new Date(a))[0];
            const tempLastPaymentDate = data.map(v => v.Date).sort((a, b) => +new Date(b) - +new Date(a))[0];
            if (+new Date(tempLastPaymentDate) > +new Date(lastPaymentDate)) {
              lastPaymentDate = tempLastPaymentDate;
            }
            console.log(data);
            console.log(lastPaymentDate);
            this.lasts.financial.LastPaymentDate = lastPaymentDate;
            this.updateWithCounter();
          }
        );
      }
      if (this.duty.Json.financialPayments.length !== 0 && this.duty.Json.financialRequests.length !== 0) {
        const totalGrossRequest = +(this.duty.Json.financialRequests.map(v => v.GrossAmount).reduce(this.getSum) + this.contract.FinancialLast.TotalGrossRequest);
        const totalGrossPayment = +(this.duty.Json.financialPayments.map(v => v.GrossAmount).reduce(this.getSum) + this.contract.FinancialLast.TotalGrossPayment);
        this.lasts.financial.PaymentDeviation = (totalGrossRequest - totalGrossPayment) / totalGrossRequest;
      }
    }
  }

  updateWithCounter() {
    this.lastCounter++;
    let isValid = false;
    if (this.duty.Json.financialPayments.length !== 0 && this.duty.Json.financialRequests.length === 0 && this.lastCounter === 1) {
      isValid = true;
    }
    if (this.duty.Json.financialPayments.length === 0 && this.duty.Json.financialRequests.length !== 0 && this.lastCounter === 1) {
      isValid = true;
    }
    if (this.duty.Json.financialPayments.length !== 0 && this.duty.Json.financialRequests.length !== 0 && this.lastCounter === 2) {
      isValid = true;
    }

    if (isValid) {
      let finalLastDate = this.lasts.financial.LastPaymentDate;
      if (+new Date(this.lasts.financial.LastRequestDate) > +new Date(finalLastDate)) {
        finalLastDate = this.lasts.financial.LastRequestDate;
      }
      this.lasts.financial.Date = finalLastDate;
      this.tempTransfer.getDataFromContextInfo().subscribe(
        (digestValue) => {
          this.tempTransfer.updateContract(digestValue, this.contractID, this.lasts, 'finance').subscribe();
        }
      );
    }
  }

  getPaymentTypeName(id: number) {
    if (this.financialPaymentTypes.filter(v => v.ID === id)[0]) {
      return this.financialPaymentTypes.filter(v => v.ID === id)[0].Title;
    } else {
      return null;
    }
  }

  getCostResourceName(id: number) {
    return this.costResources.filter(v => v.ID === id)[0].Name;
  }

  onChangeTabFn(index: number) {
    // this.tabIndex = index;
    // if (this.tabIndex === 0) {
    //   this.displayedColumns = ['ID', 'RequestType', 'ApprovedDate', 'GrossAmount', 'NetAmount', 'Edit'];
    //   this.financialData = this.sharedService.stepFormsData.financialRequests;
    // } else {
    //   this.displayedColumns = ['ID', 'RequestType', 'ApprovedDate', 'CostResource', 'GrossAmount', 'NetAmount', 'Edit'];
    //   this.financialData = this.sharedService.stepFormsData.financialPayments;
    // }
    // this.dataSource = new MatTableDataSource(this.financialData);
  }

  getSum(total, num) {
    return +total + +num;
  }
}
