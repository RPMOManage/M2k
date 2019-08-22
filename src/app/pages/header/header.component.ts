import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import * as moment from 'jalali-moment';
import { SharedService } from '../../shared/services/shared.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() isExpand = new EventEmitter();
  @ViewChild('search') search;
  lessonLearnedShow = false;
  qaShow = false;
  EtelaResaniShow = false;
  SeminarIntroduction = false;
  checking = true;
  blur = true;
  userRole;
  today = '';

  constructor(private router: Router,
                      private authService: AuthService,
                      private sharedService: SharedService) {
  }

  ngOnInit() {
    if (this.sharedService.todayData) {
      this.today = this.sharedService.todayData;
      const mainDate = moment(this.today, 'YYYY/M/D');
      this.today = mainDate.format('jYYYY/jM/jD');
    }
    this.sharedService.today.subscribe(
      (today) => {
        this.today = <any>today;
        const mainDate = moment(this.today, 'YYYY/M/D');
        this.today = mainDate.format('jYYYY/jM/jD');
      }
    );
    if (this.authService.userRole) {
      this.userRole = this.authService.userRole;
    }
    this.authService.userRoleSubject.subscribe(
      (userRole: any) => {
        this.userRole = userRole;
      }
    );
  }

  onExpand() {
    this.isExpand.emit(true);
  }


  onClickItem(page) {
    this.router.navigate(['page'], {queryParams: {ID: page}});
  }

  onClickNormalPage(page) {
    this.router.navigate([page]);
  }

  onSearch(searchedValue: any) {
    this.checking = false;
    searchedValue = searchedValue.srcElement.value;
  }

  onPostClick(id: number) {
    this.search.nativeElement.value = '';
    this.blur = true;
    this.router.navigate(['post'], { queryParams: { ID: id }, queryParamsHandling: 'merge'});
  }
}
