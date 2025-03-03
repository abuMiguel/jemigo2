import { Component, input, computed } from '@angular/core';
import { AppData } from '../app.data';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'article-page-contents',
  templateUrl: './article-page-contents.component.html',
  standalone: true,
  imports: [
    CommonModule,
  ],
})
export class ArticlePageContentsComponent {
  data = input.required<AppData>();
  headerElements = computed(() => this.data().article?.parts?.filter(el => el?.tag === "h2"));

  constructor(){}
}
