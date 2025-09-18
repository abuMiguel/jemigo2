import { Component, Input } from '@angular/core';
import { AppData } from '../app.data';
import { CommonModule } from '@angular/common';
import { ArticleHeaderComponent } from './article-header.component';
import { ArticleDisclosureComponent } from './article-disclosure.component';
import { ScrollTopButtonComponent } from './scroll-top-button.component';

@Component({
    selector: 'jmg-article',
    templateUrl: './article.component.html',
    standalone: true,
    imports: [
        CommonModule,
        ArticleHeaderComponent,
        ArticleDisclosureComponent,
        ScrollTopButtonComponent
    ]
})
export class ArticleComponent {
    @Input() data: AppData | undefined = undefined;
}
