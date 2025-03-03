import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../app.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ArticleRelatedComponent } from '../article/article-related.component';
import { ButtonComponent } from '../shared/components/button/button.component';
import { ArticleDisclosureComponent } from '../article/article-disclosure.component';
import { AmzProductComponent } from '../article/amz-product.component';
@Component({
  selector: 'reviews',
  templateUrl: './reviews.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ArticleRelatedComponent,
    ButtonComponent,
    ArticleDisclosureComponent,
    AmzProductComponent
  ]
})
export class ReviewsComponent {
  allReviews = [
    //data.reviewEnergyDrinksData
  ];

  constructor(public router:Router,
    private appService: AppService,
    @Inject(PLATFORM_ID) private platformId: unknown
  ){
      if(isPlatformBrowser(this.platformId)){

    }
    }

  navigateTo(route: string){
    this.router.navigate([route]);
  }

  ngOnInit(){

  }
}
