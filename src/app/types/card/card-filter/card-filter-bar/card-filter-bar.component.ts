import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { ChangesRequestComponent } from '../../card-change/changes-request/changes-request.component';
import { NewContractStartComponent } from '../../../../forms/new-contract-start/new-contract-start.component';

@Component({
  selector: 'app-card-filter-bar',
  styleUrls: ['./card-filter-bar.component.scss'],
  templateUrl: './card-filter-bar.component.html',
})
export class CardFilterBarComponent implements OnInit{
  @Input() contract;
  @Input() type;
  @Input() tableShow;
  selected = 1;
  @Output() searching = new EventEmitter();
  @Output() tableShowing = new EventEmitter();
  sorts = [
    {id: 1, value: 'جدیدترین'},
    {id: 2, value: 'قدیمی ترین'},
  ];
  viewType = '';

  constructor(private router: Router,
                      private dialog: MatDialog) {
  }

  ngOnInit() {
    this.viewType = this.tableShow;
    this.sortByDateAc(this.contract);
    this.tableShowing.emit(this.viewType);
  }

  onClickButton() {
    const config: any = {
      width: '1200px',
      height: '800px',
      data: {
        contract: this.contract
      },
      autoFocus: false
    };
    const dialogRef: any = this.dialog.open(ChangesRequestComponent, config);
  }

  onClickButtonPish() {
    const config: any = {
      width: '1200px',
      height: '900px',
      data: { },
      autoFocus: false
    };
    const dialogRef: any = this.dialog.open(NewContractStartComponent, config);
  }

  onChangeTableShow(type) {
    this.viewType = type;
    this.tableShowing.emit(type);
  }

  onAddContract() {
    alert('Add Contract!');
  }

  onSelect(el) {
    let contracts;
    if (el.source.value === 1) {
      contracts = this.sortByDateAc(this.contract);
      this.searching.emit({
        contracts: contracts,
        type: this.type,
      });
    } else if (el.source.value === 2) {
      contracts = this.sortByDateDe(this.contract);
      this.searching.emit({
        contracts: contracts,
        type: this.type,
      });
    }
  }

  sortByDateDe(contracts) {
    return contracts.sort((a, b) => +new Date(a.Date) - +new Date(b.Date));
  }
  sortByDateAc(contracts) {
    return contracts.sort((a, b) => +new Date(b.Date) - +new Date(a.Date));
  }

  onSearch(el) {
    const searchValue = el.srcElement.value;
    let contracts;
    if (searchValue !== '') {
      if (this.type !== 'tempContracts') {
        contracts =  this.contract.filter(v => {
          // if (v.Title.includes(searchValue) || v.Code.includes(searchValue) || v.ShortTitle.includes(searchValue) || v.ContractCode.includes(searchValue) || v.ContractSubject.includes(searchValue) || v.Contractor.includes(searchValue)) {
          if (v.Title.includes(searchValue)) {
            return true;
          } else {
            return false;
          }
        });
      } else {
        contracts =  this.contract.filter(v => {
          if (v.Title.includes(searchValue) || v.Code.includes(searchValue)) {
            return true;
          } else {
            return false;
          }
        });
      }
    } else {
      contracts =  this.contract;
    }
    this.searching.emit({
      contracts: contracts,
      type: this.type,
      searchValue: el.srcElement.value,
    });
  }
}
