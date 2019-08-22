export class DeliverablesList {
  constructor(public Id: string,
              public Name: string,
              public MeasureUnit: string,
              public PossibleUnitIds: any,
              public PossibleOperationTypes_Deliverab: object,
              public Id_ContractService?: string,
              public DeliverableType?: number,
              ) {
  }
}
