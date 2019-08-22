export class ContractModel {
  constructor(public Id: number,
              public VersionCode: number,
              public Title: string,
              public ShortTitle: string,
              public Service: number[],
              public Kind: string,
              public Number: string,
              public Subject: string,
              public StartDate: string,
              public GuaranteePeriod: number,
              public Unit: {
                Id: number,
                Title: string
              },
              public SubUnit: {
                Id: number,
                Title: string
              },
              public Currency: {
                Id: number,
                Title: string
              },
              public PMOExpert: {
                Id: number,
                Title: string
              },
              public PM: {
                Id: number,
                Title: string
              },
              public Contractor: {
                Id: number,
                Title: string
              },
              public RaiPart: {
                Id: number,
                Title: string
              },
              public Importer: {
                Id: number,
                Title: string
              },
              public Zone: {
                Id: number,
                Title: string
              }[],
              public Standards: string,
              public FinishDate: string,
              public Cost: number,
              public LastPC?: {
                Service: number,
                Date: string,
                ActPC: number,
                PlanPC: number
              }[],
              public DelLast?: {
                Del: number,
                Op: number,
                TotalVal: number,
                Date: string,
                ActSum: number,
                PlanSum: number
              }[],
              public AssignedCostResesLast?: {
                ResID: number,
                Cost: number
              }[],
              public ServiceCosLast?: {
                Cost: number,
                Service: number
              }[],
              public PCCalcsLast?: {
                Service: number,
                Date: string,
                ProgressDeviation: number,
                Speed30D: number,
                Speed90D?: number,
                TimeDeviation: number,
                Speed4Ontime: number,
                FinishTimeForecast: string
                FinishTimeForecast90?: string
              }[],
              public FinancialLast?: {
                Date: string,
                TotalGrossPayment: number,
                TotalNetPayment: number,
                TotalGrossRequest: number,
                TotalNetRequest: number,
                TotalInvoice: number,
                FinancialProgress: number,
                PaymentDeviation: number,
                LastPaymentDate?: string
              },
              public DeclareDate?: string,
              public IsActive?: any,
  ) {
  }
}
