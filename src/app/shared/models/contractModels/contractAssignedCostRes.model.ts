export class ContractAssignedCostResModel {
  constructor(public Id: number,
              public CostCode: {
                Id: number,
                Cost: number
              },
              public DDate: string,
              public CostResourse: {
                Id: number,
                Title: string
              },
              public Cost: number) {
  }
}
