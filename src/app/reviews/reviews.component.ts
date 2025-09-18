import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { data } from '../app.data';
import { AmzProduct } from '../shared/interfaces/blog-interface';
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
    data.reviewEnergyDrinksData
  ];

  asins = [
    "B07M6PKB9W", 
    "B0952L6DRN",
    "B07HMXBSLW",
  ];
  chargingStation: AmzProduct | undefined;
  kvm: AmzProduct | undefined;
  cableTray: AmzProduct | undefined;

  constructor(public router:Router,
    private appService: AppService,
    @Inject(PLATFORM_ID) private platformId: unknown
  ){
      if(isPlatformBrowser(this.platformId)){

      this.appService.getAmazonProducts(this.asins).subscribe(
        prods => {
          if(prods){
            this.chargingStation = prods.find(prod => prod.asin.toUpperCase() === this.asins[0]);
            this.kvm = prods.find(prod => prod.asin.toUpperCase() === this.asins[1]);
            this.cableTray = prods.find(prod => prod.asin.toUpperCase() === this.asins[2]);
          }
        }
      );
    }
    }

  navigateTo(route: string){
    this.router.navigate([route]);
  }

  ngOnInit(){

  }
}
