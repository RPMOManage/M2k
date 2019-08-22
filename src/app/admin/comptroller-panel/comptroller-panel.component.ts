import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../shared/services/shared.service';
import { FinancialModel } from '../../shared/models/transferModels/Financial.model';
import { ContractComptrollerModel } from '../../shared/models/ContractComptroller.model';
import { FinancialRequestTypeModel } from '../../shared/models/FinancialRequestType.model';
import { CostResourcesList } from '../../shared/models/costResources.model';
import { ContractService } from '../../shared/services/contract.service';
import { TempTransferService } from '../../shared/services/temp-transfer.service';

@Component({
  selector: 'app-comptroller-panel',
  styleUrls: ['./comptroller-panel.component.scss'],
  templateUrl: './comptroller-panel.component.html',
})
export class ComptrollerPanelComponent implements OnInit {
  financialPayments: FinancialModel[] = [];
  financialPayments2: FinancialModel[] = [];
  financialRequests: FinancialModel[] = [];
  financialPaymentsTitles = [
    'رديف',
    'سال مالي',
    'نوع سند درخواستي',
    'تاريخ نامه',
    'تاريخ تاييد سند',
    'شماره سند',
    'شرح سند',
    'شماره طرح',
    'محل پرداخت',
    'مبلغ ناخالص',
    'سپرده',
    'بيمه پرداختي',
    'ماليات',
    'استهلاک پيش پرداخت',
    'استهلاک پ.پ مواد و کالا',
    'جريمه',
    'جمع کسور',
    'ماليات ارزش افزوده',
    'بيمه سهم کارفرما',
    'سود اسناد خزانه',
    'مبلغ خالص',
  ];
  selectedContracts: ContractComptrollerModel[] = [];
  data: FinancialModel[] = [];
  data2: FinancialModel[] = [];
  testing: FinancialModel[] = [];
  requests: FinancialModel[] = [];
  contractCode = 4;
  compotrollerCode = '37/16772';
  contracts: ContractComptrollerModel[] = [];
  selectedPR: { ID?: number, Payments?: boolean, Requests?: boolean }[] = [];
  financialRequestTypes: FinancialRequestTypeModel[] = [];
  financialPaymentTypes: FinancialRequestTypeModel[] = [];
  costResources: CostResourcesList[] = [];
  financialRequestsForLast: FinancialModel[] = [];
  financialPaymentsForLast: FinancialModel[] = [];
  updateLastCounter = 0;
  lasts: {
    costAssignedReses: { ResID: number, Cost: number }[],
    serviceCost: { Service: number, Cost: number }[],
    pc: { Service: number, Date: string, ActPC: number, PlanPC: number }[],
    del: { Del: number, Op: number, TotalVal: number, Date: string, ActSum: number, PlanSum: number }[],
    financial?: any,
    calcs?: { Service: number, Date: string, ProgressDeviation: number, Speed30D: number, TimeDeviation: number, Speed4Ontime: number, FinishTimeForecast: number }[],
  };
  lastCounter = 0;


  constructor(public sharedService: SharedService,
                      public contractService: ContractService,
                      public tempTransfer: TempTransferService) {
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
    this.sharedService.getAllFinancialPaymentTypes().subscribe(
      (financialPaymentTypes) => {
        this.financialPaymentTypes = financialPaymentTypes;
      }
    );
    this.sharedService.getCostResources().subscribe(
      (costResources) => {
        this.costResources = costResources;
      }
    );
    this.sharedService.getAllFinancialRequestTypes().subscribe(
      (financialRequestTypes) => {
        this.financialRequestTypes = financialRequestTypes;
        this.sharedService.getAllComptrollerData('All', 'Payments').subscribe(
          (data: FinancialModel[]) => {
            data.filter(v => {
              const frt = this.financialRequestTypes.filter(v2 => v2.ComptrollerTitle === v.FinancialRequestType.ID)[0];
              let mainFrt = null;
              if (frt) {
                mainFrt = frt.ID;
              }
              v.FinancialRequestType = {
                ID: mainFrt,
                Title: null
              };
            });
            this.financialPayments = data;
            this.financialPayments2 = data;
          }
        );
        this.sharedService.getAllComptrollerData('All', 'Requests').subscribe(
          (data: FinancialModel[]) => {
            data.filter(v => {
              const frt = this.financialRequestTypes.filter(v2 => v2.ComptrollerTitle === v.FinancialRequestType.ID)[0];
              let mainFrt = null;
              if (frt) {
                mainFrt = frt.ID;
              }
              v.FinancialRequestType = {
                ID: mainFrt,
                Title: null
              };
            });
            this.financialRequests = data;
          }
        );
      }
    );
    this.sharedService.getAllContractsComptrollerCode().subscribe(
      (data: ContractComptrollerModel[]) => {
        this.contracts = data;
      }
    );
  }

