import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../../shared/services/shared.service';
import { ContractService } from '../../../shared/services/contract.service';
import { ContractDutiesModel } from '../../../shared/models/contractModels/contractDuties.model';
import { MatDialog } from '@angular/material';
import { CardDutyComponent } from '../../../types/card/card-duty/card-duty.component';
import * as moment from 'jalali-moment';
import { ContractModel } from '../../../shared/models/contractModels/contract.model';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-contract-duty',
  styleUrls: ['./contract-duty.component.scss'],
  templateUrl: './contract-duty.component.html',
})
export class ContractDutyComponent implements OnInit {
  @Input() contractID;
  @Input() contract: ContractModel;
  pcs = [];
  mainPC = [];
  pcDuties: ContractDutiesModel[] = [];
  deliverableDuties: ContractDutiesModel[] = [];
  financeDuties: ContractDutiesModel[] = [];
  dutyCalenders: {ID, Title, StartDate, FinishDate, DutyType: {ID, Title}, DataEntryStartDate, DataEntryFinishDate, IsDefualt}[] = [];
  dutyDoneStatuses: {ID, Title}[] = [];
  dutyApprovementStatuses: {ID, Title}[] = [];
  today = {
    en: null,
    fa: null
  };
  isPM = false;
  checkUserRole = false;
  editableDutyPC;
  editableDutyFinance;
  editableDutyDel;
  dutyPCCounter = 0;
  dutyFinanceCounter = 0;
  dutyDelCounter = 0;

  constructor(private route: ActivatedRoute,
              private authService: AuthService,
              private sharedService: SharedService,
              private contractService: ContractService,
              private dialog: MatDialog,
              private router: Router,) {
  }

  ngOnInit() {
    if (this.authService.userRole) {
      if (this.authService.userRole.ID === +this.contract.PM.Id) {
        this.isPM = true;
        this.checkUserRole = true;
      } else {
        this.checkUserRole = true;
      }
    }


    this.authService.userRoleSubject.subscribe(
      (userRole: {ID, Account, FullName, IsPM, IsPMOExpert, Id_Importer}) => {
        if (userRole.ID === +this.contract.PM.Id) {
          this.isPM = true;
          this.checkUserRole = true;
        } else {
          this.checkUserRole = true;
        }
      }
    );
    this.getData();
  }

  getData() {
    if (this.sharedService.todayData) {
      this.today.en = this.sharedService.todayData;
      const mainDate = moment(this.sharedService.todayData, 'YYYY/M/D');
      this.today.fa = mainDate.format('jYYYY/jM/jD');
    }
    this.sharedService.today.subscribe(
      (data: any) => {
        this.today.en = data;
        const mainDate = moment(this.sharedService.todayData, 'YYYY/M/D');
        this.today.fa = mainDate.format('jYYYY/jM/jD');
      }
    );
    this.contractService.getDutyDoneStatuses().subscribe(
      (data) => {
        this.dutyDoneStatuses = data;
      }
    );
    this.contractService.getDutyApprovementStatuses().subscribe(
      (data) => {
        this.dutyApprovementStatuses = data;
      }
    );
    this.pcDuties = [];
    this.financeDuties = [];
    this.deliverableDuties = [];
    this.contractService.getContractDuties(this.contractID).subscribe(
      (duties: ContractDutiesModel[]) => {
        this.contractService.getDutyCalenders().subscribe(
          (dutyCalenders) => {
            this.dutyCalenders = dutyCalenders;
            this.dutyCalenders.filter(v2 => {
              if (v2.DutyType.ID === 1) {
                const temp = duties.filter(v => v.DutyCalenderId === v2.ID);
                if (temp.length > 0) {
                  this.pcDuties.push(temp[0]);
                }
              }
              if (v2.DutyType.ID === 2) {
                const temp = duties.filter(v => v.DutyCalenderId === v2.ID);
                if (temp.length > 0) {
                  this.deliverableDuties.push(temp[0]);
                }
              }
              if (this.contract.ComptrollerContractCode === null) {
                if (v2.DutyType.ID === 3) {
                  const temp = duties.filter(v => v.DutyCalenderId === v2.ID);
                  if (temp.length > 0) {
                    this.financeDuties.push(temp[0]);
                  }
                }
              }
            });
          });
      });
  }

