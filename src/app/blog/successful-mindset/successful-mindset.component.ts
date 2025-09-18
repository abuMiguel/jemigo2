import { Component, OnInit } from '@angular/core';
import { data } from '../../app.data';
import { AmzProduct } from '../../shared/interfaces/blog-interface';
import { AppService } from '../../app.service';


@Component({
    templateUrl: './successful-mindset.component.html',
    standalone: false
})
export class SuccessfulMindsetComponent implements OnInit {
  data = data.successMindsetData.data;

  changeHabitsAsins = [
    "0735211299",
    "0671035975",
    "098897987X",
    "1982137274",
    "081298160X",
  ];
  changeHabitsBooks: Array<AmzProduct> = [];

  understandYourselfAsins = [
    "1328915433",
    "0767928067",
    "0062316117",
    "0062464345",
    "0307352153",
  ];
  understandYourselfBooks: Array<AmzProduct> = [];

  socialAndCommunicationAsins = [
    "B08ZW85PPX",
    "0316478520",
    "007141858X",
  ];
  socialAndCommunicationBooks: Array<AmzProduct> = [];

  startABusinessAsins = [
    "0307463745",
    "0804139296",
    "0307887898",
  ];
  startABusinessBooks: Array<AmzProduct> = [];

  thriveEconomicallyAsins = [
    "1612680194",
    "1585424331",
    "1328915433",
  ];
  thriveEconomicallyBooks: Array<AmzProduct> = [];


  productivityAsins = [
    "0385491743",
    "0812983599",
    "1631619985",
  ];
  productivityBooks: Array<AmzProduct> = [];

  creativityAndThoughtAsins = [
    "0374533555",
    "0761169253",
    "0062358308",
  ];
  creativityAndThoughtBooks: Array<AmzProduct> = [];

  healthAsins = [
    "1443460710",
    "B00BDXF6BG",
  ];
  healthBooks: Array<AmzProduct> = [];

  reachYourGoalsAsins = [
    "0470627603",
  ];
  reachYourGoalsBooks: Array<AmzProduct> = [];

  constructor(private appService: AppService,
  ) { }

  ngOnInit() {
    this.appService.getAmazonProducts(
      [...this.changeHabitsAsins,
      ...this.understandYourselfAsins,
      ...this.socialAndCommunicationAsins,
      ...this.startABusinessAsins,
      ...this.thriveEconomicallyAsins,
      ...this.productivityAsins,
      ...this.creativityAndThoughtAsins,
      ...this.healthAsins,
      ...this.reachYourGoalsAsins,
      ]).subscribe(
        prods => {
          if (prods) {
            prods.forEach(prod => {
              if (this.changeHabitsAsins.includes(prod.asin.toUpperCase())) {
                this.changeHabitsBooks.push(prod);
              }
              if (this.understandYourselfAsins.includes(prod.asin.toUpperCase())) {
                this.understandYourselfBooks.push(prod);
              }
              if (this.socialAndCommunicationAsins.includes(prod.asin.toUpperCase())) {
                this.socialAndCommunicationBooks.push(prod);
              }
              if (this.startABusinessAsins.includes(prod.asin.toUpperCase())) {
                this.startABusinessBooks.push(prod);
              }
              if (this.thriveEconomicallyAsins.includes(prod.asin.toUpperCase())) {
                this.thriveEconomicallyBooks.push(prod);
              }
              if (this.productivityAsins.includes(prod.asin.toUpperCase())) {
                this.productivityBooks.push(prod);
              }
              if (this.creativityAndThoughtAsins.includes(prod.asin.toUpperCase())) {
                this.creativityAndThoughtBooks.push(prod);
              }
              if (this.healthAsins.includes(prod.asin.toUpperCase())) {
                this.healthBooks.push(prod);
              }
              if (this.reachYourGoalsAsins.includes(prod.asin.toUpperCase())) {
                this.reachYourGoalsBooks.push(prod);
              }
            });
          }
        }
      );
  }
}