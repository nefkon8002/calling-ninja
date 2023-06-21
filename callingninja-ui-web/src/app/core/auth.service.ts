import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

import { environment } from '@env';
import { User } from '@core/user.model';
import { HttpService } from '@core/http.service';

enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  CUSTOMER = 'customer'
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  static TOKEN_ENDPOINT = environment.REST_USER + '/token';
  private user: User;

  constructor(private httpService: HttpService, private router: Router) { }

  login(username: string, password: string): Observable<User> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', "password");
    //password: password,
    //username: username,
    //grant_type: 'password',
    //client_id: 'your_client_id',
    //client_secret: 'your_client_secret',

    return this.httpService
      .post(AuthService.TOKEN_ENDPOINT, formData)
      .pipe(
        map((response: any) => {
          const jwtHelper = new JwtHelperService();
          this.user = {
            username: username,
            token: response.access_token,
            name: jwtHelper.decodeToken(response.access_token).name,
            role: jwtHelper.decodeToken(response.access_token).role as Role,
            mobile: jwtHelper.decodeToken(response.access_token).user,
          };
          console.log(this.user.username);
          console.log(this.user.token);
          console.log(this.user.name);
          console.log(this.user.mobile);
          return this.user;
        })
      );
  }

  logout(): void {
    this.user = undefined;
    this.router.navigate(['']).then();
  }

  isAuthenticated(): boolean {
    return this.user != null && !(new JwtHelperService().isTokenExpired(this.user.token));
  }

  hasRoles(roles: Role[]): boolean {
    return this.isAuthenticated() && roles.includes(this.user.role);
  }

  isAdmin(): boolean {
    return this.hasRoles([Role.ADMIN]);
  }

  untilManager(): boolean {
    return this.hasRoles([Role.ADMIN, Role.MANAGER]);
  }

  untilOperator(): boolean {
    return this.hasRoles([Role.ADMIN, Role.MANAGER, Role.OPERATOR]);
  }

  isCustomer(): boolean {
    return this.hasRoles([Role.CUSTOMER]);
  }

  getUsername(): string {
    return this.user ? this.user.username : undefined;
  }

  getName(): string {
    return this.user ? this.user.name : '???';
  }

  getToken(): string {
    return this.user ? this.user.token : undefined;
  }

  getMobile(): number {
    return this.user ? this.user.mobile : undefined;
  }
}
