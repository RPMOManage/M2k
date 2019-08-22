import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from './app-material.module';
import { MainDutiesComponent } from './pages/duties/main-duties/main-duties.component';
import { CardFilterComponent } from './types/card/card-filter/card-filter.component';
import { CardFilterBarComponent } from './types/card/card-filter/card-filter-bar/card-filter-bar.component';
import { SelectiveSearchFilterComponent } from './types/card/card-filter/selective-search-filter/selective-search-filter.component';
import { CardDialogComponent } from './types/card/card-dialog/card-dialog.component';
import { DutiesComponent } from './pages/duties/duties.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { CardComponent } from './types/card/main-card/card.component';
import { ChangesComponent } from './pages/changes/changes.component';
import { MainChangesComponent } from './pages/changes/main-changes/main-changes.component';
import { ContractsComponent } from './pages/contracts/contracts.component';
import { MainContractsComponent } from './pages/contracts/main-contracts/main-contracts.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { JalaliMomentDateAdapter } from './pages/mat-core/jalali-moment-date-adapter';
import { JALALI_MOMENT_FORMATS } from './pages/mat-core/jalali_moment_formats';
import { HeaderComponent } from './pages/header/header.component';
import { FooterComponent } from './pages/footer/footer.component';
import { SideBarComponent } from './pages/side-bar/side-bar.component';
import { HomeComponent } from './pages/home/home.component';
import { CardDutyComponent } from './types/card/card-duty/card-duty.component';
import { AppWizardModule } from './app-wizard.module';
import { SharedService } from './shared/services/shared.service';
import { AlertsService } from './shared/services/alerts.service';
import { HotTableModule } from '@handsontable-pro/angular';
import { NewContractStepperComponent } from './pages/new-contract-stepper/new-contract-stepper.component';
import { AssignedCostResourcesFormComponent } from './pages/new-contract-stepper/assigned-cost-resources-form/assigned-cost-resources-form.component';
import { SeparatorPipe } from './shared/pipes/separator.pipe';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './shared/services/auth.service';
import { TransferService } from './shared/services/transfer.service';
import { UserService } from './shared/services/user.service';
import { BuildSiteService } from './shared/services/build-site.service';
import { TempTransferService } from './shared/services/temp-transfer.service';
import { CalculationsService } from './shared/services/calculations.service';
import { GenerateDatesService } from './shared/services/generate-dates.service';
import { NewContractStepperGaurdService } from './shared/gaurds/new-contract-stepper-gaurd.service';
import { MiladiToShamsiPipe } from './shared/pipes/miladi-to-shamsi.pipe';
import { ShamsiToMiladiPipe } from './shared/pipes/shamsi-to-miladi.pipe';
import { ContractFormComponent } from './pages/new-contract-stepper/contract-form/contract-form.component';
import { ContractorAddRowComponent } from './pages/new-contract-stepper/contract-form/contractor-add-row/contractor-add-row.component';
import { StakeHoldersFormComponent } from './pages/new-contract-stepper/stake-holders-form/stake-holders-form.component';
import { CashFlowPlanComponent } from './pages/new-contract-stepper/cash-flow-plan/cash-flow-plan.component';
import { PlanActsPropFormComponent } from './pages/new-contract-stepper/plan-acts-prop-form/plan-acts-prop-form.component';
import { ChartModule, HIGHCHARTS_MODULES  } from 'angular-highcharts';
import { PlanActPropChartComponent } from './pages/new-contract-stepper/plan-acts-prop-form/plan-act-prop-chart/plan-act-prop-chart.component';
import { PlanActPropAddRowComponent } from './pages/new-contract-stepper/plan-acts-prop-form/plan-act-prop-add-row/plan-act-prop-add-row.component';
import { DeliverablesFormComponent } from './pages/new-contract-stepper/deliverables-form/deliverables-form.component';
import { DeliverablesChartComponent } from './pages/new-contract-stepper/deliverables-form/deliverables-chart/deliverables-chart.component';
import { DeliverablesAddComponent } from './pages/new-contract-stepper/deliverables-form/deliverables-add/deliverables-add.component';
import { DeliverablesBoxComponent } from './pages/new-contract-stepper/deliverables-form/deliverables-box/deliverables-box.component';
import { NewContractStartComponent } from './forms/new-contract-start/new-contract-start.component';
import { FinalApprovalFormComponent } from './pages/new-contract-stepper/final-approval-form/final-approval-form.component';
import { ShowDescriptionComponent } from './pages/new-contract-stepper/final-approval-form/show-description/show-description.component';
import { CustomChangesComponent } from './pages/new-contract-stepper/custom-changes/custom-changes.component';
import { FinancialFormComponent } from './pages/new-contract-stepper/financial-form/financial-form.component';
import { FinancialTableComponent } from './pages/new-contract-stepper/financial-table/financial-table.component';
import { ComptrollerPanelComponent } from './admin/comptroller-panel/comptroller-panel.component';
import * as highstock from 'highcharts/modules/stock.src';
import { TransferComponent } from './pages/transfer/transfer.component';
import { TransferDialogComponent } from './pages/transfer/transfer-dialog/transfer-dialog.component';
import { ContractPageComponent } from './pages/contracts/contract-page/contract-page.component';
import { ContractService } from './shared/services/contract.service';
import { PlanActPropDeleteRowComponent } from './pages/new-contract-stepper/plan-acts-prop-form/plan-act-prop-delete-row/plan-act-prop-delete-row.component';
import { SiteCreationComponent } from './pages/site-creation/site-creation.component';
import { CalculateComponent } from './pages/calculate/calculate.component';
import { BuildComponent } from './pages/build/build.component';
import { ShowUserComponent } from './pages/build/show-user/show-user.component';
import { PcDutyComponent } from './types/card/card-duty/pc-duty/pc-duty.component';
import { DeliverableDutyComponent } from './types/card/card-duty/deliverable-duty/deliverable-duty.component';
import { FinancialDutyComponent } from './types/card/card-duty/financial-duty/financial-duty.component';
import { CardChangeComponent } from './types/card/card-change/card-change.component';
import { ChangesRequestComponent } from './types/card/card-change/changes-request/changes-request.component';
import { ChangeCostComponent } from './types/card/card-change/change-cost/change-cost.component';
import { ChangeFinishDateComponent } from './types/card/card-change/change-finish-date/change-finish-date.component';
import { ChangeAssignedCostResourcesComponent } from './types/card/card-change/change-assigned-cost-resources/change-assigned-cost-resources.component';
import { ChangeCashFlowComponent } from './types/card/card-change/change-cash-flow/change-cash-flow.component';
import { ChangeDeliverableComponent } from './types/card/card-change/change-deliverable/change-deliverable.component';
import { ChangePcComponent } from './types/card/card-change/change-pc/change-pc.component';
import { ChangeStakeholderComponent } from './types/card/card-change/change-stakeholder/change-stakeholder.component';
import { ChangeStakeholderFormComponent } from './types/card/card-change/change-stakeholder/change-stakeholder-form/change-stakeholder-form.component';
import { ChangeServiceComponent } from './types/card/card-change/change-service/change-service.component';
import { ChangeServiceCostComponent } from './types/card/card-change/change-service-cost/change-service-cost.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ErrorComponent } from './pages/error/error.component';
import { ContractsListComponent } from './pages/contracts-list/contracts-list.component';
import { ContractsPishComponent } from './pages/contracts-pish/contracts-pish.component';
import { ServicesTableComponent } from './pages/contracts/main-contracts/services-table/services-table.component';
import { DeliverablesTableComponent } from './pages/contracts/main-contracts/deliverables-table/deliverables-table.component';
import { KmsUserFormComponent } from './forms/kms-user-form/kms-user-form.component';
import { KmsService } from './shared/services/kms.service';
import { ContractDutyComponent } from './pages/contracts/contract-duty/contract-duty.component';
import { GenerateDutiesComponent } from './pages/duties/generate-duties/generate-duties.component';
import { SafeHtmlPipe } from './shared/pipes/inner-html.pipe';
import { PaymentPriorityComponent } from './pages/payment-priority/payment-priority.component';
import * as FusionCharts from 'fusioncharts';
declare var require: any;
import { FusionChartsModule } from 'angular-fusioncharts';
import { ChangeTotalValueComponent } from './types/card/card-change/change-total-value/change-total-value.component';
import { ChangeFinalComponent } from './types/card/card-change/change-final/change-final.component';
const Charts = require('fusioncharts/fusioncharts.charts');
const Charts2 = require('fusioncharts/fusioncharts.widgets');
import 'hammerjs';
import {ExportsComponent} from './pages/exports/exports.component';
import {ExcelService} from './shared/services/excel.service';

