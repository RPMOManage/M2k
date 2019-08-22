import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { TransferService } from '../../shared/services/transfer.service';
import { OldContractList } from '../../shared/models/transferModels/oldContract.model';
import { UnitsList } from '../../shared/models/units.model';
import { MatDialog } from '@angular/material';
import { TransferDialogComponent } from './transfer-dialog/transfer-dialog.component';
import { ContractServicesList } from '../../shared/models/contractServices.model';
import * as moment from 'jalali-moment';
import { StepFormsDataList } from '../../shared/models/stepFormModels/stepFormsData.model';
import { TransferDataBaseList } from '../../shared/models/transferModels/transferDataBase.model';
import { TransferWeekProgressList } from '../../shared/models/transferModels/transferWeekProgress.model';
import { TransferTempContractList } from '../../shared/models/transferModels/transferTempContract.model';
import { TransferDeliverablesList } from '../../shared/models/transferModels/transferDeliverables.model';
import { StepDeliverablesFormList } from '../../shared/models/stepFormModels/stepDeliverablesForm.model';
import { TransferOperationalIndList } from '../../shared/models/transferModels/transferOperationalInd.model';
import { DeliverablesList } from '../../shared/models/Deliverables.model';
import { OperationTypesList } from '../../shared/models/operationTypes.model';
import { OldContractDBNonProjectList } from '../../shared/models/transferModels/oldContractDBNonProject.model';
import { TransferContractCostTimeTrackingList } from '../../shared/models/transferModels/transferContractCostTimeTracking.model';
import { TransferSelectCostResourceList } from '../../shared/models/transferModels/transferSelectCostResource.model';
import { TransferProcurmentCDBItemsList } from '../../shared/models/transferModels/transferProcurmentCDBItems.model';
import { TransferProcurmentActPlanList } from '../../shared/models/transferModels/transferProcurmentActPlan.model';
import { TransferContractExtensionList } from '../../shared/models/transferModels/transferContractExtension.model';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss']
})
export class TransferComponent implements OnInit {
  transferForm: FormGroup;
  contracts: OldContractList[] = [];
  bContracts: OldContractList[] = [];
  contractsNonProject: OldContractDBNonProjectList[] = [];
  bContractsNonProject: OldContractDBNonProjectList[] = [];
  contractCostTimeTracking: TransferContractCostTimeTrackingList[] = [];
  selectedProjects = [];
  units: UnitsList[] = [];
  contractServices: ContractServicesList[] = [];
  progressBarValue = 0;
  progressBarFirst = false;
  today = {
    en: '',
    fa: ''
  };
  tempContracts: TransferTempContractList[] = [];
  operationalInd: TransferOperationalIndList[] = [];
  deliverables: DeliverablesList[] = [];
  operationTypes: OperationTypesList[] = [];
  switch = false;

  constructor(private _formBuilder: FormBuilder,
              private transferService: TransferService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    // for (let ci = 0; ci < ce.length; ci++) {
    // }
    this.transferService.getDataFromOperational_IndList()
      .subscribe(
        (data: TransferOperationalIndList[]) => {
          this.operationalInd = data;
        }
      );

    this.transferService.getDataFromOperationTypes()
      .subscribe(
        (data: OperationTypesList[]) => this.operationTypes = data
      );

    this.transferService.getDataFromDeliverables()
      .subscribe(
        (data: DeliverablesList[]) => {
          this.deliverables = data;
        }
      );

    // let database: TransferDataBaseList[] = [];
    // let weekProgress: TransferWeekProgressList[] = [];
    // let firstDate = '';
    // let lastDate = '';
    this.transferService.getTodayDateFromContextInfo().subscribe(
      (today) => {
        this.today.en = today;
        const mainDate = moment(this.transferService.todayData, 'YYYY/M/D');
        // mainDate = moment('2017-07-09', 'YYYY/M/D');
        this.today.fa = mainDate.format('jYYYY/jM/jD');
      }
    );

    // this.transferService.getDataFromDataBaseList(94111212138)
    //   .subscribe(
    //     (d1: TransferDataBaseList[]) => {
    //       database = d1;
    //       let tempData = database.findIndex((v, i) => {
    //         if (v.act !== 1) {
    //           if (i === database.length - 1) {
    //             return true;
    //           }
    //         }
    //       });
    //       const tempData2 = database.findIndex((v, i) => {
    //         if (v.plan === 1) {
    //           return true;
    //         }
    //       });
    //       if (tempData2 > tempData) {
    //         tempData = tempData2;
    //       }
    //       console.log(database[tempData], tempData, 'tempData');


    //     if (+database[tempData].year < 100) {
    //       firstDate = 1300 + database[0].year + '/' + this.addZeroToMonth(+database[0].month) + '/' + this.switchingMonth(+database[0].month);
    //       lastDate = 1300 + database[tempData].year + '/' + this.addZeroToMonth(+database[tempData].month) + '/' + this.switchingMonth(+database[0].month);
    //     } else {
    //       lastDate = 1400 + (+database[0].year - 100) + '/' + this.addZeroToMonth(+database[0].month) + '/' + this.switchingMonth(+database[0].month);
    //       lastDate = 1400 + (+database[tempData].year - 100) + '/' + this.addZeroToMonth(+database[tempData].month) + '/' + this.switchingMonth(+database[0].month);
    //     }
    //     console.log(lastDate);
    //     const mainDate = this.generateDates(+this.countMon(firstDate, lastDate), firstDate.split('/'), lastDate);
    //     console.log(mainDate);
    //     // lastDate =
    //     this.transferService.getDataFromWeekProgress(94111212138)
    //       .subscribe(
    //         (d2: TransferWeekProgressList[]) => {
    //           weekProgress = d2;
    //           console.log(weekProgress, 'mainDate');
    //         }
    //       );
    //   }
    // );

    this.transferForm = this._formBuilder.group({
      projects: new FormArray([]),
    });

    this.transferService.getAllContractsFromContracts_DB()
      .subscribe(
        (data: OldContractDBNonProjectList[]) => {
          this.contractsNonProject = data;
          this.transferService.getAllContractsFromContract_Cost_Time_Tracking()
            .subscribe(
              (cctt: TransferContractCostTimeTrackingList[]) => {
                this.contractCostTimeTracking = cctt;
                this.transferService.getAllContractsFromSelectCostResource()
                  .subscribe(
                    (scr: TransferSelectCostResourceList[]) => {
                      for (let i = 0; i < this.contractsNonProject.length; i++) {
                        const foundedContract = this.contractCostTimeTracking.filter(v => v.ProjectID === this.contractsNonProject[i].ProjectID);
                        const foundedContractCostResource = scr.filter(v => v.ProjectID === this.contractsNonProject[i].ProjectID);
                        if (foundedContract.length !== 0) {
                          this.contractsNonProject[i].DeclareDate = foundedContract[0].DeclareDate;
                          this.contractsNonProject[i].FinishDate = foundedContract[0].FinishDate;
                          this.contractsNonProject[i].ContractCost = foundedContract[0].ContractCost;
                        }
                        if (foundedContractCostResource.length !== 0) {
                          this.contractsNonProject[i].CostResource_ID = [];
                          for (let cr = 0; cr < foundedContractCostResource.length; cr++) {
                            this.contractsNonProject[i].CostResource_ID.push(foundedContractCostResource[cr].CostSourceID);
                          }
                        }
                      }
                      this.bContractsNonProject = this.contractsNonProject;
                    }
                  );
              }
            );
        }
      );

    this.transferService.getAllContractsFromContractsDB()
      .subscribe(
        (data: OldContractList[]) => {
          this.contracts = data;
          this.bContracts = data;
          this.transferService.getAllDataFromTempContract()
            .subscribe(
              (tcData: TransferTempContractList[]) => {
                this.tempContracts = tcData;
                for (let i = 0; i < this.tempContracts.length; i++) {
                  const foundedTempContract = this.contracts.findIndex(v => +v.ProjectID === +this.tempContracts[i].oldCode);
                  const foundedTempContractNonProject = this.contractsNonProject.findIndex(v => v.ProjectID === this.tempContracts[i].oldCode);
                  if (foundedTempContractNonProject !== -1) {
                    this.contractsNonProject[foundedTempContractNonProject].TempID = this.tempContracts[i].code;
                  }
                  if (foundedTempContract !== -1) {
                    this.contracts[foundedTempContract].TempID = this.tempContracts[i].code;
                  }
                }
              }
            );
        }
      );

    this.transferService.getContractServices()
      .subscribe(
        (data: ContractServicesList[]) => {
          this.contractServices = data;
        }
      );

    this.transferService.getUnits()
      .subscribe(
        (data: UnitsList[]) => {
          this.units = data;
          // console.log(data, this.units);
        }
      );
  }

