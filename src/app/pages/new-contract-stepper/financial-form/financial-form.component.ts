import { Component, Inject, OnInit, Optional } from '@angular/core';
import { SharedService } from '../../../shared/services/shared.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FinancialModel } from '../../../shared/models/transferModels/Financial.model';
import { FinancialRequestTypeModel } from '../../../shared/models/FinancialRequestType.model';
import { CostResourcesList } from '../../../shared/models/costResources.model';
import * as moment from 'jalali-moment';
import { isUndefined } from 'util';
import { ContractModel } from '../../../shared/models/contractModels/contract.model';
import { ContractDutiesModel } from '../../../shared/models/contractModels/contractDuties.model';
import { ContractService } from '../../../shared/services/contract.service';

@Component({
  selector: 'app-financial-form',
  templateUrl: './financial-form.component.html',
  styleUrls: ['./financial-form.component.scss']
})
export class FinancialFormComponent implements OnInit {
  formGp: FormGroup;
  checking = false;
  financialRequestTypes: FinancialRequestTypeModel[] = [];
  financialPaymentTypes: FinancialRequestTypeModel[] = [];
  costResources: CostResourcesList[] = [];
  financialRequestTypeTitle = '';
  isDate1Valid: boolean;
  isLetterDateValid: boolean;
  isGorssAmountValid: boolean;
  contractCost: number;
  selectedDate1 = null;
  selectedLetterDate = null;
  isFormValid = true;
  isDateValid = true;
  isReadOnly: boolean;
  sumGrossAmount = 0;
  sumJsonGrossAmount = 0;
  isGrossAmountValid: boolean;
  isNetAmountValid: boolean;
  today = {
    en: null,
    fa: null
  };
  contractDeclareDate: string;

  constructor(private sharedService: SharedService,
              private alertsService: AlertsService,
              @Optional() @Inject(MAT_DIALOG_DATA) public passedData: {
                data: FinancialModel,
                isNew: boolean,
                tabIndex: number,
                isDuty: boolean,
                contract?: ContractModel
                duty?: ContractDutiesModel,
                isDutyReadOnly?: boolean,
                today?: any,
              },
              public dialogRef: MatDialogRef<FinancialFormComponent>,
              private _formBuilder: FormBuilder,
              private contractService: ContractService) {
  }

  ngOnInit() {
    if (!this.passedData.duty) {
      this.contractDeclareDate = this.sharedService.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs;
      this.contractCost = this.sharedService.stepFormsData.contractsForm.Cost_Costs;
    }
    console.log(this.passedData);
    if (this.passedData.isDuty) {
      this.isReadOnly = this.passedData.isDutyReadOnly;
      this.contractCost = +this.passedData.contract.Cost;
      if (this.passedData.tabIndex === 0) {
        this.contractService.getAllFinancialGrossAmounts(this.passedData.contract.Id, 'FinancialRequests').subscribe(
          (financialRequestsGrossAmounts) => {
            financialRequestsGrossAmounts.map(v => {
              if (v.FinancialRequestType === 1) {
                this.sumGrossAmount = this.sumGrossAmount + +v.GrossAmount;
              }
            });
          }
        );
        this.contractService.getAllDutiesFinancialGrossAmounts(this.passedData.contract.Id).subscribe(
          (financialDutiesRequestsGrossAmounts) => {
            const data = [];
            console.log(financialDutiesRequestsGrossAmounts);
            financialDutiesRequestsGrossAmounts.map(v => {
              if (v.Json) {
                if (v.Json.financialRequests) {
                  v.Json.financialRequests.map(v2 => {
                    if (v2.FinancialRequestType.ID === 1) {
                      this.sumJsonGrossAmount = +this.sumJsonGrossAmount + +v2.GrossAmount;
                    }
                  });
                  data.push(v.Json);
                }
              }
            });
            console.log(this.sumJsonGrossAmount);
          }
        );
      } else {
        this.contractService.getAllFinancialGrossAmounts(this.passedData.contract.Id, 'FinancialPayments').subscribe(
          (financialPaymentsGrossAmounts) => {
            financialPaymentsGrossAmounts.map(v => {
              if (v.FinancialRequestType === 1) {
                this.sumGrossAmount = this.sumGrossAmount + +v.GrossAmount;
              }
            });
          }
        );
        this.contractService.getAllDutiesFinancialGrossAmounts(this.passedData.contract.Id).subscribe(
          (financialDutiesRequestsGrossAmounts) => {
            const data = [];
            financialDutiesRequestsGrossAmounts.map(v => {
              if (v.Json) {
                if (v.Json.financialPayments) {
                  v.Json.financialPayments.map(v2 => {
                    if (v2.FinancialRequestType.ID === 1) {
                      this.sumJsonGrossAmount = +this.sumJsonGrossAmount + +v2.GrossAmount;
                    }
                  });
                  data.push(v.Json);
                }
              }
            });
          }
        );
      }
      const contractCostResources: any = this.passedData.contract.AssignedCostResesLast.map(v => {
        return {
          ID: v.ResID,
          Name: null
        };
      });
      this.sharedService.getCostResources().subscribe(
        (data: CostResourcesList[]) => {
          for (let i = 0; i < contractCostResources.length; i++) {
            const selectedCR = data.filter(v => +v.ID === +contractCostResources[i].ID)[0];
            contractCostResources[i] = selectedCR;
          }
          this.costResources = contractCostResources;
        }
      );
    } else {
      // this.sharedService.getCostResources().subscribe(
      //   (data: CostResourcesList[]) => {
      //     this.costResources = data;
      //   }
      // );
      const contractCostResources: any = this.sharedService.stepFormsData.assignedCostResourcesForm.CostResources.map(v => {
        return {
          ID: v,
          Name: null
        };
      });
      this.sharedService.getCostResources().subscribe(
        (data: CostResourcesList[]) => {
          for (let i = 0; i < contractCostResources.length; i++) {
            const selectedCR = data.filter(v => +v.ID === +contractCostResources[i].ID)[0];
            contractCostResources[i] = selectedCR;
          }
          this.costResources = contractCostResources;
        }
      );
      this.contractCost = this.sharedService.stepFormsData.contractsForm.Cost_Costs;
      this.isReadOnly = this.sharedService.isReadOnly;
    }

    this.sharedService.getAllFinancialRequestTypes().subscribe(
      (data: FinancialRequestTypeModel[]) => {
        this.financialRequestTypes = data;
      }
    );

    if (this.passedData.tabIndex === 0) {
      this.financialRequestTypeTitle = 'نوع سند درخواستي';
      this.buildFormRequest();
    } else {
      this.financialRequestTypeTitle = 'پرداخت بابت';
      this.sharedService.getAllFinancialPaymentTypes().subscribe(
        (data: FinancialRequestTypeModel[]) => {
          this.financialPaymentTypes = data;
        }
      );
      this.buildFormPayment();
    }
    this.checking = true;
  }

