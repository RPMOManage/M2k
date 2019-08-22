import {Component, OnInit} from '@angular/core';
import {ContractService} from '../../shared/services/contract.service';
import {Router} from '@angular/router';
import {SharedService} from '../../shared/services/shared.service';
import {ExcelService} from '../../shared/services/excel.service';
import {ContractModel} from '../../shared/models/contractModels/contract.model';
import {ContractServicesList} from '../../shared/models/contractServices.model';
import {BasicModel} from '../../shared/models/contractModels/basic.model';
import {ContractAssignedCostResModel} from '../../shared/models/contractModels/contractAssignedCostRes.model';
import {ContractStakeHolderModel} from '../../shared/models/contractModels/contractStakeHolder.model';

@Component({
  selector: 'app-exports',
  templateUrl: './exports.component.html',
  styleUrls: ['./exports.component.scss']
})
export class ExportsComponent implements OnInit {
  data: any = [{
    ID: 1,
    FirstName: 'Ajab',
    LastName: 'Jijo'
  }, {
    ID: 2,
    FirstName: 'Havij',
    LastName: 'Jiji'
  }, {
    ID: 3,
    FirstName: 'Golabi',
    LastName: 'Jigol'
  }];
  contracts: ContractModel[] = [];
  types: { ID, Name, isChecked }[] = [{
    Name: 'خلاصه وضعیت قرارداد ها',
    ID: 1,
    isChecked: false,
    // all contracts
  }, {
    Name: 'سوابق اطلاعات پایه',
    ID: 2,
    isChecked: false,
  }, {
    Name: 'مبالغ قرارداد',
    ID: 3,
    isChecked: false,
  }, {
    Name: 'تاریخ های پایان',
    ID: 4,
    isChecked: false,
  }, {
    Name: 'محل های تامین اعتبار',
    ID: 5,
    isChecked: false,
  }, {
    Name: 'برآورد مبالغ خدمات',
    ID: 6,
    isChecked: false,
  }, {
    Name: 'کلیات جریان های نقدینگی',
    ID: 7,
    isChecked: false,
  }, {
    Name: 'ریز جریان های نقدینگی',
    ID: 8,
    isChecked: false,
  }, {
    Name: 'کلیات سری های درصد پیشرفت',
    ID: 9,
    isChecked: false,
  }, {
    Name: 'ریز سری های درصد یپشرفت',
    ID: 8,
    isChecked: false,
  }, {
    Name: 'شاخص های محاسباتی درصد پیشرفت',
    ID: 9,
    isChecked: false,
  }, {
    Name: 'عناوین تحویل شدنی ها',
    ID: 10,
    isChecked: false,
  }, {
    Name: 'کلیات سری های تحویل شدنی ها',
    ID: 11,
    isChecked: false,
  }, {
    Name: 'ریز سری های تحویل شدنی ها',
    ID: 12,
    isChecked: false,
  }, {
    Name: 'درخواست های مالی',
    ID: 13,
    isChecked: false,
  }, {
    Name: 'پرداخت های مالی',
    ID: 14,
    isChecked: false,
  }, {
    Name: 'ذی نفعان',
    ID: 15,
    isChecked: false,
  }, {
    Name: 'نسخه های قرارداد',
    ID: 16,
    isChecked: false,
  }];
  services: ContractServicesList[] = [];

  constructor(private contractService: ContractService,
              private sharedService: SharedService,
              private router: Router,
              private excelService: ExcelService) {
  }

  ngOnInit() {
    this.contractService.getAllContracts().subscribe(
      (contracts) => {
        this.contracts = contracts;
        console.log(this.contracts);
      }
    );
    this.sharedService.getContractServices().subscribe(
      (services) => this.services = services
    );
  }

  onChange(e: any, i) {
    this.types[i].isChecked = e.checked;
    console.log(e);
  }

