import { Component, OnInit } from '@angular/core';
import { ContractModel } from '../../shared/models/contractModels/contract.model';
import { ContractService } from '../../shared/services/contract.service';
import { Router } from '@angular/router';
import { PMsList } from '../../shared/models/PMs.model';
import { SharedService } from '../../shared/services/shared.service';

@Component({
  selector: 'app-contracts-list',
  templateUrl: './contracts-list.component.html',
  styleUrls: ['./contracts-list.component.scss']
})
export class ContractsListComponent implements OnInit {
  search = '';
  contracts: ContractModel[] = [];
  filtredContracts: ContractModel[] = [];
  selectedContract: ContractModel;
  contractPCs: { Contract, PC }[] = [];
  pms: PMsList[] = [];

  constructor(private contractService: ContractService,
              private sharedService: SharedService,
              private router: Router) {
  }

  ngOnInit() {
    this.sharedService.getPMs().subscribe(
      (data) => {
        this.pms = data;
      }
    );
    this.contractService.getAllContracts().subscribe(
      (contracts) => {
        this.contracts = contracts;
        this.filtredContracts = contracts;
        this.contracts.map(v => v.LastPC.filter(v2 => {
          if (+v2.Service === 7) {
            this.contractPCs.push({Contract: v.Id, PC: v2.ActPC});
          } else {
            this.contractPCs.push({Contract: v.Id, PC: v2.ActPC});
          }
        }));
      });
  }

  getPMName(id: number) {
    return this.pms.filter(v => v.User.ID === id)[0].User.Title;
  }

  onSearch() {
    if (this.search === '') {
      this.filtredContracts = this.contracts;
    } else {
      this.filtredContracts = this.contracts.filter(v => v.Title.includes(this.search) || v.Id.toString().includes(this.search));
    }
  }

  getContractPC(id: number) {
    return (this.contractPCs.filter(v => v.Contract === id)[0].PC * 100).toFixed(2);
  }

  onClickPage(Name: any) {
    if (Name === 'duties') {
      this.router.navigate(['/duties']);
    } else if (Name === 'changes') {
      this.router.navigate(['/changes']);
    } else if (Name === 'dashboard') {
      this.router.navigate(['/contracts']);
    } else {
      this.router.navigate(['/contract'], {queryParams: {ID: Name}, queryParamsHandling: 'merge'});
    }
  }
}
