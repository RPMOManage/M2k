import { Component, Input, OnInit } from '@angular/core';
import { ContractService } from '../../../shared/services/contract.service';
import { ContractModel } from '../../../shared/models/contractModels/contract.model';
import { SharedService } from '../../../shared/services/shared.service';
import { Router } from '@angular/router';
import { ChangesRequestComponent } from '../../../types/card/card-change/changes-request/changes-request.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-main-changes',
  styleUrls: ['./main-changes.component.scss'],
  templateUrl: './main-changes.component.html',
})
export class MainChangesComponent implements OnInit {
  @Input() contractID;
  @Input() contract: ContractModel;
  flipped = false;
  type = 'changes';
  tabIndex = 0;
  contracts = [
    {
      Title: 'دیجیتال سازی شبکه رادیویی مسیر یزد- هرمزگان ،تهران- جنوب', Code: 'TC234', PM: 'احسان رهبر', PMCode: 'p1', Status: 'importer',
      Picture: 'https://www.iamexpat.nl/sites/default/files/styles/article--full/public/work-contracts-netherlands.jpg',
      ShortTitle: 'دیجیتال سازی شبکه مسیر یزد', ContractCode: '223f', ContractSubject: 'عجب ایز عجب', Unit: 'un2', SubUnit: 'sub5', Contractor: 'سازمان ایکس', Importer: 'Imp1', Date: '1396/07/20', IsSpecial: false,
    },
    {
      Title: 'اتصال انشعاب بندرعباس و سیلو سازمان غله به شبکه ریلی', Code: 'TC236', PM: 'مریم محمدی', PMCode: 'p2', Status: 'pm',
      Picture: 'http://commettelaw.com/wp-content/uploads/2017/04/Contract-Law-Ft-Lauderdale-Florida.jpg',
      ShortTitle: 'اتصال انشعاب بندرعباس و سیلو غله به شبکه', ContractCode: '243d', ContractSubject: 'عجب ایز عجب', Unit: 'un4', SubUnit: 'sub3', Contractor: 'سازمان ایکس 2', Importer: 'Imp4', Date: '1393/05/15', IsSpecial: true,
    },
    {
      Title: 'اتصال کارخانه فولاد ایرانیان به شبکه ریلی', Code: 'TC255', PM: 'حسین کمالی', PMCode: 'p3', Status: 'pmo',
      Picture: 'https://www.iamexpat.nl/sites/default/files/styles/' +
      'article--full/public/oldimages/67cddc45e6e8c166afe752d0b5e0866c1441700680.jpg',
      ShortTitle: 'اتصال کارخانه فولاد ایرانیان به شبکه', ContractCode: '224t', ContractSubject: 'عجب ایز عجب', Unit: 'un2', SubUnit: 'sub2', Contractor: 'سازمان ایکس 3', Importer: 'Imp3', Date: '1395/02/11', IsSpecial: false,
    },
    {
      Title: 'بهسازی خطوط بلاک شمسی- اشکذر (نظرآباد)', Code: 'TC268', PM: 'علی پناهی', PMCode: 'p4', Status: 'importer',
      Picture: 'https://www.welcome-center-malta.com/wp-content/uploads/2018/04/Employment-contract.jpg',
      ShortTitle: 'بهسازی خطوط شمسی - اشکذر', ContractCode: '423t', ContractSubject: 'عجب ایز عجب', Unit: 'un5', SubUnit: 'sub4', Contractor: 'سازمان ایکس 4', Importer: 'Imp2', Date: '1394/07/27', IsSpecial: true,
    },
    {
      Title: 'پروژه طراحی و احداث خط دوم راه آهن (زیرسازی، روسازی و پل سازی) تهران - پرند (قطعه دوم)', Code: 'TC279', PM: 'مجید سعیدی', PMCode: 'p5', Status: 'pmo',
      Picture: 'https://img-aws.ehowcdn.com/877x500p/photos.demandstudios.com/getty/article/181/18/466050663.jpg',
      ShortTitle: 'طراحی و احداث خط دوم راه آهن تهران پرند', ContractCode: '823a', ContractSubject: 'عجب ایز عجب', Unit: 'un1', SubUnit: 'sub5', Contractor: 'سازمان ایکس 5', Importer: 'Imp4', Date: '1397/09/30', IsSpecial: false,
    },
  ];

  contractChanges = [
    {id: 1, changeID: [1, 4, 5, 7], contractCode: 'TC234'},
    {id: 2, changeID: [1, 4, 5, 7], contractCode: 'TC236'},
    {id: 3, changeID: [2, 5, 8, 7], contractCode: 'TC255'},
    {id: 4, changeID: [1, 2, 5, 8], contractCode: 'TC268'},
    {id: 5, changeID: [2, 5, 6, 8], contractCode: 'TC279'},
  ];
  mainContractsComp = [];
  menu: { ID, TitleEn, TitleFa }[] = [{
    ID: 0,
    TitleEn: 'contracts',
    TitleFa: 'قرارداد ها',
  }, {
    ID: 1,
    TitleEn: 'duties',
    TitleFa: 'وظایف',
  }, {
    ID: 2,
    TitleEn: 'changes',
    TitleFa: 'تغییرات',
  }, {
    ID: 3,
    TitleEn: 'wizard',
    TitleFa: 'ویزارد',
  }, {
    ID: 4,
    TitleEn: 'contract',
    TitleFa: 'صفحه قرارداد 3',
  }];
  changes: { ID, Date, ChangeItem, ImporterApproved, PMApproved, Json, DDate, Description }[] = [];
  changeItemsWithChecked: { ID, Title, Order, ChangeCategory, ChangeItem, VersionMaker, Checked }[] = [];

  constructor(private contractService: ContractService,
              private dialog: MatDialog,
              private router: Router,
              private sharedService: SharedService) {
  }

  ngOnInit() {
    this.contractService.getAllChangeItems().subscribe(
      (changeItems) => {
        changeItems.map(v => {
          this.changeItemsWithChecked.push({
            ID: v.ID,
            Title: v.Title,
            Order: v.Order,
            ChangeCategory: v.ChangeCategory,
            ChangeItem: v.ChangeItem,
            VersionMaker: v.VersionMaker,
            Checked: false
          });
        });
        console.log(this.changeItemsWithChecked);
      }
    );
    this.contractService.getChange(this.contractID, null, false).subscribe(
      (change) => {
        this.changes = change;
        console.log(this.changes, 'change');
      }
    );
    this.mainContractsComp = this.contracts;
  }

  onSearch(data: { contracts: any, type: string }) {
    if (data.type === this.type) {
      this.contracts = data.contracts;
    }
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

  getChangeItemName(id: number) {
    const selectedChangeItem = this.changeItemsWithChecked.filter(v => +v.ID === +id)[0];
    if (selectedChangeItem) {
      return this.changeItemsWithChecked.filter(v => +v.ID === +id)[0].Title;
    } else {
      return null;
    }
  }

  onClickPage(id: number) {
    this.router.navigate(['change'], {queryParams: {ID: this.contractID, ChangeID: id}, queryParamsHandling: 'merge'});
  }

  toggleView() {
    this.flipped = !this.flipped;
  }

  goToHome() {
    // this.menuService.navigateHome();
  }

  onChangeTab(index: number) {
    this.tabIndex = index;
  }

  onAddContract() {
    alert('Add Contract!');
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    // return 'rgba(60, 172, 197, 0.75)';
    return color;
  }
}
