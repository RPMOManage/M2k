import { Component, Inject, OnInit, Optional } from '@angular/core';
import * as Highcharts from 'highcharts';
import { Chart } from 'angular-highcharts';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-plan-act-prop-chart',
  templateUrl: './plan-act-prop-chart.component.html',
  styleUrls: ['./plan-act-prop-chart.component.scss']
})
export class PlanActPropChartComponent implements OnInit {
  chart;
  chartOptions;
  date;

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public passedData: any) {
  }

  ngOnInit() {
    console.log(this.passedData.colHeaders);
    this.buildChart();
    this.cc();
  }

  cc() {
    for (let i = 0; i < (this.passedData.colHeaders.length - 1) / 2; i++) {
      const jab = this.passedData.tableData.map(v => ({
        x: new Date(v[0]),
        y: this.checkDataZeroforChart(v[(i) * 2 + 1])
      }));
      const jab2 = this.passedData.tableData.map(v => ({
        x: new Date(v[0]),
        y: this.checkDataZeroforChart(v[(i) * 2 + 2])
      }));
      this.chart.addSeries({
        name: this.passedData.chartHeaders[(i) * 2 + 1],
        data: jab,
        color: 'blue'
      }, true);
      this.chart.addSeries({
        name: this.passedData.chartHeaders[(i) * 2 + 2],
        data: jab2,
        dashStyle: 'shortdash',
        color: 'red'
      }, true);
    }
  }

  buildChart() {
    this.chartOptions = {
      chart: {
        type: 'spline',
        zoomType: 'x',
        height: 450,
        animation: true
      },
      plotOptions: {
        series: {
          connectNulls: true
        }
      },
      yAxis: {
        max: 100,
        min: 0,
        title: {
          text: 'درصد پیشرفت'
        },
        labels: {
          formatter: function () {
            return this.value + '%';
          }
        }
      },
      tooltip: {
        padding: 4,
        useHTML: true,
        formatter: function () {
          return '<p class="highchart-Tooltip">' + this.series.name + '</p>' +
            '<p class="highchart-Tooltip">' + ' تاریخ : ' + new Date(this.point.category).getFullYear() + '/' + (+new Date(this.point.category).getMonth() + 1) + '/' + new Date(this.point.category).getDate() + '</p>' +
            '<p style="direction: ltr;" class="highchart-Tooltip">' + 'مقدار : ' + Highcharts.numberFormat(Math.abs(this.point.y), 0) + '</p>';
        }
      },
      legend: {
        width: 600,
        itemWidth: 300,
        itemStyle: {
          width: 280
        },
        rtl: true,
      },
      dateFormat: 'YYYY/mm/dd',
      xAxis: {
        type: 'datetime',
        labels: {
          formatter: function () {
            const monthStr = Highcharts.dateFormat('%Y/%m/%e', this.value);
            return monthStr;
          }
        },
      },
      title: {
        text: ''
      },
      credits: {
        enabled: false
      },
      series: []
    };
    this.chart = new Chart(this.chartOptions);
  }

  checkDataZeroforChart(value) {
    if (value !== '' && value !== null) {
      return value * 100;
    } else {
      return null;
    }
  }
}
