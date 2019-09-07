import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { SharedService } from '../services/shared.service';
import { catchError, map, mapTo, switchMap } from 'rxjs/internal/operators';
import { Observable, of, Subject } from 'rxjs';
import { errorHandler } from '@angular/platform-browser/src/browser';
import { HttpErrorResponse } from '@angular/common/http';
import { UserList } from '../models/user.model';

@Injectable()
export class NewContractStepperGaurdService implements CanActivate {
  public loader$ = new Subject<boolean>();
  public loader = false;
  public isPM = false;
  public counter = 0;
  public isPM$ = new Subject<boolean>();
  public contractID = '';
  public userData: any;

  constructor(private authService: AuthService,
              private sharedService: SharedService,
              private route: ActivatedRoute,
              private router: Router) {
    this.loader$.subscribe(loader => {
      this.loader = loader;
    });
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // console.log(this.authService.checkPMs());
    // this.authService.checkPMs().pipe(map(
    //   (data) => {
    //     console.log(data);
    //   }
    //   )
    // );
    // this.authService.getCurrentUser().subscribe(
    //   (userData) => {
    //     this.userData = userData;
    //
    //   }-
    // );
    return this.authService.getCurrentUser().pipe(switchMap(
      (uData) => {
        console.log(uData);
        console.log(route.queryParams);
        this.contractID = route.queryParams.ContractID.replace('TC', '');
        return this.authService.getUserRole(uData.Id).pipe(switchMap(
          (rUser: any) => {
            if (+rUser.Account === 17 || +rUser.Account === 18) {
              return this.onAdmin();
            }
            if (rUser.Id_Importer) {
              if (+route.queryParams.ImpID) {
                if (+route.queryParams.ImpID === rUser.ID) {
                  return this.onImporter(uData.Id, rUser.ID);
                }
              } else {
                return this.onImporter(uData.Id, rUser.ID);
              }
            }
            if (rUser.IsPM) {
              return this.onPM(rUser.ID);
            }
            if (rUser.IsPMOExpert) {
              return this.onPMOExpert(rUser.ID);
            }
            this.router.navigate(['/error']);
            return of(false);
          }
        ));
      }));
    // const uAjab2 = this.authService.getCurrentUser().pipe(map(
    //   (uData) => {
    //     return false;
    //   }));
    // console.log(uAjab , uAjab2);
    // this.loader$.next(true);
    // if (route.queryParams.ContractID) {
    //   this.contractID = route.queryParams.ContractID.replace('TC', '');
    //   const ajab = this.authService.isPM(22, +this.contractID)
    //     .pipe(map(() => {
    //       this.loader$.next(false);
    //       this.isPM$.next(true);
    //       this.isPM = true;
    //       return true;
    //     }))
    //     .pipe(catchError((err) => {
    //       this.loader$.next(false);
    //       this.isPM$.next(false);
    //       this.isPM = false;
    //       this.router.navigate(['/error']);
    //       return of(false);
    //     }));
    //   console.log(ajab,);
    //   return ajab;
    // } else {
    //   console.log('iTs Not');
    //   this.isPM$.next(false);
    //   this.isPM = false;
    //   this.router.navigate(['/error']);
    //   return false;
    // }

    // return new Observable<boolean>(obs => {
    //   setTimeout(() => {
    //         this.loader$.next(false);
    //     obs.next(true);
    //     obs.complete();
    //   }, 10000);
    // });
  }

  onAdmin() {
    return this.authService.isAccessible(null, +this.contractID, 3, null)
      .pipe(switchMap(() => {
        this.loader$.next(false);
        this.isPM$.next(true);
        this.isPM = true;
        this.sharedService.isReadOnly = false;
        return of(true);
      }))
      .pipe(catchError((err) => {
        this.loader$.next(false);
        this.isPM$.next(false);
        this.isPM = false;
        this.router.navigate(['/error']);
        return of(false);
      }));
  }

  onImporter(userId: number, userImporterId: string) {
    return this.authService.isAccessible(userId, +this.contractID, 0, userImporterId)
      .pipe(switchMap(() => {
        this.loader$.next(false);
        this.isPM$.next(true);
        this.isPM = true;
        this.sharedService.userMainRole = 0;
        return of(true);
      }))
      .pipe(catchError((err) => {
        this.loader$.next(false);
        this.isPM$.next(false);
        this.isPM = false;
        this.router.navigate(['/error']);
        return of(false);
      }));
  }

  onPM(userId: number) {
    return this.authService.isAccessible(userId, +this.contractID, 1)
      .pipe(switchMap(() => {
        this.loader$.next(false);
        this.isPM$.next(true);
        this.isPM = true;
        this.sharedService.userMainRole = 1;
        this.sharedService.isReadOnly = true;
        return of(true);
      }))
      .pipe(catchError((err) => {
        this.loader$.next(false);
        this.isPM$.next(false);
        this.isPM = false;
        console.log('ajab2');
        this.router.navigate(['/error']);
        return of(false);
      }));
  }

  onPMOExpert(userId: number) {
    console.log(userId);
    return this.authService.isAccessible(userId, +this.contractID, 2)
      .pipe(switchMap(() => {
        this.loader$.next(false);
        this.isPM$.next(true);
        this.isPM = true;
        this.sharedService.userMainRole = 2;
        this.sharedService.isReadOnly = true;
        return of(true);
      }))
      .pipe(catchError((err) => {
        this.loader$.next(false);
        this.isPM$.next(false);
        this.isPM = false;
        this.router.navigate(['/error']);
        return of(false);
      }));
  }
}