  classObject(duty: ContractDutiesModel) {
    let classes: any = '';
    if (duty.DutyDoneStatus === 3 && +new Date(this.today.fa) < +new Date(this.dutyCalenders.filter(v => v.ID === duty.DutyCalenderId)[0].StartDate)) {
      classes = 'unDone-f';
    } else if (duty.DutyDoneStatus === 3 && +new Date(this.today.fa) > +new Date(this.dutyCalenders.filter(v => v.ID === duty.DutyCalenderId)[0].FinishDate)) {
      classes = 'unDone-b';
    } else if (duty.DutyDoneStatus === 1) {
      classes = 'done';
    } else if (duty.DutyDoneStatus === 2) {
      classes = 'delayed';
    } else if (duty.DutyDoneStatus === 4) {
      classes = 'canceled';
    } else {
      if (!this.isPM) {
        classes = 'now';
      }
    }
    if (this.isPM && duty.DutyApprovementStatus === 3) {
      classes = classes + ' isPM';
    }
    return classes;
  }

  onClickButton(duty, type, isReadOnly) {
    const config: any = {
      width: '1200px',
      height: '900px',
      data: {
        contractID: this.contractID,
        dutyType: type,
        mainDuty: duty,
        isReadOnly: isReadOnly,
        today: this.today,
        isPM: this.isPM,
        dutyDoneTitle: this.getNameOfStatus(duty.DutyDoneStatus),
        dutyApprovementTitle: this.getNameOfApprovement(duty.DutyApprovementStatus),
      },
      autoFocus: false
    };
    const dialogRef: any = this.dialog.open(CardDutyComponent, config);
    dialogRef.afterClosed().subscribe(
      (result) => {
        this.router.navigate(['contract'], { queryParams: { DutyID: null }, queryParamsHandling: 'merge'});
        this.dutyPCCounter = 0;
        this.dutyFinanceCounter = 0;
        this.dutyDelCounter = 0;
        this.editableDutyPC = null;
        this.editableDutyFinance = null;
        this.editableDutyDel = null;
        this.getData();
      }
    );
  }

  getNameOfStatus(id: number) {
    if (this.dutyDoneStatuses.filter(v => v.ID === id)[0]) {
      return this.dutyDoneStatuses.filter(v => v.ID === id)[0].Title;
    }
  }

  getNameOfApprovement(id: number) {
    if (this.dutyApprovementStatuses.filter(v => v.ID === id)[0]) {
      return this.dutyApprovementStatuses.filter(v => v.ID === id)[0].Title;
    }
  }

  isCurrent(duty: ContractDutiesModel, edit, type = 0) {
    if (+new Date(this.today.fa) >= +new Date(this.dutyCalenders.filter(v => v.ID === duty.DutyCalenderId)[0].StartDate) && duty.DutyApprovementStatus !== 1 && duty.DutyApprovementStatus !== 3 && !this.isPM) {
      if (type === 1) {
        if (this.dutyPCCounter === 0) {
          this.editableDutyPC = duty.Id;
          this.dutyPCCounter++;
        }
      }
      if (type === 2) {
        if (this.dutyFinanceCounter === 0) {
          this.editableDutyFinance = duty.Id;
          this.dutyFinanceCounter++;
        }
      }
      if (type === 3) {
        if (this.dutyDelCounter === 0) {
          this.editableDutyDel = duty.Id;
          this.dutyDelCounter++;
        }
      }

      return true;
    }

    if (+new Date(this.today.fa) >= +new Date(this.dutyCalenders.filter(v => v.ID === duty.DutyCalenderId)[0].StartDate) && duty.DutyApprovementStatus !== 1 && this.isPM) {
      if (type === 1) {
        if (this.dutyPCCounter === 0) {
          this.editableDutyPC = duty.Id;
          this.dutyPCCounter++;
        }
      }
      if (type === 2) {
        if (this.dutyFinanceCounter === 0) {
          this.editableDutyFinance = duty.Id;
          this.dutyFinanceCounter++;
        }
      }
      if (type === 3) {
        if (this.dutyDelCounter === 0) {
          this.editableDutyDel = duty.Id;
          this.dutyDelCounter++;
        }
      }
      return true;
    }

    if (duty.DutyApprovementStatus === 1) {
      return false;
    }
    if (+new Date(this.today.fa) < +new Date(this.dutyCalenders.filter(v => v.ID === duty.DutyCalenderId)[0].StartDate)) {
      return false;
    }
  }