  onChangeSwitch(e) {
    this.selectedProjects = [];
    this.switch = !this.switch;
    if (this.switch) {
      this.contracts = [];
      this.contractsNonProject = this.bContractsNonProject;
    } else {
      this.contractsNonProject = [];
      this.contracts = this.bContracts;
    }
  }

  onShowPopup(id: number) {
    const dialogRef = this.dialog.open(TransferDialogComponent, {
      width: '1200px',
      height: '500px',
      data: {
        data: this.contracts[id],
      }
    });
  }

  onTransfer() {
    if (this.progressBarValue === 100) {
      this.progressBarValue = 0;
    }
    if (this.switch) {
      this.onNonProjectTransfer();
    } else {
      this.onProjectTransfer();
    }
  }

  onNonProjectTransfer() {
    const projects: OldContractDBNonProjectList[] = [];
    const mainData = [];
    this.progressBarFirst = true;
    for (let i = 0; i < this.selectedProjects.length; i++) {
      projects.push(
        this.contractsNonProject[this.selectedProjects[i]]
      );
      mainData.push({
        ImporterId: 'Imp' + projects[i].McId,
        PMOExpertId: this.units.filter(v => v.Id === projects[i].Unit)[0].DefaultPMOExpertId_User,
        ProjectId: projects[i].ProjectID
      });
      const stepFormsData = new StepFormsDataList();
      stepFormsData.contractsForm = {};
      stepFormsData.cashFlowPlanForm = {};
      stepFormsData.cashFlowPlanForm.data = [];
      stepFormsData.cashFlowPlanForm.date = [];
      stepFormsData.assignedCostResourcesForm = {};
      stepFormsData.assignedCostResourcesForm.CostResources = [];
      stepFormsData.assignedCostResourcesForm.hobbies = [];
      stepFormsData.contractsForm.FullTitle_Contract = projects[i].Title;
      stepFormsData.contractsForm.ShortTitle_Contract = projects[i].Title;
      stepFormsData.contractsForm.Number_Contract = projects[i].ContractNumber;
      stepFormsData.contractsForm.Subject_Contract = projects[i].Content;
      let startDate = moment(projects[i].StartDate, 'YYYY/M/D');
      startDate.add(1, 'day');
      startDate = <any>startDate.format('jYYYY/jM/jD');
      stepFormsData.contractsForm.StartDate_Contract = <any>startDate;
      let finishDate = moment(projects[i].FinishDate, 'YYYY/M/D');
      finishDate.add(1, 'day');
      finishDate = <any>finishDate.format('jYYYY/jM/jD');
      stepFormsData.contractsForm.FinishDate_Contract = <any>finishDate;
      let declareDate = moment(projects[i].DeclareDate, 'YYYY/M/D');
      declareDate.add(1, 'day');
      declareDate = <any>declareDate.format('jYYYY/jM/jD');
      stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs = <any>declareDate;
      stepFormsData.contractsForm.GuaranteePeriod = null;
      stepFormsData.contractsForm.Costs = [];
      stepFormsData.contractsForm.Id_Unit = this.units.filter(v => v.Id === projects[i].Unit)[0].Id;
      stepFormsData.contractsForm.Id_SubUnit = +projects[i].SubUnit_ID;
      const projectServiecs = projects[i].DefaultServices.split(';');
      stepFormsData.contractsForm.ContractNatureId = [];
      for (let cs = 0; cs < this.contractServices.length; cs++) {
        if (projectServiecs.findIndex(v => v === this.contractServices[cs].Id) !== -1) {
          stepFormsData.contractsForm.ContractNatureId.push(true);
        } else {
          stepFormsData.contractsForm.ContractNatureId.push(false);
        }
      }
      stepFormsData.contractsForm.Id_ContractType = '';
      stepFormsData.contractsForm.SignatoryRaiParts = '';
      let id_Currency = 'IRR';
      let currency_Exchange = 1;
      if (projects[i].CurrencyName === 'یورو') {
        id_Currency = 'EUR';
        currency_Exchange = 4800;
      }
      if (projects[i].CurrencyName === 'دلار') {
        id_Currency = 'USD';
        currency_Exchange = 4200;
      }
      if (projects[i].CurrencyName === 'درهم') {
        id_Currency = 'AED';
        currency_Exchange = 1100;
      }
      if (id_Currency === 'IRR') {
        stepFormsData.contractsForm.Cost_EqCosts = null;
        stepFormsData.contractsForm.Cost_Costs = +projects[i].ContractCost;
      } else {
        stepFormsData.contractsForm.Cost_Costs = null;
        stepFormsData.contractsForm.Cost_EqCosts = +projects[i].ContractCost;
      }
      stepFormsData.contractsForm.Id_Currency = id_Currency;
      stepFormsData.contractsForm.PMOExpertId_User = mainData[i].PMOExpertId;
      stepFormsData.contractsForm.PMId_User = {Id: null, Name: null};
      stepFormsData.contractsForm.Id_Contractor = '';
      stepFormsData.contractsForm.Id_Importer = mainData[i].ImporterId;
      stepFormsData.contractsForm.Standards_Contract = '';
      // console.log(this.today.fa);
      for (let acr = 0; acr < projects[i].CostResource_ID.length; acr++) {
        stepFormsData.assignedCostResourcesForm.CostResources.push(projects[i].CostResource_ID[acr]);
        if (projects[i].CostResource_ID.length === 1) {
          stepFormsData.assignedCostResourcesForm.hobbies.push(+stepFormsData.contractsForm.Cost_Costs);
        } else {
          stepFormsData.assignedCostResourcesForm.hobbies.push(null);
        }
        // }
      }
      this.transferService.getDataFromProcurement_CDB_Items(projects[i].ProjectID)
        .subscribe(
          (data: TransferProcurmentCDBItemsList[]) => {
            const procurementCDBItems: TransferProcurmentCDBItemsList[] = data;
            console.log(data, 'PRO');
            stepFormsData.deliverablesForm = [];
            // const deliverablesId = Array.from(new Set(data.map((item: TransferProcurmentCDBItemsList) => item.Del_ID)));
            // let deliverableZones = Array.from(new Set(data.map((item: TransferDeliverablesList) => item.Zone)));
            for (let serv = 0; serv < projectServiecs.length; serv++) {
              stepFormsData.deliverablesForm[serv] = {};
              stepFormsData.deliverablesForm[serv].zone_deliverables = [];
              stepFormsData.deliverablesForm[serv].operationTypes_deliverables = [];
              stepFormsData.deliverablesForm[serv].name_Deliverable = [];
              stepFormsData.deliverablesForm[serv].date = [];
              stepFormsData.deliverablesForm[serv].data = [];
              stepFormsData.deliverablesForm[serv].value_Deliverable = [];
              stepFormsData.deliverablesForm[serv].serviceId = projectServiecs[serv];


              this.transferService.getDataFromProcurement_Schedul(projects[i].ProjectID)
                .subscribe(
                  (plan: TransferProcurmentActPlanList[]) => {
                    this.transferService.getDataFromProcurement_Actual(projects[i].ProjectID)
                      .subscribe(
                        (act: TransferProcurmentActPlanList[]) => {
                          const planDates = plan.map(v => {
                            return {
                              Date: v.Date,
                              CDB_ID: v.CDB_ID
                            };
                          });
                          const actDates = act.map(v => {
                            return {
                              Date: v.Date,
                              CDB_ID: v.CDB_ID
                            };
                          });
                          const finalDates = planDates.concat(actDates);
                          console.log(finalDates);
                          // const ff2 = Array.from(new Set(finalDates.map(v => v.Date)));
                          // const ff2Persian = Array.from(new Set(finalDates.map(v => (moment(v.Date, 'YYYY/M/D')).format('jYYYY/jM/jD'))));
                          // const ff = Array.from(new Set(finalDates.map(v => v.Date)));
                          // const finalDates3 = finalDates.filter((v, index) => v.Date === ff[index]);
                          // console.log(finalDates3, 'ajabz');
                          // finalDates = Array.from(new Set(finalDates.map((item) => {
                          //   return {
                          //     Date: item.Date,
                          //     CDB_ID: item.CDB_ID
                          //   };
                          // }))).sort((a, b) => +new Date(a.Date) - +new Date(b.Date));
                          //
                          // const finalDates2 = Array.from(new Set(finalDates.map((item) => {
                          //   return {
                          //     Date: (moment(item.Date, 'YYYY/M/D')).format('jYYYY/jM/jD'),
                          //     CDB_ID: item.CDB_ID
                          //   };
                          // }))).sort((a, b) => +new Date(a.Date) - +new Date(b.Date));
                          // console.log(finalDates);
                          // console.log(finalDates2);
                          for (let del = 0; del < procurementCDBItems.length; del++) {
                            const finalDateWithCDB = act.filter(v => v.CDB_ID === procurementCDBItems[del].CDB_ID);
                            const finalDateWithCDBPlan = plan.filter(v => v.CDB_ID === procurementCDBItems[del].CDB_ID);
                            const finalDateCDB = finalDateWithCDB.concat(finalDateWithCDBPlan).sort((a, b) => +new Date(a.Date) - +new Date(b.Date));
                            const ff2 = Array.from(new Set(finalDateCDB.map(v => v.Date)));
                            const ff2Persian = Array.from(new Set(finalDateCDB.map(v => (moment(v.Date, 'YYYY/M/D')).add(1, 'day').format('jYYYY/jM/jD'))));
                            console.log(ff2Persian, 'ff2Persian');
                            stepFormsData.deliverablesForm[serv].date[del] = [];
                            let finalDel = procurementCDBItems[del].Del_ID;
                            let finalOp = procurementCDBItems[del].Op_ID;
                            if (finalDel === null) {
                              if (procurementCDBItems[del].Procur_ID_Del_ID === null) {
                                finalDel = null;
                                finalOp = null;
                                alert('Error: Del_ID is empty in both Tables!!!');
                              } else {
                                finalDel = procurementCDBItems[del].Procur_ID_Del_ID;
                                finalOp = procurementCDBItems[del].Procur_ID_Op_ID;
                              }
                            }
                            const selectedDeliverable = this.deliverables.filter(v => v.Id === finalDel)[0];
                            stepFormsData.deliverablesForm[serv].zone_deliverables.push(
                              null
                            );
                            stepFormsData.deliverablesForm[serv].operationTypes_deliverables.push({
                              Id: finalOp,
                              Name: this.operationTypes.filter(v => v.Id === finalOp)[0].Name
                            });
                            stepFormsData.deliverablesForm[serv].date[del] = ff2;
                            stepFormsData.deliverablesForm[serv].name_Deliverable.push({
                              Id: finalDel,
                              Name: selectedDeliverable.Name,
                              MeasureUnit: selectedDeliverable.MeasureUnit,
                              PossibleUnitIds: selectedDeliverable.PossibleUnitIds,
                              PossibleOperationTypes_Deliverab: selectedDeliverable.PossibleOperationTypes_Deliverab
                            });
                            stepFormsData.deliverablesForm[serv].value_Deliverable.push(
                              procurementCDBItems[del].Amount
                            );
                            let ddd = [];
                            let dddPlan = [];
                            const mainAct = act.filter(v => v.CDB_ID === procurementCDBItems[del].CDB_ID);
                            const mainPlan = plan.filter(v => v.CDB_ID === procurementCDBItems[del].CDB_ID);
                            console.log(mainAct, mainPlan, 'mainsss plan act ');
                            console.log(finalDates, 'final Dates');
                            for (let mm = 0; mm < ff2.length; mm++) {
                              const selectedMainDelData = mainAct.filter(v => +new Date(v.Date) === +new Date(ff2[mm]));
                              const selectedMainDelDataPlan = mainPlan.filter(v => +new Date(v.Date) === +new Date(ff2[mm]));
                              console.log(selectedMainDelData, 'selected');
                              if (selectedMainDelData.length !== 0) {
                                if (selectedMainDelData[0].Amount !== 0) {
                                  ddd[mm] = selectedMainDelData[0].Amount;
                                } else {
                                  ddd[mm] = null;
                                }
                              } else {
                                ddd[mm] = null;
                              }
                              if (selectedMainDelDataPlan.length !== 0) {
                                if (selectedMainDelDataPlan[0].Amount !== 0) {
                                  dddPlan[mm] = selectedMainDelDataPlan[0].Amount;
                                } else {
                                  dddPlan[mm] = null;
                                }
                              } else {
                                dddPlan[mm] = null;
                              }
                            }
                            // stepFormsData.deliverablesForm[serv].date[del] = ff2Persian;
                            // stepFormsData.deliverablesForm[serv].date = p
                            console.log(ddd, dddPlan);
                            let dddSum = 0;
                            ddd = ddd.map((v, index) => {
                              if (v === null) {
                                return null;
                              } else {
                                if (dddSum === 0) {
                                  dddSum = +v;
                                  return v;
                                } else {
                                  const val = +v - +dddSum;
                                  dddPlanSum = +v;
                                  return val;
                                }
                              }
                            });
                            let dddPlanSum = 0;
                            dddPlan = dddPlan.map((v, index) => {
                              if (v === null) {
                                return null;
                              } else {
                                if (dddPlanSum === 0) {
                                  dddPlanSum = +v;
                                  return v;
                                } else {
                                  const val = +v - +dddPlanSum;
                                  dddPlanSum = +v;
                                  return val;
                                }
                              }
                            });
                            stepFormsData.deliverablesForm[serv].date[del] = ff2Persian;
                            stepFormsData.deliverablesForm[serv].data.push([]);
                            stepFormsData.deliverablesForm[serv].data[del].push(dddPlan);
                            stepFormsData.deliverablesForm[serv].data[del].push(ddd);
                          }


                          // new Json
                          const stepJson = {
                            costTable: {
                              DDate: [],
                              Cost: [],
                              eqCost: []
                            },
                            endDateTable: {
                              DDate: [],
                              EndDate: []
                            },
                            progressTable: {
                              Date: [],
                              Data: []
                            }
                          };
                          const filteredCostTimeTracking = this.contractCostTimeTracking.filter(v => v.ProjectID === projects[i].ProjectID);
                          console.log(filteredCostTimeTracking, projects[i].ProjectID);
                          const costMap = filteredCostTimeTracking.map((v) => {
                            const date = moment(v.DeclareDate, 'YYYY/M/D').add(1, 'day').format('jYYYY/jM/jD').split('/');
                            return {
                              DDate: date[0] + '/' + this.addZeroToMonth(+date[1]) + '/' + this.addZeroToMonth(+date[2]),
                              Cost: v.ContractCost
                            };
                          });

                          const endDateMap = filteredCostTimeTracking.map((v) => {
                            const date = moment(v.DeclareDate, 'YYYY/M/D').add(1, 'day').format('jYYYY/jM/jD').split('/');
                            const fDate = moment(v.FinishDate, 'YYYY/M/D').add(1, 'day').format('jYYYY/jM/jD').split('/');
                            return {
                              DDate: date[0] + '/' + this.addZeroToMonth(+date[1]) + '/' + this.addZeroToMonth(+date[2]),
                              EndDate: fDate[0] + '/' + this.addZeroToMonth(+fDate[1]) + '/' + this.addZeroToMonth(+fDate[2])
                            };
                          });
                          console.log(endDateMap, 'endDateMap');
                          stepJson.costTable.DDate = costMap.map(v => v.DDate).splice(0, 1);
                          if (id_Currency === 'IRR') {
                            stepJson.costTable.Cost = costMap.map(v => v.Cost).splice(0, 1);
                          } else {
                            stepJson.costTable.Cost = costMap.map(v => v.Cost * currency_Exchange).splice(0, 1);
                            stepJson.costTable.eqCost = costMap.map(v => v.Cost).splice(0, 1);
                          }
                          stepJson.endDateTable.DDate = endDateMap.map(v => v.DDate);
                          stepJson.endDateTable.EndDate = endDateMap.map(v => v.EndDate);

                          stepFormsData.newJson = <any>stepJson;
                          const tempJsonData = stepFormsData;
                          console.log(stepFormsData, projects[i].ProjectID, 'contractsForm');
                          this.transferService.getDataFromContextInfo()
                            .subscribe(
                              (DigestValue) => {
                                this.transferService.sendDataJson(DigestValue, mainData[i], tempJsonData)
                                  .subscribe(
                                    (sendDataJsonResult: any) => {
                                      const contractID = sendDataJsonResult.d.ID;
                                      console.log(contractID);
                                      this.transferService.updateDataContractID(DigestValue, contractID).subscribe(
                                        () => {
                                          this.progressBarValue = this.progressBarValue + (100 / this.selectedProjects.length);
                                          if (this.switch) {
                                            const contractIndex = this.contractsNonProject.findIndex(v => v.ProjectID === mainData[i].ProjectId);
                                            this.contractsNonProject[contractIndex].TempID = 'TC' + contractID;
                                          } else {
                                            const contractIndex = this.contracts.findIndex(v => +v.ProjectID === +mainData[i].ProjectId);
                                            this.contracts[contractIndex].TempID = 'TC' + contractID;
                                          }
                                          console.log('success');
                                        }
                                      );
                                    }
                                  );
                              }
                            );


                        }
                      );
                  }
                );
            }
          }
        );
    }
  }

