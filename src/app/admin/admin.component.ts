import { Component, OnInit, Inject } from "@angular/core";
import { data } from "../app.data";
import { DOCUMENT } from '@angular/common';

@Component({
  selector: "admin",
  templateUrl: "./admin.component.html",
})
export class AdminComponent implements OnInit {
  title = data.aboutData.title;
  view = "article";
 
  constructor(
    @Inject(DOCUMENT) private document: unknown,
  ) { }

  ngOnInit(): void {}

  viewArticleManagement(){
    if(this.view !== "article"){
      this.view = "article";
    }
  }

  viewProductManagement(){
    if(this.view !== "product"){
      this.view = "product";
    }
  }
}
