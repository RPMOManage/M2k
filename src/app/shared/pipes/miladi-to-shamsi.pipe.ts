import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'miladiToShamsi'
})
export class MiladiToShamsiPipe implements PipeTransform {
  fdate: any;

  transform(Ldate: any): any {
    this.fdate = Ldate.split('/');
    return this.j_to_g(this.fdate[0], this.fdate[1], +this.fdate[2]);
  }

  j_to_g(g_y: number, g_m: number, g_d: number) {
    const JalaliDate = {
      g_days_in_month: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      j_days_in_month: [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
    };
    g_y = Math.floor(g_y);
    g_m = Math.floor(g_m);
    g_d = Math.floor(g_d);
    const gy = g_y - 1600;
    const gm = g_m - 1;
    const gd = g_d - 1;

    let g_day_no = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400);

    for (let i = 0; i < gm; ++i)
      g_day_no += JalaliDate.g_days_in_month[i];
    if (gm > 1 && ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)))
    /* leap and after Feb */
      ++g_day_no;
    g_day_no += gd;

    let j_day_no = g_day_no - 79;

    const j_np = Math.floor(j_day_no / 12053);
    j_day_no %= 12053;

    let jy = 979 + 33 * j_np + 4 * Math.floor(j_day_no / 1461);

    j_day_no %= 1461;

    if (j_day_no >= 366) {
      jy += Math.floor((j_day_no - 1) / 365);
      j_day_no = (j_day_no - 1) % 365;
    }
    let counter = 0;
    for (let i = 0; i < 11 && j_day_no >= JalaliDate.j_days_in_month[i]; ++i) {
      j_day_no -= JalaliDate.j_days_in_month[i];
      counter++;
    }
    const jm = counter + 1;
    const jd = j_day_no + 1;


    return jy + '/' + jm + '/' + jd;
  }
}
