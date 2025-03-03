import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { environment } from '../environments/environment';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export const authGuard: CanActivateFn = (_route, _state) => {
    const http = inject(HttpClient);
    const router = inject(Router);
  
    if(!environment.production) return true;
    if(typeof window !== "undefined"){
        const token = window?.prompt("type: ");
        return http.post(`/api/access`, {token: token}, {observe: 'response', responseType: 'text'}).pipe(
            map((res) => { return res.status === 200 }),
            catchError(() => of(router.parseUrl('/'))),
        );
    }
    else{
        return false;
    }
  };