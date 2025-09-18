import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { data } from '../../app.data';
import { ViewportScroller, isPlatformBrowser } from '@angular/common';
import { AmzProduct } from '../../shared/interfaces/blog-interface';
import { AppService } from '../../app.service';

@Component({
    templateUrl: './wfh-part2.component.html',
    standalone: false
})
export class WfhPart2Component implements OnInit{

  data = data.wfhPart2Data.data;

  asins = [
    "B08R9V1HNQ", 
    "B084692GC8",
    "B000O3S0PK",
    "B071GL4MXS",
    "B07F7ZJ9D3",
    "B08JD7FN44",
    "B07QY69DQN"
  ];
  asins2 = [
    "B07XHFZ1P4", 
    "B09FF8BCMX",
    "B09DV8WKK8",
    "B09DCNDVD7",
    "B08FRL3Y6N",
    "B08Q3P48ZS",
    "B08DHMMBFF"
  ];
  asins3 = [
    "B08GFLT87K", 
    "B088WJ2PT9",
    "B0B8VKS5H2",
    "B08B4N5JX9",
    "B0828BS2YD",
    "B088KQTGDD",
    "B079MM48JQ"
  ];

  wfhBookAsin = "0991405161";
  
  wfh2Slider: Array<AmzProduct> = [];
  wfh2Slider2: Array<AmzProduct> = [];
  wfh2Slider3: Array<AmzProduct> = [];
  wfhBook: AmzProduct | undefined;

  constructor(public appService: AppService, 
    private viewportScroller: ViewportScroller,
    @Inject(PLATFORM_ID) private platformId: any
  ){}

  ngOnInit(){
    if(isPlatformBrowser(this.platformId)){

    this.appService.getAmazonProducts([...this.asins, ...this.asins2, ...this.asins3, this.wfhBookAsin]).subscribe(
      prods => {
        if(prods){
          prods.forEach(prod => {
            if(this.asins.includes(prod.asin.toUpperCase())){
              this.wfh2Slider.push(prod);
            }
            if(this.asins2.includes(prod.asin.toUpperCase())){
              this.wfh2Slider2.push(prod);
            }
            if(this.asins3.includes(prod.asin.toUpperCase())){
              this.wfh2Slider3.push(prod);
            }
            if(prod.asin.toUpperCase() === this.wfhBookAsin){
              this.wfhBook = prod;
            }

          });
        }
      }
    );
  }
  }
}
