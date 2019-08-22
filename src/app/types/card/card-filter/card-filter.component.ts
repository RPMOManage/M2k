import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isUndefined } from 'util';
import { UnitsList } from '../../../shared/models/units.model';
import { SharedService } from '../../../shared/services/shared.service';
import { PMsList } from '../../../shared/models/PMs.model';
import { RaiPartsList } from '../../../shared/models/raiParts.model';
import { ImporterList } from '../../../shared/models/importer.model';
import { ZonesList } from '../../../shared/models/zones.model';
import { ContractServicesList } from '../../../shared/models/contractServices.model';

@Component({
  selector: 'app-card-filter',
  styleUrls: ['./card-filter.component.scss'],
  templateUrl: './card-filter.component.html',
})
export class CardFilterComponent implements OnInit {
  @Input() type;
  @Input() contracts;
  @Input() maxSpeed;
  @Input() maxTDeviation;
  @Input() maxPDeviation;
  @Input() maxPayDeviation;
  @Input() maxContractCost;
  @Input() minSpeed;
  @Input() minTDeviation;
  @Input() minPDeviation;
  @Input() minPayDeviation;
  @Input() minContractCost;
  startDateVal = null;
  finishDateVal = null;
  finishActDateVal = null;
  finishContract = false;
  searchVal = '';
  panelOpenState = false;
  @ViewChild('nameit') private elementRef: ElementRef;
  dutyStatus = '';
  typee = '';
  contractType = '';
  approval = '';
  units: UnitsList[] = [];
  pms: PMsList[] = [];
  raiParts: RaiPartsList[] = [];
  importers: ImporterList[] = [];
  zones: ZonesList[] = [];
  paRange = [0, 100];
  ppRange = [0, 100];
  pfRange = [0, 100];
  speedRange = [null, null];
  tDRange = [null, null];
  pDRange = [null, null];
  payDRange = [null, null];
  costRange = [null, null];
  contractServices: ContractServicesList[] =[];

  constructor(private router: Router,
                      private route: ActivatedRoute,
                      private sharedService: SharedService) {
    this.route.queryParams.subscribe(
      (params: any) => {
        if (!isUndefined(params.dutyStatus)) {
          this.dutyStatus = params.dutyStatus.split(',').join();
        }
        if (!isUndefined(params.type)) {
          this.typee = params.type.split(',').join();
        }
        if (!isUndefined(params.cType)) {
          this.contractType = params.cType.split(',').join();
        }
        if (!isUndefined(params.approval)) {
          this.approval = params.approval.split(',').join();
        }
      },
    );
  }

  ngOnInit() {
    this.sharedService.getContractServices().subscribe(
      (data) => {
        this.contractServices = data;
      }
    );
    this.speedRange[1] = this.maxSpeed;
    this.tDRange[1] = this.maxTDeviation;
    this.pDRange[1] = this.maxPDeviation;
    this.payDRange[1] = this.maxPayDeviation;
    this.costRange[1] = this.maxContractCost;
    this.speedRange[0] = this.minSpeed;
    this.tDRange[0] = this.minTDeviation;
    this.pDRange[0] = this.minPDeviation;
    this.payDRange[0] = this.minPayDeviation;
    this.costRange[0] = this.minContractCost;
    this.sharedService.getPMs().subscribe(
      (data) => {
        this.pms = data;
      }
    );
    this.sharedService.getAllUnits().subscribe(
      (data) => {
        this.units = data;
      }
    );
    this.sharedService.getRaiParts().subscribe(
      (data) => {
        this.raiParts = data;
      }
    );
    this.sharedService.getAllImporters().subscribe(
      (data) => {
        this.importers = data;
      }
    );
    this.sharedService.getZones().subscribe(
      (data) => {
        this.zones = data;
      }
    );
  }

