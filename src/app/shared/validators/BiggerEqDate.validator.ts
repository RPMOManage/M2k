import { AbstractControl } from '@angular/forms';

export function BiggerEqDateValidator(timeStr: any) {
  console.log(timeStr);
  return true;
  // return (c: AbstractControl) => {
  //   if (true) {
  //     const isValid = +timeStr.FiscalYear > 8;
  //     if (isValid) {
  //       return timeStr;
  //     } else {
  //       return {'invalidNumber': false};
  //     }
  //   }
  // };
}
