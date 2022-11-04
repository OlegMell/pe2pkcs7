import { Injectable } from '@angular/core';
import {
  HTTP_INTERCEPTORS,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, dematerialize, materialize, mergeMap } from 'rxjs/operators';

@Injectable()
export class MockBackendService implements HttpInterceptor {

  // static perjReqCounter = 0;

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const { url } = request;

    return of(null)
      .pipe(mergeMap(handleRoute))
      .pipe(materialize())
      .pipe(dematerialize());

    function handleRoute() {

      switch (true) {

        case url.includes('api/upload'):
          console.log(request);
          return ok({ data: 'ok' }).pipe(delay(1000));

        default:
          return next.handle(request);
      }
    }

    function ok(b: any) {
      return of(new HttpResponse({ status: 200, body: b }));
    }

    function err(b: any) {
      return of(new HttpResponse({ status: 230, body: b }));
    }
  }
}

export const mockBackendProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: MockBackendService,
  multi: true
};