  onCalculateNetAmount() {
    const netAmount = +this.formGp.get('GrossAmount').value - +this.formGp.get('TotalDeductions').value;
    this.formGp.get('NetAmount').setValue(netAmount);
    this.formGp.get('NetAmountDisabled').setValue(netAmount);
  }

  onSelectionTypeChange() {
    this.onGrossAmountChange();
  }

  onCalculateTotalDeductions() {
    let totalDeductions = 0;
    totalDeductions = +totalDeductions + +this.formGp.get('Deposits').value;
    totalDeductions = +totalDeductions + +this.formGp.get('PayableInsurance').value;
    totalDeductions = +totalDeductions + +this.formGp.get('PrepaidDepreciation').value;
    totalDeductions = +totalDeductions + +this.formGp.get('MaterialPrepaidDepreciation').value;
    totalDeductions = +totalDeductions + +this.formGp.get('Tax').value;
    totalDeductions = +totalDeductions + +this.formGp.get('Fine').value;
    totalDeductions = +totalDeductions + +this.formGp.get('OtherDeductions').value;
    this.formGp.get('TotalDeductionsDisabled').setValue(totalDeductions);
    this.formGp.get('TotalDeductions').setValue(totalDeductions);
    this.onCalculateNetAmount();
  }

  buildFormRequest() {
    let ID = null;
    let FiscalYear = null;
    let FinancialRequestType = null;
    let LetterDate = null;
    let Date1 = null;
    let VoucherNum = null;
    let VoucherDescription = null;
    let GrossAmount = null;
    let Deposits = null;
    let PayableInsurance = null;
    let Tax = null;
    let PrepaidDepreciation = null;
    let MaterialPrepaidDepreciation = null;
    let Fine = null;
    let TotalDeductions = null;
    let VAT = null;
    let EmployerInsurance = null;
    let TreasuryBillsProfit = null;
    let NetAmount = null;
    let OtherDeductions = null;

    if (this.passedData.data) {
      ID = this.passedData.data.ID;
      FiscalYear = this.passedData.data.FiscalYear;
      FinancialRequestType = this.passedData.data.FinancialRequestType.ID;
      LetterDate = this.passedData.data.LetterDate;
      Date1 = this.passedData.data.Date1;
      VoucherNum = this.passedData.data.VoucherNum;
      VoucherDescription = this.passedData.data.VoucherDescription;
      GrossAmount = this.passedData.data.GrossAmount;
      Deposits = this.passedData.data.Deposits;
      PayableInsurance = this.passedData.data.PayableInsurance;
      Tax = this.passedData.data.Tax;
      PrepaidDepreciation = this.passedData.data.PrepaidDepreciation;
      MaterialPrepaidDepreciation = this.passedData.data.MaterialPrepaidDepreciation;
      Fine = this.passedData.data.Fine;
      VAT = this.passedData.data.VAT;
      EmployerInsurance = this.passedData.data.EmployerInsurance;
      TreasuryBillsProfit = this.passedData.data.TreasuryBillsProfit;
      TotalDeductions = this.passedData.data.TotalDeductions;
      NetAmount = this.passedData.data.NetAmount;
      OtherDeductions = this.passedData.data.OtherDeductions;
    } else {
      if (this.passedData.isDuty) {
        if (this.passedData.duty.Json) {
          if (this.passedData.duty.Json.financialRequests) {
            ID = this.passedData.duty.Json.financialRequests.length + 1;
          }
        } else {
          ID = 1;
        }
      } else {
        if (this.sharedService.stepFormsData.financialRequests) {
          ID = this.sharedService.stepFormsData.financialRequests.length + 1;
        } else {
          ID = 1;
        }
      }
    }
    this.selectedDate1 = moment(Date1, 'jYYYY/jMM/jDD');
    this.selectedLetterDate = moment(LetterDate, 'jYYYY/jMM/jDD');

    const control = new FormControl();
    this.formGp = this._formBuilder.group({
      ID: new FormControl(ID, [Validators.required]),
      FiscalYear: new FormControl(FiscalYear, [Validators.required]),
      FinancialRequestType: new FormControl(FinancialRequestType, [Validators.required, Validators.min(1)]),
      LetterDate: new FormControl(moment(LetterDate, 'jYYYY/jMM/jDD'), [Validators.required]),
      Date1: new FormControl(moment(Date1, 'jYYYY/jMM/jDD'), [Validators.required]),
      VoucherNum: new FormControl(VoucherNum, [Validators.required]),
      VoucherDescription: new FormControl(VoucherDescription),
      GrossAmount: new FormControl(GrossAmount, [Validators.required, Validators.min(1)]),
      Deposits: new FormControl(Deposits, [Validators.min(1)]),
      PayableInsurance: new FormControl(PayableInsurance, [Validators.min(1)]),
      Tax: new FormControl(Tax, [Validators.min(1)]),
      PrepaidDepreciation: new FormControl(PrepaidDepreciation, [Validators.min(1)]),
      MaterialPrepaidDepreciation: new FormControl(MaterialPrepaidDepreciation, [Validators.min(1)]),
      Fine: new FormControl(Fine, [Validators.min(1)]),
      VAT: new FormControl(VAT, [Validators.min(1)]),
      EmployerInsurance: new FormControl(EmployerInsurance, [Validators.min(1)]),
      TreasuryBillsProfit: new FormControl(TreasuryBillsProfit, [Validators.min(1)]),
      TotalDeductionsDisabled: new FormControl(TotalDeductions),
      NetAmountDisabled: new FormControl(NetAmount),
      TotalDeductions: new FormControl(TotalDeductions),
      NetAmount: new FormControl(NetAmount, [Validators.min(0)]),
      OtherDeductions: new FormControl(OtherDeductions, [Validators.min(1)]),
    });
    this.formGp.get('TotalDeductionsDisabled').disable();
    this.formGp.get('NetAmountDisabled').disable();
    this.onCalculateTotalDeductions();
    this.onGrossAmountChange();
    this.formGp.get('FinancialRequestType').setValue(FinancialRequestType);
    if (this.isReadOnly) {
      this.formGp.disable();
    }
  }

