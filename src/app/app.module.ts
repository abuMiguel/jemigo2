import { NgModule } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import {
  MatSnackBarModule,
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
} from "@angular/material/snack-bar";
import { MatTooltipModule } from "@angular/material/tooltip";

import {
  BrowserModule,
} from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule, Routes, ExtraOptions } from "@angular/router";
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

import { LayoutModule } from "@angular/cdk/layout";

import { data } from "./app.data";
import { DynamicArticleComponent } from "./dynamic/dynamic-templates/dynamic-article.component";
//import { AmzInterceptor } from "./shared/interceptors/amz-interceptor";
import { authGuard } from "./auth.guard";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HighlightModule } from "ngx-highlightjs";

export const routes: Routes = [
  {
    path: "about",
    title: data.aboutData.title,
    data: data.aboutData.data,
    loadComponent: () =>
      import('./about/about.component').then((m) => m.AboutComponent),
  },

  //Reviews
  {
    path: "reviews",
    title: data.reviewsData.title,
    data: data.reviewsData.data,
    loadComponent: () =>
      import('./reviews/reviews.component').then((m) => m.ReviewsComponent),
  },
  //Blog
  {
    path: "blog",
    title: data.blogData.title,
    data: data.blogData.data,
    loadChildren: () => import("./blog/blog.module").then((m) => m.BlogModule),
  },
  
  {
    path: "admin",
    title: "admin",
    loadChildren: () =>
      import("./admin/admin.module").then((m) => m.AdminModule),
    canActivate: [authGuard],
    runGuardsAndResolvers: "always",
  },

  //App paths
  {
    path: "404",
    loadComponent: () =>
      import('./not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: "404 Not Found",
  },
  {
    path: "",
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
    title: data.homeData.title,
    data: data.homeData.data,
  },
  { path: "**", redirectTo: "404", data: data.notFoundData.data },
];

const routerOptions: ExtraOptions = {
  useHash: false,
  anchorScrolling: "enabled",
  onSameUrlNavigation: "reload",
  initialNavigation: "enabledBlocking",
  scrollPositionRestoration: "enabled",
};

@NgModule({
  bootstrap: [], 
  imports: [
    BrowserModule,
    CommonModule,
    DynamicArticleComponent,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes, routerOptions),
    ReactiveFormsModule,
    FormsModule,
    LayoutModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    HighlightModule,
    FontAwesomeModule
  ],
  providers: [
    HttpClient,
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 4000, horizontalPosition: "center" },
    },
    //{ provide: HTTP_INTERCEPTORS, useClass: AmzInterceptor, multi: true },
    // provideHighlightOptions({
    //   coreLibraryLoader: () => import('highlight.js/lib/core'),
    //   lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'), // Optional, add line numbers if needed
    //   languages: {
    //     typescript: () => import('highlight.js/lib/languages/typescript'),
    //     css: () => import('highlight.js/lib/languages/css'),
    //     xml: () => import('highlight.js/lib/languages/xml')
    //   },
    //   themePath: 'path-to-theme.css' // Optional, useful for dynamic theme changes
    // }),
    provideHttpClient(withInterceptorsFromDi()),
  ]
})
export class AppModule { }
