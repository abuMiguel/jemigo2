import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'article-disclosure',
    standalone: true,
    imports: [
        CommonModule
    ],
    template: `
  <section *ngIf="affiliate" class="affiliate-disclaimer">
    "When you purchase products through our links, we may receive a commission at no additional
    cost to you."
  </section>`
})
export class ArticleDisclosureComponent {
  @Input() affiliate = true;
}
