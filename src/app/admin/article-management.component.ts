import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, viewChild, ElementRef, AfterViewInit, inject, DOCUMENT } from "@angular/core";
import { data } from "../app.data";

import { BlogService } from "../blog.service";
import { AdminBlogData, AmzProduct, BlogData } from "../shared/interfaces/blog-interface";
import { FormsModule } from "@angular/forms";
import Quill, { Delta } from "quill";

@Component({
    selector: "article-management",
    templateUrl: "./article-management.component.html",
    imports: [
    FormsModule
],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
    @import 'quill/dist/quill.snow.css';
  `]
})
export class ArticleManagementComponent implements OnInit, AfterViewInit, OnDestroy {

  private document: Document = inject(DOCUMENT);

  //NEW Quill stuff
  editor = viewChild.required<ElementRef>('editor');
  private quill: Quill | undefined;
  currentArticleContents: Delta | undefined;

    async ngAfterViewInit() {
    try {
      // Dynamically import the Quill library from the installed npm package.
      // This tells the Angular builder to put Quill in a separate, lazy-loadable file.
      const { default: QuillConstructor } = await import('quill');
      const editorEl = this.editor();

      if (!editorEl) {
        throw new Error('Editor element could not be found in the template.');
      }

      this.quill = new QuillConstructor(editorEl.nativeElement, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image']
          ]
        },
        placeholder: 'Compose something wonderful...',
      });
    } catch (error) {
      console.error("Error loading Quill from node_modules:", error);
    }
  }

  testSaveQuill() {
    if (this.quill) {
      this.currentArticleContents = this.quill.getContents();
      console.log("Quill content:", this.currentArticleContents);

      const htmlContent = this.quill.getSemanticHTML();
      console.log("Quill html:", htmlContent);
    } else {
      console.warn("Quill editor is not initialized yet.");
    }
  }

  testRestoreArticle() {
    if (this.quill) {
      this.quill.setContents(this.currentArticleContents);

      const htmlContent = this.quill.getSemanticHTML();
      console.log("Quill html:", htmlContent);
    } else {
      console.warn("Quill editor is not initialized yet.");
    }
  }
  //END NEW Quill stuff

  title = data.aboutData.title;
  selectedRow = 0;

  ar: BlogData = new AdminBlogData();
  blogArticles: Array<BlogData> = [];

  tags = "";
  savedProducts: Array<AmzProduct> = [];

  // clickListener = (e: { target: unknown; }) => {
  //   if (this.ar?.published) {
  //     return;
  //   }
  //   const container = this.document.getElementById("articleContainer");
  //   const buttons = this.document.getElementById("controlButtons");
  //   if (container !== e.target && !container.contains(e.target as Element) && buttons !== e.target && !buttons.contains(e.target as Element)) {
  //     this.selectedRow = 0;
  //   }
  // };

  constructor(
    private blogService: BlogService,
  ) { }

  ngOnInit(): void {
    // this.document.addEventListener('click', this.clickListener);
  }

  ngOnDestroy(): void {
    // this.document.removeEventListener("click", this.clickListener);
  }


  // add(tag: BlogElement, id: string = "", value: string = "", link: string = "", after: boolean = true) {
  //   const insertLocation = after ? 1 : 0;
  //   //section, contents, h2, p, link
  //   if (!this.ar.article.parts || this.ar.article.parts.length < 1) {
  //     this.ar.article = {
  //       parts: [{ tag: "section" }]
  //     }
  //   }

  //   this.ar.article.parts.splice(this.selectedRow + insertLocation, 0, {
  //     tag: tag,
  //     ...(id && { id: id }),
  //     ...(value && { value: value }),
  //     ...(link && { link: link }),
  //   });
  // }

  // selectRow(i: number) {
  //   this.selectedRow = i;
  // }

  selectArticle(id?: string | undefined) {
    // this.selectedRow = 0;
    if (id) {
      this.ar = this.blogArticles.find(b => b._id === id);
      this.tags = this.ar.tags.join(",");
      this.currentArticleContents = this.ar.article.contents;
      this.quill.setContents(this.currentArticleContents);
    }
    else {
      this.ar = new AdminBlogData();
      this.tags = "";
    }
  }

  // deleteSelected() {
  //   if (this.selectedRow > 0 && this.ar.article.parts?.length > 0) {
  //     this.ar.article.parts.splice(this.selectedRow, 1);
  //     this.selectedRow--;
  //   }
  // }

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
    const htmlContent = this.quill?.getSemanticHTML()?.replace(/&nbsp;/g, ' ');
    this.ar.article = { contents: this.quill?.getContents(), html: htmlContent };

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
    const htmlContent = this.quill?.getSemanticHTML()?.replace(/&nbsp;/g, ' ');
    this.ar.article = { contents: this.quill.getContents(), html: htmlContent };
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
