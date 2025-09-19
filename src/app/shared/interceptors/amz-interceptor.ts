import { Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
} from "@angular/common/http";
import { Observable, EMPTY } from "rxjs";

@Injectable()
export class AmzInterceptor implements HttpInterceptor {
  constructor() {}
  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
  if (!req.url.includes("ir-na.amazon-adsystem.com")) {
    return next.handle(req);
  }
  else{
    // block this request by returning an empty observable
    return EMPTY;
  }
  }
}
