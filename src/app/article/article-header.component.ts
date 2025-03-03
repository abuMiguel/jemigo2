import { Component, Input } from '@angular/core';
import { AppData } from '../app.data';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ResourceUrlSanitizerPipe } from '../shared/pipes/url-sanitize-resource.pipe';
import { ArticleShareComponent } from './article-share.component';
import { imageLoaderConfig } from '../shared/services/providers';

@Component({
  selector: 'article-header',
  templateUrl: './article-header.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ResourceUrlSanitizerPipe,
    ArticleShareComponent,
    NgOptimizedImage,
  ],
  providers: [
    ...imageLoaderConfig
  ]
})
export class ArticleHeaderComponent {
  @Input() data: AppData | undefined = undefined;
}
