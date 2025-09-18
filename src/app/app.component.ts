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
    providers: [Router],
    imports: [
        RouterModule,
        FontAwesomeModule,
        CommonModule,
        FooterComponent,
        RouterOutlet,
        RouterLink,
    ]
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
    //@Inject(DOCUMENT) private document: any
  ) 
    {
    // afterNextRender(() => {
    //   isBrowser => {
    //     if (isBrowser) {
    //       const me = this.document?.localStorage?.getItem("itsme");
    //       if (!me) {
    //         this.appService.incrementVisits().subscribe();
    //       }
    //     }
    //   }
    // });
    }

  ngOnInit(): void {
    this.appService.updateMetaTags();


    //setup cust app scroll behavior
    // this.router.events.pipe(
    //   filter((event): event is Scroll => event instanceof Scroll))
    //   .subscribe(
    //     () => {
    //       const nestedChildRoutes = ["wfh-guide", "wfh-tools"];
    //       let scrollToTop = true;
    //       nestedChildRoutes.forEach(r => {
    //         if (this.appService.previousUrl?.includes(r) &&
    //           this.appService.currentUrl?.includes(r)) {
    //           scrollToTop = false;
    //         }
    //       });

    //       if (scrollToTop) {
    //         //default scroll behavior
    //         this.viewportScroller.scrollToPosition([0, 0]);
    //       }
    //     }
    //   );
  }

}