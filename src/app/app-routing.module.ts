import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DutiesComponent } from './pages/duties/duties.component';
import { ChangesComponent } from './pages/changes/changes.component';
import { ContractsComponent } from './pages/contracts/contracts.component';
import { HomeComponent } from './pages/home/home.component';
import { CardDutyComponent } from './types/card/card-duty/card-duty.component';
import { NewContractStepperComponent } from './pages/new-contract-stepper/new-contract-stepper.component';
import { AssignedCostResourcesFormComponent } from './pages/new-contract-stepper/assigned-cost-resources-form/assigned-cost-resources-form.component';
import { NewContractStepperGaurdService } from './shared/gaurds/new-contract-stepper-gaurd.service';
import { NewContractStartComponent } from './forms/new-contract-start/new-contract-start.component';
import { FinancialTableComponent } from './pages/new-contract-stepper/financial-table/financial-table.component';
import { ComptrollerPanelComponent } from './admin/comptroller-panel/comptroller-panel.component';
import { TransferComponent } from './pages/transfer/transfer.component';
import { ContractPageComponent } from './pages/contracts/contract-page/contract-page.component';
import { SiteCreationComponent } from './pages/site-creation/site-creation.component';
import { CalculateComponent } from './pages/calculate/calculate.component';
import { BuildComponent } from './pages/build/build.component';
import { CardChangeComponent } from './types/card/card-change/card-change.component';
import { ChangesRequestComponent } from './types/card/card-change/changes-request/changes-request.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ErrorComponent } from './pages/error/error.component';
import { ContractsListComponent } from './pages/contracts-list/contracts-list.component';
import { ContractsPishComponent } from './pages/contracts-pish/contracts-pish.component';
import { KmsUserFormComponent } from './forms/kms-user-form/kms-user-form.component';
import { GenerateDutiesComponent } from './pages/duties/generate-duties/generate-duties.component';
import { PaymentPriorityComponent } from './pages/payment-priority/payment-priority.component';
import { MainDutiesComponent } from './pages/duties/main-duties/main-duties.component';
import {ExportsComponent} from './pages/exports/exports.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'changes', component: ChangesComponent},
  {path: 'contracts', component: ContractsComponent},
  {path: 'duties', component: MainDutiesComponent},
  {path: 'duty', component: CardDutyComponent},
  {path: 'wizard', component: NewContractStepperComponent, canActivate: [NewContractStepperGaurdService]},
  {path: 'pre-contract', component: NewContractStepperComponent, canActivate: [NewContractStepperGaurdService]},
  {path: 'newContract', component: NewContractStartComponent},
  {path: 'fn', component: FinancialTableComponent},
  {path: 'panel', component: ComptrollerPanelComponent},
  {path: 'transfer', component: TransferComponent},
  {path: 'contract', component: ContractPageComponent},
  {path: 'create', component: SiteCreationComponent},
  {path: 'calculate', component: CalculateComponent},
  {path: 'build', component: BuildComponent},
  {path: 'request', component: ChangesRequestComponent},
  {path: 'change', component: CardChangeComponent},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'error', component: ErrorComponent},
  {path: 'contracts-list', component: ContractsListComponent},
  {path: 'payment-priority', component: PaymentPriorityComponent},
  {path: 'contracts-drafts', component: ContractsPishComponent},
  {path: 'profile', component: KmsUserFormComponent},
  {path: 'generate', component: GenerateDutiesComponent},
  {path: 'exports', component: ExportsComponent},
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
