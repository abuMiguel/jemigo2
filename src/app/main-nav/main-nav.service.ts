import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, tap, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MainNavService {

  drawerOpen = false;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.HandsetPortrait)
    .pipe(
      map(result => result.matches),
      tap(() => this.drawerOpen == false),
      shareReplay()
    );
  isTablet$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.TabletPortrait)
    .pipe(
      map(result => result.matches),
      tap(() => this.drawerOpen == false),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver) { }

}
