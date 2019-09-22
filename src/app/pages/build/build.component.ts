import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SharedService} from '../../shared/services/shared.service';
import {BuildSiteService} from '../../shared/services/build-site.service';
import {GetUserList} from '../../shared/models/buildSiteModels/getUser.model';
import {MatDialog} from '@angular/material';
import {ShowUserComponent} from './show-user/show-user.component';
import {SiteGroupsList} from '../../shared/models/buildSiteModels/siteGroups.model';
import {ImporterList} from '../../shared/models/importer.model';
import {ActivatedRoute} from '@angular/router';
import {StepFormsDataList} from '../../shared/models/stepFormModels/stepFormsData.model';
import * as moment from 'jalali-moment';
import {TempTransferService} from '../../shared/services/temp-transfer.service';
import {UnitsList} from '../../shared/models/units.model';

@Component({
  selector: 'app-build',
  templateUrl: './build.component.html',
  styleUrls: ['./build.component.scss']
})
export class BuildComponent implements OnInit {
  @ViewChild('viewerGroup') viewerGroup;
  @ViewChild('writerGroup') writerGroup;

  siteGroups_Viewers: SiteGroupsList[] = [];
  siteGroups_Writers: SiteGroupsList[] = [];
  mainSiteGroups_Viewers: SiteGroupsList[] = [];
  mainSiteGroups_Writers: SiteGroupsList[] = [];
  importerViewers: GetUserList[] = [];
  importerWriters: GetUserList[] = [];
  allImporters: ImporterList[] = [];
  tempID: number;
  contractID: number;
  stepFormsData: StepFormsDataList;
  startTransferToSite = false;
  isSiteBuilt = false;
  title = null;
  importerUser;
  importerTemp;
  isPreContract = false;

  constructor(private sharedService: SharedService,
              private buildSiteService: BuildSiteService,
              private dialog: MatDialog,
              private route: ActivatedRoute,
              private tempTransfer: TempTransferService,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    if (this.activatedRoute.snapshot.url[0].path === 'pre-build') {
      this.isPreContract = true;
    }

    console.clear();
    this.route.queryParams.subscribe(
      (params: any) => {
        if (params.ContractID) {
          try {
            this.tempID = +params.ContractID.replace('TC', '');
            this.sharedService.getDataJson(this.tempID, this.isPreContract)
              .subscribe(
                (data: StepFormsDataList) => {
                  this.stepFormsData = data;
                  this.importerTemp = this.sharedService.tempContractImporter;
                  // this.sharedService.getPMName(+this.stepFormsData.contractsForm.Id_Importer).subscribe(
                  //   (userTitle) => {
                  //     this.importerUser = userTitle;
                  //   }
                  // );
                  this.title = this.stepFormsData.contractsForm.FullTitle_Contract;
                  // console.log(this.stepFormsData);
                  this.createContract();
                });
          } catch {
          }
        }
      }
    );


    // Role Assignment
    // this.sharedService.getDataFromContextInfo().subscribe(
    //   (data) => {
    //     console.log(data);
    //     this.buildSite.roleAssignment(data).subscribe(
    //       (dd) => {
    //         console.log(dd);
    //       }
    //     );
    //   });

    // Get Importer Viewers
    // this.sharedService.getDataFromContextInfo().subscribe(
    //   (data) => {
    //     this.buildSite.getImporterGroupUsers(135).subscribe(
    //       (importerViewers) => {
    //         this.importerViewers = importerViewers;
    //         console.log(this.importerViewers);
    //       }
    //     );
    //     this.buildSite.getImporterGroupUsers(136).subscribe(
    //       (importerWriters) => {
    //         this.importerWriters = importerWriters;
    //         console.log(this.importerWriters);
    //       }
    //     );
    //   });
  }

