export class OldContractDBNonProjectList {
  constructor(
    public McId: number,
    public ProjectID: string,
    public Unit: string,
    public SubUnit_ID: string,
    public DefaultServices: string,
    public Title: string,
    public ContractNumber: string,
    public ContractorName: string,
    public StartDate: string,
    public FinishDate: string,
    public CurrencyName: string,
    public ContractCost: number,
    public CostResource_ID: any,
    public Content: string,
    public TempID: string,
    public DeclareDate?: string
    ) {}
}
