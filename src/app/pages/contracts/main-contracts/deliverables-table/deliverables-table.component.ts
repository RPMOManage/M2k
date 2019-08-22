import { Component, Inject, OnInit, Optional } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { SharedService } from '../../../../shared/services/shared.service';
import { ContractService } from '../../../../shared/services/contract.service';
import { MAT_DIALOG_DATA } from '@angular/material';
import { ContractModel } from '../../../../shared/models/contractModels/contract.model';
import { DeliverablesList } from '../../../../shared/models/Deliverables.model';
import { OperationTypesList } from '../../../../shared/models/operationTypes.model';

@Component({
  selector: 'app-deliverables-table',
  styleUrls: ['./deliverables-table.component.scss'],
  templateUrl: './deliverables-table.component.html',
})
export class DeliverablesTableComponent implements OnInit {
  filteredContracts: ContractModel[] = [];
  deliverables: DeliverablesList[] = [];
  operations: OperationTypesList[] = [];

  constructor(private route: ActivatedRoute,
              private sharedService: SharedService,
              @Optional() @Inject(MAT_DIALOG_DATA) public passedData: { deliverables, operations, unit: { Id, Title }, contracts: ContractModel[], title, isTotal: boolean, contractServices, lastRecord: { length, costs, plan, act, dp, dt, sp } },
              private contractService: ContractService) {
  }

  ngOnInit() {
    console.log(this.passedData);
    this.filteredContracts = this.passedData.contracts.filter(v => +v.Unit.Id === +this.passedData.unit.Id);
    this.deliverables = this.passedData.deliverables;
    this.operations = this.passedData.operations;
  }

  getContractLengths(id: number, type = null) {
    if (type === 'all') {
      return this.filteredContracts.length;
    } else {
      const contracts = [];
      this.filteredContracts.filter(v => {
        v.DelLast.filter(v2 => {
          if (+v2.Del === +id) {
            contracts.push(v);
          }
        });
      });
      return contracts.length;
    }
  }

  getContractProgress(op, type) {
    const ops = [];
    if (type === 'plan') {
      this.filteredContracts.filter(v => {
        v.DelLast.filter(v2 => {
          if (+v2.Del === +op) {
            ops.push(+v2.PlanSum);
          }
        });
      });
    } else if (type === 'act') {
      this.filteredContracts.filter(v => {
        v.DelLast.filter(v2 => {
          if (+v2.Del === +op) {
            ops.push(+v2.ActSum);
          }
        });
      });
    } else if (type === 'op') {
      this.filteredContracts.filter(v => {
        v.DelLast.filter(v2 => {
          if (+v2.Del === +op) {
            ops.push(this.operations.filter(v3 => +v3.Id === +v2.Op)[0].Name);
          }
        });
      });
      return ops[0];
    } else if (type === 'del') {
      this.filteredContracts.filter(v => {
        v.DelLast.filter(v2 => {
          if (+v2.Del === +op) {
            ops.push(this.deliverables.filter(v3 => +v3.Id === +v2.Del)[0].Name);
          }
        });
      });
      return ops[0];
    } else if (type === 'MeasureUnit') {
      this.filteredContracts.filter(v => {
        v.DelLast.filter(v2 => {
          if (+v2.Del === +op) {
            ops.push(this.deliverables.filter(v3 => +v3.Id === +v2.Del)[0].MeasureUnit);
          }
        });
      });
      return ops[0];
    }
    // else if (type === 'deviation') {
    //   this.filteredContracts.filter(v => {
    //     v.DelLast.filter(v2 => {
    //       if (+v2.Del === +op) {
    //         ops.push(+(((+v2.PlanSum - +v2.ActSum) / +v2.PlanSum) * 100).toFixed(2));
    //       }
    //     });
    //   });
    //   console.log(ops);
    //   return ops.reduce(this.getSum) / ops.length;
    // }

    return +ops.reduce(this.getSum);
  }

  onChangeTable() {
    const ops = [];
    this.filteredContracts.filter(v => {
      v.DelLast.map(v2 => {
        ops.push({
          del: v2.Del,
          op: v2.Op
        });
      });
    });
    const mainOPs = Array.from(new Set(ops.sort((a, b) => a.op - b.op).map(v => v.del)));
    return mainOPs;
  }

  getSum(total, num) {
    return total + num;
  }
}
