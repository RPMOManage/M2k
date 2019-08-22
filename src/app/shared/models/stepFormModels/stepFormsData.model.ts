import { StepContractFormList } from './stepContractForm.model';
import { StepStackHoldersFormList } from './stepStackHoldersForm.model';
import { StepProgressPlansFormList } from './stepProgressPlansForm.model';
import { StepDeliverablesFormList } from './stepDeliverablesForm.model';
import { StepCashFlowPlanFormList } from './stepCashFlowPlanForm.model';
import { StepAssignedCostResourcesFormList } from './stepAssignedCostResourcesForm.model';
import { StepFinalApprovalFormList } from './stepfinalApprovalForm.model';
import { StepCustomChangesList } from './stepCustomChanges.model';
import { FinancialModel } from '../transferModels/Financial.model';

export class StepFormsDataList {
  constructor(public contractsForm?: StepContractFormList,
              public stackHoldersForm?: [StepStackHoldersFormList],
              public stackHoldersForm2?: [StepStackHoldersFormList],
              public progressPlansForm?: StepProgressPlansFormList,
              public deliverablesForm?: any,
              public cashFlowPlanForm?: StepCashFlowPlanFormList,
              public assignedCostResourcesForm?: StepAssignedCostResourcesFormList,
              public finalApprovalForm?: any[],
              public newJson?: StepCustomChangesList,
              public financialRequests?: FinancialModel[],
              public financialPayments?: FinancialModel[],
  ) {
  }
}
