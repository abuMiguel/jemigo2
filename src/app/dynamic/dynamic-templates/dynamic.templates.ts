import { ArticleInterface } from "../../shared/interfaces/article-interface";
import { Type } from '@angular/core';
import { DynamicArticleComponent } from "./dynamic-article.component";

export const dynamicTemplates: Array<Type<ArticleInterface>> = 
[
    DynamicArticleComponent
]