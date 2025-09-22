import { ObjectId, Document } from "mongodb";
import { Delta } from "quill";

export interface Visits {
    _id?: ObjectId;
    year: number;
    month: number;
    day: number;
}

export interface BlogData {
    _id?: ObjectId;
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

export interface Article {
    contents: Delta | undefined;
    html?: string;
}

// export type BlogElement = "section" | "contents" | "h2" | "p" | "link";
// export interface Ele {
//     tag?: BlogElement;
//     id?: string; //If the element is an affiliate link, use product id aka ASIN for the id
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
    features?: Array<string> | unknown;
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

export interface Log {
    date: Date;
    msg: string;
    asin?: string;
}

export interface SitemapDocument extends Document {
  content: Buffer;
  contentType: string;
  lastUpdated: Date;
}