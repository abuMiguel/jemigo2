import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminComponent } from './admin.component';
import { ArticleManagementComponent } from './article-management.component';
import { ProductManagementComponent } from './prod-management.component';

const routes: Routes = [
    {
        path: "",
        title: "admin",
        component: AdminComponent,
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ArticleManagementComponent,
        ProductManagementComponent,
        RouterModule.forChild(routes)
    ],
    declarations: [
        AdminComponent
    ]
})
export class AdminModule { }
