import { Route } from '@angular/router';
import { environment } from '../environments/environment';
import { Type } from '@angular/core';
import { ArticleInterface } from './shared/interfaces/article-interface';
import { NotFoundComponent } from './not-found/not-found.component';
import { ArticleParts } from './shared/interfaces/blog-interface';

const baseUrl = environment.url;
const imagePath = 'assets/images';
const iconPath = 'assets/icons';
const defaultImage = "icon-512";
const defaultImageType = ".png";

export class RouteData implements Route {
    path: string;
    title: string;
    component?: Type<unknown>;
    data?: AppData;
    constructor(path: string, title: string, data: AppData, comp?: Type<unknown>) {
        this.path = path;
        this.title = title;
        this.data = data;
        if(comp){
            this.component = comp;
        }
        this.data.title = this.title;
        if(this.data?.parent && this.path){
            this.data.fullPath = this.data.parent + "/" + path;
        }
        if (this.path !== baseUrl && this.path !== "") {
            const urlPath = this.data?.fullPath ?? this.path;
            this.data.url = `${baseUrl}/${urlPath}`;
        }
        else {
            this.data.url = baseUrl;
        }
        if (!this.data.image) {
            this.data.image = new ArticleImage();
        }
    }
}
export class ArticleImage {
    src: string;
    alt: string;
    constructor(name = defaultImage, fileType = defaultImageType, alt = "logo") {
        if (name !== defaultImage) {
            this.src = `${imagePath}/${name}${fileType}`;
        }
        else {
            this.src = `${iconPath}/${name}${defaultImageType}`;
        }
        this.alt = alt;
    }
}

export interface AppData {
    parent?: string;
    fullPath?: string;
    title?: string;
    description?: string;
    image?: ArticleImage;
    articleDate?: string;
    modifiedDate?: string;
    url?: string;
    article?: ArticleParts;
    tags?: Array<string>;
    component?: Type<ArticleInterface>;
}

export const blogData: RouteData[] = [];

export const data = {
    homeData: new RouteData(
        baseUrl,
        "Group Nook",
        {
            description: "GNook is awesome",
            image: new ArticleImage()
        }
    ),
    notFoundData: new RouteData(
        '404',
        "404 Not Found",
        {
            description: "404 Error: Page Not Found",
            image: new ArticleImage()
        },
        NotFoundComponent
    ),
    aboutData: new RouteData(
        'about',
        "Our Story",
        {
            description: "groupnook",
            image: new ArticleImage()
        }
    ),
    blogData: new RouteData(
        'blog',
        "Blog",
        {
            description: "blog",
            image: new ArticleImage()
        }
    ),
    reviewsData: new RouteData(
        'reviews',
        "Reviews",
        {
            description: "Reviews for WFH related products to help remote workers save time and benefit from our experience and knowledge",
            image: new ArticleImage()
        }
    ),
};
