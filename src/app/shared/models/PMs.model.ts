export class PMsList {
  constructor(public Id: number,
              public User: {
                ID: number,
                Title: string
              },
              public UnitsId: string[]) {
  }
}
