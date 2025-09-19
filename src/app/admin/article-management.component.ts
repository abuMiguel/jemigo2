import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, viewChild, ElementRef, AfterViewInit, inject, DOCUMENT, signal, Signal } from "@angular/core";
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
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link']
          ]
        },
        placeholder: 'Compose something wonderful...',
      });

      // Add a simple custom toolbar button for inserting an Amazon product placeholder.
      try {
        const toolbar: any = this.quill.getModule('toolbar');
        if (toolbar && toolbar.container) {
          // create a new formats group and append to the end so the button appears at the end
          const group = this.document.createElement('span');
          group.className = 'ql-formats';

          const amzButton = this.document.createElement('button');
          amzButton.type = 'button';
          amzButton.className = 'ql-amz';
          amzButton.title = 'Insert Amazon affiliate link';
          amzButton.setAttribute('aria-label', 'Insert product link');
          // Simple product/tag SVG icon — small and unobtrusive
          amzButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M21 11.5v6a2 2 0 0 1-2 2h-6L3 11.5V5a2 2 0 0 1 2-2h6L21 11.5z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 7h.01" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          `;

          amzButton.addEventListener('click', () => {
            const asin = window.prompt('Enter ASIN to insert');
            if (asin && this.quill) {
              const placeholder = `[[AMZ:${asin}]]`;
              const range = this.quill.getSelection(true) || { index: 0, length: 0 };
              this.quill.insertText(range.index, placeholder, 'user');
              // move cursor after the inserted placeholder
              this.quill.setSelection(range.index + placeholder.length, 0, 'user');
            }
          });

          group.appendChild(amzButton);
          // append the new group to the end of the toolbar container
          toolbar.container.appendChild(group);
        }
      } catch (err) {
        // if running in non-browser or toolbar unavailable, ignore
        console.warn('Could not add product toolbar button', err);
      }
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
  blogArticlesSignal = signal<Array<BlogData>>([]);

  // Expose a plain array getter named `blogArticles` so legacy template preprocessor
  // that uses `@for (article of blogArticles; ...)` can read the array value.
  get blogArticles(): Array<BlogData> {
    return this.blogArticlesSignal();
  }

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
      this.ar = this.blogArticles.find(b => b._id === id) as BlogData;
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
        this.blogArticlesSignal.set(blogs);
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
