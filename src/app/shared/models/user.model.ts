export class UserList {
  constructor(public Id: number,
              public Account: number,
              public FullName: string,
              public Gender: string,
              public Birthday: string,
              public JobTitle: string,
              public Major: string,
              public Experience: number,
              public ExperienceModifiedDate: string,
              public MobileNumber: string,
              public PhoneNumber: string,
              public Email: string,
              public Address: string,
              public ActivityScope: string,
              public IsPM: boolean,
              public IsPMOExpert: boolean,
              public JobLocationId: string,
              public Id_Position: string,
              public Id_Importer: string,
              public Id_EducationLevel: string,) {
  }
}
