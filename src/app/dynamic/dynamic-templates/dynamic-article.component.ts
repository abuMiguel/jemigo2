import { Component } from '@angular/core';
import { AppData } from '../../app.data';
import { ArticleInterface } from '../../shared/interfaces/article-interface';
import { CommonModule } from '@angular/common';
import { ArticleComponent } from '../../article/article.component';
import { ArticlePageContentsComponent } from '../../article/article-page-contents.component';
import { AmzProductComponent } from '../../article/amz-product.component';

@Component({
  selector: 'dynamic-article',
  templateUrl: './dynamic-article.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ArticleComponent,
    ArticlePageContentsComponent,
    AmzProductComponent,
  ]
})
export class DynamicArticleComponent implements ArticleInterface {
  data: AppData;
}

