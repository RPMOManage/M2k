export class StepProgressPlansFormList {
  constructor(public date?: any,
              public data?: {
                LastActPC, ServiceId, act, plan, startFinish
              }[],
              public chart?: object,) {
  }
}
