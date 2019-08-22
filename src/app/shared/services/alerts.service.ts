import { Injectable } from '@angular/core';
import swal from 'sweetalert2';

@Injectable()
export class AlertsService {

  constructor() {
  }

  selectionChangeAlert() {
    return swal({
      title: 'اطلاعات مرحله ی قبل ذخیره شود؟',
      type: 'success',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'خیر - برگشت به مرحله ی قبل',
      confirmButtonText: 'بله - ذخیره کن و ادامه بده',
    });
  }

  alerts() {
    return swal({
      title: 'اطلاعات این مرحله مورد تایید است؟',
      type: 'success',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'ماندن در این مرحله',
      confirmButtonText: 'بله - ذخیره کن و ادامه بده',
    });
  }

  alertsWrong(text) {
    return swal({
      title: 'اطلاعات دارای اشکال است!',
      type: 'error',
      showCancelButton: true,
      width: 500,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'ماندن در این مرحله',
      confirmButtonText: 'فعلا ذخیره کن بعدا اصلاح میکنم',
      footer: text,
    });
  }

  alertsWrong2(text) {
    return swal({
      title: text,
      type: 'error',
      showCancelButton: false,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'متوجه شدم!',
    });
  }

  alertsWrongContractForm(text) {
    return swal({
      title: 'اطلاعات دارای اشکال است!',
      footer: text,
      type: 'error',
      showCancelButton: false,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'متوجه شدم!',
    });
  }

  alertsRemove() {
    return swal({
      title: 'آیا مطمئن هستید که میخواهید حذف نمایید؟',
      type: 'error',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'خیر - حذف نشود',
      confirmButtonText: 'بله - حذف شود',
    });
  }

  alertsSubmit() {
    return swal({
      title: 'تاریخ با موفقیت افزوده شد!',
      type: 'success',
      showCancelButton: false,
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'متوجه شدم!',
    });
  }
}
