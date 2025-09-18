import { Component, OnInit } from '@angular/core';
import { MainNavService } from '../main-nav/main-nav.service';
import { AppService } from '../app.service';
import { faAngleRight, faTree } from '@fortawesome/free-solid-svg-icons';
import { data } from '../app.data';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { ArticleRelatedComponent } from '../article/article-related.component';
import { ButtonComponent } from '../shared/components/button/button.component';
import { ArticleCardComponent } from '../article/article-card.component';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [
    FontAwesomeModule,
    CommonModule,
    ArticleRelatedComponent,
    ArticleCardComponent,
    ButtonComponent
  ],
})
export class HomeComponent implements OnInit {
  faAngleRight = faAngleRight; faTree = faTree;
  isMobile = false;
  
  featured = [
    {
      title: data.wfhGuideData.title,
      linkRoute: data.wfhGuideData.path,
      imgRoute: data.wfhGuideData.data.image.src,
      snippet: "The debate continues over whether our homes serve as viable work locations after the most recent pandemic acted as a catalyst for the WFH movement. The real reason, that all of us who actually WFH already know, is freedom and flexibility. We just want to be happy human beings, and staying home allows us to do that. It also allows us to be more productive, which in turn benefits the employer, but that’s not why it’s important to us.",
      alt: data.wfhGuideData.data?.image?.alt,
      date: data.wfhGuideData.data?.modifiedDate
    },
    {
      title: data.cableManData.title,
      linkRoute: data.cableManData.path,
      imgRoute: data.cableManData.data.image.src,
      snippet: "Tidy cables can transform your home office space. This guide covers the process of how to organize cords in your office and shows you some of the best products to manage and conceal your cables. A good cable management system makes an office space look so much better. It doesn't cost a lot to make a huge improvement to a space and anybody can do it.",
      alt: data.cableManData.data?.image?.alt,
      date: data.cableManData.data?.modifiedDate
    },
    {
      title: data.reviewEnergyDrinksData.title,
      linkRoute: data.reviewEnergyDrinksData.data.fullPath,
      imgRoute: data.reviewEnergyDrinksData.data.image.src,
      snippet: "Many popular energy drinks on the market don't taste very good and are packed with sugar and carbs. The ultimate energy drink, in a perfect world, would be super healthy and give a huge boost of energy. Unfortunately, we don't live in that world, so here is the best and worst energy boosting drinks that are on the market.",
      alt: data.reviewEnergyDrinksData.data.image.alt,
      date: data.reviewEnergyDrinksData.data.modifiedDate
    },
  ];

  topArticles = [
    data.wfhGuideData, data.cableManData
  ];

  constructor(public navService: MainNavService, public appService: AppService,
    public router: Router) {
     }

  ngOnInit(): void {
    this.navService.isHandset$.subscribe(mobile => this.isMobile = mobile);
  }
  
  navigateTo(route: string){
    this.router.navigate([route]);
  }

  plantTrees(){
    window.open('https://forest-fundraiser.raisely.com/jemigo/', '_blank');
  }
}