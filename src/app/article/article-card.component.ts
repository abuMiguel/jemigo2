import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'article-card',
    templateUrl: './article-card.component.html',
    imports: [DatePipe],
    standalone: true,
})
export class ArticleCardComponent {

  @Input() title = "";
  @Input() linkRoute = "/";
  @Input() snippet = "";
  @Input() alt = "";
  @Input() date = "";
  @Input() imgRoute = "";

  constructor(public router: Router) {}

  routeTo(){
    this.router.navigate([this.linkRoute]);
  }
}
