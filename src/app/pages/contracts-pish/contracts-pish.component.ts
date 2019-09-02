import {Component, OnInit} from '@angular/core';
import {SharedService} from '../../shared/services/shared.service';
import {PMsList} from '../../shared/models/PMs.model';
import {Router} from '@angular/router';
import {AuthService} from '../../shared/services/auth.service';
import {switchMap} from 'rxjs/internal/operators';
import {NewContractStartComponent} from '../../forms/new-contract-start/new-contract-start.component';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-contracts-pish',
  templateUrl: './contracts-pish.component.html',
  styleUrls: ['./contracts-pish.component.scss']
})
export class ContractsPishComponent implements OnInit {
  mainContractsComp = [];
  menu: { ID, TitleEn, TitleFa }[] = [{
    ID: 0,
    TitleEn: 'contracts',
    TitleFa: 'قرارداد ها',
  }, {
    ID: 1,
    TitleEn: 'duties',
    TitleFa: 'وظایف',
  }, {
    ID: 2,
    TitleEn: 'changes',
    TitleFa: 'تغییرات',
  }, {
    ID: 3,
    TitleEn: 'wizard',
    TitleFa: 'ویزارد',
  }, {
    ID: 4,
    TitleEn: 'contract',
    TitleFa: 'صفحه قرارداد 3',
  }];

  tempContracts: { ID, Title, ImporterApprovedPre, PMApprovedPre, PMUserId, ImporterUserId, PMOExpertId, ImporterId, PMApproved, ImporterApproved, Code, Created, Importer?: number, ContractStatus?: number }[] = [];
  pms: PMsList[] = [];
  type = 'pish';
  spinnerChecking = false;
  userRole;
  filters = [];

  constructor(private sharedService: SharedService,
              private router: Router,
              private dialog: MatDialog,
              private authService: AuthService) {
  }

  ngOnInit() {
    this.sharedService.getPMs().subscribe(
      (data) => {
        this.pms = data;
      }
    );
    this.sharedService.getAllTempContracts().subscribe(
      (data) => {
        if (this.authService.userRole) {
          this.userRole = this.authService.userRole;
          this.tempContracts = data.filter(v => {
            if (+v.ImporterUserId === +this.userRole.ID || +v.PMUserId === +this.authService.userRole.ID || +v.PMOExpertId === +this.authService.userRole.ID) {
              return v;
            }
          });
        }
        this.authService.userRoleSubject.subscribe(
          (userRole: any) => {
            this.userRole = userRole;
            this.tempContracts = data.filter(v => {
              if (+v.ImporterUserId === +userRole.ID || +v.PMUserId === +userRole.ID || +v.PMOExpertId === +userRole.ID) {
                return v;
              }
            });
          }
        );
        this.spinnerChecking = true;
      }
    );
  }

  iconStyleObject(tempContract: { ID, Title, PMUserId, ImporterUserId, PMOExpertId, ImporterId, PMApproved, ImporterApproved, Code, Created }) {
    const styles: any = {};
    if (+tempContract.ImporterId === +this.userRole.Id_Importer) {
      styles.borderColor = '#2c85d3';
    }
    if (+tempContract.PMUserId === +this.userRole.ID) {
      styles.borderColor = '#d35548';
    }
    if (+tempContract.PMOExpertId === +this.userRole.ID) {
      styles.borderColor = '#39d38e';
    }
    return styles;
  }

  onClickButtonPish() {
    const config: any = {
      width: '1200px',
      height: '900px',
      data: {},
      autoFocus: false
    };
    const dialogRef: any = this.dialog.open(NewContractStartComponent, config);
  }

  iconStyleObject2(tempContract: { ID, Title, PMUserId, ImporterUserId, PMOExpertId, ImporterId, PMApproved, ImporterApproved, Code, Created }) {
    const styles: any = {};
    if (+tempContract.ImporterId === +this.userRole.Id_Importer) {
      styles.color = '#2c85d3';
    }
    if (+tempContract.PMUserId === +this.userRole.ID) {
      styles.color = '#d35548';
    }
    if (+tempContract.PMOExpertId === +this.userRole.ID) {
      styles.color = '#39d38e';
    }
    return styles;
  }

  getPMName(id: number) {
    return this.pms.filter(v => v.User.ID === id)[0].User.Title;
  }

  onClickContract(id: number) {
    const mainContract = this.tempContracts.filter(v => v.ID === id)[0];
    if (mainContract.ContractStatus === 1) {
      this.router.navigate(['/pre-contract'], {
        queryParams: {ContractID: 'TC' + id, ImpID: mainContract.ImporterUserId},
        queryParamsHandling: 'merge'
      });
    } else {
      this.router.navigate(['/wizard'], {
        queryParams: {ContractID: 'TC' + id, ImpID: mainContract.ImporterUserId},
        queryParamsHandling: 'merge'
      });
    }
  }

}
