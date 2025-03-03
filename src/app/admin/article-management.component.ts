import { Component, OnDestroy, OnInit, Inject } from "@angular/core";
import { data } from "../app.data";
import { CommonModule, DOCUMENT } from '@angular/common';
import { BlogService } from "../blog.service";
import { AdminBlogData, AmzProduct, BlogData, BlogElement } from "../shared/interfaces/blog-interface";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "article-management",
  templateUrl: "./article-management.component.html",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ]
})
export class ArticleManagementComponent implements OnInit, OnDestroy {
  title = data.aboutData.title;
  selectedRow = 0;

  ar: BlogData = new AdminBlogData();
  blogArticles: Array<BlogData> = [];

  tags = "";
  savedProducts: Array<AmzProduct> = [];

  clickListener = (e: { target: unknown; }) => {
    if (this.ar?.published) {
      return;
    }
    const container = this.document.getElementById("articleContainer");
    const buttons = this.document.getElementById("controlButtons");
    if (container !== e.target && !container.contains(e.target as Element) && buttons !== e.target && !buttons.contains(e.target as Element)) {
      this.selectedRow = 0;
    }
  };

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private blogService: BlogService,
  ) { }

  ngOnInit(): void {
    this.document.addEventListener('click', this.clickListener);
  }

  ngOnDestroy(): void {
    this.document.removeEventListener("click", this.clickListener);
  }


  add(tag: BlogElement, id: string = "", value: string = "", link: string = "", after: boolean = true) {
    const insertLocation = after ? 1 : 0;
    //section, contents, h2, p, link
    if (!this.ar.article.parts || this.ar.article.parts.length < 1) {
      this.ar.article = {
        parts: [{ tag: "section" }]
      }
    }

    this.ar.article.parts.splice(this.selectedRow + insertLocation, 0, {
      tag: tag,
      ...(id && { id: id }),
      ...(value && { value: value }),
      ...(link && { link: link }),
    });
  }

  selectRow(i: number) {
    this.selectedRow = i;
  }

  selectArticle(id?: string | undefined) {
    this.selectedRow = 0;
    if (id) {
      this.ar = this.blogArticles.find(b => b._id === id);
      this.tags = this.ar.tags.join(",");
    }
    else {
      this.ar = new AdminBlogData();
      this.tags = "";
    }
  }

  deleteSelected() {
    if (this.selectedRow > 0 && this.ar.article.parts?.length > 0) {
      this.ar.article.parts.splice(this.selectedRow, 1);
      this.selectedRow--;
    }
  }

  getArticles() {
    this.blogService.getBlogData().subscribe({
      next: blogs => {
        this.blogArticles = blogs;
      },
      error: err => console.log(err),
    });
  }

  saveArticle() {
    //Tags must be comma separated with no spaces
    this.ar.tags = this.tags.replace(/\s/g, "").split(",");
    const nowDate = new Date().toISOString();
    this.ar.articleDate = this.ar.articleDate ?? nowDate;
    this.ar.modifiedDate = nowDate;
    this.blogService.saveBlogData(this.ar).subscribe({
      next: res => console.log(res),
      error: err => console.log(err),
    });
  }

  publishArticle() {
    this.ar.tags = this.tags.replace(/\s/g, "").split(",");
    const nowDate = new Date().toISOString();
    this.ar.articleDate = nowDate;
    this.ar.modifiedDate = nowDate;
    this.ar.published = true;

    this.blogService.updateBlogData(this.ar).subscribe({
      next: res => console.log(res),
      error: err => console.log(err),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  trackByFn(index: unknown, _item: unknown) {
    return index;
  }
}
