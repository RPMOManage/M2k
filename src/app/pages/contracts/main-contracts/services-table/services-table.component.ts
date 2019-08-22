import { Component, Inject, OnInit, Optional } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { SharedService } from '../../../../shared/services/shared.service';
import { ContractService } from '../../../../shared/services/contract.service';
import { MAT_DIALOG_DATA } from '@angular/material';
import { ContractModel } from '../../../../shared/models/contractModels/contract.model';

@Component({
  selector: 'app-services-table',
  styleUrls: ['./services-table.component.scss'],
  templateUrl: './services-table.component.html',
})
export class ServicesTableComponent implements OnInit {
  filteredContracts: ContractModel[] = [];

  constructor(private route: ActivatedRoute,
              private sharedService: SharedService,
              @Optional() @Inject(MAT_DIALOG_DATA) public passedData: {unit: {Id, Title}, contracts: ContractModel[], isTotal: boolean, title?: string, contractServices, lastRecord: {length, costs, plan, act, dp, dt, sp}},
              private contractService: ContractService) {
  }

  ngOnInit() {
    if (this.passedData.isTotal) {
      // this.
    } else {
      this.filteredContracts = this.passedData.contracts.filter(v => +v.Unit.Id === +this.passedData.unit.Id);
    }
  }

  onChangeTable() {
    const services = [];
    this.filteredContracts.filter(v => {
      v.ServiceCosLast.map(v2 => {
        services.push(v2.Service);
      });
    });
    const mainServices = Array.from(new Set(services));
    return mainServices.sort();
  }

  getServiceName(serviceId: number) {
      return this.passedData.contractServices.filter(v => +v.ServiceID === +serviceId)[0].Name;
  }

  getContractLengths(id: number, type = null) {
    if (type === 'all') {
      return this.filteredContracts.length;
    } else {
      const contracts = [];
      this.filteredContracts.filter(v => {
        v.ServiceCosLast.filter(v2 => {
          if (+v2.Service === +id) {
            contracts.push(v);
          }
        });
      });
      return contracts.length;
    }
  }

  getContractCosts(id: number, type = null) {
    const costs = [];
    if (type === 'all') {
      this.filteredContracts.filter(v => {
        v.ServiceCosLast.filter(v2 => {
            costs.push(v2.Cost);
        });
      });
    } else {
      this.filteredContracts.filter(v => {
        v.ServiceCosLast.filter(v2 => {
          if (+v2.Service === +id) {
            costs.push(v2.Cost);
          }
        });
      });
    }
    return (+costs.reduce(this.getSum) / 1000000).toFixed();
  }

  getContractProgress(id: number, type, isTotal = false) {
    let fp = 0;
    let contracts: ContractModel[] = [];
    const costs = [];
    if (isTotal) {
      contracts = this.filteredContracts;
      this.filteredContracts.filter(v => {
        v.ServiceCosLast.filter(v2 => {
            costs.push(v2.Cost);
        });
      });
    } else {
      this.filteredContracts.filter(v => {
        v.ServiceCosLast.filter(v2 => {
          if (+v2.Service === +id) {
            costs.push(v2.Cost);
            contracts.push(v);
          }
        });
      });
    }
    const mainCost = +costs.reduce(this.getSum);
    if (type === 'plan') {
      for (let i = 0; i < contracts.length; i++) {
        if (isTotal) {
          // for (let j = 0; j < contracts[i].ServiceCosLast.length; j++) {
          //   if (contracts[i].LastPC.filter(v => +v.Service === +contracts[i].ServiceCosLast[j].Service).length > 0) {
          //     fp = fp + ((+contracts[i].ServiceCosLast[j].Cost / +mainCost) * +contracts[i].LastPC.filter(v => +v.Service === +contracts[i].ServiceCosLast[j].Service)[0].PlanPC);
          //   }
          // }
        } else {
          if (contracts[i].LastPC.filter(v => v.Service === id).length > 0) {
            let contractCost = 0;
            contracts[i].ServiceCosLast.map(v => {
              if (v.Service === id) {
                contractCost = contractCost + v.Cost;
              }
            });
            fp = fp + ((+contractCost / +mainCost) * +contracts[i].LastPC.filter(v => v.Service === id)[0].PlanPC);
          }
        }
      }
    }
    if (type === 'act') {
      for (let i = 0; i < contracts.length; i++) {
        if (contracts[i].LastPC.filter(v => v.Service === id).length > 0) {
          let contractCost = 0;
          contracts[i].ServiceCosLast.map(v => {
            if (v.Service === id) {
              contractCost = contractCost + v.Cost;
            }
          });
          fp = fp + ((+contractCost / +mainCost) * +contracts[i].LastPC.filter(v => v.Service === id)[0].ActPC);
        }
      }
    }
    if (type === 'dp') {
      for (let i = 0; i < contracts.length; i++) {
        if (contracts[i].LastPC.filter(v => v.Service === id).length > 0) {
          let contractCost = 0;
          contracts[i].ServiceCosLast.map(v => {
            if (v.Service === id) {
              contractCost = contractCost + v.Cost;
            }
          });
          fp = fp + ((+contractCost / +mainCost) * +contracts[i].PCCalcsLast.filter(v => v.Service === id)[0].ProgressDeviation);
        }
      }
    }
    if (type === 'dt') {
      for (let i = 0; i < contracts.length; i++) {
        if (contracts[i].LastPC.filter(v => v.Service === id).length > 0) {
          let contractCost = 0;
          contracts[i].ServiceCosLast.map(v => {
            if (v.Service === id) {
              contractCost = contractCost + v.Cost;
            }
          });
          fp = fp + ((+contractCost / +mainCost) * +contracts[i].PCCalcsLast.filter(v => v.Service === id)[0].TimeDeviation);
        }
      }
    }
    if (type === 'sp') {
      for (let i = 0; i < contracts.length; i++) {
        if (contracts[i].LastPC.filter(v => v.Service === id).length > 0) {
          let contractCost = 0;
          contracts[i].ServiceCosLast.map(v => {
            if (v.Service === id) {
              contractCost = contractCost + v.Cost;
            }
          });
          fp = fp + ((+contractCost / +mainCost) * +contracts[i].PCCalcsLast.filter(v => v.Service === id)[0].Speed30D);
        }
      }
      if (fp !== 0) {
        return ((+fp)).toFixed();
      }
    }
    if (fp === 0) {
      return '-';
    } else {
      return ((+fp) * 100).toFixed(2) + '%';
    }
  }

  getSum(total, num) {
    return total + num;
  }
}
