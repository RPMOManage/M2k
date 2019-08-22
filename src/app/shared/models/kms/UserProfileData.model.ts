export class UserProfileDataModel {
  constructor(public ID: number,
              public Title: string,
              public Experience: number,
              public Email: string,
              public RaiPart: {ID, Title},
              public Contractor: {ID, Title},
              public EducationLevel: {ID, Title},
              public Position: {ID, Title},
              public Gender: string,
              public MobileNumber: string,
              public JobTitle: string,
              public PhoneNumber: string,
              public Address: string,
              public ActivityScope: string,
              public Major: string,
              public BirthDate: string,
              public IsComplete: boolean,
              ) {
  }
}
