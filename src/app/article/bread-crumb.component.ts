import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <nav><p class="mt-0"><a [routerLink]="backRoute">{{backName}}</a></p></nav>
  `
})
export class BreadCrumbComponent {
  @Input() backRoute = "/";
  @Input() backName = "Back";
}
