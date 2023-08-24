import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { Router } from '@angular/router';
import { shareReplay, tap } from 'rxjs';
//import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  constructor(private webService: WebRequestService, private router: Router, private http: HttpClient) { }

  // login(email: string, password: string) {
  //   this.webService.login(email, password).pipe(
  //     shareReplay(),
  //     tap((res: HttpResponse<any>) => {
  //       //The auth token will be in the header of this response
  //       this.setSession(res.body._id, res.headers.get('x-access-token'), res.headers.get('x-refresh-token'));
  //     })
  //   )
  // }

  login(email: string, password: string) {
    return this.webService.login(email, password).pipe(
        shareReplay(),
        tap((res: HttpResponse<any>) => {
            // The auth token will be in the header of this response
            const accessToken = res.headers.get('x-access-token') ?? '';
            const refreshToken = res.headers.get('x-refresh-token') ?? '';
            this.setSession(res.body._id, accessToken, refreshToken);
            console.log("Logged in!");
        })
    );
}

  logout() {
    this.removeSession();

    this.router.navigateByUrl("/login");
  }

  signup(email: string, password: string) {
    return this.webService.signup(email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
          // The auth token will be in the header of this response
          const accessToken = res.headers.get('x-access-token') ?? ''; // Use an empty string as default
          const refreshToken = res.headers.get('x-refresh-token') ?? ''; // Use an empty string as default
          this.setSession(res.body._id, accessToken, refreshToken);
          console.log("Successfully signed up and now logged in!");
      })
  );
  }

  getAccessToken() {
    return localStorage.getItem('x-access-token');
  }

  setAccessToken(accessToken: string) {
    localStorage.setItem('x-access-token', accessToken);
  }

  getRefreshToken() {
    return localStorage.getItem('x-refresh-token');
  }

  getUserId() {
    return localStorage.getItem('user-id');
  }

  private setSession(userId: string, accessToken: string, refreshToken: string) {
    localStorage.setItem('user-id', userId);
    localStorage.setItem('x-access-token', accessToken);
    localStorage.setItem('x-refresh-token', refreshToken);
  }

  private removeSession() {
    localStorage.removeItem('user-id');
    localStorage.removeItem('x-access-token');
    localStorage.removeItem('x-refresh-token');
  }

  getNewAccessToken() {
    return this.http.get(`${this.webService.ROOT_URL}/users/me/access-token`, {
      headers: {
        'x-refresh-token': this.getRefreshToken()|| '',
        '_id': this.getUserId()|| ''
      },
      observe: 'response'
    }).pipe(
      tap((res: HttpResponse<any>)=>{
        this.setAccessToken(res.headers.get('x-access-token')||'');
      })
    )
  }
}