// Create FusionCharts provider function
export function FusionChartsProvider () {
  // Resolve charts dependency
  Charts(FusionCharts);
  Charts2(FusionCharts);

  return FusionCharts;
}

@NgModule({
  declarations: [
    AppComponent,
    DutiesComponent,
    CardFilterComponent,
    CardFilterBarComponent,
    SelectiveSearchFilterComponent,
    CardDialogComponent,
    MainDutiesComponent,
    CardComponent,
    ChangesComponent,
    MainChangesComponent,
    ContractsComponent,
    MainContractsComponent,
    HeaderComponent,
    FooterComponent,
    SideBarComponent,
    HomeComponent,
    CardDutyComponent,
    ContractPageComponent,
    KmsUserFormComponent,
    ContractDutyComponent,
    PaymentPriorityComponent,
    ExportsComponent,

    NewContractStepperComponent,
    AssignedCostResourcesFormComponent,
    SeparatorPipe,
    MiladiToShamsiPipe,
    ShamsiToMiladiPipe,
    SafeHtmlPipe,
    ContractFormComponent,
    ContractorAddRowComponent,
    StakeHoldersFormComponent,
    CashFlowPlanComponent,
    PlanActsPropFormComponent,
    PlanActPropChartComponent,
    PlanActPropAddRowComponent,
    PlanActPropDeleteRowComponent,
    DeliverablesFormComponent,
    DeliverablesChartComponent,
    DeliverablesAddComponent,
    DeliverablesBoxComponent,
    NewContractStartComponent,
    FinalApprovalFormComponent,
    ShowDescriptionComponent,
    CustomChangesComponent,
    FinancialTableComponent,
    FinancialFormComponent,
    ComptrollerPanelComponent,
    TransferComponent,
    TransferDialogComponent,
    SiteCreationComponent,
    CalculateComponent,
    BuildComponent,
    ShowUserComponent,
    PcDutyComponent,
    DeliverableDutyComponent,
    FinancialDutyComponent,
    CardChangeComponent,
    ChangesRequestComponent,
    ChangeCostComponent,
    ChangeFinishDateComponent,
    ChangeAssignedCostResourcesComponent,
    ChangeCashFlowComponent,
    ChangeDeliverableComponent,
    ChangePcComponent,
    ChangeStakeholderComponent,
    ChangeStakeholderFormComponent,
    ChangeServiceComponent,
    ChangeServiceCostComponent,
    ChangeTotalValueComponent,
    ChangeFinalComponent,
    DashboardComponent,
    ServicesTableComponent,
    ErrorComponent,
    ContractsListComponent,
    ContractsPishComponent,
    DeliverablesTableComponent,
    GenerateDutiesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    NouisliderModule,
    AngularMultiSelectModule,
    ChartModule ,
    HotTableModule.forRoot(),
    CurrencyMaskModule,
    FusionChartsModule.forRoot(FusionChartsProvider),
  ],
  exports: [],
  providers: [
    { provide: DateAdapter, useClass: JalaliMomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: JALALI_MOMENT_FORMATS },
    SharedService,
    KmsService,
    AlertsService,
    AuthService,
    TransferService,
    UserService,
    BuildSiteService,
    TempTransferService,
    CalculationsService,
    GenerateDatesService,
    ExcelService,
    NewContractStepperGaurdService,
    ContractService,
    ShamsiToMiladiPipe,
    { provide: HIGHCHARTS_MODULES, useFactory: () => [ highstock ] }
],
  bootstrap: [AppComponent],
  entryComponents: [
    CardDialogComponent,
    PlanActPropChartComponent,
    PlanActPropAddRowComponent,
    ContractorAddRowComponent,
    DeliverablesAddComponent,
    DeliverablesBoxComponent,
    DeliverablesChartComponent,
    FinancialFormComponent,
    TransferDialogComponent,
    PlanActPropDeleteRowComponent,
    ShowDescriptionComponent,
    ServicesTableComponent,
    ChangesRequestComponent,
    DeliverablesTableComponent,
    PcDutyComponent
  ],

})
export class AppModule { }
