import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ToolsComponent } from './tools.component';
import { PercentChangeToolComponent } from './wfh-tools/percent-change.component';
import { TimeSavingsToolComponent } from './wfh-tools/time-savings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { data } from '../app.data';
import { ToolsNavComponent } from './tools-nav.component';

const routes: Routes = [
    { path: '', component: ToolsComponent, title: data.toolsData.title, data: data.toolsData, pathMatch: 'full' },
    { path: 'percent-change-calculator', component: PercentChangeToolComponent, title: data.percentChangeToolData.title, data: data.percentChangeToolData.data },
    { path: 'wfh-time-savings-calculator', component: TimeSavingsToolComponent, title: data.wfhTimeSavingsToolData.title, data: data.wfhTimeSavingsToolData.data },
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        ToolsComponent,
        PercentChangeToolComponent,
        TimeSavingsToolComponent,
        ToolsNavComponent
    ]
})
export class ToolsModule { }