  buildFormPayment() {
    let ID = null;
    let FiscalYear = null;
    let FinancialRequestType = null;
    let LetterDate = null;
    let Date1 = null;
    let VoucherNum = null;
    let VoucherDescription = null;
    let GrossAmount = null;
    let Deposits = null;
    let PayableInsurance = null;
    let Tax = null;
    let PrepaidDepreciation = null;
    let MaterialPrepaidDepreciation = null;
    let Fine = null;
    let TotalDeductions = null;
    let VAT = null;
    let EmployerInsurance = null;
    let TreasuryBillsProfit = null;
    let NetAmount = null;
    let CostResource = null;
    let PaymentType = null;
    let OtherDeductions = null;

    if (this.passedData.data) {
      ID = this.passedData.data.ID;
      FiscalYear = this.passedData.data.FiscalYear;
      FinancialRequestType = this.passedData.data.FinancialRequestType.ID;
      LetterDate = this.passedData.data.LetterDate;
      Date1 = this.passedData.data.Date1;
      VoucherNum = this.passedData.data.VoucherNum;
      VoucherDescription = this.passedData.data.VoucherDescription;
      GrossAmount = this.passedData.data.GrossAmount;
      Deposits = this.passedData.data.Deposits;
      PayableInsurance = this.passedData.data.PayableInsurance;
      Tax = this.passedData.data.Tax;
      PrepaidDepreciation = this.passedData.data.PrepaidDepreciation;
      MaterialPrepaidDepreciation = this.passedData.data.MaterialPrepaidDepreciation;
      Fine = this.passedData.data.Fine;
      TotalDeductions = this.passedData.data.TotalDeductions;
      VAT = this.passedData.data.VAT;
      EmployerInsurance = this.passedData.data.EmployerInsurance;
      TreasuryBillsProfit = this.passedData.data.TreasuryBillsProfit;
      NetAmount = this.passedData.data.NetAmount;
      CostResource = this.passedData.data.CostResource;
      PaymentType = this.passedData.data.PaymentType;
      OtherDeductions = this.passedData.data.OtherDeductions;
    } else {
      if (this.passedData.isDuty) {
        if (this.passedData.duty.Json) {
          if (this.passedData.duty.Json.financialPayments) {
            ID = this.passedData.duty.Json.financialPayments.length + 1;
          }
        } else {
          ID = 1;
        }
      } else {
        if (this.sharedService.stepFormsData.financialPayments) {
          ID = this.sharedService.stepFormsData.financialPayments.length + 1;
        } else {
          ID = 1;
        }
      }
    }
    this.selectedDate1 = moment(Date1, 'jYYYY/jMM/jDD');
    this.selectedLetterDate = moment(LetterDate, 'jYYYY/jMM/jDD');

    this.formGp = this._formBuilder.group({
      ID: new FormControl(ID, [Validators.required]),
      FiscalYear: new FormControl(FiscalYear, [Validators.required]),
      FinancialRequestType: new FormControl(FinancialRequestType),
      LetterDate: new FormControl(moment(LetterDate, 'jYYYY/jMM/jDD'), [Validators.required]),
      Date1: new FormControl(moment(Date1, 'jYYYY/jMM/jDD'), [Validators.required]),
      VoucherNum: new FormControl(VoucherNum, [Validators.required]),
      VoucherDescription: new FormControl(VoucherDescription),
      GrossAmount: new FormControl(GrossAmount, [Validators.required, Validators.min(1)]),
      Deposits: new FormControl(Deposits, [Validators.min(1)]),
      PayableInsurance: new FormControl(PayableInsurance, [Validators.min(1)]),
      Tax: new FormControl(Tax, [Validators.min(1)]),
      PrepaidDepreciation: new FormControl(PrepaidDepreciation, [Validators.min(1)]),
      MaterialPrepaidDepreciation: new FormControl(MaterialPrepaidDepreciation, [Validators.min(1)]),
      Fine: new FormControl(Fine, [Validators.min(1)]),
      VAT: new FormControl(VAT, [Validators.min(1)]),
      EmployerInsurance: new FormControl(EmployerInsurance, [Validators.min(1)]),
      TreasuryBillsProfit: new FormControl(TreasuryBillsProfit, [Validators.min(1)]),
      TotalDeductionsDisabled: new FormControl(TotalDeductions),
      NetAmountDisabled: new FormControl(NetAmount),
      TotalDeductions: new FormControl(TotalDeductions),
      NetAmount: new FormControl(NetAmount, [Validators.min(0)]),
      CostResource: new FormControl(CostResource, [Validators.required]),
      PaymentType: new FormControl(PaymentType, [Validators.required]),
      OtherDeductions: new FormControl(OtherDeductions, [Validators.min(1)]),
    });
    this.formGp.get('TotalDeductionsDisabled').disable();
    this.formGp.get('NetAmountDisabled').disable();
    this.onCalculateTotalDeductions();
    this.onGrossAmountChange();
    this.formGp.get('FinancialRequestType').setValue(FinancialRequestType);
    if (this.isReadOnly) {
      this.formGp.disable();
    }
  }