  onSliderChanges(type: string) {
    if (type === 'pa') {
      this.router.navigate(['/contracts'], { queryParams: { minPA: 100 - this.paRange[1], maxPA: 100 - this.paRange[0] }, queryParamsHandling: 'merge'});
    }
    if (type === 'pp') {
      this.router.navigate(['/contracts'], { queryParams: { minPP: 100 - this.ppRange[1], maxPP: 100 - this.ppRange[0] }, queryParamsHandling: 'merge'});
    }
    if (type === 'pf') {
      this.router.navigate(['/contracts'], { queryParams: { minPF: 100 - this.pfRange[1], maxPF: 100 - this.pfRange[0] }, queryParamsHandling: 'merge'});
    }
    if (type === 'speed') {
      this.router.navigate(['/contracts'], { queryParams: { minSpeed: (this.maxSpeed - this.speedRange[1] + this.minSpeed).toFixed(2), maxSpeed: (this.minSpeed - this.speedRange[0] + this.maxSpeed).toFixed(2) }, queryParamsHandling: 'merge'});
    }
    if (type === 'td') {
      this.router.navigate(['/contracts'], { queryParams: { minTD: (this.maxTDeviation - this.tDRange[1] + this.minTDeviation).toFixed(2), maxTD: (this.minTDeviation - this.tDRange[0] + this.maxTDeviation).toFixed(2) }, queryParamsHandling: 'merge'});
    }
    if (type === 'pd') {
      this.router.navigate(['/contracts'], { queryParams: { minPD: (this.maxPDeviation - this.pDRange[1] + this.minPDeviation).toFixed(2), maxPD: (this.minPDeviation - this.pDRange[0] + this.maxPDeviation).toFixed(2) }, queryParamsHandling: 'merge'});
    }
    if (type === 'payd') {
      this.router.navigate(['/contracts'], { queryParams: { minPayD: (this.maxPayDeviation - this.payDRange[1] + this.minPayDeviation).toFixed(2), maxPayD: (this.minPayDeviation - this.payDRange[0] + this.maxPayDeviation).toFixed(2) }, queryParamsHandling: 'merge'});
    }
    if (type === 'c') {
      this.router.navigate(['/contracts'], { queryParams: { minCost: (this.maxContractCost - this.costRange[1]).toFixed(), maxCost: (this.maxContractCost - this.costRange[0]).toFixed() }, queryParamsHandling: 'merge'});
    }
  }

  onRemoveTag(val: string) {
    if (val === 'Date') {
      this.startDateVal = null;
      this.finishActDateVal = null;
      this.router.navigate(['/contracts'], { queryParams: { fromDate: null, toDate: null }, queryParamsHandling: 'merge'});
    }
    if (val === 'unit') {
      this.router.navigate(['/contracts'], { queryParams: { unit: null }, queryParamsHandling: 'merge'});
    }
    if (val === 'pm') {
      this.router.navigate(['/contracts'], { queryParams: { pm: null }, queryParamsHandling: 'merge'});
    }
    if (val === 'rai') {
      this.router.navigate(['/contracts'], { queryParams: { rai: null }, queryParamsHandling: 'merge'});
    }
    if (val === 'importer') {
      this.router.navigate(['/contracts'], { queryParams: { importer: null }, queryParamsHandling: 'merge'});
    }
    if (val === 'pa') {
      this.paRange = [0, 100];
      this.router.navigate(['/contracts'], { queryParams: { minPA: null, maxPA: null }, queryParamsHandling: 'merge'});
    }
    if (val === 'pp') {
      this.ppRange = [0, 100];
      this.router.navigate(['/contracts'], { queryParams: { minPP: null, maxPP: null }, queryParamsHandling: 'merge'});
    }
    if (val === 'pf') {
      this.pfRange = [0, 100];
      this.router.navigate(['/contracts'], { queryParams: { minPF: null, maxPF: null }, queryParamsHandling: 'merge'});
    }
    if (val === 'td') {
      this.tDRange = [this.minTDeviation, this.maxTDeviation];
      this.router.navigate(['/contracts'], { queryParams: { minTD: null, maxTD: null }, queryParamsHandling: 'merge'});
    }
    if (val === 'pd') {
      this.pDRange = [this.minPDeviation, this.maxPDeviation];
      this.router.navigate(['/contracts'], { queryParams: { minPD: null, maxPD: null }, queryParamsHandling: 'merge'});
    }
    if (val === 'payd') {
      this.payDRange = [this.minPayDeviation, this.maxPayDeviation];
      this.router.navigate(['/contracts'], { queryParams: { minPayD: null, maxPayD: null }, queryParamsHandling: 'merge'});
    }
    if (val === 'speed') {
      this.speedRange = [this.minSpeed, this.maxSpeed];
      this.router.navigate(['/contracts'], { queryParams: { minSpeed: null, maxSpeed: null }, queryParamsHandling: 'merge'});
    }
    if (val === 'c') {
      this.costRange = [this.minContractCost, this.maxContractCost];
      this.router.navigate(['/contracts'], { queryParams: { minCost: null, maxCost: null }, queryParamsHandling: 'merge'});
    }
    if (val === 'service') {
      this.router.navigate(['/contracts'], { queryParams: { service: null }, queryParamsHandling: 'merge'});
    }
    if (val === 'all') {
      this.startDateVal = null;
      this.finishActDateVal = null;
      this.paRange = [0, 100];
      this.ppRange = [0, 100];
      this.speedRange = [this.minSpeed, this.maxSpeed];
      this.pfRange = [0, 100];
      this.tDRange = [this.minTDeviation, this.maxTDeviation];
      this.pDRange = [this.minPDeviation, this.maxPDeviation];
      this.payDRange = [this.minPayDeviation, this.maxPayDeviation];
      this.costRange = [this.minContractCost, this.maxContractCost];
      this.router.navigate(['/contracts']);
    }
  }

