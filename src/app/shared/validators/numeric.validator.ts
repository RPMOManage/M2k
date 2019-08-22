import { AbstractControl } from '@angular/forms';

export function ValidateNumeric(control: AbstractControl) {
  const val = control.value;

  if (val === null || val === '') {
    return null;
  }

  if (val) {
    if (!val.toString().match(/^[0-9]+(\.?[0-9]+)?$/)) {
      return {'invalidNumber': true};
    }
  }


  return null;
}
