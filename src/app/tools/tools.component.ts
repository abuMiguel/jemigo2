import { Component } from '@angular/core';
import { data } from '../app.data';

@Component({
    selector: 'tools',
    templateUrl: './tools.component.html',
    styleUrls: ['./tools.component.css'],
    standalone: false
})
export class ToolsComponent {
    data = data.toolsData.data;
}