  onProjectTransfer() {
    const projects: OldContractList[] = [];
    const mainData = [];
    console.log(this.contracts);
    this.progressBarFirst = true;
    for (let i = 0; i < this.selectedProjects.length; i++) {
      projects.push(
        this.contracts[this.selectedProjects[i]]
      );
      console.log(i, 'projectID');
      mainData.push({
        ImporterId: 'Imp' + projects[i].McId,
        PMOExpertId: this.units.filter(v => v.Name === projects[i].Unit)[0].DefaultPMOExpertId_User,
        ProjectId: projects[i].ProjectID
      });
      const stepFormsData = new StepFormsDataList();
      stepFormsData.contractsForm = {};
      stepFormsData.cashFlowPlanForm = {};
      stepFormsData.cashFlowPlanForm.data = [];
      stepFormsData.cashFlowPlanForm.date = [];
      stepFormsData.assignedCostResourcesForm = {};
      stepFormsData.assignedCostResourcesForm.CostResources = [];
      stepFormsData.assignedCostResourcesForm.hobbies = [];
      stepFormsData.contractsForm.FullTitle_Contract = projects[i].Title;
      stepFormsData.contractsForm.ShortTitle_Contract = projects[i].Title;
      stepFormsData.contractsForm.Number_Contract = projects[i].ContractNumber;
      stepFormsData.contractsForm.Subject_Contract = projects[i].Content;
      let startDate = moment(projects[i].StartDate, 'YYYY/M/D');
      startDate.add(1, 'day');
      startDate = <any>startDate.format('jYYYY/jM/jD');
      stepFormsData.contractsForm.StartDate_Contract = <any>startDate;
      let finishDate = moment(projects[i].FinishDate, 'YYYY/M/D');
      finishDate.add(1, 'day');
      finishDate = <any>finishDate.format('jYYYY/jM/jD');
      stepFormsData.contractsForm.FinishDate_Contract = <any>finishDate;
      stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs = <any>startDate;
      stepFormsData.contractsForm.GuaranteePeriod = null;
      stepFormsData.contractsForm.Costs = [];
      stepFormsData.contractsForm.Id_Unit = +this.units.filter(v => v.Name === projects[i].Unit)[0].Id.replace('Un', '');
      stepFormsData.contractsForm.Id_SubUnit = +projects[i].SubUnit_ID;
      const projectServiecs = projects[i].DefaultServices.split(';');
      // console.log(projectServiecs);
      stepFormsData.contractsForm.ContractNatureId = [];
      for (let cs = 0; cs < this.contractServices.length; cs++) {
        if (projectServiecs.findIndex(v => v === this.contractServices[cs].Id) !== -1) {
          stepFormsData.contractsForm.ContractNatureId.push(true);
        } else {
          stepFormsData.contractsForm.ContractNatureId.push(false);
        }
      }
      stepFormsData.contractsForm.Id_ContractType = '';
      stepFormsData.contractsForm.SignatoryRaiParts = '';
      let id_Currency = 'IRR';
      let currency_Exchange = 1;
      if (projects[i].CurrencyName === 'یورو') {
        id_Currency = 'EUR';
        currency_Exchange = 4800;
      }
      if (projects[i].CurrencyName === 'دلار') {
        id_Currency = 'USD';
        currency_Exchange = 4200;
      }
      if (projects[i].CurrencyName === 'درهم') {
        id_Currency = 'AED';
        currency_Exchange = 1100;
      }
      if (id_Currency === 'IRR') {
        stepFormsData.contractsForm.Cost_EqCosts = null;
        stepFormsData.contractsForm.Cost_Costs = +projects[i].ContractCost;
      } else {
        stepFormsData.contractsForm.Cost_Costs = null;
        stepFormsData.contractsForm.Cost_EqCosts = +projects[i].ContractCost;
      }
      stepFormsData.contractsForm.Id_Currency = id_Currency;
      stepFormsData.contractsForm.ContractServices = projectServiecs;
      stepFormsData.contractsForm.PMOExpertId_User = mainData[i].PMOExpertId;
      stepFormsData.contractsForm.PMId_User = {Id: null, Name: null};
      stepFormsData.contractsForm.Id_Contractor = +projects[i].ContractorName.replace('Co', '');
      stepFormsData.contractsForm.Id_Importer = +mainData[i].ImporterId.replace('Imp', '');
      stepFormsData.contractsForm.Standards_Contract = '';
      console.log(stepFormsData, 'contractsForm');

      // console.log(this.today.fa);
      // console.log(+this.countMon(stepFormsData.contractsForm.StartDate_Contract, this.today.fa), 'monthes');

      for (let acr = 0; acr < projects[i].CostResource_ID.length; acr++) {
        stepFormsData.assignedCostResourcesForm.CostResources.push(projects[i].CostResource_ID[acr]);
        if (projects[i].CostResource_ID.length === 1) {
          stepFormsData.assignedCostResourcesForm.hobbies.push(+stepFormsData.contractsForm.Cost_Costs);
        } else {
          stepFormsData.assignedCostResourcesForm.hobbies.push(null);
        }
      }

      let database: TransferDataBaseList[] = [];
      let databaseFormProgressPlan2: TransferDataBaseList[] = [];
      let weekProgress: TransferWeekProgressList[] = [];
      const subMain = [];
      this.transferService.getDataFromDataBaseList(projects[i].ProjectID)
        .subscribe(
          (db1) => {
            console.log(db1.DataBase, 'db1');
            // let aja = [];
            // let ajaP = [];
            // console.log(db1.DataBase);
            // stepFormsData.deliverablesForm[serv].date[del].map(v => {
            //   // console.log(v);
            //   aja.push({date: +v.split('/')[0] * 12 + +v.split('/')[1], Quantity: null});
            //   ajaP.push({date: +v.split('/')[0] * 12 + +v.split('/')[1], Quantity: null});
            // });
            // mainDelDataByZone = mainDelDataByZone.sort((a, b) => (+a.Year * 12 + +a.Month) - (+b.Year * 12 + +b.Month));
            database = db1.DataBase;
            databaseFormProgressPlan2 = db1.DataBaseForProgressPlan2;
            if (database.length !== 0) {
              stepFormsData.contractsForm.StartDate_Contract = (+database[0].year + 1300) + '/' + this.addZeroToMonth(database[0].month) + '/01';
              stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs = stepFormsData.contractsForm.StartDate_Contract;
              stepFormsData.contractsForm.FinishDate_Contract = (+database[database.length - 1].year + 1300) + '/' + this.addZeroToMonth(database[database.length - 1].month) + '/' + this.switchingMonth(database[database.length - 1].month);
            }
            let mainDate2;
            let DelDates;
            if (+new Date(stepFormsData.contractsForm.FinishDate_Contract) > +new Date(this.today.fa)) {
              mainDate2 = this.generateDates(+this.countMon(stepFormsData.contractsForm.StartDate_Contract, stepFormsData.contractsForm.FinishDate_Contract) + 1, stepFormsData.contractsForm.StartDate_Contract.split('/'), stepFormsData.contractsForm.FinishDate_Contract, false);
            } else {
              mainDate2 = this.generateDates(+this.countMon(stepFormsData.contractsForm.StartDate_Contract, this.today.fa), stepFormsData.contractsForm.StartDate_Contract.split('/'), stepFormsData.contractsForm.FinishDate_Contract, true);
            }
            mainDate2 = mainDate2.sort((a, b) => +new Date(a) - +new Date(b));
            DelDates = mainDate2;
            this.transferService.getDataFromWeekProgress(projects[i].ProjectID)
              .subscribe(
                (d2: TransferWeekProgressList[]) => {
                  console.log(d2, 'db1');
                  weekProgress = d2;
                  stepFormsData.cashFlowPlanForm.date = mainDate2;
                  let main = [];
                  let ifCashFlowLast = false;
                  const test = [];
                  for (let md = 0; md < mainDate2.length; md++) {
                    const foundedCashFlow = database.filter(v => ((+v.year + 1300) + '/' + this.addZeroToMonth(v.month)) === (mainDate2[md].substring(0, 7)));
                    if (foundedCashFlow.length !== 0 && !ifCashFlowLast && stepFormsData.contractsForm.Id_Currency === 'IRR') {
                      stepFormsData.cashFlowPlanForm.data.push(
                        foundedCashFlow[0].cashFlowPlan
                      );
                      if (+foundedCashFlow[0].cashFlowPlan === +stepFormsData.contractsForm.Cost_Costs) {
                        ifCashFlowLast = true;
                      }
                    } else {
                      stepFormsData.cashFlowPlanForm.data.push(
                        null
                      );
                    }

                    main.push({
                      date: mainDate2[md],
                      plan: null,
                      act: null,
                    });
                    const dd = mainDate2[md].split('/');
                    const year = +dd[0] - 1300;
                    const month = dd[1];
                    const recordFromDatabase: TransferDataBaseList[] = database.filter((v) => (+v.year === +year) && (+v.month === +month));
                    if (recordFromDatabase.length !== 0) {
                      if (recordFromDatabase[0].plan !== 1) {
                        main[main.length - 1].plan = recordFromDatabase[0].plan;
                      }
                      main[main.length - 1].act = recordFromDatabase[0].act;
                      const recordFromWeekProgress: TransferWeekProgressList[] = weekProgress.filter((v) => (+v.year === +year) && (+v.month === +month));
                      const mainDate2WithoutDay = mainDate2[md].substring(0, 8);
                      if (recordFromWeekProgress.length > 0) {
                        // console.log(+recordFromWeekProgress[recordFromWeekProgress.length - 1].act, recordFromWeekProgress[recordFromWeekProgress.length - 1].act, year, month, +main[md].act, +recordFromWeekProgress[recordFromWeekProgress.length - 1].act === +main[md].act);
                        if (+recordFromWeekProgress[recordFromWeekProgress.length - 1].act === +main[main.length - 1].act) {
                          for (let wp = 0; wp < recordFromWeekProgress.length; wp++) {
                            let isPush = true;
                            let subMainDate = mainDate2[md];
                            if (+recordFromWeekProgress[wp].weekNum === 1) {
                              subMainDate = mainDate2WithoutDay + '08';
                            } else if (+recordFromWeekProgress[wp].weekNum === 2) {
                              subMainDate = mainDate2WithoutDay + '15';
                            } else if (+recordFromWeekProgress[wp].weekNum === 3) {
                              subMainDate = mainDate2WithoutDay + '22';
                            } else {
                              isPush = false;
                            }
                            if (isPush) {
                              let weekProgressAct = +recordFromWeekProgress[wp].act;
                              if (+weekProgressAct === 1) {
                                weekProgressAct = null;
                              }

                              main.push({
                                date: subMainDate,
                                plan: null,
                                act: weekProgressAct,
                              });
                            }
                            // if (isPush) {
                            //   subMain.push({
                            //     date: subMainDate,
                            //     plan: recordFromWeekProgress[wp].plan,
                            //     act: recordFromWeekProgress[wp].act,
                            //   });
                            // }
                          }
                        }
                      }
                    }
                  }
                  // console.log(Object.assign(main, subMain).sort((a, b) => +new Date(a.date) - +new Date(b.date)), 'Two Objjjjjjjjjjjjjjjjj');
                  // console.log(main, 'main normal');
                  // console.log(main.concat(subMain).sort((a, b) => +new Date(a.date) - +new Date(b.date)), 'maaion2');
                  main = main.sort((a, b) => +new Date(a.date) - +new Date(b.date));
                  console.log(main.map(v => moment(v.date, 'jYYYY/jM/jD').format('M/D/YYYY')));
                  // console.log(main, 'main sorted');
                  // console.log(mainDate2, 'mainDate2');
                  stepFormsData.progressPlansForm = {};
                  stepFormsData.progressPlansForm.date = main.map(v => v.date);
                  stepFormsData.progressPlansForm.data = [];
                  stepFormsData.progressPlansForm.data.push({
                    ServiceId: 'T',
                    LastActPC: null,
                    plan: main.map(v => v.plan),
                    act: main.map(v => v.act),
                    startFinish: null
                  });
                  // console.log(stepFormsData.progressPlansForm, 'progress');
                  // console.log(Object.assign(main, subMain), 'Two Obj');


                  this.transferService.getDataFromDeliverableActList(projects[i].ProjectID)
                    .subscribe(
                      (data: TransferDeliverablesList[]) => {
                        console.log(data.filter(v => v.Deliverable === 20));
                        let deliverablesId = Array.from(new Set(data.map((item: TransferDeliverablesList) => item.Deliverable)));
                        let deliverableZones = Array.from(new Set(data.map((item: TransferDeliverablesList) => item.Zone)));
                        this.transferService.getDataFromDeliverablePlanDB(projects[i].ProjectID)
                          .subscribe(
                            (dpDB: TransferDeliverablesList[]) => {
                              const deliverablesIdFromDeliverablePlanDB = Array.from(new Set(dpDB.map((item: TransferDeliverablesList) => item.Deliverable)));
                              const finalZone = [];
                              const fZone = [];
                              for (let fz = 0; fz < deliverablesId.length; fz++) {
                                finalZone.push(data.filter(v => +v.Deliverable === +deliverablesId[fz]));
                                fZone[fz] = {
                                  name: +deliverablesId[fz],
                                  zones: Array.from(new Set(finalZone[fz].map((item: TransferDeliverablesList) => 'Zo' + item.Zone)))
                                };
                              }
                              // console.log(finalZone);
                              // console.log(fZone);
                              const deliverablesZonesFromDeliverablePlanDB = Array.from(new Set(dpDB.map((item: TransferDeliverablesList) => item.Zone)));
                              const deliverableTotalValue = dpDB.map(v => v.Quantity).reduce((a, b) => +a + +b, 0);
                              deliverablesId = deliverablesId.concat(deliverablesIdFromDeliverablePlanDB);
                              deliverablesId = Array.from(new Set(deliverablesId));
                              deliverableZones = deliverableZones.concat(deliverablesZonesFromDeliverablePlanDB);
                              deliverableZones = Array.from(new Set(deliverableZones));
                              // console.log(data.map((v) => {
                              //   return {Quantity: v.Quantity, date: v.Year + '/' + this.addZeroToMonth(v.Month)};
                              // }));
                              // console.log(dpDB.map((v) => {
                              //   return {Quantity: v.Quantity, date: v.Year + '/' + this.addZeroToMonth(v.Month)};
                              // }));
                              // console.log(deliverablesId, 'deliverablesId');
                              // console.log(deliverableZones, 'deliverableZones');
                              // console.log(deliverableTotalValue, 'deliverable Total Valuie');
                              // console.log(dpDB, 'dpDB', deliverablesIdFromDeliverablePlanDB, 'deliverablesIdFromDeliverablePlanDB');
                              stepFormsData.deliverablesForm = [];
                              // console.log(projectServiecs, 'projectServiecs');
                              const finalDel: TransferOperationalIndList[] = [];
                              for (let dl = 0; dl < deliverablesId.length; dl++) {
                                finalDel[dl] = this.operationalInd.filter(v => +v.IndCode === +deliverablesId[dl])[0];
                              }
                              // console.log(finalDel, 'finalDel');
                              for (let serv = 0; serv < projectServiecs.length; serv++) {
                                stepFormsData.deliverablesForm[serv] = {};
                                stepFormsData.deliverablesForm[serv].zone_deliverables = [];
                                stepFormsData.deliverablesForm[serv].operationTypes_deliverables = [];
                                stepFormsData.deliverablesForm[serv].name_Deliverable = [];
                                stepFormsData.deliverablesForm[serv].date = [];
                                stepFormsData.deliverablesForm[serv].data = [];
                                stepFormsData.deliverablesForm[serv].value_Deliverable = [];
                                stepFormsData.deliverablesForm[serv].serviceId = projectServiecs[serv];
                                for (let del = 0; del < finalDel.length; del++) {
                                  stepFormsData.deliverablesForm[serv].date[del] = [];
                                  const finalDateWithCDB = data.filter(v => v.Deliverable === deliverablesId[del]);
                                  const finalDateWithCDBPlan = dpDB.filter(v => v.Deliverable === deliverablesId[del]);
                                  const finalDateCDB = finalDateWithCDB.concat(finalDateWithCDBPlan);
                                  const ff2 = Array.from(new Set(finalDateCDB.map(v => (+v.Year + 1300) + '/' + this.addZeroToMonth(v.Month) + '/' + this.switchingMonth(v.Month)))).sort((a, b) => +new Date(a) - +new Date(b));
                                  // const ff2Persian = Array.from(new Set(finalDateCDB.map(v => (moment(v.Date, 'YYYY/M/D')).format('jYYYY/jM/jD'))));


                                  // console.log(finalDel);
                                  // console.log(dpDB, 'dpDB');
                                  const selectedDeliverable = this.deliverables.filter(v => v.Id === finalDel[del].Deliverable_ID)[0];
                                  if (selectedDeliverable.Id_ContractService === projectServiecs[serv]) {
                                    let zone = null;
                                    if (fZone[del]) {
                                      zone = fZone[del].zones;
                                    }
                                    stepFormsData.deliverablesForm[serv].zone_deliverables.push(
                                      zone
                                    );
                                    stepFormsData.deliverablesForm[serv].operationTypes_deliverables.push({
                                      Id: finalDel[del].Operation_ID,
                                      Name: this.operationTypes.filter(v => v.Id === finalDel[del].Operation_ID)[0].Name
                                    });
                                    stepFormsData.deliverablesForm[serv].name_Deliverable.push({
                                      Id: finalDel[del].Deliverable_ID,
                                      Name: selectedDeliverable.Name,
                                      MeasureUnit: selectedDeliverable.MeasureUnit,
                                      PossibleUnitIds: selectedDeliverable.PossibleUnitIds,
                                      PossibleOperationTypes_Deliverab: selectedDeliverable.PossibleOperationTypes_Deliverab
                                    });
                                    stepFormsData.deliverablesForm[serv].date[del] = ff2;
                                    // console.log(deliverablesId);
                                    const mainDelData = data.filter(v => {
                                      if (+v.Deliverable === +deliverablesId[del]) {
                                        return true;
                                      }
                                    });
                                    const mainDelDataPlan = dpDB.filter(v => {
                                      if (+v.Deliverable === +deliverablesId[del]) {
                                        return true;
                                      }
                                    });
                                    const ddd = [];
                                    const dddPlan = [];
                                    stepFormsData.deliverablesForm[serv].data.push([]);
                                    // console.log(data);
                                    // console.log(mainDelData);
                                    // console.log(ff2);
                                    if (zone === null) {
                                      console.log('zone is null');
                                      for (let mm = 0; mm < ff2.length; mm++) {
                                        const selectedMainDelData = mainDelData.filter(v => ((+v.Year + 1300) + '/' + this.addZeroToMonth(v.Month)) === (ff2[mm].substring(0, 7)));
                                        const selectedMainDelDataPlan = mainDelDataPlan.filter(v => ((+v.Year + 1300) + '/' + this.addZeroToMonth(v.Month)) === (ff2[mm].substring(0, 7)));
                                        if (selectedMainDelData.length !== 0) {
                                          if (selectedMainDelData[0].Quantity !== 0) {
                                            ddd[mm] = selectedMainDelData[0].Quantity;
                                          } else {
                                            ddd[mm] = null;
                                          }
                                        } else {
                                          ddd[mm] = null;
                                        }
                                        if (selectedMainDelDataPlan.length !== 0) {
                                          if (selectedMainDelDataPlan[0].Quantity !== 0) {
                                            dddPlan[mm] = selectedMainDelDataPlan[0].Quantity;
                                          } else {
                                            dddPlan[mm] = null;
                                          }
                                        } else {
                                          dddPlan[mm] = null;
                                        }
                                      }
                                      stepFormsData.deliverablesForm[serv].data[del].push(dddPlan);
                                      stepFormsData.deliverablesForm[serv].data[del].push(ddd);
                                    } else {
                                      // console.log(data);
                                      // console.log(mainDelData);
                                      // console.log(mainDelData.filter(v => {
                                      //   if (v.Deliverable === 20 && v.Zone === 21) {
                                      //     return v;
                                      //   }
                                      // }), 'adsaadsadsa');
                                      for (let zo = 0; zo < stepFormsData.deliverablesForm[serv].zone_deliverables[del].length; zo++) {
                                        let mainDelDataByZone = mainDelData.filter(v => +v.Zone === +stepFormsData.deliverablesForm[serv].zone_deliverables[del][zo].replace('Zo', ''));
                                        const selectedMainDelData = mainDelDataByZone;
                                        const selectedMainDelDataPlan = mainDelDataPlan;
                                        let finData = [];
                                        let aja = [];
                                        let ajaP = [];
                                        stepFormsData.deliverablesForm[serv].date[del].map(v => {
                                          // console.log(v);
                                          aja.push({date: +v.split('/')[0] * 12 + +v.split('/')[1], Quantity: null});
                                          ajaP.push({date: +v.split('/')[0] * 12 + +v.split('/')[1], Quantity: null});
                                        });
                                        mainDelDataByZone = mainDelDataByZone.sort((a, b) => (+a.Year * 12 + +a.Month) - (+b.Year * 12 + +b.Month));
                                        // console.log(mainDelDataByZone);
                                        // console.log(aja);
                                        for (let mm = 0; mm < aja.length; mm++) {
                                          for (let ll = 0; ll < mainDelDataByZone.length; ll++) {
                                            if (+aja[mm].date  === +((1300 + +mainDelDataByZone[ll].Year) * 12 + +mainDelDataByZone[ll].Month)) {
                                              // console.log(((1300 + +mainDelDataByZone[ll].Year) * 12 + +mainDelDataByZone[ll].Month), 'daaaaa', aja[mm].date, 'ajab', mainDelDataByZone[ll].Quantity);
                                              aja[mm].Quantity = mainDelDataByZone[ll].Quantity;
                                            } else {
                                              // aja[mm].Quantity = null;
                                            }
                                          }
                                          for (let pp = 0; pp < dpDB.length; pp++) {
                                            if (+ajaP[mm].date  === +((1300 + +dpDB[pp].Year) * 12 + +dpDB[pp].Month)) {
                                              ajaP[mm].Quantity = dpDB[pp].Quantity;
                                            }
                                          }
                                        }
                                        // console.log(aja);
                                        // mainDelDataByZone.map(v => {
                                        //   const ind = aja.findIndex(v2 => {
                                        //     // console.log(v2.date);
                                        //     // console.log(((1300 + +v.Year) * 12) + v.Month);
                                        //     if (v2.date === (v.Year * 12) + v.Month) {
                                        //       return;
                                        //     }
                                        //   });
                                        //   console.log(ind);
                                        // });
                                        // console.log(aja);
                                        stepFormsData.deliverablesForm[serv].data[del].push(aja.map(v => v.Quantity));
                                        stepFormsData.deliverablesForm[serv].data[del].push(ajaP.map(v => v.Quantity));
                                        // for (let mm = 0; mm < ff2.length; mm++) {
                                        //   // const selectedMainDelData = mainDelDataByZone.filter(v => ((+v.Year + 1300) + '/' + this.addZeroToMonth(v.Month)) === (ff2[mm].substring(0, 7)));
                                        //   // const selectedMainDelDataPlan = mainDelDataPlan.filter(v => ((+v.Year + 1300) + '/' + this.addZeroToMonth(v.Month)) === (ff2[mm].substring(0, 7)));
                                        //   const selectedMainDelData = mainDelDataByZone;
                                        //   const selectedMainDelDataPlan = mainDelDataPlan;
                                        //   // console.log(selectedMainDelData);
                                        //   if (selectedMainDelData.length !== 0) {
                                        //     if (selectedMainDelData[0].Quantity !== 0) {
                                        //       ddd[mm] = selectedMainDelData[0].Quantity;
                                        //     } else {
                                        //       ddd[mm] = null;
                                        //     }
                                        //   } else {
                                        //     ddd[mm] = null;
                                        //   }
                                        //   if (selectedMainDelDataPlan.length !== 0) {
                                        //     if (selectedMainDelDataPlan[0].Quantity !== 0) {
                                        //       dddPlan[mm] = selectedMainDelDataPlan[0].Quantity;
                                        //     } else {
                                        //       dddPlan[mm] = null;
                                        //     }
                                        //   } else {
                                        //     dddPlan[mm] = null;
                                        //   }
                                        // }
                                      }
                                    }
                                    stepFormsData.deliverablesForm[serv].value_Deliverable.push(
                                      dddPlan.reduce((a, b) => a + b, 0)
                                    );
                                  }
                                }
                              }


                              // Database For ProgressPlan2

                              this.transferService.getDataFromContractExtension(projects[i].ProjectID).subscribe(
                                (ce: TransferContractExtensionList[]) => {
                                  const stepJson = {
                                    costTable: {
                                      DDate: [],
                                      Cost: [],
                                      eqCost: []
                                    },
                                    endDateTable: {
                                      DDate: [],
                                      EndDate: []
                                    },
                                    progressTable: {
                                      Date: [],
                                      Data: []
                                    }
                                  };
                                  const costMap = ce.map((v) => {
                                    return {
                                      DDate: v.dateExtension,
                                      Cost: v.contractCost
                                    };
                                  });

                                  const endDateMap = ce.map((v) => {
                                    return {
                                      DDate: v.dateExtension,
                                      EndDate: v.endDateAccordingToContractExtension
                                    };
                                  });

                                  stepJson.costTable.DDate = costMap.map((v) => {
                                    const date = moment(v.DDate, 'YYYY/M/D').add(1, 'day').format('jYYYY/jM/jD').split('/');
                                    return date[0] + '/' + this.addZeroToMonth(+date[1]) + '/' + this.addZeroToMonth(+date[2]);
                                  });
                                  if (id_Currency === 'IRR') {
                                    stepJson.costTable.Cost = costMap.map(v => v.Cost);
                                  } else {
                                    stepJson.costTable.Cost = costMap.map(v => v.Cost * currency_Exchange);
                                    stepJson.costTable.eqCost = costMap.map(v => v.Cost);
                                  }
                                  stepJson.endDateTable.DDate = endDateMap.map((v) => {
                                    const date = moment(v.DDate, 'YYYY/M/D').add(1, 'day').format('jYYYY/jM/jD').split('/');
                                    return date[0] + '/' + this.addZeroToMonth(+date[1]) + '/' + this.addZeroToMonth(+date[2]);
                                  });
                                  stepJson.endDateTable.EndDate = endDateMap.map((v) => {
                                    const date = moment(v.EndDate, 'YYYY/M/D').add(1, 'day').format('jYYYY/jM/jD').split('/');
                                    return date[0] + '/' + this.addZeroToMonth(+date[1]) + '/' + this.addZeroToMonth(+date[2]);
                                  });

                                  let hund = false;
                                  const filteredDatabaseFromProgressPlan2 = databaseFormProgressPlan2.filter((v) => {
                                    if (hund) {
                                      return false;
                                    } else {
                                      if (v.ProgressPlan2 === 1) {
                                        hund = true;
                                      }
                                      return true;
                                    }
                                  });
                                  stepJson.progressTable.Date = filteredDatabaseFromProgressPlan2.map(v => (+v.year + 1300) + '/' + this.addZeroToMonth(v.month) + '/' + this.switchingMonth(v.month));
                                  const ptData = filteredDatabaseFromProgressPlan2.map(v => v.ProgressPlan2);
                                  for (let ps = 0; ps < projectServiecs.length; ps++) {
                                    stepJson.progressTable.Data.push(
                                      ptData
                                    );
                                  }
                                  console.log(stepJson);
                                  stepFormsData.newJson = <any>stepJson;
                                  const tempJsonData = stepFormsData;

                                  console.log(stepFormsData, 'stepFormsData');
                                  // this.transferService.getDataFromContextInfo()
                                  //   .subscribe(
                                  //     (DigestValue) => {
                                  //       this.transferService.sendDataJson(DigestValue, mainData[i], tempJsonData)
                                  //         .subscribe(
                                  //           (sendDataJsonResult: any) => {
                                  //             const contractID = sendDataJsonResult.d.ID;
                                  //             console.log(contractID);
                                  //             this.transferService.updateDataContractID(DigestValue, contractID).subscribe(
                                  //               () => {
                                  //                 this.progressBarValue = this.progressBarValue + (100 / this.selectedProjects.length);
                                  //                 const contractIndex = this.contracts.findIndex(v => +v.ProjectID === +mainData[i].ProjectId);
                                  //                 this.contracts[contractIndex].TempID = 'TC' + contractID;
                                  //                 console.log('success');
                                  //               }
                                  //             );
                                  //           }
                                  //         );
                                  //     }
                                  //   );
                                });
                            });
                      });
                }
              );
          }
        );
    }
  }

