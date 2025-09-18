import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { data } from '../../app.data';
import { AmzProduct } from '../../shared/interfaces/blog-interface';
import { AppService } from '../../app.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
    templateUrl: './wfh-part1.component.html',
    standalone: false
})
export class WfhPart1Component {

  data = data.wfhPart1Data.data;

    //wfh sign, smart watch
    asins = [
      "B08F2JGLL7", 
      "B0B8YR3KZS",
      "B08N9P9MDQ"
    ];
  wfhSign: AmzProduct | undefined;
  gtrSmartWatch: AmzProduct | undefined;
  productivityBook: AmzProduct | undefined;
    
  constructor(public appService: AppService,
    @Inject(PLATFORM_ID) private platformId: any
  ){}

  ngOnInit(){
    if(isPlatformBrowser(this.platformId)){

    this.appService.getAmazonProducts(this.asins).subscribe(
      prods => {
        if(prods){
          this.wfhSign = prods.find(prod => prod.asin.toUpperCase() === this.asins[0]);
          this.gtrSmartWatch = prods.find(prod => prod.asin.toUpperCase() === this.asins[1]);
          this.productivityBook = prods.find(prod => prod.asin.toUpperCase() === this.asins[2]);
        }
      }
    );
  }
}
}
