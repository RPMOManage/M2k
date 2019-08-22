import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SharedService } from '../../../shared/services/shared.service';
import { StepFinalApprovalFormList } from '../../../shared/models/stepFormModels/stepfinalApprovalForm.model';
import { CurrentUserList } from '../../../shared/models/currentUser.model';
import { MatDialog } from '@angular/material';
import { ShowDescriptionComponent } from './show-description/show-description.component';
import { AuthService } from '../../../shared/services/auth.service';
import * as moment from 'jalali-moment';
import { Router } from '@angular/router';
import { NewContractStepperGaurdService } from '../../../shared/gaurds/new-contract-stepper-gaurd.service';


@Component({
  selector: 'app-final-approval-form',
  templateUrl: './final-approval-form.component.html',
  styleUrls: ['./final-approval-form.component.scss']
})
export class FinalApprovalFormComponent implements OnInit {
  @Input() formGp: FormGroup;
  @Output() formData = new EventEmitter();
  @Input() text: any;
  @Input() finalValid: boolean;
  @Input() tabs: any;
  @Output() checkAllValidations = new EventEmitter();
  today: any;
  currentUser: CurrentUserList = null;
  finalApprovalForm: StepFinalApprovalFormList[] = [];
  userRoles: object[] = [];
  userRole;
  isReadOnly: boolean;
  isApproved: {
    pm: boolean,
    expert: boolean,
    importer: boolean
  };
  isAllowed = true;
  userMainRole = null;
  importerUser;

  constructor(private sharedService: SharedService,
              private dialog: MatDialog,
              private authService: AuthService,
              private router: Router,
              private newContractStepperGaurd: NewContractStepperGaurdService) {
  }

  ngOnInit() {
    this.userMainRole = this.sharedService.userMainRole;
    this.importerUser = this.sharedService.stepFormsData.contractsForm.Id_Importer;
    console.log(this.finalValid);
    this.userRole = this.authService.userRole;
    console.log(this.userRole.Id_Importer, this.importerUser);

    this.isReadOnly = this.sharedService.isReadOnly;
    this.isApproved = this.sharedService.isApproved;
    console.log(this.isApproved, 'isApproved');
    console.log(this.userMainRole, 'userMainRole');
    if (this.userRole.Id_Importer === true) {
      if (this.isApproved.importer === true) {
        this.isAllowed = false;
      } else {
        this.isAllowed = true;
      }
    }
    if (this.userRole.IsPM === true) {
      if (this.isApproved.pm === true) {
        this.isAllowed = false;
      } else {
        this.isAllowed = true;
      }
    }
    if (this.userRole.IsPMOExpert === true) {
      if (this.isApproved.expert === true) {
        this.isAllowed = false;
      } else {
        this.isAllowed = true;
      }
    }
    if (this.sharedService.stepFormsData.finalApprovalForm) {
      this.finalApprovalForm = this.sharedService.stepFormsData.finalApprovalForm;
      for (let i = 0; i < this.finalApprovalForm.length; i++) {
        this.sharedService.getUserRole(this.finalApprovalForm[i].approver)
          .subscribe(
            (dd) => {
              this.userRoles[i] = dd;
            }
          );
      }
    }

    this.sharedService.today.subscribe(
      (data: any) => {
        const mainDate = moment(this.sharedService.todayData, 'YYYY/M/D');
        this.today = mainDate.format('jYYYY/jM/jD');
      }
    );
    this.currentUser = this.sharedService.currentUser2;
    setTimeout(() => {
      this.showText();
    }, 100);
    console.log(this.userRole);
  }

  showText() {
    this.checkAllValidations.emit(true);
  }

  showDescriptionPopup(description: string, fullName: string, role: string, date) {
    let position = 'وارد کننده اطلاعات';
    if (role === 'PMOExpert') {
      position = 'دفتر مدیریت پروژه';
    } else if (role === 'PM') {
      position = 'مدیر پروژه';
    }
    this.dialog.open(ShowDescriptionComponent, {
      width: '1200px',
      height: '550px',
      data: {
        description: description,
        user: position + ' : ' + fullName,
        date: date
      }
    });
  }

  shorten(str, maxLen, separator = ' ') {
    if (str.length <= maxLen) {
      return str;
    }
    return str.substr(0, str.lastIndexOf(separator, maxLen));
  }

  onApproved(data: boolean) {
    this.formGp.get('isApproved').setValue(data);
    this.formGp.get('date').setValue(moment(this.sharedService.todayData, 'YYYY/M/D').format('jYYYY/jM/jD'));
    this.formGp.get('approver').setValue(this.currentUser.Id);
    if (this.userRole.IsPM && this.userRole.ID === <any>this.sharedService.stepFormsData.contractsForm.PMId_User.User.ID) {
      this.formGp.get('role').setValue('PM');
    } else if (this.userRole.IsPMOExpert && +this.userRole.ID === +this.sharedService.stepFormsData.contractsForm.PMOExpertId_User) {
      this.formGp.get('role').setValue('PMOExpert');
    } else {
      this.formGp.get('role').setValue(this.userRole.Id_Importer);
    }
    this.userRoles.push(this.userRole);
    if (!this.sharedService.stepFormsData.finalApprovalForm && this.userRole.IsPM && this.userRole.ID === this.sharedService.stepFormsData.contractsForm.PMId_User.User.ID) {
      this.sharedService.stepFormsData.finalApprovalForm = [];
      this.sharedService.stepFormsData.finalApprovalForm.push({
        role: this.userRole.Id_Importer,
        date: this.formGp.get('date').value,
        Description: this.formGp.get('Description').value,
        isApproved: this.formGp.get('isApproved').value,
        approver: this.formGp.get('approver').value,
      });
    }
    this.formData.emit(true);
    // this.finalApprovalForm.push({
    //   role: this.formGp.get('role').value,
    //   date: this.formGp.get('date').value,
    //   Description: this.formGp.get('Description').value,
    //   isApproved: this.formGp.get('isApproved').value,
    //   approver: this.formGp.get('approver').value,
    // });
    // if (this.userRole.IsPMOExpert) {
    //   this.router.navigate(['build'], {queryParams: {'ContractID': this.newContractStepperGaurd.contractID}});
    // }
  }
}
