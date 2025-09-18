import { Injectable } from "@angular/core";
import { DynamicArticleComponent } from "./dynamic/dynamic-templates/dynamic-article.component";
import { AppData, ArticleImage, RouteData } from "./app.data";
import { DynamicComponent } from "./dynamic/dynamic.component";
import { HttpClient } from "@angular/common/http";
import { catchError, map, of, take } from "rxjs";
import { BlogData } from "./shared/interfaces/blog-interface";

@Injectable({
  providedIn: "root",
})
export class BlogService {
  constructor(
    private http: HttpClient,
  ) { }
  
  getBlogRouteData() {
    return this.getBlogData().pipe(
      map((data) => this.blogDataToRouteData(data)),
      catchError(() => {
        return of([]);
      }),
    );
  }

  getPublishedBlogRouteData() {
    return this.getPublishedBlogData().pipe(
      map((data) => this.blogDataToRouteData(data)),
      catchError(() => {
        return of([]);
      }),
    );
  }

  getBlogData() {
    return this.http.get<Array<BlogData>>(`/api/blog/data`).pipe(
      catchError(() => {
        return of([]);
      }));
  }

  getPublishedBlogData() {
    return this.http.get<Array<BlogData>>(`/api/blog/data/published`).pipe(
      catchError(() => {
        return of([]);
      }));
  }

  getBlogDataById(id: string) {
      return this.http.get<BlogData>(`/api/blog/data/${id}`).pipe(
        take(1),
        map((data) => this.mapBlogData(data)),
        catchError((error) => { throw new Error(error); }),
      );
  }

  saveBlogData(data: BlogData) {
    if (data._id) {
      return this.updateBlogData(data);
    }
    const body = { blogData: data };
    return this.http.post<{ message: string }>(`/api/blog/data/save`, body);
  }

  updateBlogData(data: BlogData) {
    const body = { blogData: data };
    return this.http.post<{ message: string }>(`/api/blog/data/update`, body);
  }

  private blogDataToRouteData(data: Array<BlogData>): RouteData[] {
    return data?.flatMap((blog) => {
      try{
        return this.mapBlogData(blog);
      }
      catch(e){
        return [];
      }
    });
  }

  mapBlogData(blog: BlogData): RouteData {
    try{
      const appData: AppData = {
        parent: "blog",
        title: blog.title,
        description: blog.description,
        image: new ArticleImage(blog.imagePath, "", blog.imageAlt),
        articleDate: blog.articleDate,
        modifiedDate: blog.modifiedDate,
        article: blog.article,
        tags: blog.tags,
        component: DynamicArticleComponent,
      };
      const rd = new RouteData(blog.path, blog.title, appData);
      rd.component = DynamicComponent;
      return rd;
    }
    catch(e){
      throw e;
    }
  }
}
