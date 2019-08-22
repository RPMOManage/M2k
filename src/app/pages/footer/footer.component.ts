import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit  {

  constructor(private router: Router) {
  }

  ngOnInit() {
  }

  onClickNormalPage(page) {
    this.router.navigate([page]);
  }

  onClickItem(page) {
    this.router.navigate(['page'], {queryParams: {ID: page}});
  }
}
