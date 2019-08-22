export class ContractDutiesModel {
  constructor(public Id: number,
              public DutyCalenderId: number,
              public DutyDoneStatus: number,
              public ImporterDoneDate: string,
              public PMApprovedDate: string,
              public DutyApprovementStatus: number,
              public Json: any) {
  }
}
