import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { BrushService } from '../_services/index';
import { Brush, ChannelNames, GlobalVariables } from '../brush';

@Component({
  selector: 'app-brush-graph',
  templateUrl: './brush-graph.component.html',
  styleUrls: ['./brush-graph.component.scss']
})
export class BrushGraphComponent implements OnInit {

  // Chart variables
  public barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        ticks: {
          autoSkip: false // Stops labels from disappearing at certain resolutions
        }
      }],
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            max: 100
          }
        }
      ]
    },
    tooltips: {
      mode: 'point'
    }
  };
  public barChartLabels: string[] = ['No data'];
  public barChartData: any[] = [{
    data: 0,
    label: 'No data'
  }];
  public barChartType = 'bar';
  public barChartLegend = true;
  public isDataAvailable = false; // Controls if graph is displayed or not

  constructor(private data: BrushService) { }

  // Class variables
  private chNames: ChannelNames;
  private brushes: Brush[];
  private chart: [];
  private initialized = false;
  private currentBrushId: number;
  private maxChannelValue: number;
  private widePage = true; // If screen of user is wide (>=995px) = true

  ngOnInit() {
    // Subscriptions
    this.data.channelNames.subscribe(chNames => {
      this.chNames = chNames;
      if (this.initialized === true) {
        this.addData();
      }
    });
    this.data.currentBrush.subscribe(brushes => {
      if (this.initialized === true) {
        this.addData();
      }
      this.brushes = brushes;
      if (this.brushes.length > 0) {
        this.initialized = true;
      }
    });
    this.data.currentBrushId.subscribe(brushId => {
      this.currentBrushId = brushId;
      if (this.initialized === true) {
        this.addData();
        if (this.getWidthOfScreen() >= 995) { // If pixels of users screen >= 995px
          this.widePage = true;
        } else {
          this.widePage = false;
        }
      }
    });
    this.data.maxChannelValue.subscribe(maxChannelValue => {
        this.maxChannelValue = maxChannelValue;
        if (this.initialized === true) {
          this.addData();
        }
    });
    this.data.currentBrushId.subscribe(brushId => {
      this.currentBrushId = brushId;
      console.log(this.currentBrushId);
      if (this.initialized === true) {
        this.addData();
        if (this.getWidthOfScreen() >= 995) { // If pixels of users screen >= 995px
          this.widePage = true;
        } else {
          this.widePage = false;
        }
      }
    });
  }

  getWidthOfScreen() {
    return Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
  }

  // Add/update labels to graph
  addLabels() {
    const channelAmount = this.returnAmountOfChannels();
    this.barChartLabels.length = 0;

    this.barChartLabels.push(
      this.chNames.ch1,
      this.chNames.ch2,
      this.chNames.ch3
    );
    if (channelAmount >= 4) {
      this.barChartLabels.push(this.chNames.ch4);
    }
    if (channelAmount === 5) {
      this.barChartLabels.push(this.chNames.ch5);
    }
  }

  // Add/update data the graph
  addData() {
    if (this.currentBrushId > 0) {  // Do not draw graph if no brush is selected
      
      this.addLabels();
      this.isDataAvailable = true;
      this.barChartData = [];
      const br: Brush = this.brushes[this.currentBrushId - 1];
      const ch1Percent: number = (br.ch1 / this.maxChannelValue) * 100;
      console.log('ch1Percent: ' + br.ch1 + ' / ' + this.maxChannelValue + ' = ' + ch1Percent);
      const ch2Percent: number = (br.ch2 / this.maxChannelValue) * 100;
      const ch3Percent: number = (br.ch3 / this.maxChannelValue) * 100;
      const values: number[] = [ch1Percent, ch2Percent, ch3Percent];
      if (br.ch4 >= 0) {
        const ch4Percent: number = (br.ch4 / this.maxChannelValue) * 100;
        values.push(ch4Percent);
      }
      if (br.ch5 >= 0) {
        const ch5Percent: number = (br.ch5 / this.maxChannelValue) * 100;
        values.push(ch5Percent);
      }

      this.barChartData.push({
        data: values,
        label: 'BrushID: ' + this.currentBrushId
      });

      // For Angular to recognize the change in the dataset!
      const clone = JSON.parse(JSON.stringify(this.barChartData));
      clone[0].data = values;
      clone[0].label = 'BrushID ' + this.currentBrushId;
      this.barChartData = clone;
    } else {
      this.isDataAvailable = false;
    }
  }

  returnAmountOfChannels() {
    let totalChannels = 0;
    if (this.brushes[0].ch3 >= 0) { totalChannels = 3; }
    if (this.brushes[0].ch4 >= 0) { totalChannels = 4; }
    if (this.brushes[0].ch5 >= 0) { totalChannels = 5; }
    return totalChannels;
  }
}
