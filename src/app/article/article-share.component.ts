import { Component, Input, OnInit } from '@angular/core';
import { MainNavService } from '../main-nav/main-nav.service';

import { ShareButtons } from 'ngx-sharebuttons/buttons';

@Component({
    selector: 'article-share',
       standalone: true,
       imports: [
    ShareButtons
],
    template: `
  <share-buttons theme="modern-dark"
    [include]="['copy', 'linkedin', 'pinterest', 'facebook', 'reddit']"
    [showIcon]="true" 
    [showText]="showLabel" 
    [url]="url">
</share-buttons>
  `
})
export class ArticleShareComponent implements OnInit {
    @Input() url = "";
    @Input() showLabel = true;
    constructor(public navService: MainNavService){}

    ngOnInit(): void {
      this.navService.isHandset$.subscribe(mobile => this.showLabel = !mobile);
    }
}
