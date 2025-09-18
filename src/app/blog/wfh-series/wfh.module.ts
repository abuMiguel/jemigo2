import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { data } from '../../app.data';
import { WfhComponent } from './wfh.component';
import { WfhPart1Component } from './wfh-part1.component';
import { WfhPart2Component } from './wfh-part2.component';
import { ArticleHeaderComponent } from '../../article/article-header.component';
import { ArticleDisclosureComponent } from '../../article/article-disclosure.component';
import { AmzProductComponent } from '../../article/amz-product.component';
import { ScrollTopButtonComponent } from '../../article/scroll-top-button.component';
import { QuoteComponent } from '../../article/quote.component';
import { SliderComponent } from '../../shared/components/slider/slider.component';
import { imageLoaderConfig } from '../../shared/services/providers';

const routes: Routes = [
    {
        path: 'reasons-to-work-from-home',
        component: WfhPart1Component,
        data: data.wfhPart1Data.data,
    },
    {
        path: 'take-control',
        component: WfhPart2Component,
        data: data.wfhPart2Data.data,
    },
    {
        path: '',
        component: WfhComponent,
        data: data.wfhGuideData.data,
    }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ArticleHeaderComponent,
        ArticleDisclosureComponent,
        AmzProductComponent,
        ScrollTopButtonComponent,
        QuoteComponent,
        SliderComponent
    ],
    declarations: [
        WfhPart1Component,
        WfhPart2Component,
        WfhComponent,
    ],
    providers: [
        ...imageLoaderConfig
    ]
})
export class WfhModule { }