  // console.log(mainData);
  // console.log(this.selectedProjects, projects);

  onProjectClick(contract: any, id: number) {
    const projectIndex = this.selectedProjects.findIndex(v => +v === +id);
    if (projectIndex === -1) {
      this.selectedProjects.push(id);
    } else {
      this.selectedProjects.splice(projectIndex, 1);
    }
  }

  onSelectDeSelect() {
    if (this.switch) {
      if (this.selectedProjects.length === 0) {
        for (let i = 0; i < this.contractsNonProject.length; i++) {
          this.selectedProjects.push(i);
        }
      } else {
        this.selectedProjects = [];
      }
    } else {
      if (this.selectedProjects.length === 0) {
        for (let i = 0; i < this.contracts.length; i++) {
          this.selectedProjects.push(i);
        }
      } else {
        this.selectedProjects = [];
      }
    }
  }

  onSearch(e) {
    console.log(e.srcElement.value);

    // this.contracts = this.contracts.
  }

  styleObject(id: number) {
    const projectIndex = this.selectedProjects.findIndex(v => v === id);
    const styles: any = {};
    if (projectIndex !== -1) {
      styles.border = '1px solid rgb(85, 190, 255)';
      styles.background = '#eff2ff';
    }
    return styles;
  }

  styleObjectNumber(id: number) {
    const projectIndex = this.selectedProjects.findIndex(v => v === id);
    const styles: any = {};
    if (projectIndex !== -1) {
      styles.color = '#fff';
      styles.background = '#3693f7';
    }
    return styles;
  }

