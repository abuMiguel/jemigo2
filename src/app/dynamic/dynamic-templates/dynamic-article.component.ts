import { Component } from '@angular/core';
import { AppData } from '../../app.data';
import { ArticleInterface } from '../../shared/interfaces/article-interface';
import { ArticleComponent } from '../../article/article.component';

@Component({
    selector: 'dynamic-article',
    templateUrl: './dynamic-article.component.html',
  standalone: true,
  imports: [
    ArticleComponent,
  ]
})
export class DynamicArticleComponent implements ArticleInterface {
  data: AppData;
}

