import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'article-card',
  templateUrl: './article-card.component.html',
  standalone: true,
  imports: [
    CommonModule,
  ]
})
export class ArticleCardComponent {

  @Input() title = "";
  @Input() linkRoute = "/";
  @Input() snippet = "";
  @Input() alt = "";
  @Input() date = "";

  _imgRoute: string;
  get imgRoute(): string {
    return this._imgRoute;
  }
  @Input() set imgRoute(value: string) {
    const src = value.split(".");
    this._imgRoute = `${src[0]}-640w.${src[1]}`;
  }

  constructor(public router: Router) {}

  routeTo(){
    this.router.navigate([this.linkRoute]);
  }
}