  // onDateChange(type: number) {
  //   console.log('ondate Change ', this.selectedLetterDate);
  //   if (+new Date(e.target.value) < +new Date(this.sharedService.stepFormsData.contractsForm.StartDate_Contract)) {
  //     if (type === 0) {
  //       this.isDate1Valid = false;
  //     } else {
  //       this.isLetterDateValid = false;
  //     }
  //   } else {
  //     if (type === 0) {
  //       this.isDate1Valid = true;
  //     } else {
  //       this.isLetterDateValid = true;
  //     }
  //   }
  // }

  onGrossAmountChange() {
    let sGrossAmount = this.sumGrossAmount;
    if (this.passedData.isDuty) {
      this.onCalculateNetAmount();
      // if (+this.formGp.get('FinancialRequestType').value === 1) {
      //   sGrossAmount = sGrossAmount + +this.formGp.get('GrossAmount').value;
      //   if ((+sGrossAmount + +this.sumJsonGrossAmount) <= +this.passedData.contract.Cost) {
      //     this.isGorssAmountValid = true;
      //   } else {
      //     this.isGorssAmountValid = false;
      //   }
      // } else {
      //   this.isGorssAmountValid = true;
      // }


      let sum = 0;
      console.log(this.formGp.get('FinancialRequestType').value);
      if (+this.formGp.get('FinancialRequestType').value === 1) {
        if (this.passedData.tabIndex === 0) {
          if (this.passedData.duty.Json) {
            if (this.passedData.duty.Json.financialRequests) {
              this.passedData.duty.Json.financialRequests.filter(v => {
                if (+this.formGp.get('ID').value !== +v.ID && (v.FinancialRequestType.ID === 1)) {
                  sum = +sum + +v.GrossAmount;
                }
              });
            }
          }
        } else {
          if (this.passedData.duty.Json) {
            if (this.passedData.duty.Json.financialPayments) {
              this.passedData.duty.Json.financialPayments.filter(v => {
                if (+this.formGp.get('ID').value !== +v.ID && (v.FinancialRequestType.ID === 1)) {
                  sum = +sum + +v.GrossAmount;
                }
              });
            }
          }
        }
        sum = +sum + +this.formGp.get('GrossAmount').value + +this.passedData.contract.FinancialLast.TotalInvoice;
        console.log(sum);
        console.log(this.passedData.contract.Cost);
        if (+sum > +this.passedData.contract.Cost) {
          this.isGorssAmountValid = false;
        } else {
          this.isGorssAmountValid = true;
        }
      } else {
        this.isGorssAmountValid = true;
      }






    } else {
      this.onCalculateNetAmount();
      let sum = 0;
      if (+this.formGp.get('FinancialRequestType').value === 1) {
        if (this.passedData.tabIndex === 0) {
          if (this.sharedService.stepFormsData.financialRequests) {
            this.sharedService.stepFormsData.financialRequests.filter(v => {
              if (+this.formGp.get('ID').value !== +v.ID && (v.FinancialRequestType.ID === 1)) {
                sum = +sum + +v.GrossAmount;
              }
            });
          }
        } else {
          if (this.sharedService.stepFormsData.financialPayments) {
            this.sharedService.stepFormsData.financialPayments.filter(v => {
              if (+this.formGp.get('ID').value !== +v.ID && (v.FinancialRequestType.ID === 1)) {
                sum = +sum + +v.GrossAmount;
              }
            });
          }
        }
        sum = +sum + +this.formGp.get('GrossAmount').value;
        if (+sum > +this.sharedService.stepFormsData.contractsForm.Cost_Costs) {
          this.isGorssAmountValid = false;
        } else {
          this.isGorssAmountValid = true;
        }
      } else {
        this.isGorssAmountValid = true;
      }
    }
  }

