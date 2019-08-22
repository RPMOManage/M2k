import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContractModel } from '../../../shared/models/contractModels/contract.model';
import { SharedService } from '../../../shared/services/shared.service';
import { ContractService } from '../../../shared/services/contract.service';
import { ContractDutiesModel } from '../../../shared/models/contractModels/contractDuties.model';

@Component({
  selector: 'app-main-duties',
  styleUrls: ['./main-duties.component.scss'],
  templateUrl: './main-duties.component.html',
})
export class MainDutiesComponent implements OnInit {
  spinnerChecking = false;
  contracts: ContractModel[] = [];
  duties: ContractDutiesModel[] = [];
  checkList = false;

  constructor(private route: ActivatedRoute,
              private sharedService: SharedService,
              private contractService: ContractService) {
  }

  ngOnInit() {
    // this.contractService.getAllContracts().subscribe(
    //   (contracts) => {
    //     this.contracts = contracts;
    //     const mainDuties = [];
    //     for (let i = 0; i < this.contracts.length; i++) {
    //       this.contractService.getContractDuties(this.contracts[i].Id).subscribe(
    //         (duties: ContractDutiesModel[]) => {
    //           mainDuties.push(duties);
    //           // for (let j = 0; j < duties.length; j++) {
    //           //   duties.push(duties[j]);
    //           // }
    //           if (i === this.contracts.length - 1) {
    //             // this.duties = mainDuties.flat();
    //             console.log(this.duties);
    //             this.checkList = true;
    //           }
    //         });
    //       // if (i === this.contracts.length - 1) {
    //       //   this.checkList = true;
    //       // }
    //     }
    //   }
    // );

  }
}
