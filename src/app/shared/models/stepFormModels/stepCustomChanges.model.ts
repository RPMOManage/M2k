export class StepCustomChangesList {
  constructor(
              public costTable?: {
                DDate: [string],
                Cost: [number],
                eqCost: [number]
              },
              public endDateTable?: {
                DDate: [string],
                EndDate: [string]
              },
              public progressTable?: {
                Date: [string],
                Data: [number]
              }) {
  }
}
