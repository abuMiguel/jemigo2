import { Injectable, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Meta } from '@angular/platform-browser';
import { BehaviorSubject, of } from 'rxjs';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AppData } from './app.data';
import { AmzProduct } from './shared/interfaces/blog-interface';


@Injectable({
  providedIn: 'root'
})
export class AppService implements OnInit{

  isBrowser = new BehaviorSubject<boolean>(false);

  defaultImageUrl = `/assets/icons/jmg-512.png`;

  previousUrl: string = "";
  currentUrl: string = "";

  constructor(
    private http: HttpClient, 
    @Inject(PLATFORM_ID) private platformId: unknown, 
    @Inject(DOCUMENT) private doc: Document,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    private meta: Meta
  ) {

    this.isBrowser.next(isPlatformBrowser(this.platformId));
  }

  ngOnInit(): void {
  }


  getAmazonProducts(asins?: string[]) {
      const body = asins && asins.length > 0 ? { ids: asins } : {};
      return this.http.post<Array<AmzProduct>>(`/api/product/amz`, body);
  }

  saveAmazonProducts(asins: string[]) {
    if (this.isBrowser.value) {
      const body = { ids: asins };
      return this.http.post<{ msg: string }>(`/api/product/amz/save`, body);
    }
    else{
      return of();
    }
  }


  reload() {
    location?.reload();
  }

  updateMetaTags() {
    this.router.events.pipe(
      filter((event) => {
        return event instanceof NavigationEnd
      }),
      map(() => this.activatedRoute),
      map((route) => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      filter((route) => route.outlet === 'primary'),
      mergeMap((route) => route.data)
    )
      .subscribe((event) => {
        const data: AppData = event as AppData;
        if (data.title) {
          this.setMetaTags(data);
        }
        if (data.url) {
          this.updateCanonLink(data.url);
        }
      });
  }

  setMetaTags(data: AppData) {
    this.meta.updateTag({ name: "description", content: data.description });
    this.meta.updateTag({ property: "og:url", content: data.url });
    this.meta.updateTag({ property: "og:title", content: data.title });
    this.meta.updateTag({ property: "og:description", content: data.description });
    this.meta.updateTag({ property: "og:image", content: `/${data.image.src}` });
    this.meta.updateTag({ property: "og:type", content: "article" });
  }

  updateCanonLink(url: string) {
    const links: HTMLCollection = this.doc.getElementsByTagName('link');
    if (links) {
      const canonLinks = Array.from(links).filter(l => l.getAttribute('rel') === 'canonical');
      canonLinks.forEach(cl => cl.remove());
    }

    if (this.doc.location.protocol === 'http:') {
      url = url.replace("http:", "https:");
    }

    const link: HTMLLinkElement = this.doc.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    this.doc.head.appendChild(link);
  }

}