  generateDates(numMon, date, lastDate: string, isToday: boolean) {
    const dates = [];
    dates[0] = +date[0] + '/' + this.addZeroToMonth(+date[1]) + '/' + this.addZeroToMonth(+date[2]);
    for (let i = 0; i < +numMon; i++) {
      if (i !== 0) {
        date[1] = +date[1] + 1;
      }
      if (+date[1] === 13) {
        date[1] = 1;
        date[0] = +date[0] + 1;
      }
      date[2] = this.switchingMonth(+date[1]);
      dates[i + 1] = date[0] + '/' + this.addZeroToMonth(+date[1]) + '/' + date[2];
    }
    const lastDD = lastDate.split('/');
    dates[+numMon + 1] = lastDD[0] + '/' + this.addZeroToMonth(+lastDD[1]) + '/' + this.addZeroToMonth(+lastDD[2]);
    dates[+numMon + 1] = dates[+numMon + 1].replace('-', '/');
    if (isToday) {
      const today = this.today.fa.split('/');
      dates.push(today[0] + '/' + this.addZeroToMonth(+today[1]) + '/' + this.addZeroToMonth(+today[2]));
    }
    return dates;
  }

  switchingMonth(month: number) {
    let selectedMonth;
    if (month < 7) {
      selectedMonth = 31;
    } else if (month > 6 && month < 12) {
      selectedMonth = 30;
    } else {
      selectedMonth = 29;
    }
    return selectedMonth;
  }

  addZeroToMonth(month) {
    if (+month < 10) {
      return '0' + month;
    } else {
      return month;
    }
  }

  countMon(firstDate: string, finishDate: string) {
    const m = moment(firstDate, 'jYYYY/jM/jD');
    const md = moment(finishDate, 'jYYYY/jM/jD');
    let counter = 0;
    counter = md.diff(m, 'months');
    return counter;
  }
}
