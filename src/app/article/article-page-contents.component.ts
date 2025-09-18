import { Component, input, computed } from '@angular/core';
import { AppData } from '../app.data';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'article-page-contents',
    templateUrl: './article-page-contents.component.html',
  standalone: true,
  imports: [
        CommonModule,
    ]
})
export class ArticlePageContentsComponent {
  data = input.required<AppData>();
  headerElements = computed(() => {
    const headerIndices = this.data().article?.contents.ops.flatMap((op, i) => {
      return op?.attributes?.["header"] === 2 ? i - 1 : [];
    });
    return headerIndices;
  });



  constructor(){}
}
