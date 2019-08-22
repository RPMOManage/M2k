import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs/index';
import * as moment from 'jalali-moment';
import { isUndefined } from 'util';
import { RaiPartsModel } from '../../shared/models/kms/RaiParts.model';
import { PositionModel } from '../../shared/models/kms/Position.model';
import { EducationLevelModel } from '../../shared/models/kms/EducationLevel.model';
import { UserProfileDataModel } from '../../shared/models/kms/UserProfileData.model';
import { ContractorModel } from '../../shared/models/kms/Contractor.model';
import { CurrentUserModel } from '../../shared/models/kms/CurrentUser.model';
import { KmsService } from '../../shared/services/kms.service';


@Component({
  selector: 'app-kms-user-form',
  templateUrl: './kms-user-form.component.html',
  styleUrls: ['./kms-user-form.component.scss']
})
export class KmsUserFormComponent implements OnInit {
  formGp: FormGroup;
  @Input() currentUser: CurrentUserModel;
  @Output() validEmit = new EventEmitter<any>();
  raiParts: RaiPartsModel[] = [];
  positions: PositionModel[] = [];
  genders: {ID: number, Title: string, Name: string}[] = [
    {ID: 0, Title: 'مرد', Name: 'M'},
    {ID: 1, Title: 'زن', Name: 'F'}
    ];
  educationLevels: EducationLevelModel[] = [];
  userProfileEdit: UserProfileDataModel;
  checking = false;
  selectedJobTitlePlaceHolder = '';
  jobLocations: ContractorModel[] = [];
  contractors: ContractorModel[] = [];
  counter = 0;
  counterSubject = new Subject();
  isComplete = false;

  constructor(private router: Router,
              private _formBuilder: FormBuilder,
              private kmsService: KmsService) {
  }

  ngOnInit() {
    this.counterSubject.subscribe(
      (data) => {
        if (this.counter === 4) {
          if (this.userProfileEdit) {
            if (this.userProfileEdit.RaiPart) {
              this.formGp.get('JobLocation').setValue('1');
              this.onJobLocationChange({value: 1});
              this.formGp.get('JobLocationList').setValue(this.userProfileEdit.RaiPart);
            } else {
              this.formGp.get('JobLocation').setValue('2');
              this.onJobLocationChange({value: 2});
              this.formGp.get('JobLocationList').setValue(this.userProfileEdit.Contractor);
            }
          } else {
            // this.formGp.get('JobLocation').setValue('1');
            // this.onJobLocationChange({value: 1});
          }
        }
      }
    );

    this.kmsService.getAllRaiParts().subscribe(
      (data: RaiPartsModel[]) => {
        this.raiParts = data;
        this.counter++;
        this.counterSubject.next(true);
      }
    );

    this.kmsService.getAllPositions().subscribe(
      (data: PositionModel[]) => this.positions = data
    );

    this.kmsService.getAllEducationLevels().subscribe(
      (data: EducationLevelModel[]) => this.educationLevels = data
    );

    this.kmsService.getAllContractors().subscribe(
      (data: ContractorModel[]) => {
        this.contractors = data;
        this.counter++;
        this.counterSubject.next(true);
      }
    );
    this.kmsService.getCurrentUser().subscribe(
      (currentUser: CurrentUserModel) => {
        this.currentUser = currentUser;
        this.kmsService.getUserProfileData(this.currentUser.Id).subscribe(
          (data: UserProfileDataModel) => {
            if (data) {
              this.userProfileEdit = data;
              this.checking = true;
              if (this.userProfileEdit.ID) {
                this.buildForm(1);
              }
            } else {
              this.checking = true;
              this.buildForm();
            }
            this.counter++;
            this.counterSubject.next(true);
          }
        );
      }
    );
  }

  onJobLocationChange(e) {
    this.formGp.get('JobLocationList').setValue(null);
    const selectedJobLocation = +e.value;
    if (selectedJobLocation === 1) {
      this.selectedJobTitlePlaceHolder = 'سازمان راه آهن';
      this.jobLocations = this.raiParts;
    } else {
      this.selectedJobTitlePlaceHolder = 'شرکت های طرف قرارداد';
      this.jobLocations = this.contractors;
    }
  }

