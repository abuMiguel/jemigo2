import { Component } from '@angular/core';
import { data } from '../app.data';

@Component({
    selector: 'tools',
    templateUrl: './tools.component.html',
    styleUrls: ['./tools.component.css'],
})
export class ToolsComponent {
    data = data.toolsData.data;
}
