import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { AmzProduct } from '../../interfaces/blog-interface';

@Component({
  selector: 'slider',
  templateUrl: './slider.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule
  ]
})
export class SliderComponent {
  @Input() items: Array<AmzProduct> = [];

  faAngleLeft = faAngleLeft;faAngleRight = faAngleRight;

  next(){
    const first = this.items.shift();
    if(first)
      this.items.push(first);
  }

  prev(){
    const last = this.items.pop();
    if(last)
      this.items.unshift(last);
  }
}