import { Component, OnInit } from '@angular/core';
import { AuthService } from './shared/services/auth.service';
import { SharedService } from './shared/services/shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'pmo7';
  isExpand = true;

  constructor(private authService: AuthService,
                      private sharedService: SharedService) {}

  ngOnInit() {
    this.sharedService.getTodayDateFromContextInfo().subscribe();
    this.authService.getCurrentUser().subscribe(
      (uData) => {
        this.authService.getUserRole(uData.Id).subscribe(
          (uData2) => {
          }
        );
      }
    );
  }

  onExpand(e) {
    this.isExpand = !this.isExpand;
  }
}