  checkForm() {
    const mainDate = moment(this.sharedService.todayData, 'YYYY/M/D');
    this.today = {
      en: this.sharedService.todayData,
      fa: mainDate.format('jYYYY/jM/jD'),
    };
    console.log(this.today);
    console.log(this.sharedService.todayData);
    const dDate = this.sharedService.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs;
    let validationCounter = 0;
    if (+new Date(this.selectedDate1.format('jYYYY/jM/jD')) < +new Date(dDate) || (this.selectedDate1.format('jYYYY/jM/jD') === 'Invalid date') || +new Date(this.selectedDate1.format('jYYYY/jM/jD')) > +new Date(this.today.fa)) {
      this.isDateValid = false;
    }
    if (+new Date(this.selectedDate1.format('jYYYY/jM/jD')) >= +new Date(dDate) && (this.selectedDate1.format('jYYYY/jM/jD') !== 'Invalid date') && +new Date(this.selectedDate1.format('jYYYY/jM/jD')) <= +new Date(this.today.fa)) {
      validationCounter++;
    }
    if (+new Date(this.selectedLetterDate.format('jYYYY/jM/jD')) < +new Date(dDate) || (this.selectedLetterDate.format('jYYYY/jM/jD') === 'Invalid date') || +new Date(this.selectedLetterDate.format('jYYYY/jM/jD')) > +new Date(this.today.fa)) {
      this.isDateValid = false;
    }
    if (+new Date(this.selectedLetterDate.format('jYYYY/jM/jD')) >= +new Date(dDate) && (this.selectedLetterDate.format('jYYYY/jM/jD') !== 'Invalid date') && +new Date(this.selectedLetterDate.format('jYYYY/jM/jD')) <= +new Date(this.today.fa)) {
      validationCounter++;
    }

    if (+new Date(this.selectedDate1.format('jYYYY/jM/jD')) < +new Date(this.selectedLetterDate.format('jYYYY/jM/jD'))) {
      this.isDateValid = false;
    }
    if (+new Date(this.selectedDate1.format('jYYYY/jM/jD')) >= +new Date(this.selectedLetterDate.format('jYYYY/jM/jD'))) {
      validationCounter++;
    }

    if (validationCounter === 3) {
      this.isDateValid = true;
    }

    // let validationCounter = 0;
    // const dDate = this.sharedService.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs;
    //
    // if (+new Date(this.selectedDate1.format('jYYYY/jM/jD')) < +new Date(dDate) || (this.selectedDate1.format('jYYYY/jM/jD') === 'Invalid date') || +new Date(this.selectedDate1.format('jYYYY/jM/jD')) > +new Date(this.passedData.today)) {
    //   this.isDateValid = false;
    // }
    // if (+new Date(this.selectedDate1.format('jYYYY/jM/jD')) >= +new Date(dDate) && (this.selectedDate1.format('jYYYY/jM/jD') !== 'Invalid date') || +new Date(this.selectedDate1.format('jYYYY/jM/jD')) <= +new Date(this.passedData.today)) {
    //   validationCounter++;
    // }
    // if (+new Date(this.selectedLetterDate.format('jYYYY/jM/jD')) < +new Date(dDate) || (this.selectedLetterDate.format('jYYYY/jM/jD') === 'Invalid date') || +new Date(this.selectedLetterDate.format('jYYYY/jM/jD')) > +new Date(this.passedData.today)) {
    //   this.isDateValid = false;
    // }
    // if (+new Date(this.selectedLetterDate.format('jYYYY/jM/jD')) >= +new Date(dDate) && (this.selectedLetterDate.format('jYYYY/jM/jD') !== 'Invalid date') || +new Date(this.selectedLetterDate.format('jYYYY/jM/jD')) <= +new Date(this.passedData.today)) {
    //   validationCounter++;
    // }
    //
    // if (validationCounter === 2) {
    //   this.isDateValid = true;
    // }

    let gPSum = 0;
    let nPSum = 0;
    let gRSum = 0;
    let nRSum = 0;
    if (this.passedData.tabIndex === 0) {
      gRSum = this.formGp.get('GrossAmount').value;
      nRSum = this.formGp.get('NetAmount').value;
      if (this.sharedService.stepFormsData.financialRequests) {
        this.sharedService.stepFormsData.financialRequests.filter(v => {
          if (+this.formGp.get('ID').value !== +v.ID) {
            gRSum = +gRSum + +v.GrossAmount;
          }
        });
        this.sharedService.stepFormsData.financialRequests.filter(v => {
          if (+this.formGp.get('ID').value !== +v.ID) {
            nRSum = +nRSum + +v.NetAmount;
          }
        });
      }
      if (this.sharedService.stepFormsData.financialPayments) {
        this.sharedService.stepFormsData.financialPayments.filter(v => {
          gPSum = +gPSum + +v.GrossAmount;
        });
        this.sharedService.stepFormsData.financialPayments.filter(v => {
          nPSum = +nPSum + +v.NetAmount;
        });
      }
    } else {
      gPSum = this.formGp.get('GrossAmount').value;
      nPSum = this.formGp.get('NetAmount').value;
      if (this.sharedService.stepFormsData.financialRequests) {
        this.sharedService.stepFormsData.financialRequests.filter(v => {
          gRSum = +gRSum + +v.GrossAmount;
        });
        this.sharedService.stepFormsData.financialRequests.filter(v => {
          nRSum = +nRSum + +v.NetAmount;
        });
      }
      if (this.sharedService.stepFormsData.financialPayments) {
        this.sharedService.stepFormsData.financialPayments.filter(v => {
          if (+this.formGp.get('ID').value !== +v.ID) {
            gPSum = +gPSum + +v.GrossAmount;
          }
        });
        this.sharedService.stepFormsData.financialPayments.filter(v => {
          if (+this.formGp.get('ID').value !== +v.ID) {
            nPSum = +nPSum + +v.NetAmount;
          }
        });
      }
    }
    if (this.passedData.tabIndex === 0) {
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
    } else {
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

    console.log(this.sharedService.stepFormsData.financialRequests);

    console.log(this.isNetAmountValid);
    console.log(this.isGrossAmountValid);

    if (this.isDateValid && this.formGp.valid && this.isGorssAmountValid && this.isNetAmountValid && this.isGrossAmountValid) {
      this.isFormValid = true;
      if (this.passedData.isNew) {
        const mainData = this.formGp.value;
        if (this.financialRequestTypes.filter(v => v.ID === mainData.FinancialRequestType)[0]) {
          mainData.FinancialRequestType = {
            ID: mainData.FinancialRequestType,
            Title: this.financialRequestTypes.filter(v => v.ID === mainData.FinancialRequestType)[0].Title
          };
        }
        mainData.Date1 = this.selectedDate1.format('jYYYY/jM/jD');
        mainData.LetterDate = this.selectedLetterDate.format('jYYYY/jM/jD');
        const data2 = mainData;

        if (this.passedData.tabIndex === 0) {
          if (!this.sharedService.stepFormsData.financialRequests) {
            this.sharedService.stepFormsData.financialRequests = [];
          }
          this.sharedService.stepFormsData.financialRequests.push(data2);
        } else {
          if (!this.sharedService.stepFormsData.financialPayments) {
            this.sharedService.stepFormsData.financialPayments = [];
          }
          this.sharedService.stepFormsData.financialPayments.push(data2);
        }
      } else {
        const mainData = this.formGp.value;
        let index;
        console.log(this.passedData.data.ID);
        if (this.passedData.tabIndex === 0) {
          index = this.sharedService.stepFormsData.financialRequests.findIndex(v => v.ID === mainData.ID);
        } else {
          index = this.sharedService.stepFormsData.financialPayments.findIndex(v => v.ID === mainData.ID);
        }
        if (this.financialRequestTypes.filter(v => v.ID === mainData.FinancialRequestType)[0]) {
          mainData.FinancialRequestType = {
            ID: mainData.FinancialRequestType,
            Title: this.financialRequestTypes.filter(v => v.ID === mainData.FinancialRequestType)[0].Title
          };
        }
        mainData.Date1 = this.selectedDate1.format('jYYYY/jM/jD');
        mainData.LetterDate = this.selectedLetterDate.format('jYYYY/jM/jD');
        if (this.passedData.tabIndex === 0) {
          this.sharedService.stepFormsData.financialRequests[index] = mainData;
        } else {
          this.sharedService.stepFormsData.financialPayments[index] = mainData;
        }
      }
      if (!this.passedData.duty) {
        console.log(this.sharedService.stepFormsData.financialRequests);
        this.sharedService.getDataFromContextInfo().subscribe(
          (digestValue) => {
            this.sharedService.updateDataJson(digestValue, +this.sharedService.stepFormsData.contractsForm.Code_Contract, false).subscribe(
              () => {
                this.dialogRef.close();
              }
            );
          }
        );
      } else {
        this.dialogRef.close();
      }
    } else {
      this.isFormValid = false;
    }

    console.log(this.formGp);
    console.log(this.formGp.valid);
  }

  checkDutyForm() {
    console.log(this.passedData.duty.Json);
    console.log(this.formGp.value);
    const dDate = this.passedData.contract.DeclareDate;
    this.onGrossAmountChange();
    this.isGrossAmountValid = true;
    this.isNetAmountValid = true;
    let gPSum = 0;
    let nPSum = 0;
    let gRSum = 0;
    let nRSum = 0;
    if (this.passedData.tabIndex === 0) {
      gRSum = this.formGp.get('GrossAmount').value;
      nRSum = this.formGp.get('NetAmount').value;
      if (this.passedData.duty.Json) {
        if (this.passedData.duty.Json.financialRequests) {
          this.passedData.duty.Json.financialRequests.filter(v => {
            if (+this.formGp.get('ID').value !== +v.ID) {
              gRSum = +gRSum + +v.GrossAmount;
            }
          });
          this.passedData.duty.Json.financialRequests.filter(v => {
            if (+this.formGp.get('ID').value !== +v.ID) {
              nRSum = +nRSum + +v.NetAmount;
            }
          });
        }
        if (this.passedData.duty.Json.financialPayments) {
          this.passedData.duty.Json.financialPayments.filter(v => {
            gPSum = +gPSum + +v.GrossAmount;
          });
          this.passedData.duty.Json.financialPayments.filter(v => {
            nPSum = +nPSum + +v.NetAmount;
          });
        }
      }
    } else {
      gPSum = this.formGp.get('GrossAmount').value;
      nPSum = this.formGp.get('NetAmount').value;
      if (this.passedData.duty.Json) {
        if (this.passedData.duty.Json.financialRequests) {
          this.passedData.duty.Json.financialRequests.filter(v => {
            gRSum = +gRSum + +v.GrossAmount;
          });
          this.passedData.duty.Json.financialRequests.filter(v => {
            nRSum = +nRSum + +v.NetAmount;
          });
        }
        if (this.passedData.duty.Json.financialPayments) {
          this.passedData.duty.Json.financialPayments.filter(v => {
            if (+this.formGp.get('ID').value !== +v.ID) {
              gPSum = +gPSum + +v.GrossAmount;
            }
          });
          this.passedData.duty.Json.financialPayments.filter(v => {
            if (+this.formGp.get('ID').value !== +v.ID) {
              nPSum = +nPSum + +v.NetAmount;
            }
          });
        }
      }
    }
    nPSum = +nPSum + +this.passedData.contract.FinancialLast.TotalNetPayment;
    gPSum = +gPSum + +this.passedData.contract.FinancialLast.TotalGrossPayment;
    nRSum = +nRSum + +this.passedData.contract.FinancialLast.TotalNetRequest;
    gRSum = +gRSum + +this.passedData.contract.FinancialLast.TotalGrossRequest;
    if (this.passedData.duty.Json) {
      // if (this.passedData.duty.Json.financialPayments) {
      //   this.passedData.duty.Json.financialPayments.filter(v => {
      //     if (+this.formGp.get('ID').value !== +v.ID) {
      //       gPSum = +gPSum + +v.GrossAmount;
      //     }
      //   });
      //   this.passedData.duty.Json.financialPayments.filter(v => {
      //     if (+this.formGp.get('ID').value !== +v.ID) {
      //       nPSum = +nPSum + +v.NetAmount;
      //     }
      //   });
      //   console.log(nPSum);
      //   console.log(gPSum);
      //   nPSum = +nPSum + +this.passedData.contract.FinancialLast.TotalNetPayment;
      //   gPSum = +gPSum + +this.passedData.contract.FinancialLast.TotalGrossPayment;
      //   console.log(nPSum);
      //   console.log(gPSum);
      // }

      // if (this.passedData.duty.Json.financialRequests) {
      //   this.passedData.duty.Json.financialRequests.filter(v => {
      //     if (+this.formGp.get('ID').value !== +v.ID) {
      //       gRSum = +gRSum + +v.GrossAmount;
      //     }
      //   });
      //   this.passedData.duty.Json.financialRequests.filter(v => {
      //     if (+this.formGp.get('ID').value !== +v.ID) {
      //       nRSum = +nRSum + +v.NetAmount;
      //     }
      //   });
      //   console.log(nRSum);
      //   console.log(gRSum);
      //   nRSum = +nRSum + +this.passedData.contract.FinancialLast.TotalNetRequest;
      //   gRSum = +gRSum + +this.passedData.contract.FinancialLast.TotalGrossRequest;
      //   console.log(nRSum);
      //   console.log(gRSum);
      // }
      if (this.passedData.tabIndex === 0) {
        // nRSum = +nRSum + +this.formGp.get('NetAmount').value;
        // gRSum = +gRSum + +this.formGp.get('GrossAmount').value;
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
      } else {
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
    }

    console.log(this.isNetAmountValid);
    console.log(this.isGrossAmountValid);
    let validationCounter = 0;
    console.log(this.passedData.today);
    console.log(this.selectedDate1);
    console.log(this.selectedLetterDate);
    console.log(this.selectedDate1.format('jYYYY/jM/jD'));
    console.log(this.selectedLetterDate.format('jYYYY/jM/jD'));
    if (+new Date(this.selectedDate1.format('jYYYY/jM/jD')) < +new Date(dDate) || (this.selectedDate1.format('jYYYY/jM/jD') === 'Invalid date') || +new Date(this.selectedDate1.format('jYYYY/jM/jD')) > +new Date(this.passedData.today.fa)) {
      this.isDateValid = false;
      console.log(1);
    }
    if (+new Date(this.selectedDate1.format('jYYYY/jM/jD')) >= +new Date(dDate) && (this.selectedDate1.format('jYYYY/jM/jD') !== 'Invalid date') && +new Date(this.selectedDate1.format('jYYYY/jM/jD')) <= +new Date(this.passedData.today.fa)) {
      validationCounter++;
    }
    if (+new Date(this.selectedLetterDate.format('jYYYY/jM/jD')) < +new Date(dDate) || (this.selectedLetterDate.format('jYYYY/jM/jD') === 'Invalid date') || +new Date(this.selectedLetterDate.format('jYYYY/jM/jD')) > +new Date(this.passedData.today.fa)) {
      this.isDateValid = false;
      console.log(2);
    }
    if (+new Date(this.selectedLetterDate.format('jYYYY/jM/jD')) >= +new Date(dDate) && (this.selectedLetterDate.format('jYYYY/jM/jD') !== 'Invalid date') && +new Date(this.selectedLetterDate.format('jYYYY/jM/jD')) <= +new Date(this.passedData.today.fa)) {
      validationCounter++;
    }

    if (+new Date(this.selectedDate1.format('jYYYY/jM/jD')) < +new Date(this.selectedLetterDate.format('jYYYY/jM/jD'))) {
      this.isDateValid = false;
      console.log(3);
    }
    if (+new Date(this.selectedDate1.format('jYYYY/jM/jD')) >= +new Date(this.selectedLetterDate.format('jYYYY/jM/jD'))) {
      validationCounter++;
    }
    console.log(validationCounter);

    if (validationCounter === 3) {
      this.isDateValid = true;
    }

    if (this.isDateValid && this.formGp.valid && this.isGorssAmountValid && this.isNetAmountValid && this.isGrossAmountValid) {
      this.isFormValid = true;
      if (this.passedData.isNew) {
        const mainData = this.formGp.value;
        if (this.financialRequestTypes.filter(v => v.ID === mainData.FinancialRequestType)[0]) {
          mainData.FinancialRequestType = {
            ID: mainData.FinancialRequestType,
            Title: this.financialRequestTypes.filter(v => v.ID === mainData.FinancialRequestType)[0].Title
          };
        } else {
          mainData.FinancialRequestType = {
            ID: mainData.FinancialRequestType,
            Title: null
          };
        }

        mainData.Date1 = this.selectedDate1.format('jYYYY/jM/jD');
        mainData.LetterDate = this.selectedLetterDate.format('jYYYY/jM/jD');
        const data2 = mainData;
        if (!this.passedData.duty.Json) {
          this.passedData.duty.Json = {
            financialRequests: [],
            financialPayments: [],
          };
        }
        if (this.passedData.tabIndex === 0) {
          this.passedData.duty.Json.financialRequests.push(data2);
        } else {
          this.passedData.duty.Json.financialPayments.push(data2);
        }
      } else {
        const mainData = this.formGp.value;
        let index;
        if (this.passedData.tabIndex === 0) {
          index = this.passedData.duty.Json.financialRequests.findIndex(v => v.ID === mainData.ID);
        } else {
          index = this.passedData.duty.Json.financialPayments.findIndex(v => v.ID === mainData.ID);
        }
        if (this.financialRequestTypes.filter(v => v.ID === mainData.FinancialRequestType)[0]) {
          mainData.FinancialRequestType = {
            ID: mainData.FinancialRequestType,
            Title: this.financialRequestTypes.filter(v => v.ID === mainData.FinancialRequestType)[0].Title
          };
        } else {
          mainData.FinancialRequestType = {
            ID: mainData.FinancialRequestType,
            Title:null
          };
        }
        mainData.Date1 = this.selectedDate1.format('jYYYY/jM/jD');
        mainData.LetterDate = this.selectedLetterDate.format('jYYYY/jM/jD');
        if (this.passedData.tabIndex === 0) {
          this.passedData.duty.Json.financialRequests[index] = mainData;
        } else {
          this.passedData.duty.Json.financialPayments[index] = mainData;
        }
      }
      console.log(this.passedData.duty.Json);
      this.dialogRef.close();
      // this.sharedService.getDataFromContextInfo().subscribe(
      //   (digestValue) => {
      //     this.sharedService.updateDataJson(digestValue, +this.sharedService.stepFormsData.contractsForm.Code_Contract, false).subscribe(
      //       () => {
      //         this.dialogRef.close();
      //       }
      //     );
      //   }
      // );
    } else {
      this.isFormValid = false;
    }

    console.log(this.formGp);
    console.log(this.formGp.valid);
  }

  getSum(total, num) {
    return +total + +num;
  }
}
