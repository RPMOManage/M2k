import { OperationTypesList } from '../operationTypes.model';
import { DeliverablesList } from '../Deliverables.model';

export class StepDeliverablesFormList {
  constructor(public serviceId?: number,
              // public name_Deliverable?: DeliverablesList,
              public name_Deliverable?: any,
              public operationTypes_deliverables?: any,
              public value_Deliverable?: object,
              public zone_deliverables?: object,
              public data?: object,
              public date?: any) {
  }
}

// export class StepDeliverablesFormList {
//   constructor(
//     public names?: any,
//     public values?: any,
//     public zones?: any,
//     public dataa?: any,
//     public operationTypes?: any,
//   ) {}
// }