  buildForm(type: number = 0) {
    let title = null;
    let experience = null;
    let email = null;
    let jobLocation = null;
    let position = null;
    let educationLevel = null;
    let gender = null;
    let mobileNumber = null;
    let jobTitle = null;
    let phoneNumber = null;
    let address = null;
    let activityScope = null;
    let major = null;
    let birthDate = null;
    let jobLocationList = null;
    let raiPart = null;
    if (type === 1) {
      title = this.userProfileEdit.Title;
      experience = this.userProfileEdit.Experience;
      email = this.userProfileEdit.Email;
      // raiPart = this.userProfileEdit.RaiPart;
      position = this.userProfileEdit.Position;
      educationLevel = this.userProfileEdit.EducationLevel;
      gender = this.userProfileEdit.Gender;
      mobileNumber = this.userProfileEdit.MobileNumber;
      jobTitle = this.userProfileEdit.JobTitle;
      phoneNumber = this.userProfileEdit.PhoneNumber;
      address = this.userProfileEdit.Address;
      activityScope = this.userProfileEdit.ActivityScope;
      major = this.userProfileEdit.Major;
      birthDate = this.userProfileEdit.BirthDate;
      // jobLocation = this.userProfileEdit.jobLocation;
      // jobLocationList = this.userProfileEdit.jobLocationList;
    }
    this.formGp = this._formBuilder.group({
      Title: new FormControl(title, [Validators.required, Validators.minLength(5)]),
      Account: new FormControl(this.currentUser.Id, [Validators.required]),
      Experience: new FormControl(experience, [Validators.required, Validators.min(1)]),
      Email: new FormControl(email, [Validators.required, Validators.email]),
      JobLocationList: new FormControl(jobLocationList, [Validators.required]),
      Position: new FormControl(position, [Validators.required]),
      EducationLevel: new FormControl(educationLevel, [Validators.required]),
      Gender: new FormControl(gender, [Validators.required]),
      MobileNumber: new FormControl(mobileNumber),
      JobTitle: new FormControl(jobTitle, [Validators.required, Validators.minLength(4)]),
      PhoneNumber: new FormControl(phoneNumber),
      Address: new FormControl(address),
      ActivityScope: new FormControl(activityScope, [Validators.required, Validators.minLength(20)]),
      Major: new FormControl(major, [Validators.required, Validators.minLength(5)]),
      BirthDate: new FormControl(birthDate, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
      JobLocation: new FormControl(jobLocation, [Validators.required]),
    });
    this.formGp.get('JobLocation').setValue('1');
    this.onJobLocationChange({value: 1});
    this.counter++;
    this.counterSubject.next(true);
  }

  onSubmitForm() {
    this.kmsService.getDataFromContextInfo().subscribe(
      (DigestValue) => {
        console.log(this.formGp);
        if (this.formGp.valid) {
          this.isComplete = true;
          this.formGp.get('Title').setValue(this.formGp.get('Title').value.replace(/ي/g, 'ی').replace(/ك/g, 'ک'));
          if (this.userProfileEdit) {
            this.kmsService.updateUserProfileData(DigestValue, this.formGp.value, this.userProfileEdit.ID, this.isComplete).subscribe(
              (data: any) => {
                console.log(this.formGp.value);
                Swal({
                  type: 'success',
                  title: 'پروفایل با موفقیت بروزرسانی گردید!',
                  confirmButtonText: 'متوجه شدم!'
                });
                this.validEmit.emit(true);
              },
              (error) => {
                Swal({
                  type: 'error',
                  title: 'خطایی بوجود آمده است!',
                  confirmButtonText: 'متوجه شدم!'
                });
              }
            );
          } else {
            this.kmsService.getUserProfileData(this.currentUser.Id).subscribe(
              (data: UserProfileDataModel) => {
                if (isUndefined(data)) {
                  this.kmsService.createUserProfileData(DigestValue, this.formGp.value, this.isComplete).subscribe(
                    (dd: any) => {
                      Swal({
                        type: 'success',
                        title: 'پروفایل با موفقیت بروزرسانی گردید!',
                        confirmButtonText: 'متوجه شدم!'
                      });
                      this.validEmit.emit(true);
                    },
                    (error) => {
                      Swal({
                        type: 'error',
                        title: 'خطایی بوجود آمده است!',
                        confirmButtonText: 'متوجه شدم!'
                      });
                    }
                  );
                } else {
                  this.userProfileEdit = data;
                }
              });
          }
        } else {
          this.isComplete = false;
          Swal({
            type: 'error',
            title: 'اطلاعات فرم ناقص است!',
            confirmButtonText: 'متوجه شدم!'
          });
        }
      }
    );
  }

  addZeroToMonth(month) {
    if (+month < 10) {
      return '0' + month;
    } else {
      return month;
    }
  }
}
