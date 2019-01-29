import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Brush, ChannelNames, GlobalVariables } from '../brush';
import { BrushService } from '../brush.service';
import { PagerService } from '../_services/index';

@Component({
  selector: 'app-brush-table',
  templateUrl: './brush-table.component.html',
  styleUrls: ['./brush-table.component.scss']
})

export class BrushTableComponent implements OnInit {
  constructor(private cookieService: CookieService, private data: BrushService,
              private pagerService: PagerService) { }

  // Local variables
  brushes: Brush[];
  channelNames: ChannelNames;
  initialized = false;
  globals: GlobalVariables;

  // Keep track ogf current page
  currentPage = 1;

  // pager object
  pager: any = {};

  // paged items
  pagedItems: Brush[];

  ngOnInit() {
    // Subscribe
    this.data.currentBrush.subscribe(brushes => {
      this.brushes = brushes;

      if (this.initialized === true) { // Page is fully initialized
        // Initialize to page 1
        this.setPage(1);
      }

    });
    this.data.channelNames.subscribe(chNames => {
      this.channelNames = chNames;
      if (this.initialized === true) { // Page is fully initialized
        this.addChannelCookie();
      }
      this.initialized = true;
    });
    this.data.changeGlobals({currentBrushId: 1});
    this.data.globals.subscribe(globalVars => {
      this.globals = globalVars;
    });
    // Check if a cookie named chNames exist
    if (this.cookieService.check('chNames')) {
      console.log('We have a cookie with the value: ' + this.cookieService.get('chNames'));
      this.channelNames = JSON.parse(this.cookieService.get('chNames'));
    }
  }

  setPage(page: number) {
    this.currentPage = page;
    // get pager object from service
    this.pager = this.pagerService.getPager(this.brushes.length, page);

    // get current page of items
    this.pagedItems = this.brushes.slice(this.pager.startIndex, this.pager.endIndex + 1);

    // Check if a row on this page needs to be marked
    if (this.initialized = true) {
      const index = 10 * (this.currentPage - 1) + 1; // Current first row index
      const indexEnd = index + this.pagedItems.length - 1; // Last index for current page

      if ( this.globals.currentBrushId >= index && this.globals.currentBrushId <= indexEnd ) {
        console.log('SetPage currentID: ' + this.globals.currentBrushId);
        console.log('SetPage indexes: ' + index + ', ' + indexEnd);
        this.markRow(this.globals.currentBrushId);
      }
    }
  }

  // Returns default channel names
  returnChannelDefaults() {
    const defaultNames = {ch1: 'Channel 1', ch2: 'Channel 2', ch3: 'Channel 3', ch4: 'Channel 4', ch5: 'Channel 5'};
    return defaultNames;
  }

  markRow(rowId: number) {
    console.log('Marking row');

    this.data.changeGlobals({currentBrushId: rowId});
    this.data.changeChannelName(this.channelNames);
    const colorClass = 'table-danger';

    let index = 10 * (this.currentPage - 1) + 1; // Current first row index
    const indexEnd = index + this.pagedItems.length - 1; // Last index for current page

    // Clear color of all inactive rows
    for (index; index <= indexEnd; index++) {
      console.log (index.toString());
      document.getElementById(index.toString()).classList.remove(colorClass);
    }

    // Setting color of the active row
    document.getElementById(rowId.toString()).classList.add(colorClass);
  }

  changeChannelValue(channelId: number) {
    const channelName = (<HTMLInputElement>document.getElementById('channelName' + channelId)).value;

    if (channelId === 1) {
      this.channelNames.ch1 = channelName;
    } else if (channelId === 2) {
      this.channelNames.ch2 = channelName;
    } else if (channelId === 3) {
      this.channelNames.ch3 = channelName;
    } else if (channelId === 4) {
      this.channelNames.ch4 = channelName;
    } else if (channelId === 5) {
      this.channelNames.ch5 = channelName;
    }
    this.data.changeChannelName(this.channelNames);
  }

  // Add/customize a cookie containing users channelnames
  addChannelCookie() {
    const json_channelNames = JSON.stringify(this.channelNames);
    this.cookieService.set('chNames', json_channelNames, 365); // Expires after 1 year
  }

  updateBrushes(brushId: number, channel: string) {
    const elementId = '' + brushId + channel;
    const val = (<HTMLInputElement>document.getElementById(elementId)).value;

    const brush = this.brushes[brushId - 1];
    if (channel === 'ch1') {
      brush.ch1 = +val; // + parses string to number
    } else if (channel === 'ch2') {
      brush.ch2 = +val;
    } else if (channel === 'ch3') {
      brush.ch3 = +val;
    } else if (channel === 'ch4') {
      brush.ch4 = +val;
    } else if (channel === 'ch5') {
      brush.ch5 = +val;
    } else {  // channel === "desc"
      brush.desc = val;
    }
    this.data.changeBrush(this.brushes);
  }

  // If the user wants to reset his channel-name changes
  resetChannelValues() {
    const defaultVals = this.returnChannelDefaults();
    this.channelNames = defaultVals;
    this.data.changeChannelName(this.channelNames);
  }
}
