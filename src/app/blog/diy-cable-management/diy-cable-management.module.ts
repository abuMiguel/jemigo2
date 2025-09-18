import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { data } from '../../app.data';
import { DiyCableManagementComponent } from './diy-cable-management.component';
import { ArticleHeaderComponent } from '../../article/article-header.component';
import { ArticleDisclosureComponent } from '../../article/article-disclosure.component';
import { AmzProductComponent } from '../../article/amz-product.component';
import { QuoteComponent } from '../../article/quote.component';
import { ScrollTopButtonComponent } from '../../article/scroll-top-button.component';
import { FormsModule } from '@angular/forms';
import { imageLoaderConfig } from '../../shared/services/providers';


const routes: Routes = [
    {
        path: '',
        title: data.cableManData.title,
        component: DiyCableManagementComponent,
        data: data.cableManData.data,
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ArticleHeaderComponent,
        ArticleDisclosureComponent,
        QuoteComponent,
        AmzProductComponent,
        ScrollTopButtonComponent,
        RouterModule.forChild(routes)
    ],
    declarations: [
        DiyCableManagementComponent
    ],
    providers: [
        ...imageLoaderConfig
    ]
})
export class DiyCableManagementModule { }