  onExport() {
    console.log(this.types);
    if (this.types[0].isChecked) {
      const mainData = [];
      const serviceCostLastData = [];
      const pcLastData = [];
      const financialLastData = [];
      const delLastData = [];
      const assignedCostResesLastData = [];
      const pcCalcsLastData = [];
      const titles = ['اطلاعات کلی قرارداد'];
      // const titles = ['اطلاعات کلی قرارداد', 'برآورد مبالغ قرارداد', 'درصد پیشرفت', 'محاسبات درصد پیشرفت', 'مالی', 'تحویل شدنی ها'];
      for (let i = 0; i < this.contracts.length; i++) {
        mainData[i] = {
          'کد قرارداد': this.contracts[i].Id,
          'کد آخرین ورژن': this.contracts[i].VersionCode,
          'عنوان': this.contracts[i].Title,
          'عنوان مختصر': this.contracts[i].ShortTitle,
          'وضعیت': this.contracts[i].IsActive,
          'خدمات': this.services.filter(v2 => v2.ServiceID === this.contracts[i].Service[0])[0].Name,
          'نوع': this.contracts[i].Kind,
          'شماره قرارداد': this.contracts[i].Number,
          'موضوع قرارداد': this.contracts[i].Subject,
          'تاریخ انعقاد': this.contracts[i].DeclareDate,
          'تاریخ شروع': this.contracts[i].StartDate,
          'دوره تضمین': this.contracts[i].GuaranteePeriod,
          'واحد سازمانی': this.contracts[i].Unit.Title,
          'گروه متولی': this.contracts[i].SubUnit.Title,
          'واحد پول': this.contracts[i].Currency.Title,
          'کارشناس دفتر مدیریت پروژه': this.contracts[i].PMOExpert.Title,
          'مدیر پروژه': this.contracts[i].PM.Title,
          'طرف قرارداد': this.contracts[i].Contractor.Title,
          'کارفرما': this.contracts[i].RaiPart.Title,
          'مسئول اطلاعات': this.contracts[i].Importer.Title,
          'آیین نامه ها و استاندارد ها': this.contracts[i].Standards,
          'ناحیه ها': null,
          'مبلغ قرارداد': this.contracts[i].Cost,
          'تاریخ پایان': this.contracts[i].FinishDate,
          'برآورد مبالغ خدمات': null,
          'درصد پیشرفت': null,
          'محاسبات درصد پیشرفت': null,
          'مالی': null,
          'تحویل شدنی ها': null,
          'محل تامین اعتبار': null,
        };
        this.contracts[i].ServiceCosLast.filter(v => {
          serviceCostLastData[i] = {
            'خدمات': this.services.filter(v2 => v2.ServiceID === v.Service)[0].Name,
            'مبلغ': v.Cost,
          };
        });
        this.contracts[i].LastPC.filter(v => {
          pcLastData[i] = {
            'خدمات': this.services.filter(v2 => v2.ServiceID === v.Service)[0].Name,
            'تاریخ': v.Date,
            'پیشرفت برنامه ای': v.PlanPC,
            'پیشرفت واقعی': v.ActPC,
          };
        });
        financialLastData[i] = {
          'TotalGrossPayment': this.contracts[i].FinancialLast.TotalGrossPayment,
          'TotalNetPayment': this.contracts[i].FinancialLast.TotalNetPayment,
          'TotalGrossRequest': this.contracts[i].FinancialLast.TotalGrossRequest,
          'TotalNetRequest': this.contracts[i].FinancialLast.TotalNetRequest,
          'TotalInvoice': this.contracts[i].FinancialLast.TotalInvoice,
          'FinancialProgress': this.contracts[i].FinancialLast.FinancialProgress,
          'PaymentDeviation': this.contracts[i].FinancialLast.PaymentDeviation,
          'LastPaymentDate': this.contracts[i].FinancialLast.LastPaymentDate,
          'LastRequestDate': null,
        };
        this.contracts[i].DelLast.filter(v => {
          delLastData[i] = {
            'تحویل شدنی': v.Del,
            'عملیات': v.Op,
            'تعداد کل': v.TotalVal,
            'مجموع برنامه ای': v.PlanSum,
            'مجموع واقعی': v.ActSum,
          };
        });
        this.contracts[i].AssignedCostResesLast.filter(v => {
          assignedCostResesLastData[i] = {
            'محل تامین اعتبار': v.ResID,
            'مبلغ': v.Cost,
          };
        });
        this.contracts[i].PCCalcsLast.filter(v => {
          pcCalcsLastData[i] = {
            'خدمات': this.services.filter(v2 => v2.ServiceID === v.Service)[0].Name,
            'تاریخ': v.Date,
            'انحراف پیشرفت': v.ProgressDeviation,
            'انحراف زمانی': v.TimeDeviation,
            'سرعت 30 روزه': v.Speed30D,
            'سرعت 90 روزه': v.Speed90D,
            'سرعت تا اتمام': v.Speed4Ontime,
            'پیش بینی 30 روزه': v.FinishTimeForecast,
            'پیش بینی 90 روزه': v.FinishTimeForecast90,
          };
        });
        mainData[i]['برآورد مبالغ خدمات'] = JSON.stringify(serviceCostLastData[i]);
        mainData[i]['درصد پیشرفت'] = JSON.stringify(pcLastData[i]);
        mainData[i]['مالی'] = JSON.stringify(financialLastData[i]);
        mainData[i]['تحویل شدنی ها'] = JSON.stringify(delLastData[i]);
        mainData[i]['محل تامین اعتبار'] = JSON.stringify(assignedCostResesLastData[i]);
        mainData[i]['محاسبات درصد پیشرفت'] = JSON.stringify(pcCalcsLastData[i]);
      }
      console.log(mainData);
      if (this.types[0].isChecked) {
        this.excelService.exportMultipleAsExcelFile([mainData], this.types[0].Name, titles);
      }
    }
    if (this.types[1].isChecked) {
      console.log(this.contracts);
      console.log('ajab');
      const mainData = [];
      const titles = ['سوابق اطلاعات پایه'];
      for (let i = 0; i < this.contracts.length; i++) {
        this.contractService.getBasics(this.contracts[i].Id).subscribe(
          (basics: BasicModel[]) => {
            console.log(basics);
            for (let j = 0; j < basics.length; j++) {
              mainData[i] = {
                'کد قرارداد': this.contracts[i].Id,
                'آی دی': basics[j].Id,
                'کد ورژن': basics[j].VersionCode,
                'عنوان': basics[j].Title,
                'عنوان مختصر': basics[j].ShortTitle,
                'خدمات': basics[j].Service.Id,
                'نوع قرارداد': basics[j].Kind,
                'شماره قرارداد': basics[j].Number,
                'موضوع قرارداد': basics[j].Subject,
                'تاریخ شروع': basics[j].StartDate,
                'دوره تضمینی': basics[j].GuaranteePeriod,
                'واحد سازمانی': basics[j].Unit,
                'گروه متولی': basics[j].SubUnit,
                'واحد پول': basics[j].Currency.Id,
                'کارشناس دفتر مدیریت پروژه': basics[j].PMOExpert.Id,
                'مدیر پروژه': basics[j].PM.Id,
                'طرف قرارداد': basics[j].Contractor.Id,
                'کارفرما': basics[j].RaiPart.Id,
                'مسئول اطلاعات': basics[j].Importer.Id,
                'ناحیه': basics[j].Zone.Id,
                'آیین نامه ها و استاندارد ها': basics[j].Standards,
              };
              if (j === basics.length - 1 && i === this.contracts.length - 1) {
                console.log(mainData);
                this.excelService.exportMultipleAsExcelFile([mainData], this.types[1].Name, titles);
              }
            }
          }
        );
      }
    }
    if (this.types[2].isChecked) {
      const mainData = [];
      const titles = ['مبالغ قرارداد'];
      for (let i = 0; i < this.contracts.length; i++) {
        this.contractService.getAllCosts(this.contracts[i].Id).subscribe(
          (costs: { ID, Cost, DDate, EqCost }[]) => {
            console.log(costs);
            for (let j = 0; j < costs.length; j++) {
              mainData[i] = {
                'کد قرارداد': this.contracts[i].Id,
                'آی دی': costs[j].ID,
                'تاریخ انعقاد': costs[j].DDate,
                'مبلغ': costs[j].Cost,
                'مبلغ ارزی': costs[j].EqCost,
              };
              if (j === costs.length - 1 && i === this.contracts.length - 1) {
                console.log(mainData);
                this.excelService.exportMultipleAsExcelFile([mainData], this.types[2].Name, titles);
              }
            }
          }
        );
      }
    }
    if (this.types[3].isChecked) {
      const mainData = [];
      const titles = ['تاریخ های پایان'];
      for (let i = 0; i < this.contracts.length; i++) {
        this.contractService.getAllFinishDates(this.contracts[i].Id).subscribe(
          (finishDates: { ID, DDate, FinishDate }[]) => {
            console.log(finishDates);
            for (let j = 0; j < finishDates.length; j++) {
              mainData[i] = {
                'کد قرارداد': this.contracts[i].Id,
                'آی دی': finishDates[j].ID,
                'تاریخ انعقاد': finishDates[j].DDate,
                'تاریخ پایان': finishDates[j].FinishDate,
              };
              if (j === finishDates.length - 1 && i === this.contracts.length - 1) {
                console.log(mainData);
                this.excelService.exportMultipleAsExcelFile([mainData], this.types[3].Name, titles);
              }
            }
          }
        );
      }
    }
    if (this.types[4].isChecked) {
      const mainData = [];
      const titles = ['محل های تامین اعتبار'];
      for (let i = 0; i < this.contracts.length; i++) {
        this.contractService.getContractAssignedCostReses(this.contracts[i].Id).subscribe(
          (assignedCostReses: ContractAssignedCostResModel[]) => {
            console.log(assignedCostReses);
            for (let j = 0; j < assignedCostReses.length; j++) {
              mainData[i] = {
                'کد قرارداد': this.contracts[i].Id,
                'آی دی': assignedCostReses[j].Id,
                'تاریخ انعقاد': assignedCostReses[j].DDate,
                'مبلغ': assignedCostReses[j].CostCode.Cost,
                'محل تامین اعتبار': assignedCostReses[j].CostResourse.Id,
              };
              if (j === assignedCostReses.length - 1 && i === this.contracts.length - 1) {
                console.log(mainData);
                this.excelService.exportMultipleAsExcelFile([mainData], this.types[4].Name, titles);
              }
            }
          }
        );
      }
    }
    if (this.types[5].isChecked) {
      const mainData = [];
      const titles = ['برآورد مبالغ خدمات'];
      for (let i = 0; i < this.contracts.length; i++) {
        this.contractService.getAllServiceCosts(this.contracts[i].Id).subscribe(
          (serviceCosts: { ID, CostCode, DDate, Service: { ID, Title }, Cost }[]) => {
            console.log(serviceCosts);
            for (let j = 0; j < serviceCosts.length; j++) {
              mainData[i] = {
                'کد قرارداد': this.contracts[i].Id,
                'آی دی': serviceCosts[j].ID,
                'تاریخ انعقاد': serviceCosts[j].DDate,
                'مبلغ': serviceCosts[j].Cost,
                'خدمات': serviceCosts[j].Service.ID,
              };
              if (j === serviceCosts.length - 1 && i === this.contracts.length - 1) {
                console.log(mainData);
                this.excelService.exportMultipleAsExcelFile([mainData], this.types[5].Name, titles);
              }
            }
          }
        );
      }
    }
    if (this.types[6].isChecked) {
      const mainData = [];
      const titles = ['کلیات جریان های نقدینگی'];
      for (let i = 0; i < this.contracts.length; i++) {
        this.contractService.getAllCashFlowPlansProp(this.contracts[i].Id).subscribe(
          (cashFlowPlansProps: { ID, Cost, DDate, FinishDate }[]) => {
            console.log(cashFlowPlansProps);
            for (let j = 0; j < cashFlowPlansProps.length; j++) {
              mainData[i] = {
                'کد قرارداد': this.contracts[i].Id,
                'آی دی': cashFlowPlansProps[j].ID,
                'تاریخ انعقاد': cashFlowPlansProps[j].DDate,
                'مبلغ': cashFlowPlansProps[j].Cost,
                'تاریخ پایان': cashFlowPlansProps[j].FinishDate,
              };
              if (j === cashFlowPlansProps.length - 1 && i === this.contracts.length - 1) {
                console.log(mainData);
                this.excelService.exportMultipleAsExcelFile([mainData], this.types[6].Name, titles);
              }
            }
          }
        );
      }
    }
    if (this.types[7].isChecked) {
      const mainData = [];
      const titles = ['ریز جریان های نقدینگی'];
      for (let i = 0; i < this.contracts.length; i++) {
        this.contractService.getAllOfCashFlowPlans(this.contracts[i].Id).subscribe(
          (cashFlowPlans: { ID, cashFlowPlansPropCode, Date, Cost }[]) => {
            console.log(cashFlowPlans);
            for (let j = 0; j < cashFlowPlans.length; j++) {
              mainData[i] = {
                'کد قرارداد': this.contracts[i].Id,
                'آی دی': cashFlowPlans[j].ID,
                'تاریخ': cashFlowPlans[j].Date,
                'مبلغ': cashFlowPlans[j].Cost,
                'آی دی جریان نقدینگی': cashFlowPlans[j].cashFlowPlansPropCode,
              };
              if (j === cashFlowPlans.length - 1 && i === this.contracts.length - 1) {
                console.log(mainData);
                this.excelService.exportMultipleAsExcelFile([mainData], this.types[7].Name, titles);
              }
            }
          }
        );
      }
    }
    if (this.types[8].isChecked) {
      const mainData = [];
      const titles = ['کلیات سری های درصد پیشرفت'];
      for (let i = 0; i < this.contracts.length; i++) {
        this.contractService.getAllPCProps(this.contracts[i].Id).subscribe(
          (pcProps: { ID, Service, DDate, Kind?: string }[]) => {
            console.log(pcProps);
            for (let j = 0; j < pcProps.length; j++) {
              mainData[i] = {
                'کد قرارداد': this.contracts[i].Id,
                'آی دی': pcProps[j].ID,
                'تاریخ انعقاد': pcProps[j].DDate,
                'نوع': pcProps[j].Kind,
                'خدمات': pcProps[j].Service.results[0],
              };
              if (j === pcProps.length - 1 && i === this.contracts.length - 1) {
                console.log(mainData);
                this.excelService.exportMultipleAsExcelFile([mainData], this.types[8].Name, titles);
              }
            }
          }
        );
      }
    }
    if (this.types[9].isChecked) {
      const mainData = [];
      const titles = ['ریز سری های درصد یپشرفت'];
      for (let i = 0; i < this.contracts.length; i++) {
        this.contractService.getAllOfPCsByPCProp(this.contracts[i].Id).subscribe(
          (pcs: { ID, PCProp, Date, PC }[]) => {
            console.log(pcs);
            for (let j = 0; j < pcs.length; j++) {
              mainData[i] = {
                'کد قرارداد': this.contracts[i].Id,
                'آی دی': pcs[j].ID,
                'تاریخ': pcs[j].Date,
                'کد پی سی پراپ': pcs[j].PCProp,
                'درد پیشرفت': pcs[j].PC,
              };
              if (j === pcs.length - 1 && i === this.contracts.length - 1) {
                console.log(mainData);
                this.excelService.exportMultipleAsExcelFile([mainData], this.types[9].Name, titles);
              }
            }
          }
        );
      }
    }
    if (this.types[10].isChecked) {
      const mainData = [];
      const titles = ['شاخص های محاسباتی درصد پیشرفت'];
      for (let i = 0; i < this.contracts.length; i++) {
        this.contractService.getAllActPCCalcs(this.contracts[i].Id).subscribe(
          (actPCCalcs: { ID, PCRelationId, PCCodeId, Speed30D, Speed90D, TimeDeviation, ProgressDeviation, Speed4Ontime, FinishTimeForecast_Speed30D, FinishTimeForecast_Speed90D0, PlanPC, SuitablePlanPropId }[]) => {
            console.log(actPCCalcs);
            for (let j = 0; j < actPCCalcs.length; j++) {
              mainData[i] = {
                'کد قرارداد': this.contracts[i].Id,
                'آی دی': actPCCalcs[j].ID,
                'ارتباط PC': actPCCalcs[j].PCRelationId.results[0],
                'کد درصد پیشرفت': actPCCalcs[j].PCCodeId,
                'پلن سودبل': actPCCalcs[j].SuitablePlanPropId,
                'درصد پیشرفت برنامه ای': actPCCalcs[j].PlanPC,
                'انحراف پیشرفت': actPCCalcs[j].ProgressDeviation,
                'سرعت 30 روزه': actPCCalcs[j].Speed30D,
                'سرعت 90 روزه': actPCCalcs[j].Speed90D,
                'انحراف زمانی': actPCCalcs[j].TimeDeviation,
                'سرعت تا اتمام': actPCCalcs[j].Speed4Ontime,
                'پیش بینی با 30 روزه تا اتمام': actPCCalcs[j].FinishTimeForecast_Speed30D,
                'پیش بینی با 90 روزه تا اتمام': actPCCalcs[j].FinishTimeForecast_Speed90D0,
              };
              if (j === actPCCalcs.length - 1 && i === this.contracts.length - 1) {
                console.log(mainData);
                this.excelService.exportMultipleAsExcelFile([mainData], this.types[10].Name, titles);
              }
            }
          }
        );
      }
    }
    if (this.types[11].isChecked) {
      const mainData = [];
      const titles = ['عناوین تحویل شدنی ها'];
      for (let i = 0; i < this.contracts.length; i++) {
        this.contractService.getAllDelItems(this.contracts[i].Id).subscribe(
          (delItems: { ID, Deliverable: { ID, Title }, OperationType: { ID, Title } }[]) => {
            console.log(delItems);
            for (let j = 0; j < delItems.length; j++) {
              mainData[i] = {
                'کد قرارداد': this.contracts[i].Id,
                'آی دی': delItems[j].ID,
                'تحویل شدنی': delItems[j].Deliverable.ID,
                'نوع عملیات': delItems[j].OperationType.ID,
              };
              if (j === delItems.length - 1 && i === this.contracts.length - 1) {
                console.log(mainData);
                this.excelService.exportMultipleAsExcelFile([mainData], this.types[11].Name, titles);
              }
            }
          }
        );
      }
    }
    if (this.types[12].isChecked) {
      const mainData = [];
      const titles = ['کلیات سری های تحویل شدنی ها'];
      for (let i = 0; i < this.contracts.length; i++) {
        this.contractService.getAllDelProps(this.contracts[i].Id).subscribe(
          (delProps: { ID, DelItem, Kind }[]) => {
            console.log(delProps);
            for (let j = 0; j < delProps.length; j++) {
              mainData[i] = {
                'کد قرارداد': this.contracts[i].Id,
                'آی دی': delProps[j].ID,
                'دل آیتم آی دی': delProps[j].DelItem,
                'نوع': delProps[j].Kind,
              };
              if (j === delProps.length - 1 && i === this.contracts.length - 1) {
                console.log(mainData);
                this.excelService.exportMultipleAsExcelFile([mainData], this.types[12].Name, titles);
              }
            }
          }
        );
      }
    }
    if (this.types[13].isChecked) {
      const mainData = [];
      const titles = ['ریز سری های تحویل شدنی ها'];
      for (let i = 0; i < this.contracts.length; i++) {
        this.contractService.getDels(this.contracts[i].Id).subscribe(
          (dels: { ID, DelPropsRev, Date, Zone, Value }[] = []) => {
            console.log(dels);
            for (let j = 0; j < dels.length; j++) {
              mainData[i] = {
                'کد قرارداد': this.contracts[i].Id,
                'آی دی': dels[j].ID,
                'دل پراو رو آی دی': dels[j].DelPropsRev,
                'تاریخ': dels[j].Date,
                'ناحیه': dels[j].Zone,
                'مقدار': dels[j].Value,
              };
              if (j === dels.length - 1 && i === this.contracts.length - 1) {
                console.log(mainData);
                this.excelService.exportMultipleAsExcelFile([mainData], this.types[13].Name, titles);
              }
            }
          }
        );
      }
    }
    if (this.types[14].isChecked) {
      const mainData = [];
      const titles = ['درخواست های مالی'];
      for (let i = 0; i < this.contracts.length; i++) {
        this.contractService.getAllFinancialRequests(this.contracts[i].Id).subscribe(
          (financialRequests: { ID, FiscalYear, FinancialRequestTypeId, LetterDate, Date, VoucherNum, VoucherDescription, GrossAmount, Deposits, PayableInsurance, Tax, PrepaidDepreciation, MaterialPrepaidDepreciation, Fine, TotalDeductions, VAT, EmployerInsurance, TreasuryBillsProfit, NetAmount, OtherDeductions }[]) => {
            console.log(financialRequests);
            for (let j = 0; j < financialRequests.length; j++) {
              mainData[i] = {
                'کد قرارداد': this.contracts[i].Id,
                'آی دی': financialRequests[j].ID,
                'سال مالی': financialRequests[j].FiscalYear,
                'نوع درخواست': financialRequests[j].FinancialRequestTypeId,
                'تاریخ نامه': financialRequests[j].LetterDate,
                'تاریخ': financialRequests[j].Date,
                'واچر نامبر': financialRequests[j].VoucherNum,
                'GrossAmount': financialRequests[j].GrossAmount,
                'Deposits': financialRequests[j].Deposits,
                'PayableInsurance': financialRequests[j].PayableInsurance,
                'Tax': financialRequests[j].Tax,
                'PrepaidDepreciation': financialRequests[j].PrepaidDepreciation,
                'MaterialPrepaidDepreciation': financialRequests[j].MaterialPrepaidDepreciation,
                'Fine': financialRequests[j].Fine,
                'OtherDeductions': financialRequests[j].OtherDeductions,
                'TotalDeductions': financialRequests[j].TotalDeductions,
                'VAT': financialRequests[j].VAT,
                'EmployerInsurance': financialRequests[j].EmployerInsurance,
                'TreasuryBillsProfit': financialRequests[j].TreasuryBillsProfit,
                'NetAmount': financialRequests[j].NetAmount,
              };
              if (j === financialRequests.length - 1 && i === this.contracts.length - 1) {
                console.log(mainData);
                this.excelService.exportMultipleAsExcelFile([mainData], this.types[14].Name, titles);
              }
            }
          }
        );
      }
    }
    if (this.types[15].isChecked) {
      const mainData = [];
      const titles = ['پرداخت های مالی'];
      for (let i = 0; i < this.contracts.length; i++) {
        this.contractService.getAllFinancialPayments(this.contracts[i].Id).subscribe(
          (financialRequests: { ID, FiscalYear, FinancialRequestTypeId, LetterDate, Date, VoucherNum, VoucherDescription, GrossAmount, Deposits, PayableInsurance, Tax, PrepaidDepreciation, MaterialPrepaidDepreciation, Fine, TotalDeductions, VAT, EmployerInsurance, TreasuryBillsProfit, NetAmount, OtherDeductions, CostResource, FinancialPaymentType }[]) => {
            console.log(financialRequests);
            for (let j = 0; j < financialRequests.length; j++) {
              mainData[i] = {
                'کد قرارداد': this.contracts[i].Id,
                'آی دی': financialRequests[j].ID,
                'سال مالی': financialRequests[j].FiscalYear,
                'نوع درخواست': financialRequests[j].FinancialRequestTypeId,
                'تاریخ نامه': financialRequests[j].LetterDate,
                'تاریخ': financialRequests[j].Date,
                'واچر نامبر': financialRequests[j].VoucherNum,
                'GrossAmount': financialRequests[j].GrossAmount,
                'Deposits': financialRequests[j].Deposits,
                'PayableInsurance': financialRequests[j].PayableInsurance,
                'Tax': financialRequests[j].Tax,
                'PrepaidDepreciation': financialRequests[j].PrepaidDepreciation,
                'MaterialPrepaidDepreciation': financialRequests[j].MaterialPrepaidDepreciation,
                'Fine': financialRequests[j].Fine,
                'OtherDeductions': financialRequests[j].OtherDeductions,
                'TotalDeductions': financialRequests[j].TotalDeductions,
                'VAT': financialRequests[j].VAT,
                'EmployerInsurance': financialRequests[j].EmployerInsurance,
                'TreasuryBillsProfit': financialRequests[j].TreasuryBillsProfit,
                'NetAmount': financialRequests[j].NetAmount,
                'CostResource': financialRequests[j].CostResource,
                'FinancialPaymentType': financialRequests[j].FinancialPaymentType,
              };
              if (j === financialRequests.length - 1 && i === this.contracts.length - 1) {
                console.log(mainData);
                this.excelService.exportMultipleAsExcelFile([mainData], this.types[15].Name, titles);
              }
            }
          }
        );
      }
    }
    if (this.types[16].isChecked) {
      const mainData = [];
      const titles = ['ذی نفعان'];
      for (let i = 0; i < this.contracts.length; i++) {
        this.contractService.getContractStakeHolders(this.contracts[i].Id).subscribe(
          (stakeHolders: ContractStakeHolderModel[]) => {
            console.log(stakeHolders);
            for (let j = 0; j < stakeHolders.length; j++) {
              mainData[i] = {
                'کد قرارداد': this.contracts[i].Id,
                'آی دی': stakeHolders[j].Id,
                'تاریخ انعقاد': stakeHolders[j].DDate,
                'نقش': stakeHolders[j].Role,
                'نام': stakeHolders[j].AgentName,
                'سمت': stakeHolders[j].AgentPosition.Id,
                'تلفن': stakeHolders[j].PhoneNumber,
                'آدرس': stakeHolders[j].LocationAddress,
                'ایمیل': stakeHolders[j].Email,
                'اصلی': stakeHolders[j].IsPillar,
              };
              if (j === stakeHolders.length - 1 && i === this.contracts.length - 1) {
                console.log(mainData);
                this.excelService.exportMultipleAsExcelFile([mainData], this.types[16].Name, titles);
              }
            }
          }
        );
      }
    }
    if (this.types[17].isChecked) {
      const mainData = [];
      const titles = ['نسخه های قرارداد'];
      for (let i = 0; i < this.contracts.length; i++) {
        this.contractService.getAllVersions(this.contracts[i].Id).subscribe(
          (versions: { ID, DDate, Basic, CostCode: { ID, Cost }, FinishDateCode: { ID, Date }, PCRelation, DelPropsRev }[]) => {
            console.log(versions);
            for (let j = 0; j < versions.length; j++) {
              mainData[i] = {
                'کد قرارداد': this.contracts[i].Id,
                'آی دی': versions[j].ID,
                'تاریخ انعقاد': versions[j].DDate,
                'کد اطلاعات پایه': versions[j].Basic,
                'تاریخ پایان': versions[j].FinishDateCode.Date,
                'PCRelation': versions[j].PCRelation.toString(),
                'DelPropsRev': versions[j].DelPropsRev.toString(),
              };
              if (j === versions.length - 1 && i === this.contracts.length - 1) {
                console.log(mainData);
                this.excelService.exportMultipleAsExcelFile([mainData], this.types[17].Name, titles);
              }
            }
          }
        );
      }
    }
  }
}
