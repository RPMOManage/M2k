import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shamsiToMiladi'
})
export class ShamsiToMiladiPipe implements PipeTransform {
  fdate: any;
  transform(Ldate: any): any {
    this.fdate =  Ldate.split('/');
    return this.jalali_to_gregorian(this.fdate[0], this.fdate[1], +this.fdate[2] + 1);
  }
  jalali_to_gregorian(jy, jm, jd ) {
    jd = jd - 1;
    let gy, days, gd, sal_a, gm, v;
    if (jy > 979) {
      gy = 1600;
      jy -= 979;
    }
    else {
      gy = 621;
    }
    days = (365 * jy) + ((Math.floor(jy / 33)) * 8) + (Math.floor(((jy % 33) + 3) / 4)) + 78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
    gy += 400 * (Math.floor(days / 146097));
    days %= 146097;
    if (days > 36524) {
      gy += 100 * (Math.floor(--days / 36524));
      days %= 36524;
      if (days >= 365)
        days++;
    }
    gy += 4 * (Math.floor(days / 1461));
    days %= 1461;
    if (days > 365) {
      gy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    gd = days + 1;
    sal_a = [0, 31, ((gy % 4 == 0 && gy % 100 != 0) || (gy % 400 == 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    for (gm = 0; gm < 13; gm++) {
      v = sal_a[gm];
      if (gd <= v)
        break;
      gd -= v;
    }
    return gy + '-' + gm + '-' + gd ;
  }
}
