import { Component, Inject, input, Input, PLATFORM_ID } from '@angular/core';
import { AmzProduct } from '../shared/interfaces/blog-interface';
import { CommonModule, isPlatformBrowser } from '@angular/common';

type AmzProdSize = "sm" | "md" | "lg";

@Component({
  selector: 'amz-product',
  standalone: true,
  imports: [
    CommonModule,
  ],
  styleUrl: './../../styles/amz.scss',
  template: `
  <ng-container *ngIf="amzProd && isBrowser">
    <ng-container *ngIf="singleProduct; else linkAndButton">
      <section class="center images-section">
        <ng-container *ngTemplateOutlet="linkAndButton"></ng-container>
      </section>
    </ng-container>
  
    <ng-template #linkAndButton>
      <a [href]="amzProd()?.link" target="_blank">
      <!-- <img 
      [srcset]="image?.url + ' ' + image?.width + 'w,'" 
      [sizes]="'(max-width: 600px) ' + ((image?.width ?? 600) - offsetSm) + 'px, ' +
        '((min-width: 600px) and (max-width: 817px)) ' + ((image?.width ?? 601) - offsetMd) + 'px, ' +
        '(min-width: 817px) ' + ((image?.width ?? 817) - offsetLg) + 'px'"
      [src]="image?.url"
      [alt]="amzProd()?.title"
      > -->
      <img [src]="image?.url" [alt]="amzProd()?.title"
      >
      </a>
      <button *ngIf="showButton" class="prod-btn"><a [href]="amzProd.link" target="_blank">View on Amazon</a></button>
    </ng-template>
  </ng-container>

  <!-- <div class="paapi5-pa-ad-unit">
    <div class="paapi5-pa-product-container">
        <div class="paapi5-pa-product-image">
            <div class="paapi5-pa-product-image-wrapper">
                <a class="paapi5-pa-product-image-link" 
                [href]="amzProd()?.link" [title]="amzProd()?.title" target="_blank">
                <img class="paapi5-pa-product-image-source" [src]="image?.url" [alt]="amzProd()?.title">
                </a>
                
            </div>
        </div>
        <div class="paapi5-pa-product-details">
            <div class="paapi5-pa-product-title">
                <a class="paap5-pa-product-title-link" 
                [href]="amzProd()?.link" [title]="amzProd()?.title" target="_blank">{{amzProd()?.title}}</a>
            </div>
            <div *ngIf="amzProd()?.price" class="paapi5-pa-product-list-price">
                <span class="paapi5-pa-product-list-price-value"></span>
            </div>
            <div *ngIf="amzProd()?.isPrime" class="paapi5-pa-product-prime-icon"><span class="icon-prime-all"></span></div>
        </div>
    </div>
  </div> -->
  `
})
export class AmzProductComponent {
  amzProd = input.required<AmzProduct>();
  @Input() size: AmzProdSize = "lg";
  @Input() singleProduct = true;
  @Input() showButton = true;

  isBrowser = isPlatformBrowser(this.platformId);

  constructor(@Inject(PLATFORM_ID) private platformId: unknown) { }

  offsetSm = 225;
  offsetMd = 150;
  offsetLg = 100;

  get image() {
    if (this.size === "lg") {
      return this.amzProd()?.largeImage;
    }
    else if (this.size === "md") {
      //this.clearOffsets();
      return this.amzProd()?.mediumImage;
    }
    else if (this.size === "sm") {
      //this.clearOffsets();
      return this.amzProd()?.smallImage;
    }
    return this.amzProd()?.largeImage;
  }

  //   clearOffsets(){
  //     this.offsetLg = 0;
  //     this.offsetMd = 0;
  //     this.offsetSm = 0;
  //   }
}
