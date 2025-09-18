import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AppData } from '../app.data';
import { ArticleShareComponent } from './article-share.component';

@Component({
    selector: 'article-header',
    templateUrl: './article-header.component.html',
  standalone: true,
  imports: [
        ArticleShareComponent,
        DatePipe,
    ],
})
export class ArticleHeaderComponent {
  @Input() data: AppData | undefined = undefined;
}
