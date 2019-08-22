export class ContractBuildLastModel {
  constructor(
    costAssignedReses: {ResID: number, Cost: number}[],
    serviceCost: {Service: number, Cost: number}[],
    pc: {Service: number, Date: string, ActPC: number, PlanPC: number}[],
    del: {Del: number, Op: number, TotalVal: number, Date: string, ActSum: number, PlanSum: number}[],
  ) {}
}
