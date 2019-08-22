import { Component, OnInit } from '@angular/core';
import * as moment from 'jalali-moment';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  someRange = [0, 15];
  progressRange = [0, 100];
  startDateVal = null;
  finishDateVal = null;
  finishActDateVal = null;
  finishContract = false;

  constructor(private router: Router,
                      private route: ActivatedRoute,
                      private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle('داشبورد اعظم');
    this.route.queryParams
      .subscribe((param: any) => {
      if (param.startDate) {
        const startDate = param.startDate.substring(0, 4) + '/' +  param.startDate.substring(4, 6) + '/' + param.startDate.substring(6, 8);
        this.startDateVal = moment(startDate, 'jYYYY/jMM/jDD');
      }
      if (param.finishDate) {
        const finishDate = param.finishDate.substring(0, 4) + '/' +  param.finishDate.substring(4, 6) + '/' + param.finishDate.substring(6, 8);
        this.finishDateVal = moment(finishDate, 'jYYYY/jMM/jDD');
      }
      if (param.finishActDate) {
        const finishActDate = param.finishActDate.substring(0, 4) + '/' +  param.finishActDate.substring(4, 6) + '/' + param.finishActDate.substring(6, 8);
        this.finishActDateVal = moment(finishActDate, 'jYYYY/jMM/jDD');
      }
      if (param.minCost && param.maxCost) {
        this.someRange[0] = 15 - +param.maxCost;
        this.someRange[1] = 15 - +param.minCost;
      }
      if (param.minProgress && param.maxProgress) {
        this.progressRange[0] = 100 - +param.maxProgress;
        this.progressRange[1] = 100 - +param.minProgress;
      }
      if (param.finishContract) {
        if (param.finishContract === 'true') {
          this.finishContract = true;
        } else if (param.finishContract === 'false') {
          this.finishContract = false;
        }
      }
      });
    // this.startDateVal = moment('2015/05/25', 'YYYY/MM/DD');
    // this.finishDateVal = moment('2017/05/25', 'YYYY/MM/DD');
  }

  onSliderChanges(e) {
    this.router.navigate(['/dashboard'], { queryParams: { minCost: 15 - this.someRange[1], maxCost: 15 - this.someRange[0] }, queryParamsHandling: 'merge'});
  }

  onProgressSliderChanges(e) {
    this.router.navigate(['/dashboard'], { queryParams: { minProgress: 100 - this.progressRange[1], maxProgress: 100 - this.progressRange[0] }, queryParamsHandling: 'merge'});
  }

  onDateChange(val: string) {
    if (val === 'startDate') {
      this.router.navigate(['/dashboard'], { queryParams: { startDate: this.startDateVal.format('YYYY/MM/DD').replace('/', '').replace('/', '') }, queryParamsHandling: 'merge'});
    }
    if (val === 'finishDate') {
      this.router.navigate(['/dashboard'], { queryParams: { finishDate: this.finishDateVal.format('YYYY/MM/DD').replace('/', '').replace('/', '') }, queryParamsHandling: 'merge'});
    }
    if (val === 'finishActDate') {
      this.router.navigate(['/dashboard'], { queryParams: { finishActDate: this.finishActDateVal.format('YYYY/MM/DD').replace('/', '').replace('/', '') }, queryParamsHandling: 'merge'});
    }
    if (val === 'finishContract') {
      this.router.navigate(['/dashboard'], { queryParams: { finishContract: true }, queryParamsHandling: 'merge'});
    }
  }

  onFinishContractChange(e) {
    console.log(e.checked);
    this.finishContract = e.checked;
    if (e.checked) {
      this.router.navigate(['/dashboard'], { queryParams: { finishContract: true }, queryParamsHandling: 'merge'});
    } else {
      this.router.navigate(['/dashboard'], { queryParams: { finishContract: null }, queryParamsHandling: 'merge'});
    }
  }

  onRemoveTag(val: string) {
    if (val === 'startDate' || val === 'all') {
      this.startDateVal = null;
      this.router.navigate(['/dashboard'], { queryParams: { startDate: null }, queryParamsHandling: 'merge'});
    }
    if (val === 'finishDate' || val === 'all') {
      this.finishDateVal = null;
      this.router.navigate(['/dashboard'], { queryParams: { finishDate: null }, queryParamsHandling: 'merge'});
    }
    if (val === 'finishActDate' || val === 'all') {
      this.finishActDateVal = null;
      this.router.navigate(['/dashboard'], { queryParams: { finishActDate: null }, queryParamsHandling: 'merge'});
    }
    if (val === 'contractCost' || val === 'all') {
      this.someRange = [0, 15];
      this.router.navigate(['/dashboard'], { queryParams: { minCost: null, maxCost: null }, queryParamsHandling: 'merge'});
    }
    if (val === 'progressRange' || val === 'all') {
      this.progressRange = [0, 100];
      this.router.navigate(['/dashboard'], { queryParams: { minProgress: null, maxProgress: null }, queryParamsHandling: 'merge'});
    }
    if (val === 'finishContract' || val === 'all') {
      this.finishContract = false;
      this.router.navigate(['/dashboard'], { queryParams: { finishContract: null }, queryParamsHandling: 'merge'});
    }
    if (val === 'all') {
      this.router.navigate(['/dashboard']);
    }
  }
}
