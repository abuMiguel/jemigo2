import { Injectable, Inject, PLATFORM_ID, OnInit, signal, DOCUMENT } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Meta } from '@angular/platform-browser';
import { BehaviorSubject, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Jmg } from './shared/jmg';
import { TREE_FACTS } from './shared/constants';
import { AppData } from './app.data';
import { AmzProduct } from './shared/interfaces/blog-interface';


@Injectable({
  providedIn: 'root'
})
export class AppService implements OnInit{

  isBrowser = new BehaviorSubject<boolean>(false);

  factIndex = 0;
  randomFact = "";
  treeFacts = TREE_FACTS;
  defaultImageUrl = `/assets/icons/jmg-512.png`;

  previousUrl: string = "";
  currentUrl: string = "";

  authFailCount = signal(0);


  constructor(
    private http: HttpClient, 
    // private readonly updates: SwUpdate,
    @Inject(PLATFORM_ID) private platformId: unknown, 
    @Inject(DOCUMENT) private doc: Document,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    private meta: Meta
  ) {

    this.isBrowser.next(isPlatformBrowser(this.platformId));

    // this.updates.versionUpdates.pipe(
    //   filter((evt: VersionReadyEvent): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
    //   map((evt: VersionReadyEvent) => ({
    //     type: 'UPDATE_AVAILABLE',
    //     current: evt.currentVersion,
    //     available: evt.latestVersion,
    //   }))).subscribe(
    //     () => this.showAppUpdateAlert()
    //   );

    if (this.isBrowser.value) {
      Jmg.shuffle(this.treeFacts);
      this.setTreeFact();
    }
  }

  ngOnInit(): void {
    this.removeExistingServiceWorkers();
  }

  authFailed(){
    this.authFailCount.update(value => value + 1);
  }

  setTreeFact() {
    this.randomFact = this.treeFacts[this.factIndex];
  }

  nextTreeFact() {
    if (this.factIndex < this.treeFacts.length - 1) {
      this.factIndex++;
    }
    else {
      this.factIndex = 0;
    }
    this.setTreeFact();
  }

  getAmazonProducts(asins?: string[]) {
    //if (this.isBrowser.value) {
      const body = asins && asins.length > 0 ? { ids: asins } : {};
      return this.http.post<Array<AmzProduct>>(`/api/product/amz`, body);
    // }
    // else{
    //   return of([]);
    // }
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

  authenticate(){

  }

  // showAppUpdateAlert() {
  //   this.updateApp();

  //   this.snackBar.open("Jemigo.com has available updates.", "Download",
  //     {
  //       duration: 10000
  //     }).
  //     onAction().subscribe(() => {
  //       this.updateApp();
  //     });
  // }

  // updateApp() {
  //   this.updates.activateUpdate().then(() => this.reload()).catch();
  // }

  reload() {
    location?.reload();
    //console.log("site updated");
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
    //this.title.setTitle(data.title);
    this.meta.updateTag({ name: "description", content: data.description });
    this.meta.updateTag({ property: "og:url", content: data.url });
    this.meta.updateTag({ property: "og:title", content: data.title });
    this.meta.updateTag({ property: "og:description", content: data.description });
    // this.meta.updateTag({ name: "twitter:description", content: data.description });
    // this.meta.updateTag({ name: "twitter:image:src", content: `/${data.image.src}`});
    // this.meta.updateTag({ name: "twitter:title", content: data.title });
    this.meta.updateTag({ property: "og:image", content: `/${data.image.src}` });
    this.meta.updateTag({ property: "og:type", content: "article" });

  //   this.meta.removeTag("property='article:published_time'");
  //   this.meta.removeTag("property='article:modified_time'");

  //   if (data?.articleDate) {
  //     this.meta.addTag({ property: "article:published_time", content: data?.articleDate }, false);
  //     this.meta.addTag({ property: "article:modified_time", content: data?.modifiedDate }, false);
  //   }
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

  removeExistingServiceWorkers(){
    if (navigator && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().then((success) => {
            if (success) {
              //console.log('Service worker unregistered successfully');
            }
          });
        });
      }).catch(() => {
        //console.error('Error unregistering service workers:', error);
      });
    }
  }

}