  updateLast() {
    this.updateLastCounter++;
    console.log(this.updateLastCounter);
    if (this.updateLastCounter === 2) {
      for (let c = 0; c < this.selectedContracts.length; c++) {
        let totalInvoice = 0;
        if (this.financialRequestsForLast.length !== 0) {
          for (let i = 0; i < this.financialRequestsForLast.length; i++) {
            if (this.financialRequestsForLast[i].FinancialRequestType.ID === 1) {
              totalInvoice = totalInvoice + this.financialRequestsForLast[i].GrossAmount;
            }
          }
          this.lasts.financial.TotalInvoice = totalInvoice;
          console.log(this.selectedContracts[c].Cost);
          this.lasts.financial.FinancialProgress = +((totalInvoice) / +this.selectedContracts[c].Cost);
          const totalGrossRequest = +(this.financialRequestsForLast.map(v => v.GrossAmount).reduce(this.getSum));
          this.lasts.financial.TotalGrossRequest = totalGrossRequest;
          this.lasts.financial.TotalNetRequest = +(this.financialRequestsForLast.map(v => v.NetAmount).reduce(this.getSum));
              let lastRequestDate = this.financialRequestsForLast.map(v => v.Date1).sort((a, b) => +new Date(b) - +new Date(a))[0];
              const tempLastRequestDate = this.financialRequestsForLast.map(v => v.Date1).sort((a, b) => +new Date(b) - +new Date(a))[0];
              if (+new Date(tempLastRequestDate) > +new Date(lastRequestDate)) {
                lastRequestDate = tempLastRequestDate;
              }
              this.lasts.financial.LastRequestDate = lastRequestDate;
              console.log(lastRequestDate);
              this.updateWithCounter(+this.selectedContracts[c].Id);
        }
        if (this.financialPaymentsForLast.length !== 0) {
          const totalGrossPayment = +(this.financialPaymentsForLast.map(v => v.GrossAmount).reduce(this.getSum));
          this.lasts.financial.TotalInvoice = totalInvoice;
          this.lasts.financial.TotalGrossPayment = totalGrossPayment;
          this.lasts.financial.TotalNetPayment = +(this.financialPaymentsForLast.map(v => v.NetAmount).reduce(this.getSum));
              let lastPaymentDate = this.financialPaymentsForLast.map(v => v.Date1).sort((a, b) => +new Date(b) - +new Date(a))[0];
              const tempLastPaymentDate = this.financialPaymentsForLast.map(v => v.Date1).sort((a, b) => +new Date(b) - +new Date(a))[0];
              if (+new Date(tempLastPaymentDate) > +new Date(lastPaymentDate)) {
                lastPaymentDate = tempLastPaymentDate;
              }
              console.log(lastPaymentDate);
              this.lasts.financial.LastPaymentDate = lastPaymentDate;
          this.updateWithCounter(+this.selectedContracts[c].Id);
        }
        if (this.financialPaymentsForLast.length !== 0 && this.financialRequestsForLast.length !== 0) {
          const totalGrossRequest = +(this.financialRequestsForLast.map(v => v.GrossAmount).reduce(this.getSum));
          const totalGrossPayment = +(this.financialPaymentsForLast.map(v => v.GrossAmount).reduce(this.getSum));
          this.lasts.financial.PaymentDeviation = (totalGrossRequest - totalGrossPayment) / totalGrossRequest;
        }
      }
      this.updateLastCounter = 0;
    }
  }