  // isCurrent(duty: ContractDutiesModel, type, edit) {
  //   if (duty.DutyDoneStatus === 3 && +new Date(this.today.fa) < +new Date(this.dutyCalenders.filter(v => v.ID === duty.DutyCalenderId)[0].StartDate)) {
  //     return false;
  //   } else if (duty.DutyDoneStatus === 3 && +new Date(this.today.fa) >= +new Date(this.dutyCalenders.filter(v => v.ID === duty.DutyCalenderId)[0].StartDate)) {
  //     if (this.isPM) {
  //       console.log(this.pcDuties, 'this.pcDuties');
  //       const editableDuties = this.pcDuties.filter(v1 => !v1.DutyApprovementStatus && (v1.DutyDoneStatus === 3 || v1.DutyDoneStatus === 2 || !v1.DutyDoneStatus) && +new Date(this.today.fa) > +new Date(this.dutyCalenders.filter(v => v.ID === v1.DutyCalenderId)[0].FinishDate));
  //       if (editableDuties.length > 0) {
  //         if (editableDuties[0] === duty && duty.DutyApprovementStatus !== 1) {
  //           if (!this.editableDutyPC) {
  //             this.editableDutyPC = duty;
  //           }
  //           if (!this.editableDutyDel) {
  //             this.editableDutyDel = duty;
  //           }
  //         }
  //       }
  //     } else {
  //       if (!duty.DutyApprovementStatus && +new Date(this.today.fa) <= +new Date(this.dutyCalenders.filter(v => v.ID === duty.DutyCalenderId)[0].FinishDate)) {
  //         return true;
  //       }
  //       const editableDuties = this.pcDuties.filter(v1 => v1.DutyDoneStatus === 3 && !v1.DutyApprovementStatus && +new Date(this.today.fa) > +new Date(this.dutyCalenders.filter(v => v.ID === v1.DutyCalenderId)[0].FinishDate));
  //       if (editableDuties.length > 0) {
  //         if (editableDuties[0] === duty && duty.DutyApprovementStatus !== 1) {
  //           if (!this.editableDutyPC) {
  //             this.editableDutyPC = duty;
  //           }
  //           if (!this.editableDutyDel) {
  //             this.editableDutyDel = duty;
  //           }
  //         }
  //       }
  //     }
  //   } else if (duty.DutyDoneStatus === 1 && duty.DutyApprovementStatus !== 1) {
  //     if (this.isPM) {
  //       if (!this.editableDutyPC) {
  //         this.editableDutyPC = duty;
  //       }
  //       if (!this.editableDutyDel) {
  //         this.editableDutyDel = duty;
  //       }
  //     }
  //   } else if (duty.DutyDoneStatus === 2 && duty.DutyApprovementStatus !== 1) {
  //     if (this.isPM) {
  //       if (!this.editableDutyPC) {
  //         this.editableDutyPC = duty;
  //       }
  //       if (!this.editableDutyDel) {
  //         this.editableDutyDel = duty;
  //       }
  //     }
  //   } else if (duty.DutyDoneStatus === 4) {
  //     return false;
  //   } else {
  //     // console.log('ajab');
  //     // const dutyIndex = this.pcDuties.findIndex(v => v.Id === duty.Id);
  //     // if (this.pcDuties[dutyIndex - 1].DutyDoneStatus === 3 && type === 'edit') {
  //     //   return false;
  //     // }
  //   }
  //   if (type === 1) {
  //     if (this.editableDutyPC) {
  //       if (this.editableDutyPC === duty) {
  //         return true;
  //       } else {
  //         return false;
  //       }
  //     }
  //   }
  //   if (type === 3) {
  //     if (this.editableDutyDel) {
  //       if (this.editableDutyDel === duty) {
  //         return true;
  //       } else {
  //         return false;
  //       }
  //     }
  //   }
  // }

  getFromDutyCalender(id, type) {
    if (type === 'start') {
      return this.dutyCalenders.filter(v => v.ID === id)[0].StartDate;
    }
    if (type === 'finish') {
      return this.dutyCalenders.filter(v => v.ID === id)[0].FinishDate;
    }
    if (type === 'title') {
      return this.dutyCalenders.filter(v => v.ID === id)[0].Title;
    }
  }

}
