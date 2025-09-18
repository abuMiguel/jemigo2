// export interface BlogData {
//     _id?: string;
//     title: string;
//     path: string;
//     description: string;
//     imageName: string;
//     imageFormat: string;
//     imageAlt: string;
//     articleDate: string;
//     modifiedDate: string;
//     tags: Array<string>;
//     article: ArticleParts;
//     published: boolean;
// }

import { Delta } from "quill";

export interface BlogData {
    _id?: string;
    title: string;
    path: string;
    description: string;
    imagePath: string;
    imageAlt: string;
    articleDate: string;
    modifiedDate: string;
    tags: Array<string>;
    article: Article;
    published: boolean;
}

// export class AdminBlogData implements BlogData {
//     _id?: string;
//     title: string = "";
//     path: string = "";
//     description: string = "";
//     imageName: string = "";
//     imageFormat: string = "";
//     imageAlt: string = "";
//     articleDate: string = "";
//     modifiedDate: string = "";
//     tags: Array<string> = [];
//     article: ArticleParts = { parts: [{ tag: "section" }] };
//     published: boolean = false;
// }

export class AdminBlogData implements BlogData {
    _id?: string;
    title: string = "";
    path: string = "";
    description: string = "";
    imagePath: string = "";
    imageAlt: string = "";
    articleDate: string = "";
    modifiedDate: string = "";
    tags: Array<string> = [];
    article: Article;
    published: boolean = false;
}

export interface Article {
    contents: Delta | undefined;
    html?: string;
}

// export type BlogElement = "section" | "contents" | "h2" | "p" | "link";
// export interface Ele {
//     tag?: BlogElement;
//     id?: string;
//     value?: string;
//     product?: AmzProduct;
//     _id?: string;
// }

export interface AmzProduct {
    _id?: string;
    asin: string;
    link?: string;
    largeImage?: AmzImage;
    mediumImage?: AmzImage;
    smallImage?: AmzImage;
    title?: string;
    price?: number;
    displayPrice?: string;
    isPrime?: boolean;
    lastUpdated?: Date;
}

export interface AmzImage {
    height: number;
    width: number;
    url: string;
}