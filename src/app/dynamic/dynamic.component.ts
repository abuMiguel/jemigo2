import { AfterViewInit, Component, Inject, OnInit, PLATFORM_ID, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppData } from "../app.data";
import { BlogService } from "../blog.service";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { DynamicArticleComponent } from "./dynamic-templates/dynamic-article.component";

@Component({
  templateUrl: "./dynamic.component.html",
  standalone: true,
  imports: [
    CommonModule,
    DynamicArticleComponent
]
})
export class DynamicComponent implements OnInit, AfterViewInit {
  @ViewChild(DynamicArticleComponent, { static: true }) articleHost!: DynamicArticleComponent;
  data = {};
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public blogService: BlogService,
    @Inject(PLATFORM_ID) private platformId: unknown
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const id = this.activatedRoute.snapshot.paramMap.get("id");
      if (id) {
        this.blogService.getBlogDataById(id)
          .subscribe({
            next: (res) => {
              if (res) {
                this.loadComponent(res.data as AppData);
              }
              else {
                this.router.navigate(["/404"]);
              }
            },
            error: () => this.router.navigate(["/404"]),
          });
      }
    }
  }

  loadComponent(data: AppData) {
    if(data.component){
      this.articleHost.data = data;
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() =>
      this.scrollToAnchor(), 500);
    }
  }

  scrollToAnchor(){
    const fragment = this.activatedRoute.snapshot.fragment;
    if(fragment){
      const element = document.getElementById(fragment);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  }
}
