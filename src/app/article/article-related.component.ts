import { Component, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RouteData } from '../app.data';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'article-related',
    templateUrl: './article-related.component.html',
  standalone: true,
  imports: [
        RouterLink,
        CommonModule,
    ],

})
export class ArticleRelatedComponent {

  @Input() articlesData: RouteData[] = [];
  @Input() showHeader = true;
  @Input() centerLinks = false;
  @Input() smallerVersion = false;
  constructor(public router: Router) { }
}
