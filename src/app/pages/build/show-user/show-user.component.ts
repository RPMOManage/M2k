import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { SharedService } from '../../../shared/services/shared.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-show-user',
  templateUrl: './show-user.component.html',
  styleUrls: ['./show-user.component.scss']
})
export class ShowUserComponent implements OnInit {
  userId: number;
  constructor(private sharedService: SharedService,
              private userService: UserService,
              @Optional() @Inject(MAT_DIALOG_DATA) public passedData: any) { }

  ngOnInit() {
  if (this.passedData) {
    this.userId = this.passedData.importerData.Id;
  }
    // this.userService.getUserInformation(this.userId).subscribe(
    //   (data) => {
    //     console.log(data);
    //   }
    // );
  }
}
