import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NewContractStartComponent } from '../../forms/new-contract-start/new-contract-start.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {
  @Input() isIcon: boolean;
  menu: { ID, TitleEn, TitleFa, Icon }[] = [{
    ID: 0,
    TitleEn: '',
    TitleFa: 'صفحه اصلی',
    Icon: 'fas fa-home'
  }, {
    ID: 1,
    TitleEn: 'contracts',
    TitleFa: 'داشبورد سبد',
    Icon: 'fas fa-shopping-basket'
    }, {
    ID: 2,
    TitleEn: 'contracts-list',
    TitleFa: 'لیست قرارداد ها',
    Icon: 'fas fa-file-contract'
  }, {
    ID: 3,
    TitleEn: 'contracts-drafts',
    TitleFa: 'درخواست قرارداد ها',
    Icon: 'fas fa-pencil-ruler'
  }, {
    ID: 5,
    TitleEn: 'payment-priority',
    TitleFa: 'مشاهده اولویت های پرداخت',
    Icon: 'fas fa-flag'
  }];
// , {
//   ID: 6,
//   TitleEn: 'duties',
//   TitleFa: 'وظایف جاری قراردادها',
//   Icon: 'fas fa-tasks'
// }
  selectedMenu = 0;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.router.events.subscribe(
      (event: any) => {
        if (event instanceof NavigationEnd) {
          const selectMenuVal = this.menu.filter(v => v.TitleEn === this.router.url.replace('/', ''))[0];
          if (selectMenuVal) {
            this.selectedMenu = selectMenuVal.ID;
          }
        }
      }
    );
  }

  onClickButtonPish() {
    const config: any = {
      width: '1200px',
      height: '900px',
      data: { },
      autoFocus: false
    };
    const dialogRef: any = this.dialog.open(NewContractStartComponent, config);
  }

  onClickItem(men: { ID, TitleEn, TitleFa }) {
    this.selectedMenu = men.ID;
    // if (this.selectedMenu === 3) {
    //   this.router.navigate([men.TitleEn], {queryParams: {ContractID: 6}});
    // } else if (this.selectedMenu === 4) {
    //   this.router.navigate([men.TitleEn], {queryParams: {ContractID: 'TC43'}});
    // } else if (this.selectedMenu === 5) {
    //   this.router.navigate([men.TitleEn], {queryParams: {ID: '19'}});
    // } else if (this.selectedMenu === 6) {
    //   this.router.navigate([men.TitleEn]);
    // } else {
      this.router.navigate([men.TitleEn]);
    // }
  }
}
