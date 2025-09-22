import { Component } from '@angular/core';
import { AppData } from '../../app.data';
import { ArticleInterface } from '../../shared/interfaces/article-interface';
import { ArticleComponent } from '../../article/article.component';
import { SanitizeHtmlPipe } from '../../shared/pipes/sanitize-html.pipe';

@Component({
    selector: 'dynamic-article',
    templateUrl: './dynamic-article.component.html',
  standalone: true,
  imports: [
    ArticleComponent,
    SanitizeHtmlPipe,
  ]
})
export class DynamicArticleComponent implements ArticleInterface {
  data: AppData;
}

