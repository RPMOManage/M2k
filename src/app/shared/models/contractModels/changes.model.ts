export class ChangesModel {
  constructor(public ID: number,
              public Date: string,
              public ChangeItem: string,
              public ImporterApproved: string,
              public PMApproved: string,
              public Json: {
                ChangeCost: { Cost, Currency, EqCost },
                ChangeAssignedCost: { CostResources, Costs },
                ChangeFinishDate: { Date },
                ChangeCashFlow: { Dates, Values },
                ChangeService: { Service },
                ChangeServiceCost: { Services, Costs },
                ChangeStakeHolderPillar: { Data },
                ChangeStakeHolderNotPillar: { Data },
                ChangeTotalValue: { Service: number, ChangesPercentage: number, Name_Deliverable: number[], OperationTypes_deliverables: number[], Value_Deliverable: number[] }[],
                ChangePC: { Date: string[], Data: any, ColHeaders: any },
                ChangeDeliverables: { Data: any, ColHeaders: any, instance: any, ServiceID: any, totalValue: any }[],
              },
              public DDate: string,
              public Description: string) {
  }
}