  createContract() {
    this.sharedService.getAllUnits().subscribe(
      (units: UnitsList[]) => {
        this.sharedService.getContractServices().subscribe(
          (services) => {
            this.sharedService.getContractCurrencies().subscribe(
              (currencies) => {
                let contractStatus = 1;
                let contractor;
                let Number = null;
                let DeclareForecst = null;
                let StartDateForecast = null;
                let FinishDateForecast = null;
                let DocSendDateForecast = null;
                let MinutesSignDateForecast = null;
                let WinnerDateForecast = null;
                let CreationDate = null;
                if (!this.isPreContract) {
                  contractStatus = 2;
                  contractor = this.stepFormsData.contractsForm.Id_Contractor.Id;
                  Number = this.stepFormsData.contractsForm.Number_Contract;
                } else {
                  DeclareForecst = moment(this.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jM/jD').format('MM/DD/YYYY');
                  StartDateForecast = moment(this.stepFormsData.contractsForm.StartDate_Contract, 'jYYYY/jM/jD').format('MM/DD/YYYY');
                  FinishDateForecast = moment(this.stepFormsData.contractsForm.FinishDate_Contract, 'jYYYY/jM/jD').format('MM/DD/YYYY');
                  DocSendDateForecast = moment(this.stepFormsData.contractsForm.DocToComptroller, 'jYYYY/jM/jD').format('MM/DD/YYYY');
                  MinutesSignDateForecast = moment(this.stepFormsData.contractsForm.SigningRecall, 'jYYYY/jM/jD').format('MM/DD/YYYY');
                  WinnerDateForecast = moment(this.stepFormsData.contractsForm.WinnerDeclare, 'jYYYY/jM/jD').format('MM/DD/YYYY');
                  CreationDate = moment(this.stepFormsData.contractsForm.CreationDate, 'jYYYY/jM/jD').format('MM/DD/YYYY');
                }
                const data: { Title, ShortTitle, Number, Subject_Contract, StartDate, DDate, GuaranteePeriod, Unit, SubUnit, Currency, PMOExpert, PM, Contractor, RaiPart, Importer, Standards, Service, Zone, ContractKind, Cost, VersionCode, Del_Last, FinishDate, ContractStatus,
                  OperationType, Goal, Demandant, ExecutePriority, TenderType, TenderOrganizer, DeclareForecst, StartDateForecast, FinishDateForecast, DocSendDateForecast, MinutesSignDateForecast, WinnerDateForecast, CreationDate} = {
                  Title: this.stepFormsData.contractsForm.FullTitle_Contract,
                  ShortTitle: this.stepFormsData.contractsForm.ShortTitle_Contract,
                  Number: this.stepFormsData.contractsForm.Number_Contract,
                  Subject_Contract: this.stepFormsData.contractsForm.Subject_Contract,
                  StartDate: moment(this.stepFormsData.contractsForm.StartDate_Contract, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
                  DDate: moment(this.stepFormsData.contractsForm.DeclareDate_FinishDates_And_Costs, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
                  GuaranteePeriod: this.stepFormsData.contractsForm.GuaranteePeriod,
                  Unit: this.stepFormsData.contractsForm.Id_Unit,
                  SubUnit: this.stepFormsData.contractsForm.Id_SubUnit,
                  Currency: currencies.filter(v => v.Id === this.stepFormsData.contractsForm.Id_Currency)[0].currencyID,
                  PMOExpert: units.filter(v => v.Id === this.stepFormsData.contractsForm.Id_Unit)[0].DefaultPMOExpertId_User,
                  PM: this.stepFormsData.contractsForm.PMId_User.Id,
                  Contractor: contractor,
                  RaiPart: this.stepFormsData.contractsForm.SignatoryRaiParts,
                  Importer: this.stepFormsData.contractsForm.Id_Importer,
                  Standards: this.stepFormsData.contractsForm.Standards_Contract,
                  Service: this.stepFormsData.contractsForm.ContractServices.map(v => +services.filter(v2 => v2.Id === v)[0].ServiceID),
                  Zone: this.stepFormsData.contractsForm.Zones,
                  ContractKind: 1,
                  Cost: +this.stepFormsData.contractsForm.Cost_Costs,
                  VersionCode: 1,
                  Del_Last: null,
                  FinishDate: moment(this.stepFormsData.contractsForm.FinishDate_Contract, 'jYYYY/jM/jD').format('MM/DD/YYYY'),
                  ContractStatus: contractStatus,
                  OperationType: this.stepFormsData.contractsForm.OperationType,
                  Goal: this.stepFormsData.contractsForm.Goal,
                  Demandant: this.stepFormsData.contractsForm.Demandant,
                  ExecutePriority: this.stepFormsData.contractsForm.OperationalPriority,
                  TenderType: this.stepFormsData.contractsForm.TenderType,
                  TenderOrganizer: this.stepFormsData.contractsForm.TenderOrganizer,
                  DeclareForecst: DeclareForecst,
                  StartDateForecast: StartDateForecast,
                  FinishDateForecast: FinishDateForecast,
                  DocSendDateForecast: DocSendDateForecast,
                  MinutesSignDateForecast: MinutesSignDateForecast,
                  WinnerDateForecast: WinnerDateForecast,
                  CreationDate: CreationDate,
                };
                console.log(this.stepFormsData.contractsForm.Id_Importer);
                this.tempTransfer.getDataFromContextInfo().subscribe(
                  (digestValue) => {
                    this.tempTransfer.createContract(digestValue, data, this.isPreContract).subscribe(
                      (rData: any) => {
                        this.contractID = rData.d.Id;
                        this.sharedService.getDataFromContextInfo().subscribe(
                          (dg) => {
                            this.sharedService.breakInheritence(dg, 'Contracts', this.contractID).subscribe();
                            if (this.isPreContract) {
                              this.buildSiteService.buildSite(dg, this.contractID).subscribe(
                                () => {
                                  this.checkIsSiteBuildForPre(dg);
                                }
                              );
                            } else {
                              this.buildSiteService.buildSite(dg, this.contractID).subscribe(
                                () => {

                                  this.checkIsSiteBuilt();
                                }
                              );
                            }
                          });
                      }
                    );
                  }
                );
              });
          });
      });
  }

  checkIsSiteBuilt() {
    this.tempTransfer.getItemsFromList(this.contractID, 'Versions', this.isPreContract).subscribe(
      (data) => {
        this.isSiteBuilt = true;
        this.tempTransfer.getDataFromContextInfo().subscribe(
          (digestValue) => {
            this.sharedService.updateDataJson(digestValue, this.tempID, true, this.contractID, this.isPreContract).subscribe();
          }
        );
        this.startPermisions();
      }, error2 => {
        setTimeout(() => {
          this.checkIsSiteBuilt();
        }, 1000);
      }
    );
  }

  checkIsSiteBuildForPre(dg) {
    this.tempTransfer.getItemsFromList(this.contractID, 'Versions', false).subscribe(
      (data) => {
        this.buildSiteService.buildSubSite(dg, this.contractID, 'pre-contract').subscribe(
          (dd) => {
            // console.clear();
            this.checkIsPreSiteBuilt();
          });
      }, error2 => {
        setTimeout(() => {
          this.checkIsSiteBuildForPre(dg);
        }, 1000);
      }
    );
  }

  checkIsPreSiteBuilt() {
    this.tempTransfer.getItemsFromList(this.contractID, 'Versions', this.isPreContract).subscribe(
      (data) => {
        this.isSiteBuilt = true;
        this.tempTransfer.getDataFromContextInfo().subscribe(
          (digestValue) => {
            this.sharedService.updateDataJson(digestValue, this.tempID, true, this.contractID, this.isPreContract).subscribe();
          }
        );
        this.startPermisions();
      }, error2 => {
        setTimeout(() => {
          this.checkIsPreSiteBuilt();
        }, 1000);
      }
    );
  }

  startPermisions() {
    this.sharedService.getAllImporters().subscribe(
      (data) => {
        this.allImporters = data;
        this.update();
      }
    );
  }

  addGroup(type) {
    let id = 0;

    if (type === 'Viewers') {
      if (this.viewerGroup.selected.value.Id > 0) {
        id = this.viewerGroup.selected.value.Id;
      }
    } else {
      if (this.writerGroup.selected.value.Id > 0) {
        id = this.writerGroup.selected.value.Id;
      }
    }
    this.sharedService.getDataFromContextInfo()
      .subscribe(
        (DigestValue) => {
          this.buildSiteService.roleAssignment(DigestValue, id, this.contractID, type, this.isPreContract).subscribe(
            () => {
              setTimeout(() => {
                this.buildSiteService.getSiteGroups(this.contractID, type, this.isPreContract).subscribe(
                  (data) => {
                    if (type === 'Viewers') {
                      this.siteGroups_Viewers = data;
                    } else {
                      this.siteGroups_Writers = data;

                    }
                  }
                );
                this.buildSiteService.roleAssignmentListItem(DigestValue, id, type, 'Contracts', this.contractID).subscribe();
              }, 10);
            }
          );
        }
      );
  }

  update() {
    this.buildSiteService.getSiteGroups(this.contractID, 'Viewers', this.isPreContract).subscribe(
      (data) => {
        this.siteGroups_Viewers = data;
        // console.log(this.siteGroups_Viewers);
      }
    );
    this.buildSiteService.getSiteGroups(this.contractID, 'Writers', this.isPreContract).subscribe(
      (data) => {
        this.siteGroups_Writers = data;
        // console.log(this.siteGroups_Writers);
      }
    );

    this.buildSiteService.getMainSiteGroups().subscribe(
      (data) => {
        this.mainSiteGroups_Viewers = data.filter(a => a.Title.startsWith('Viewers'));
        this.mainSiteGroups_Writers = data.filter(a => a.Title.startsWith('Writers'));
      }
    );
  }

  onFinish() {
    this.startTransferToSite = true;
  }

  onDeleteGroup(groupID: number) {
    this.sharedService.getDataFromContextInfo().subscribe(
      (DigestValue) => {
        this.buildSiteService.removeGroup(DigestValue, groupID, this.contractID, this.isPreContract).subscribe(
          () => {
            this.update();
          }
        );
        this.buildSiteService.removeGroupListItem(DigestValue, groupID, 'Contracts', this.contractID).subscribe();
      }
    );
  }

  showUser(importerData: GetUserList) {
    // const dialogRef = this.dialog.open(UserFormComponent, {
    //   width: '500px',
    //   height: '500px',
    //   data: {
    //     importerData: importerData
    //   }
    // });
  }

  getImporterName(id) {
    if (id !== 'All') {
      if (this.allImporters.filter(v => +v.Id === +id)[0]) {
        return this.allImporters.filter(v => +v.Id === +id)[0].Name;
      }
    } else {
      return 'همه';
    }
    // if (id.startsWith('Imp')) {

    // } else {
    //   return id;
    // }
  }
}
