export class VersionList {
  constructor(
    public Code: string,
    public DDate: string,
    public PlanPCPropCodes: string,
    public ActPCPropCodes: string,
    public DelItemsCodes: string,
    public DelPlanPropCodes: string,
    public DelActPropCodes: string,
    public LastCode: string,
    public LastFDate: string,
    public LastActPCs: string,
    public LastActDelItemVals: string,
  ) {}
}
