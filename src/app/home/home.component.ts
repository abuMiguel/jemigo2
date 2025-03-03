import { Component, OnInit } from '@angular/core';
import { MainNavService } from '../main-nav/main-nav.service';
import { AppService } from '../app.service';
import { faAngleRight, faTree } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { ArticleRelatedComponent } from '../article/article-related.component';
import { ButtonComponent } from '../shared/components/button/button.component';
import { ArticleCardComponent } from '../article/article-card.component';
import { BlogService } from '../blog.service';

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
  
  featured = [];
  topArticles = [];

  constructor(
    public navService: MainNavService,
    public appService: AppService,
    public router: Router,
    public blogService: BlogService,
  ) {}

  ngOnInit(): void {
    this.navService.isHandset$.subscribe(mobile => this.isMobile = mobile);
    this.getArticles();
  }

  getArticles(){
    this.blogService.getBlogRouteData().subscribe(
      blogs => {
        const top = blogs.filter(b => b.data?.tags?.includes("top"));
        this.topArticles.push(...top);

        const featuredArticles = blogs.filter(b => b.data?.tags?.includes("featured"));
        this.featured.push(...featuredArticles);
      });
  }
  
  navigateTo(route: string){
    this.router.navigate([route]);
  }
}