  updateWithCounter(contractID: number) {
    this.lastCounter++;
    console.log(this.lastCounter);
    let isValid = false;
    if (this.financialPaymentsForLast.length !== 0 && this.financialRequestsForLast.length === 0 && this.lastCounter === 1) {
      isValid = true;
    }
    if (this.financialPaymentsForLast.length === 0 && this.financialRequestsForLast.length !== 0 && this.lastCounter === 1) {
      isValid = true;
    }
    if (this.financialPaymentsForLast.length !== 0 && this.financialRequestsForLast.length !== 0 && this.lastCounter === 2) {
      isValid = true;
    }

    if (isValid) {
      let finalLastDate = this.lasts.financial.LastPaymentDate;
      if (+new Date(this.lasts.financial.LastRequestDate) > +new Date(finalLastDate)) {
        finalLastDate = this.lasts.financial.LastRequestDate;
      }
      this.lasts.financial.Date = finalLastDate;
      this.lastCounter = 0;
      console.log(this.lastCounter);
      console.log(this.lasts);
      this.tempTransfer.getDataFromContextInfo().subscribe(
        (digestValue) => {
          console.log(this.lastCounter);
          this.tempTransfer.updateContract(digestValue, contractID, this.lasts, 'finance').subscribe();
        }
      );
    }
  }

  compare() {
    if (this.testing && this.data.length !== 0) {
      console.log(JSON.stringify(this.data[1]) === JSON.stringify(this.testing));
    }
  }

  compare2() {
    const Ids = this.testing.map(v => v.ID);
    let mainData: FinancialModel[] = [];
    let finalData: FinancialModel[] = [];
    this.testing.filter((v, index) => {
      finalData.push(Object.assign({}, v));
      finalData[index].ID = null;
    });
    mainData = this.financialPayments.filter(v => {
      if (v.contractCode === this.compotrollerCode) {
        v.contractCode = undefined;
        v.CostResource = null;
        return v;
      }
    });
    console.log(this.testing, 'DDT');
    console.log(Ids);
    if (mainData.length !== 0 && finalData) {
      mainData = mainData.sort((a, b) => +new Date(a.Date1) - +new Date(b.Date1));
      finalData = finalData.sort((a, b) => +new Date(a.Date1) - +new Date(b.Date1));
      console.log(mainData);
      console.log(finalData);
      console.log(JSON.stringify(mainData) === JSON.stringify(finalData));
      if (JSON.stringify(mainData) !== JSON.stringify(finalData)) {
        let counter = 0;
        this.sharedService.getDataFromContextInfo().subscribe(
          (digesValue) => {
            for (let i = 0; i < Ids.length; i++) {
              this.sharedService.deleteItem(digesValue, 'FinancialPayments', Ids[i], this.contractCode).subscribe(
                () => {
                  counter++;
                  if (counter === Ids.length) {
                    for (let j = 0; j < mainData.length; j++) {
                      this.sharedService.sendFinancialRequests(digesValue, mainData[j], 'FinancialPayments', this.contractCode).subscribe();
                    }
                  }
                }
              );
            }
            // this.sharedService.sendFinancialRequests(digesValue, this.requests).subscribe();
          }
        );
      }
    }
  }

  onChangeCheckBox(e, contract: ContractComptrollerModel) {
    if (e.checked) {
      this.selectedContracts.push(contract);
    } else {
      this.selectedContracts.filter((v, index) => {
        if (contract.Id === v.Id) {
          this.selectedContracts.splice(index, 1);
        }
      });
    }
    // console.log(this.selectedContracts);
  }

