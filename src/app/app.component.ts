import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { AppService } from './app.service';
import { ActivatedRoute, Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { faArrowRightLong } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FooterComponent } from './footer/footer.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  providers: [Router],
  imports: [
    RouterModule,
    FontAwesomeModule,
    CommonModule,
    FooterComponent,
    RouterOutlet,
    RouterLink,
    NgOptimizedImage,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  faArrowRightLong = faArrowRightLong;
  environment = environment;
  private clickListener: () => void;

  constructor(
    public appService: AppService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.appService.updateMetaTags();

    this.clickListener = this.renderer.listen('document', 'click', (event) => {
      const menuToggle = document.getElementById('menu-toggle') as HTMLInputElement;
      const mobileNav = document.getElementById('mobile-nav');

      // Check if the click is outside the mobile nav menu
      if (menuToggle && mobileNav && !mobileNav.contains(event.target)) {
        menuToggle.checked = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.clickListener) {
      this.clickListener();
    }
  }
}