  onCheck(el, chType, status) {
    if (chType === 'cType') {
      this.navRouter(el, this.contractType, chType, status);
      // if (el.checked) {
      //   if (status === 'contracts') {
      //     this.router.navigate([], { queryParams: { isSpecial: false }, queryParamsHandling: 'merge'});
      //   } else {
      //     this.router.navigate([], { queryParams: { isSpecial: true }, queryParamsHandling: 'merge'});
      //   }
      // } else {
      //   this.router.navigate([], { queryParams: { isSpecial: null }, queryParamsHandling: 'merge'});
      // }
    }
    if (chType === 'dutyStatus') {
      this.navRouter(el, this.dutyStatus, chType, status);
      // if (el.checked) {
      //   let dutyS;
      //   if (this.dutyStatus !== '') {
      //     dutyS = this.dutyStatus + ',' + status;
      //   } else {
      //     dutyS = status;
      //   }
      //   const extra = '{"queryParams":{ "' + chType + '": "' + status + '" },"queryParamsHandling": "merge"}';
      //   const a: any = JSON.parse(extra);
      //   this.router.navigate([], a);
      // } else {
      //   let pS: any;
      //   pS = this.dutyStatus.split(',');
      //   pS = pS.filter(v => v !== status);
      //   pS = pS.join();
      //   if (pS !== '') {
      //     this.router.navigate([], { queryParams: { 'dutyStatus': pS }, queryParamsHandling: 'merge'});
      //   } else {
      //     this.dutyStatus = '';
      //     this.router.navigate([], { queryParams: { 'dutyStatus': null }, queryParamsHandling: 'merge'});
      //   }
      // }
    }
    if (chType === 'type') {
      this.navRouter(el, this.typee, chType, status);
      // if (el.checked) {
      //   this.router.navigate([], { queryParams: { type: status }, queryParamsHandling: 'merge'});
      // } else {
      //   this.router.navigate([], { queryParams: { type: null }, queryParamsHandling: 'merge'});
      // }
    }
    if (chType === 'approval') {
      this.navRouter(el, this.approval, chType, status);
    }
  }

  onDateChange(val: string) {
    if (val === 'fromDate') {
      this.router.navigate(['/contracts'], { queryParams: { fromDate: +new Date(this.startDateVal.format('YYYY/MM/DD')) }, queryParamsHandling: 'merge'});
    }
    if (val === 'toDate') {
      this.router.navigate(['/contracts'], { queryParams: { toDate: +new Date(this.finishActDateVal.format('YYYY/MM/DD')) }, queryParamsHandling: 'merge'});
    }
    // if (val === 'finishActDate') {
    //   this.router.navigate(['/contracts'], { queryParams: { finishActDate: this.finishActDateVal.format('YYYY/MM/DD').replace('/', '').replace('/', '') }, queryParamsHandling: 'merge'});
    // }
    // if (val === 'finishContract') {
    //   this.router.navigate(['/contracts'], { queryParams: { finishContract: true }, queryParamsHandling: 'merge'});
    // }
  }

  navRouter(el, params, qParams, status) {
    if (el.checked) {
      let dutyS;
      if (params !== '') {
        dutyS = params + ',' + status;
      } else {
        dutyS = status;
      }
      const extra = JSON.parse('{"queryParams":{ "' + qParams + '": "' + dutyS + '" },"queryParamsHandling": "merge"}');
      console.log('{"queryParams":{ "' + qParams + '": "' + dutyS + '" },"queryParamsHandling": "merge"}');
      this.router.navigate([], extra);
    } else {
      let pS: any;
      pS = params.split(',');
      pS = pS.filter(v => v !== status);
      pS = pS.join();
      let pSExtra;
      if (pS !== '') {
        pSExtra = JSON.parse('{"queryParams":{ "' + qParams + '": "' + pS + '" },"queryParamsHandling": "merge"}');
        this.router.navigate([], pSExtra);
      } else {
        if (qParams === 'type') {
          this.typee = '';
        }
        if (qParams === 'dutyStatus') {
          this.dutyStatus = '';
        }
        if (qParams === 'cType') {
          this.contractType = '';
        }
        if (qParams === 'approval') {
          this.approval = '';
        }
        pSExtra = JSON.parse('{"queryParams":{ "' + qParams + '": ' + null + ' },"queryParamsHandling": "merge"}');
        this.router.navigate([], pSExtra);
      }
    }
  }

  onAddContract() {
    alert('Add Contract!');
  }

  onSearch(el) {
  const value = el.value;
    this.router.navigate([], { queryParams: { search: value }, queryParamsHandling: 'merge'});
  }
}
