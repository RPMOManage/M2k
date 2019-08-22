export class TransferDataBaseList {
  constructor(
    public projectId: number,
    public year: number,
    public month: number,
    public act: number,
    public plan: number,
    public cashFlowPlan: number,
    public ProgressPlan2?: number
    ) {}
}
