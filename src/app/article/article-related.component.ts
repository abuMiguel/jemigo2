import { Component, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RouteData } from '../app.data';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { imageLoaderConfig } from '../shared/services/providers';

@Component({
  selector: 'article-related',
  templateUrl: './article-related.component.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgOptimizedImage,
  ],
  providers: [
    ...imageLoaderConfig
  ]
})
export class ArticleRelatedComponent {

  @Input() articlesData: RouteData[] = [];
  @Input() showHeader = true;
  @Input() centerLinks = false;
  @Input() smallerVersion = false;
  constructor(public router: Router) { }
}
