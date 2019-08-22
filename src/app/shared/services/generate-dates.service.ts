import { Injectable } from '@angular/core';
import * as moment from 'jalali-moment';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class GenerateDatesService {
  constructor(private sharedService: SharedService) {}

  initiateDate(date: string[], isCashFlow = false): string[] {
    const todayFa = moment(this.sharedService.todayData).format('jYYYY/jM/jD');
    let mainDate = null;
    if (isCashFlow) {
      mainDate = this.generateDates(+this.countMon(this.sharedService.stepFormsData.contractsForm.FinishDate_Contract), this.sharedService.stepFormsData.contractsForm.StartDate_Contract.split('/'));
    } else {
      if (+new Date(todayFa) > +new Date(this.sharedService.stepFormsData.contractsForm.FinishDate_Contract)) {
        mainDate = this.generateDates(+this.countMon(todayFa), this.sharedService.stepFormsData.contractsForm.StartDate_Contract.split('/'), todayFa);
      } else {
        mainDate = this.generateDates(+this.countMon(this.sharedService.stepFormsData.contractsForm.FinishDate_Contract), this.sharedService.stepFormsData.contractsForm.StartDate_Contract.split('/'));
      }
    }
    if (date) {
      const removeDates = mainDate.filter(val => !date.includes(val));
      const notIncluded = date.filter(val => !mainDate.includes(val));
      return this.concatDates([], mainDate, notIncluded);
    } else {
      return mainDate.sort((a, b) => +new Date(a) - +new Date(b));
    }
  }

  changeInitiateDate(startDate, finishDate, isCashFlow = false): string[] {
    const todayFa = moment(this.sharedService.todayData).format('jYYYY/jM/jD');
    let mainDate = null;
    if (isCashFlow) {
      mainDate = this.changeGenerateDates(finishDate, +this.changeCountMon(startDate, finishDate), startDate.split('/'));
    } else {
      if (+new Date(todayFa) > +new Date(finishDate)) {
        mainDate = this.changeGenerateDates(finishDate, +this.changeCountMon(startDate, todayFa), startDate.split('/'), todayFa);
      } else {
        mainDate = this.changeGenerateDates(finishDate, +this.changeCountMon(startDate, finishDate), startDate.split('/'));
      }
    }
    return mainDate.sort((a, b) => +new Date(a) - +new Date(b));
  }

  concatDates(notIncluded: string[], mainDate: string[], removeDates: string[]) {
    const newDate1 = Array.from(new Set(notIncluded.concat(mainDate)));
    const newDate2 = Array.from(new Set(removeDates.concat(newDate1)));
    const finalNewDates = newDate2.sort((a, b) => +new Date(a) - +new Date(b));
    return finalNewDates;
  }

  generateDates(numMon, date, todayFa = null) {
    const dates = [];
    dates[0] = +date[0] + '/' + this.addZeroToMonth(+date[1]) + '/' + this.addZeroToMonth(+date[2]);
    for (let i = 0; i < +numMon; i++) {
      if (i !== 0) {
        date[1] = +date[1] + 1;
      }
      if (+date[1] === 13) {
        date[1] = 1;
        date[0] = +date[0] + 1;
      }
      date[2] = this.switchingMonth(+date[1]);
      dates[i + 1] = date[0] + '/' + this.addZeroToMonth(+date[1]) + '/' + date[2];
    }
    if (this.sharedService.stepFormsData.contractsForm.FinishDate_Contract.length < 10) {
      const finishD = this.sharedService.stepFormsData.contractsForm.FinishDate_Contract.split('/');
      dates[+numMon + 1] = finishD[0] + '/' + this.addZeroToMonth(finishD[1]) + '/' + this.addZeroToMonth(finishD[2]);
    } else {
      dates[+numMon + 1] = this.sharedService.stepFormsData.contractsForm.FinishDate_Contract;
    }
    if (todayFa !== null) {
      if (todayFa.length < 10) {
        const todayD = todayFa.split('/');
        dates[+numMon + 2] = todayD[0] + '/' + this.addZeroToMonth(todayD[1]) + '/' + this.addZeroToMonth(todayD[2]);
      } else {
        dates[+numMon + 2] = todayFa;
      }
    }
    return dates;
  }

  changeGenerateDates(finishDate, numMon, date, todayFa = null) {
    const dates = [];
    dates[0] = +date[0] + '/' + this.addZeroToMonth(+date[1]) + '/' + this.addZeroToMonth(+date[2]);
    for (let i = 0; i < +numMon; i++) {
      if (i !== 0) {
        date[1] = +date[1] + 1;
      }
      if (+date[1] === 13) {
        date[1] = 1;
        date[0] = +date[0] + 1;
      }
      date[2] = this.switchingMonth(+date[1]);
      dates[i + 1] = date[0] + '/' + this.addZeroToMonth(+date[1]) + '/' + date[2];
    }
    if (finishDate.length < 10) {
      const finishD = finishDate.split('/');
      dates[+numMon + 1] = finishD[0] + '/' + this.addZeroToMonth(finishD[1]) + '/' + this.addZeroToMonth(finishD[2]);
    } else {
      dates[+numMon + 1] = finishDate;
    }
    if (todayFa !== null) {
      if (todayFa.length < 10) {
        const todayD = todayFa.split('/');
        dates[+numMon + 2] = todayD[0] + '/' + this.addZeroToMonth(todayD[1]) + '/' + this.addZeroToMonth(todayD[2]);
      } else {
        dates[+numMon + 2] = todayFa;
      }
    }
    return dates;
  }

  switchingMonth(month: number) {
    let selectedMonth;
    if (month < 7) {
      selectedMonth = 31;
    } else if (month > 6 && month < 12) {
      selectedMonth = 30;
    } else {
      selectedMonth = 29;
    }
    return selectedMonth;
  }

  addZeroToMonth(month) {
    if (+month < 10) {
      return '0' + month;
    } else {
      return month;
    }
  }

  changeCountMon(startDate: string, finishDate: string) {
    const m = moment(startDate, 'jYYYY/jM/jD');
    const md = moment(finishDate, 'jYYYY/jM/jD');
    let counter = 0;
    counter = md.diff(m, 'months');
    return counter + 1;
  }

  countMon(finishDate: string) {
    const m = moment(this.sharedService.stepFormsData.contractsForm.StartDate_Contract, 'jYYYY/jM/jD');
    const md = moment(finishDate, 'jYYYY/jM/jD');
    let counter = 0;
    counter = md.diff(m, 'months');
    return counter + 1;
  }
}
