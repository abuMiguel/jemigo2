import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { data } from '../../app.data';
import { AppService } from '../../../app/app.service';
import { AmzProduct } from '../../../../server.models';

import { ArticleHeaderComponent } from '../../article/article-header.component';
import { ArticleDisclosureComponent } from '../../article/article-disclosure.component';
import { AmzProductComponent } from '../../article/amz-product.component';

@Component({
  templateUrl: './energy-drinks.component.html',
  standalone: true,
  imports: [
    ArticleHeaderComponent,
    ArticleDisclosureComponent,
    AmzProductComponent
]
})
export class EnergyDrinksComponent implements OnInit {
  data = data.reviewEnergyDrinksData.data;
  //celsius, super cold brew
  asins = [
    "B007R8XGJA", 
    "B08M69N14D",
  ];
  celsius: AmzProduct | undefined;
  superColdBrew: AmzProduct | undefined;

  constructor(private appService: AppService,
    @Inject(PLATFORM_ID) private platformId: any
  ) { }

  ngOnInit(){
    this.appService.getAmazonProducts(this.asins).subscribe(
      prods => {
        if(prods){
          this.celsius = prods.find(prod => prod.asin.toUpperCase() === this.asins[0]);
          this.superColdBrew = prods.find(prod => prod.asin.toUpperCase() === this.asins[1]);
        }
    });
  }
}
