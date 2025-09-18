import { Route } from '@angular/router';
import { environment } from '../environments/environment';
import { Type } from '@angular/core';
import { ArticleInterface } from './shared/interfaces/article-interface';
import { NotFoundComponent } from './not-found/not-found.component';
import { Article } from './shared/interfaces/blog-interface';

const baseUrl = environment.url;
const imagePath = 'assets/images';
const iconPath = 'assets/icons';
const defaultImage = "jmg-512";
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
    constructor(name = defaultImage, fileType = defaultImageType, alt = "Jemigo logo") {
        if(name.includes("cloudinary")){
            this.src = name;
        }
        else if (name !== defaultImage) {
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
    article?: Article;
    tags?: Array<string>;
    component?: Type<ArticleInterface>;
}

export const blogData: RouteData[] = [];

export const data = {
    homeData: new RouteData(
        baseUrl,
        "Jemigo",
        {
            description: "Jemigo is a WFH hub that provides the best resources, tips, guides, and WFH products to enhance your remote work lifestyle.",
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
            description: "Jemigo is a WFH hub that provides the best resources, tips, guides, and WFH products to enhance your remote work lifestyle.",
            image: new ArticleImage()
        }
    ),
    blogData: new RouteData(
        'blog',
        "Blog",
        {
            description: "Tips, guides, and how-to articles to help you make the most out of your WFH lifestyle.",
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
    reviewEnergyDrinksData: new RouteData(
        'best-energy-drinks',
        "The Best Energy Drink",
        {
            description: "The best energy drink with amazing taste, low calorie, low carbs, and low sugar content. When working from home, drink this flavorful, health conscious energy boost.",
            parent: "reviews",
            image: new ArticleImage("https://res.cloudinary.com/jemigo/image/upload/v1755716898/energydrink.jpg", ".jpg", "An energy drink on a desk"),
            articleDate: '2022-12-4',
            modifiedDate: '2024-07-07'
        }
    ),
    cableManData: new RouteData(
        'cable-management-guide',
        'Desk Cable Management Guide for Home Offices',
        {
            description: 'WFH Cable management guide with 8 easy steps for beginners to learn how to conceal desk cords and cables in a home office.',
            image: new ArticleImage("https://res.cloudinary.com/jemigo/image/upload/v1755718517/tidy-desk.webp", ".webp", "Organized office desk setup"),
            articleDate: '2022-01-12T12:30:00+00:00',
            modifiedDate: '2022-07-13T13:00:00+00:00'
        }
    ),
    successMindsetData: new RouteData(
        'successful-mindset',
        'Build a Successful Mindset to Achieve Your Goals',
        {
            description: 'A curated book list to help you learn how to change your mindset and become more successful.',
            image: new ArticleImage("https://res.cloudinary.com/jemigo/image/upload/v1755718630/success.jpg", ".jpg", "Man on mountain top feeling successful"),
            articleDate: '2022-01-12T12:30:00+00:00',
            modifiedDate: '2022-04-24T16:04:00+00:00',
            parent: "blog"
        }
    ),
    wfhPart1Data: new RouteData(
        'wfh-guide/reasons-to-work-from-home',
        'Work from Home Guide: Reasons to Work from Home',
        {
            description: 'Jemigo WFH Guide Part 1 describes the real motives behind the work from home movement and why WFH leads to greater happiness.',
            image: new ArticleImage("wfh", ".webp", "Person working outside with scenic landscape"),
            articleDate: '2022-06-15T12:40:00+00:00',
            modifiedDate: '2022-06-16T20:00:00+00:00'
        }
    ),
    wfhPart2Data: new RouteData(
        'wfh-guide/take-control',
        'Work from Home Guide: Take Control by Working from Home',
        {
            description: 'Working from home helps employees take control of their environment to gain a better balance, save money, and relieve stress.',
            image: new ArticleImage("https://res.cloudinary.com/jemigo/image/upload/v1755718705/wfh.webp", ".webp", "Person working outside with scenic landscape"),
            articleDate: '2022-06-15T12:40:00+00:00',
            modifiedDate: '2022-10-11T17:00:00+00:00'
        }
    ),
    wfhGuideData: new RouteData(
        'wfh-guide',
        'Work from Home Guide',
        {
            description: 'The Jemigo WFH Guide helps remote workers and employers gain a greater understanding for the WFH landscape and how much it can positively impact the workforce.',
            image: new ArticleImage("https://res.cloudinary.com/jemigo/image/upload/v1755718705/wfh.webp", ".webp", "Person working outside with scenic landscape"),
            articleDate: '2022-06-15',
            modifiedDate: '2022-11-11'
        }
    ),
    toolsData: new RouteData(
        'wfh-tools',
        'WFH Tools',
        {
            description: 'Helpful and free online WFH tools',
            articleDate: '2022-06-15',
            modifiedDate: '2022-07-24',
            image: new ArticleImage()
        }
    ),
    wfhTimeSavingsToolData: new RouteData(
        'wfh-tools/wfh-time-savings-calculator',
        'WFH Time Savings Calculator',
        {
            description: 'Calculate how much time you can save by working from home.',
            articleDate: '2022-07-24',
            modifiedDate: '2022-07-24',
            image: new ArticleImage()
        }
    ),
    percentChangeToolData: new RouteData(
        'wfh-tools/percent-change-calculator',
        'Percent Change Calculator',
        {
            description: 'Calculate the percentage of change between two values.',
            articleDate: '2022-07-24',
            modifiedDate: '2022-07-24',
            image: new ArticleImage()
        }
    ),
};
