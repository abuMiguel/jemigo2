import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  standalone: true,
  imports: [NgOptimizedImage],
})
export class FooterComponent {
  year = new Date().getFullYear();
}
