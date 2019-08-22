import { Component, Inject, OnInit, Optional } from '@angular/core';
import * as Highcharts from 'highcharts';
import { Chart } from 'angular-highcharts';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-deliverables-chart',
  templateUrl: './deliverables-chart.component.html',
  styleUrls: ['./deliverables-chart.component.scss']
})
export class DeliverablesChartComponent implements OnInit {
  chartOptions;
  chart;
  zones;
  date;
  name_Deliverable;

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public passedData: any) {
  }

  ngOnInit() {
    this.zones = this.passedData.zones;
    this.name_Deliverable = this.passedData.name_Deliverable;
    this.buildChart();
    this.cc();
  }

  cc() {
    const dd = [[]];
    const ddPlan = [[]];
    this.date = this.passedData.tableData.map(v => v[0]);
    let colActData = [];
    let colPlanData = [];
    for (let i = 0; i < this.name_Deliverable.length; i++) {
      colActData = this.passedData.tableData.map(v => v[i * 2 + 1]);
      colPlanData = this.passedData.tableData.map(v => v[i * 2 + 2]);
      dd[i] = [];
      ddPlan[i] = [];
      for (let j = 0; j < this.date.length; j++) {
        dd[i][j] = {
          x: Date.UTC(
            +this.date[j].split('/')[0],
            +this.date[j].split('/')[1] - 1,
            +this.date[j].split('/')[2]),
          y: +colActData[j]
        };
        ddPlan[i][j] = {
          x: Date.UTC(
            +this.date[j].split('/')[0],
            +this.date[j].split('/')[1] - 1,
            +this.date[j].split('/')[2]),
          y: -colPlanData[j]
        };
      }
    }
    if (this.zones) {
      for (let i = 0; i < this.name_Deliverable.length; i++) {
        const mainZone = this.passedData.zoneNames.filter(v => v.Id === this.zones[i])[0].Name;
        this.chart.addSeries({
          name: 'واقعی' + ' | ' + mainZone,
          data: dd[i],
        }, true);
        this.chart.addSeries({
          name: 'برنامه ای' + ' | ' + mainZone,
          data: ddPlan[i],
        }, true);
      }
    } else {
      for (let i = 0; i < this.name_Deliverable.length; i++) {
        this.chart.addSeries({
          name: ' واقعی | ' + this.name_Deliverable[i].Name,
          data: dd[i],
        }, true);
        this.chart.addSeries({
          name: ' برنامه ای | ' + this.name_Deliverable[i].Name,
          data: ddPlan[i],
        }, true);
      }
    }

  }

  buildChart() {
    this.chartOptions = {
      chart: {
        type: 'column',
        height: 500,
        zoomType: 'x'
      },
      title: {
        text: this.passedData.title
      },
      dateFormat: 'YYYY/mm/dd',
      subtitle: {
        text: this.passedData.tooltip
      },
      legend: {
        width: 600,
        itemWidth: 300,
        itemStyle: {
          width: 280
        },
        rtl: true,
      },
      xAxis: [{
        title: {
          text: ''
        },
        type: 'datetime',
        labels: {
          formatter: function () {
            const monthStr = Highcharts.dateFormat('%Y/%m/%e', this.value);
            return monthStr;
          }
        },
        reversed: false,
      }, {
        opposite: true,
        scrollbar: {
          enabled: false
        },
        type: 'datetime',
        reversed: false,
        linkedTo: 0,
        labels: {
          formatter: function () {
            const monthStr = Highcharts.dateFormat('%Y/%m/%e', this.value);
            return monthStr;
          }
        },
      }],
      yAxis: {
        minRange: 150,
        plotLines: [{
          color: '#4b3a69',
          width: 3,
          value: 0
        }],
        title: {
          text: this.passedData.measureUnit
        },
        scrollbar: {
          enabled: false
        },
        labels: {
          formatter: function () {
            return Math.abs(this.value);
          }
        }
      },

      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            formatter: function () {
              return Math.abs(this.y);
            },
            enabled: true,
          }
        }
      },
      tooltip: {
        padding: 4,
        useHTML: true,
        formatter: function () {
          return '<p class="highchart-Tooltip">' + this.series.name + '</p>' +
            '<p class="highchart-Tooltip">' + ' تاریخ : ' + new Date(this.point.category).getFullYear() + '/' + (+new Date(this.point.category).getMonth() + 1) + '/' + new Date(this.point.category).getDate() + '</p>' +
            '<p class="highchart-Tooltip">' + 'مقدار : ' + Highcharts.numberFormat(Math.abs(this.point.y), 0) + '</p>';
        }
      },
      series: [],
    };
    this.chart = new Chart(this.chartOptions);
  }

}
