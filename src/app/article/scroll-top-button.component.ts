import { Component, Inject, OnDestroy, afterNextRender, DOCUMENT } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { fromEvent, Subject } from 'rxjs';
import { mergeWith, takeUntil } from 'rxjs/operators';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'scroll-top-button',
    templateUrl: './scroll-top-button.component.html',
    standalone: true,
    imports: [
        CommonModule,
        FontAwesomeModule
    ]
})
export class ScrollTopButtonComponent implements OnDestroy {
    faChevronUp = faChevronUp;
    private readonly unsubAll$: Subject<void> = new Subject<void>();
    windowScrolled = false;
    constructor(private viewportScroller: ViewportScroller,
        @Inject(DOCUMENT) private document: any) {
            afterNextRender(() => {
                const scroll$ = fromEvent(this.document, 'scroll').pipe(takeUntil(this.unsubAll$));
                const touchmove$ = fromEvent(this.document, 'touchmove').pipe(takeUntil(this.unsubAll$));
    
                const allScroll = scroll$.pipe(
                    takeUntil(this.unsubAll$),
                    mergeWith(touchmove$)
                );
    
                allScroll.subscribe(
                    e => {
                        this.windowScrolled = window.scrollY !== 0;
                    }
                );
            });
    }

    ngOnDestroy(): void {
        this.unsubAll$.next();
        this.unsubAll$.unsubscribe();
    }

    scrollToTop() {
        this.viewportScroller.scrollToPosition([0, 0]);
    }
}