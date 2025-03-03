import { Component, Input } from '@angular/core';

@Component({
  selector: 'banner',
  template: `
  <div>

  </div>`
})
export class BannerComponent {
  @Input() affiliate = true;
}