  onChangeCheckBoxPR(e, type, ID) {
    const dd = this.selectedPR.filter((v, index) => {
      if (ID === v.ID) {
        if (type) {
          if (e.checked) {
            this.selectedPR[index].Payments = true;
          } else {
            this.selectedPR[index].Payments = false;
          }
        } else {
          if (e.checked) {
            this.selectedPR[index].Requests = true;
          } else {
            this.selectedPR[index].Requests = false;
          }
        }
      }
    });
    if (dd.length === 0) {
      this.selectedPR.push({Payments: false, Requests: false, ID: ID});
    }
    console.log(this.selectedPR);
  }

  onSelectAll(e) {
    if (e.checked) {
      this.selectedContracts = this.contracts;
    } else {
      this.selectedContracts = [];
    }
  }

  onUpdateData() {
    this.financialPayments2 = this.financialPayments;
    console.log(this.selectedContracts, 'sls');
    for (let c = 0; c < this.selectedContracts.length; c++) {
      this.financialRequestsFunc(c);
      this.financialPaymentsFunc(c);
    }
  }

  financialRequestsFunc(c) {
    this.sharedService.getFinancialRequests('FinancialRequests', this.selectedContracts[c].Id, this.selectedContracts[c].ComptrollerCode).subscribe(
      (datad: FinancialModel[]) => {
        const testing = datad;
        const Ids = datad.map(v => v.ID);
        let mainData: FinancialModel[] = [];
        let finalData: FinancialModel[] = [];
        testing.filter((v, index) => {
          finalData.push(Object.assign({}, v));
          finalData[index].ID = null;
          finalData[index].OtherDeductions = null;
        });
        mainData = this.financialRequests.filter(v => {
          if (v.contractCode === this.selectedContracts[c].ComptrollerCode) {
            v.CostResource = null;
            return v;
          }
        });
        // console.log(testing, 'DDT');
        // console.log(Ids);
        mainData = mainData.sort((a, b) => +new Date(a.Date1) - +new Date(b.Date1));
        finalData = finalData.sort((a, b) => +new Date(a.Date1) - +new Date(b.Date1));
        // console.log(this.financialPayments);
        // console.log(finalData);
        this.financialRequestsForLast = mainData;
        console.log(this.financialRequestsForLast);
        this.updateLast();
        if (JSON.stringify(mainData) !== JSON.stringify(finalData)) {
          let counter = 0;
          // console.log('dhast');
          this.sharedService.getDataFromContextInfo().subscribe(
            (digesValue) => {
              if (finalData.length !== 0) {
                // console.log('hast');
                for (let i = 0; i < Ids.length; i++) {
                  this.sharedService.deleteItem(digesValue, 'FinancialRequests', Ids[i], this.selectedContracts[c].Id).subscribe(
                    () => {
                      counter++;
                      if (counter === Ids.length) {
                        let cc = 0;
                        for (let j = 0; j < mainData.length; j++) {
                          this.sharedService.sendFinancialRequests(digesValue, mainData[j], 'FinancialRequests', this.selectedContracts[c].Id).subscribe(
                            () => {
                              cc++;
                              if (mainData.length === cc) {
                                console.log('Finished! R');
                              }
                            }
                          );
                        }
                      }
                    }
                  );
                }
              } else {
                console.log('nist R');
                let cc = 0;
                for (let j = 0; j < mainData.length; j++) {
                  this.sharedService.sendFinancialRequests(digesValue, mainData[j], 'FinancialRequests', this.selectedContracts[c].Id).subscribe(
                    () => {
                      cc++;
                      if (mainData.length === cc) {
                        console.log('Finished! R');
                      }
                    }
                  );
                }
              }
            }
          );
        } else {
          console.log('Eq R');
        }
      }
    );
  }

