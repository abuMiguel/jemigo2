import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogComponent } from './blog.component';
import { data } from '../app.data';
import { DynamicComponent } from '../dynamic/dynamic.component';
import { ArticleRelatedComponent } from '../article/article-related.component';
import { ButtonComponent } from '../shared/components/button/button.component';
import { ArticleDisclosureComponent } from '../article/article-disclosure.component';
import { AmzProductComponent } from '../article/amz-product.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ArticleRelatedComponent,
        ArticleDisclosureComponent,
        ButtonComponent,
        AmzProductComponent,
        RouterModule.forChild(
            [
                {
                    path: ':id',
                    component: DynamicComponent,
                },
                {
                    path: '',
                    title: data.blogData.title,
                    component: BlogComponent,
                    data: data.blogData.data,
                },
            ]
        ),
    ],
    declarations: [
        BlogComponent,
    ]
})
export class BlogModule {}
