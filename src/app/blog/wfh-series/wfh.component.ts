import { Component } from '@angular/core';
import { data } from '../../app.data';
import { AppService } from '../../app.service';

@Component({
  templateUrl: './wfh.component.html'
})
export class WfhComponent {
  data = data.wfhGuideData.data;
  constructor(public appService: AppService) { }

}
