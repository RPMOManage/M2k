export class TransferWeekProgressList {
  constructor(
    public projectId: number,
    public year: number,
    public month: number,
    public weekNum: number,
    public act: number,
    public plan: number,
    ) {}
}
