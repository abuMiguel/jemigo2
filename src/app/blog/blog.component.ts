import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouteData, data } from '../app.data';
import { BlogService } from '../blog.service';
@Component({
  selector: 'blog',
  templateUrl: './blog.component.html'
})
export class BlogComponent implements OnInit {
  data = data.blogData;

  topArticles: Array<RouteData> = [];

  constructor(
    public router: Router,
    public blogService: BlogService,
  ) { }

  ngOnInit() {
    this.blogService.getBlogRouteData().subscribe(
      blogs => {
        const articles = blogs.filter(b => b.data?.tags?.includes("top"));
        this.topArticles.push(...articles);
      });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