  financialPaymentsFunc(c) {
    this.sharedService.getFinancialRequests('FinancialPayments', this.selectedContracts[c].Id, this.selectedContracts[c].ComptrollerCode).subscribe(
      (datad: FinancialModel[]) => {
        const testing = datad.slice();
        const Ids = datad.map(v => v.ID);
        let mainData: FinancialModel[] = [];
        let finalData: FinancialModel[] = [];
        testing.filter((v, index) => {
          finalData.push(Object.assign({}, v));
          finalData[index].ID = null;
          finalData[index].OtherDeductions = null;
        });
        mainData = this.financialPayments2.filter(v => {
          v.PaymentType = 'ajab';
          for (let i = 0; i < this.costResources.length; i++) {
            for (let j = 0; j < this.costResources[i].ComptrollerTitle.length; j++) {
              if (+this.costResources[i].ComptrollerTitle[j] === +v.CostResource) {
                v.CostResource = this.costResources[i].ID;
              }
            }
          }
          for (let i = 0; i < this.financialPaymentTypes.length; i++) {
            for (let j = 0; j < this.financialPaymentTypes[i].ComptrollerTitle.length; j++) {
              if (v.PaymentType.toString().includes(this.financialPaymentTypes[i].ComptrollerTitle[j])) {
                v.PaymentType = this.financialPaymentTypes[i].ID;
              }
            }
          }
          return v;
          // if (v.contractCode === this.selectedContracts[c].ComptrollerCode) {
          //   v.CostResource = this.costResources.indexOf();
          //   return v;
          // }
        });
        // console.log(testing, 'DDT');
        // console.log(Ids);
        // console.log(mainData);
        mainData = mainData.sort((a, b) => +new Date(a.Date1) - +new Date(b.Date1));
        finalData = finalData.sort((a, b) => +new Date(a.Date1) - +new Date(b.Date1));
        this.financialPaymentsForLast = mainData;
        this.updateLast();
        // console.log(this.financialPayments);
        // console.log(finalData);
        console.log(JSON.stringify(mainData) === JSON.stringify(finalData), 'P');
        if (JSON.stringify(mainData) !== JSON.stringify(finalData)) {
          let counter = 0;
          // console.log('dhast');
          this.sharedService.getDataFromContextInfo().subscribe(
            (digesValue) => {
              if (finalData.length !== 0) {
                // console.log('hast');
                for (let i = 0; i < Ids.length; i++) {
                  this.sharedService.deleteItem(digesValue, 'FinancialPayments', Ids[i], this.selectedContracts[c].Id).subscribe(
                    () => {
                      counter++;
                      if (counter === Ids.length) {
                        let cc = 0;
                        for (let j = 0; j < mainData.length; j++) {
                          this.sharedService.sendFinancialRequests(digesValue, mainData[j], 'FinancialPayments', this.selectedContracts[c].Id).subscribe(
                            () => {
                              cc++;
                              if (mainData.length === cc) {
                                console.log('Finished P!');
                              }
                            }
                          );
                        }
                      }
                    }
                  );
                }
              } else {
                console.log('nist P');
                let cc = 0;
                for (let j = 0; j < mainData.length; j++) {
                  this.sharedService.sendFinancialRequests(digesValue, mainData[j], 'FinancialPayments', this.selectedContracts[c].Id).subscribe(
                    () => {
                      cc++;
                      if (mainData.length === cc) {
                        console.log('Finished P!');
                      }
                    }
                  );
                }
              }
            }
          );
        } else {
          console.log('Eq P');
        }
      }
    );
  }

  getSum(total, num) {
    return +total + +num;
  }

// csvJSON(csv) {
//   const lines = csv.split('\n');
//   const result = [];
//   const headers = lines[0].split(',');
//
//   for (let i = 1; i < lines.length; i++) {
//     const obj = {};
//     const currentline = lines[i].split(',');
//
//     for (let j = 0; j < headers.length; j++) {
//       obj[headers[j]] = currentline[j];
//     }
//     result.push(obj);
//   }
//   return JSON.stringify(result);
// }
}
