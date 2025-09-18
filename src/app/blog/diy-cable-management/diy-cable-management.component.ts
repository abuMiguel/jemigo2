import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { data } from '../../app.data';
import { AmzProduct } from '../../shared/interfaces/blog-interface';
import { AppService } from '../../app.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
    templateUrl: './diy-cable-management.component.html',
    standalone: false
})
export class DiyCableManagementComponent {

  data = data.cableManData.data;
  deskQuote = `The best desk placement, according to feng shui principles, is one that puts your back to a wall and
  gives you a view of the door, but doesn&apost place you directly in line with the entrance. Called the
  “commanding position,” this placement, it's been shown, creates the best energy for you to be in charge of
  whatever comes your way.`;

    asins = [
      "B08BJWRZGY",
      "B071YZJ1G1",
      "B07D34L57F",
      "B08BTHXJFN",
      "B07M6PKB9W",
      "B0952L6DRN",
      "B08GG4914P",
      "B07D1HGXDG",
      "B07HMXBSLW",
      "B07Q8QN5CB",
      "B0741MRCTN",
      "B07N1JYWJJ",
      "B07M9YKLY1",
      "B07PPVM1P5",
      "B071DGMNMX",
      "B071FXZBMV",
    ];

    //keep these in order, they match the asins array order above
    surgeProtector: AmzProduct | undefined;
    mouse: AmzProduct | undefined;
    keyboard: AmzProduct | undefined;
    headset: AmzProduct | undefined;
    chargingStation: AmzProduct | undefined;
    kvm: AmzProduct | undefined;
    hdmiSwitch: AmzProduct | undefined;
    deskSkirt: AmzProduct | undefined;
    cableManTray: AmzProduct | undefined;
    cableRaceway: AmzProduct | undefined;
    vertebrae: AmzProduct | undefined;
    holeSawKit: AmzProduct | undefined;
    grommets: AmzProduct | undefined;
    grommetOutlet: AmzProduct | undefined;
    cableStraps: AmzProduct | undefined;
    cableClips: AmzProduct | undefined;

  constructor(
    public appService: AppService,
    @Inject(PLATFORM_ID) private platformId: unknown,
  ) {
    this.getProds();
  }

  getProds(): void {
    if(isPlatformBrowser(this.platformId)){

    this.appService.getAmazonProducts(this.asins).subscribe({
      next: (prods) => {
        if(prods){
          this.surgeProtector = prods.find(prod => prod.asin.toUpperCase() === this.asins[0]);
          this.mouse = prods.find(prod => prod.asin.toUpperCase() === this.asins[1]);
          this.keyboard = prods.find(prod => prod.asin.toUpperCase() === this.asins[2]);
          this.headset = prods.find(prod => prod.asin.toUpperCase() === this.asins[3]);
          this.chargingStation = prods.find(prod => prod.asin.toUpperCase() === this.asins[4]);
          this.kvm = prods.find(prod => prod.asin.toUpperCase() === this.asins[5]);
          this.hdmiSwitch = prods.find(prod => prod.asin.toUpperCase() === this.asins[6]);
          this.deskSkirt = prods.find(prod => prod.asin.toUpperCase() === this.asins[7]);
          this.cableManTray = prods.find(prod => prod.asin.toUpperCase() === this.asins[8]);
          this.cableRaceway = prods.find(prod => prod.asin.toUpperCase() === this.asins[9]);
          this.vertebrae = prods.find(prod => prod.asin.toUpperCase() === this.asins[10]);
          this.holeSawKit = prods.find(prod => prod.asin.toUpperCase() === this.asins[11]);
          this.grommets = prods.find(prod => prod.asin.toUpperCase() === this.asins[12]);
          this.grommetOutlet = prods.find(prod => prod.asin.toUpperCase() === this.asins[13]);
          this.cableStraps = prods.find(prod => prod.asin.toUpperCase() === this.asins[14]);
          this.cableClips = prods.find(prod => prod.asin.toUpperCase() === this.asins[15]);
        }
      },
      error: (e) => console.log("getProds error: ", e),
    });
    }
  }

}
