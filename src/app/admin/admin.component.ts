import { Component, OnInit, Inject, signal, inject } from "@angular/core";
import { data } from "../app.data";
import { DOCUMENT } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import { catchError } from "rxjs";
import { Router } from "@angular/router";
import { AppService } from "../app.service";

@Component({
    selector: "admin",
    templateUrl: "./admin.component.html",
    standalone: false
})
export class AdminComponent implements OnInit {
  title = data.aboutData.title;
  view = "article";
  authenticated = signal(false);

  http = inject(HttpClient);
  router = inject(Router);
  appService = inject(AppService);

  token: string = "";

  constructor(
    @Inject(DOCUMENT) private document: unknown,
  ) { }

  ngOnInit(): void { }

  viewArticleManagement() {
    if (this.view !== "article") {
      this.view = "article";
    }
  }

  viewProductManagement() {
    if (this.view !== "product") {
      this.view = "product";
    }
  }

  authenticate() {
    if(this.appService.authFailCount() > 2) this.router.navigateByUrl(this.router.parseUrl('/'));

    this.http.post(`/api/access`, { token: this.token }, { observe: 'response', responseType: 'text' }).pipe(
      catchError(() => { throw new Error("Authentication failed"); }),
    ).subscribe({
      next: (res) => {
        this.authenticated.set(res.status === 200);
      },
      error: () => {
        this.authenticated.set(false);
        this.router.navigateByUrl(this.router.parseUrl('/'));
      },
    });
  }
}
