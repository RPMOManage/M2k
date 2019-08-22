export class BasicModel {
  constructor(public Id: number,
              public VersionCode: number,
              public Title: string,
              public ShortTitle: string,
              public Service: {
                Id: number,
                Title: string
              },
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
              },
              public Standards: string,) {
  }
}
