export class FinancialModel {
  constructor(public ID: number,
              public FiscalYear: number,
              public FinancialRequestType: {
                  ID: number,
                  Title: string
              },
              public LetterDate: string,
              public Date1: string,
              public VoucherNum: number,
              public VoucherDescription: string,
              public GrossAmount: number,
              public Deposits: number,
              public PayableInsurance: number,
              public Tax: number,
              public PrepaidDepreciation: number,
              public MaterialPrepaidDepreciation: number,
              public Fine: number,
              public TotalDeductions: number,
              public VAT: number,
              public EmployerInsurance: number,
              public TreasuryBillsProfit: number,
              public NetAmount: number,
              public OtherDeductions: number,
              public CostResource?: any,
              public PaymentType?: any,
              public contractCode?: any,
              ) {
  }
}
