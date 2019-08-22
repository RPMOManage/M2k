import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../shared/services/shared.service';
import { AlertsService } from '../../../shared/services/alerts.service';
import { FinancialFormComponent } from '../financial-form/financial-form.component';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { isUndefined } from 'util';
import { FinancialModel } from '../../../shared/models/transferModels/Financial.model';
import { FinancialRequestTypeModel } from '../../../shared/models/FinancialRequestType.model';
import * as moment from 'jalali-moment';
import { CostResourcesList } from '../../../shared/models/costResources.model';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-financial-table',
  templateUrl: './financial-table.component.html',
  styleUrls: ['./financial-table.component.scss']
})
export class FinancialTableComponent implements OnInit {
  financialData: FinancialModel[] = [];
  displayedColumns: string[] = ['ID', 'RequestType', 'ApprovedDate', 'GrossAmount', 'NetAmount', 'Edit'];
  dataSource: any = [];
  tabIndex = 0;
  financialRequestTypes: FinancialRequestTypeModel[] = [];
  financialPaymentTypes: FinancialRequestTypeModel[] = [];
  costResources: CostResourcesList[] = [];
  isReadOnly: boolean;
  contractCost: number;
  isNetAmountValid = false;
  isGrossAmountValid = false;

  constructor(private sharedService: SharedService,
              private alertsService: AlertsService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.financialData = this.sharedService.stepFormsData.financialRequests;
    this.contractCost = this.sharedService.stepFormsData.contractsForm.Cost_Costs;
    this.dataSource = new MatTableDataSource(this.financialData);
    this.isReadOnly = this.sharedService.isReadOnly;


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

  onAddFinancial(element, isNew: boolean) {
    if (this.sharedService.stepFormsData.assignedCostResourcesForm) {
      const dialogRef = this.dialog.open(FinancialFormComponent, {
        width: '1200px',
        height: '800px',
        data: {
          data: element,
          isNew: isNew,
          tabIndex: this.tabIndex,
          isDuty: false,
        },
        autoFocus: false
      });

      dialogRef.afterClosed().subscribe(result => {
        if (this.tabIndex === 0) {
          this.financialData = this.sharedService.stepFormsData.financialRequests;
        } else {
          this.financialData = this.sharedService.stepFormsData.financialPayments;
        }
        this.dataSource = new MatTableDataSource(this.financialData);
      });
    } else {
      const text = '<p style="direction: rtl; text-align: right">حداقل یک محل تامین اعتبار وارد نمایید!</p>';
      this.alertsService.alertsWrongContractForm(text).then((result) => {
        if (result.value) {
        }
      });
    }
  }

  onDeleteFinancial(element, formTabIndex) {
    console.log(element);
    let gPSum = 0;
    let nPSum = 0;
    let gRSum = 0;
    let nRSum = 0;
    if (formTabIndex === 0) {
      if (this.sharedService.stepFormsData.financialRequests) {
        this.sharedService.stepFormsData.financialRequests.filter(v => {
          if (+element.ID !== +v.ID) {
            gRSum = +gRSum + +v.GrossAmount;
          }
        });
        this.sharedService.stepFormsData.financialRequests.filter(v => {
          if (+element.ID !== +v.ID) {
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
    }
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
            const index = this.sharedService.stepFormsData.financialRequests.findIndex(v => v.ID === element.ID);
            this.sharedService.stepFormsData.financialRequests.splice(index, 1);
            this.financialData = this.sharedService.stepFormsData.financialRequests;
          } else {
            const index = this.sharedService.stepFormsData.financialPayments.findIndex(v => v.ID === element.ID);
            this.sharedService.stepFormsData.financialPayments.splice(index, 1);
            this.financialData = this.sharedService.stepFormsData.financialPayments;
          }
          console.log(element);
          this.sharedService.getDataFromContextInfo().subscribe(
            (digestValue) => {
              this.sharedService.updateDataJson(digestValue, +this.sharedService.stepFormsData.contractsForm.Code_Contract, false).subscribe(
                () => {
                  this.dataSource = new MatTableDataSource(this.financialData);
                }
              );
            }
          );
        }
      });
    } else {
      let text = '<p style="direction: rtl; text-align: right">مجموع مبلغ سند های درخواستی باید بزرگتر یا مساوی مجموع مبلغ سند های پرداختی باشد(خالص یا ناخالص)!</p>';
      this.alertsService.alertsWrongContractForm(text).then((result) => {
        if (result.value) {
        }
      });
    }
  }

  getPaymentTypeName(id: number) {
    return this.financialPaymentTypes.filter(v => v.ID === id)[0].Title;
  }

  getCostResourceName(id: number) {
    return this.costResources.filter(v => v.ID === id)[0].Name;
  }

  onChangeTabFn(index: number) {
    this.tabIndex = index;
    if (this.tabIndex === 0) {
      this.displayedColumns = ['ID', 'RequestType', 'ApprovedDate', 'GrossAmount', 'NetAmount', 'Edit'];
      this.financialData = this.sharedService.stepFormsData.financialRequests;
    } else {
      this.displayedColumns = ['ID', 'RequestType', 'ApprovedDate', 'CostResource', 'GrossAmount', 'NetAmount', 'Edit'];
      this.financialData = this.sharedService.stepFormsData.financialPayments;
    }
    this.dataSource = new MatTableDataSource(this.financialData);
  }
}
