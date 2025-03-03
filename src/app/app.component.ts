import { Component, OnInit } from '@angular/core';
import { AppService } from './app.service';
import { ActivatedRoute, Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { faUser, faHouseChimney, faStar, faBlog, faCode, faTools, faArrowRightLong } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
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
  ],
})
export class AppComponent implements OnInit {
  faUser = faUser; faStar = faStar;
  faHouseChimney = faHouseChimney; faBlog = faBlog;
  faCode = faCode; faTools = faTools;
  faArrowRightLong = faArrowRightLong;
  environment = environment;

  constructor(
    public appService: AppService,
    private router: Router,
     private activatedRoute: ActivatedRoute,
  ) 
    {

    }

  ngOnInit(): void {
    this.appService.updateMetaTags();
  }

}