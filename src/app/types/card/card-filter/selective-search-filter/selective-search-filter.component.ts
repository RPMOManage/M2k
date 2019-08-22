import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ContractModel } from '../../../../shared/models/contractModels/contract.model';
import { UnitsList } from '../../../../shared/models/units.model';
import { PMsList } from '../../../../shared/models/PMs.model';
import { RaiPartsList } from '../../../../shared/models/raiParts.model';
import { ImporterList } from '../../../../shared/models/importer.model';
import { ZonesList } from '../../../../shared/models/zones.model';
import { ContractServicesList } from '../../../../shared/models/contractServices.model';

@Component({
  selector: 'app-selective-search-filter',
  styleUrls: ['./selective-search-filter.component.scss'],
  templateUrl: './selective-search-filter.component.html',
})
export class SelectiveSearchFilterComponent implements OnInit {
  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};
  @Input() type;
  @Input() contracts: ContractModel[] = [];
  @Input() units: UnitsList[];
  @Input() pms: PMsList[];
  @Input() raiParts: RaiPartsList[];
  @Input() importers: ImporterList[];
  @Input() zones: ZonesList[];
  @Input() contractServices: ContractServicesList[];

  constructor(private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    if (this.type === 'pm') {
      for (let i = 0; i < this.pms.length; i++) {
        this.dropdownList[i] = {
          'id': this.pms[i].Id,
          'itemName': this.pms[i].User.Title,
          'code': 'p1'
        };
      }
      this.dropdownSettings = {
        singleSelection: false,
        text: 'انتخاب مدیر پروژه',
        selectAllText: 'انتخاب همه',
        unSelectAllText: 'انتخاب نهمه',
        enableSearchFilter: true,
        classes: 'myclass custom-class',
        searchPlaceholderText: 'جستجو',
        badgeShowLimit: 3,
      };
    } else if (this.type === 'rai') {
      for (let i = 0; i < this.raiParts.length; i++) {
        this.dropdownList[i] = {
          'id': this.raiParts[i].Id,
          'itemName': this.raiParts[i].Name,
          'code': 'r1'
        };
      }
      this.dropdownSettings = {
        singleSelection: false,
        text: 'انتخاب کارفرما',
        selectAllText: 'انتخاب همه',
        unSelectAllText: 'انتخاب نهمه',
        enableSearchFilter: true,
        classes: 'myclass custom-class',
        searchPlaceholderText: 'جستجو',
      };
    } else if (this.type === 'unit') {
      for (let i = 0; i < this.units.length; i++) {
        this.dropdownList[i] = {
          'id': this.units[i].Id,
          'itemName': this.units[i].Name,
          'code': 'u1'
        };
      }
      // this.selectedItems = [
      //   { "id": 1, "category": "asia" },
      //   { "id": 2, "itemName": "Singapore" },
      //   { "id": 4, "itemName": "Canada" }];
      this.dropdownSettings = {
        singleSelection: false,
        text: 'انتخاب واحد سازمانی',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        searchPlaceholderText: 'Search Fields',
        enableSearchFilter: false,
        badgeShowLimit: 5,
      };
    } else if (this.type === 'importer') {
      for (let i = 0; i < this.importers.length; i++) {
        this.dropdownList[i] = {
          'id': this.importers[i].Id,
          'itemName': this.importers[i].Name,
          'code': 'i1'
        };
      }
      this.dropdownSettings = {
        singleSelection: false,
        text: 'انتخاب مسئول اطلاعات',
        selectAllText: 'انتخاب همه',
        unSelectAllText: 'انتخاب نهمه',
        enableSearchFilter: true,
        classes: 'myclass custom-class',
        searchPlaceholderText: 'جستجو',
        badgeShowLimit: 3,
      };
    } else if (this.type === 'zone') {
      for (let i = 0; i < this.zones.length; i++) {
        this.dropdownList[i] = {
          'id': this.zones[i].Id,
          'itemName': this.zones[i].Name,
          'code': 'z1'
        };
      }
      this.dropdownSettings = {
        singleSelection: false,
        text: 'انتخاب ناحیه',
        selectAllText: 'انتخاب همه',
        unSelectAllText: 'انتخاب نهمه',
        enableSearchFilter: true,
        classes: 'myclass custom-class',
        searchPlaceholderText: 'جستجو',
        badgeShowLimit: 3,
      };
    } else if (this.type === 'service') {
      for (let i = 0; i < this.contractServices.length; i++) {
        this.dropdownList[i] = {
          'id': this.contractServices[i].ServiceID,
          'itemName': this.contractServices[i].Name,
          'code': 's1'
        };
      }
      this.dropdownSettings = {
        singleSelection: false,
        text: 'انتخاب ناحیه',
        selectAllText: 'انتخاب همه',
        unSelectAllText: 'انتخاب نهمه',
        enableSearchFilter: true,
        classes: 'myclass custom-class',
        searchPlaceholderText: 'جستجو',
        badgeShowLimit: 3,
      };
    }

    this.selectedItems = [];

    this.route.queryParams.subscribe(
      (params: any) => {
        if (params.pm) {
          const pms = params.pm.split(',');
          for (let i = 0; i < pms.length; i++) {
            const filtredPM = this.dropdownList.filter(v => v.code === pms[i]);
            if (filtredPM.length > 0) {
              this.selectedItems.push(
                filtredPM[0],
              );
            }
          }
        }
        if (params.rai) {
          const rais = params.rai.split(',');
          for (let i = 0; i < rais.length; i++) {
            const filtredRai = this.dropdownList.filter(v => v.code === rais[i]);
            if (filtredRai.length > 0) {
              this.selectedItems.push(
                filtredRai[0],
              );
            }
          }
        }
        // if (params.unit) {
        //   this.units
        //   const units = Array.from(new Set(this.contracts.map(v => v.Unit.Id)));
        //   for (let i = 0; i < this.units.length)
        //   this.dropdownList =
        //   console.log(this.dropdownList);
        // }
      },
    );
  }

  onItemSelect(item: any) {
    // const arr = '[' + this.selectedItems.map(v => v.code) + ']';
    if (this.type === 'pm') {
      this.router.navigate(['contracts'], {queryParams: {pm: [this.selectedItems.map(v => v.id)]}, queryParamsHandling: 'merge'});
    } else if (this.type === 'rai') {
      this.router.navigate(['contracts'], {queryParams: {rai: [this.selectedItems.map(v => v.id)]}, queryParamsHandling: 'merge'});
    } else if (this.type === 'unit') {
      this.router.navigate(['contracts'], {queryParams: {unit: [this.selectedItems.map(v => v.id)]}, queryParamsHandling: 'merge'});
    } else if (this.type === 'importer') {
      this.router.navigate(['contracts'], {queryParams: {importer: [this.selectedItems.map(v => v.id)]}, queryParamsHandling: 'merge'});
    } else if (this.type === 'zone') {
      this.router.navigate(['contracts'], {queryParams: {zone: [this.selectedItems.map(v => v.id)]}, queryParamsHandling: 'merge'});
    } else if (this.type === 'service') {
      this.router.navigate(['contracts'], {queryParams: {service: [this.selectedItems.map(v => v.id)]}, queryParamsHandling: 'merge'});
    }
  }

  OnItemDeSelect(item: any) {
    if (this.selectedItems.length > 0) {
      this.onItemSelect(null);
    } else {
      if (this.type === 'pm') {
        this.router.navigate(['/contracts'], {queryParams: {pm: null}, queryParamsHandling: 'merge'});
      } else if (this.type === 'rai') {
        this.router.navigate(['/contracts'], {queryParams: {rai: null}, queryParamsHandling: 'merge'});
      } else if (this.type === 'unit') {
        this.router.navigate(['/contracts'], {queryParams: {unit: null}, queryParamsHandling: 'merge'});
      } else if (this.type === 'importer') {
        this.router.navigate(['/contracts'], {queryParams: {importer: null}, queryParamsHandling: 'merge'});
      } else if (this.type === 'zone') {
        this.router.navigate(['/contracts'], {queryParams: {zone: null}, queryParamsHandling: 'merge'});
      } else if (this.type === 'service') {
        this.router.navigate(['/contracts'], {queryParams: {service: null}, queryParamsHandling: 'merge'});
      }
    }
  }

  onSelectAll(items: any) {
  }

  onDeSelectAll(items: any) {
  }

}
