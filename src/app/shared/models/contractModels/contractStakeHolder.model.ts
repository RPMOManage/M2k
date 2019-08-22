export class ContractStakeHolderModel {
  constructor(public Id: number,
              public OrgName: string,
              public Role: string,
              public AgentName: string,
              public AgentPosition: {
                Id: number,
                Title: string
              },
              public PhoneNumber: string,
              public LocationAddress: string,
              public Email: string,
              public IsPillar: boolean,
              public DDate?: string) {
  }
}
