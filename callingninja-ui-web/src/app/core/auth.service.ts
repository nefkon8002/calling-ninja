import { Injectable, Output } from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
// import {map} from 'rxjs/operators';
import {JwtHelperService} from '@auth0/angular-jwt';

import {environment} from '@env';
import {User,UserDto,account_dto} from '@core/user.model';

import {HttpService} from '@core/http.service';
import {Role} from '@core/role.model';
import { HttpClient, HttpHeaders ,HttpResponse} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  static END_POINT = environment.REST_USER + '/users/token';
  static END_POINT_USERS = environment.REST_USER + '/users';

  private user: User;
  private userDto: UserDto;
  private account_dto: account_dto;
  constructor(private httpService: HttpService,private http:HttpClient, private router: Router) {
  }

  login(mobile: string, password: string): Observable<User> {
    return this.httpService.authBasic(mobile, password)
      .post(AuthService.END_POINT)
      .pipe(
        map(jsonToken => {
          const jwtHelper = new JwtHelperService();
          this.user = jsonToken; // {token:jwt} => user.token = jwtmdnRegex
          this.user.mobile = jwtHelper.decodeToken(jsonToken.token).user;  // secret key is not necessary
          this.user.name = jwtHelper.decodeToken(jsonToken.token).name;
          this.user.role = jwtHelper.decodeToken(jsonToken.token).role;
          return this.user;
        })
      );
  }



  adminlogin(admin_login:string , admin_p:string,mobile: string, password: string): void {

    const expression_email: RegExp = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
    const email: string = mobile;
    const result_email: boolean = expression_email.test(email);

    console.log('e-mail is ' + (result_email ? 'correct' : 'incorrect'));

    const expression_mdn: RegExp = /^[0-9]*$/;
    const mdn: string = mobile;
    const result_mdn: boolean = expression_mdn.test(mdn);

    console.log('mdn is ' + (result_mdn ? 'correct' : 'incorrect'));

    if ( !result_mdn && !result_email) {
      //lazar exepciones
      throw new Error('Solo puede ser un email o un numero movil a 10 digitos');
    }


  let httpOptionsToken = {
    headers: new HttpHeaders({
      'Authorization':'Basic ' + btoa(admin_login + ':' + admin_p),
    })
    }
   this.account_dto={
    password: admin_p,
    username: admin_login,
    authorities: [
      {
        authority: "ADMIN"
      }
    ],
    accountNonExpired: true,
    accountNonLocked: true,
    credentialsNonExpired:true,
    enabled: true,
   }
   this.http
      .post(AuthService.END_POINT,this.account_dto,httpOptionsToken).subscribe( (jsonToken:any) =>{
            // console.log("TOKEN OK -> "+ jsonToken.token);
            console.log("TOKEN OK -> ");
            let httpOptionsSR = {
              headers: new HttpHeaders({
                  'accept':'*/*',
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${jsonToken.token}`
                })
              }


              this.userDto ={
                mobile: (result_mdn ? mobile : 'Not Available'),
                firstName: "TESTERBOT",
                lastName: "string",
                familyName: "string",
                email:(result_email ? mobile : 'testerbot@plusnetwork.com.mx'),
                dni: "string",
                address: "string",
                password: password,
                role: Role.OPERATOR,
                active: false,
                registrationDate: new Date,
                company: "string",
                id: 0,
                guid: "string",
                balance: "string",
                picture: "string",
                age: 0,
                eyeColor: "string",
                twilio_sid: "string",
                twilio_auth: "string",
              };

            this.http.post(AuthService.END_POINT_USERS,this.userDto,httpOptionsSR)

            .subscribe( (homeworld: any) => {
              //console.log("RESONSE CRETE USERS " + homeworld)
            });

      })
  }






   signup(mobile: string, password: string,token: string): void {

    this.userDto ={
      mobile: mobile,
      firstName: "TESTERBOT",
      lastName: "string",
      familyName: "string",
      email: mobile,
      dni: "string",
      address: "string",
      password: password,
      role: Role.OPERATOR,
      active: false,
      registrationDate: new Date,
      company: "string",
      id: 0,
      guid: "string",
      balance: "string",
      picture: "string",
      age: 0,
      eyeColor: "string",
      twilio_sid: "string",
      twilio_auth: "string",
    };




    console.log("Creando user -> " + mobile);
    console.log("Creando user -> " + token);

    this.httpService
    .postSR(AuthService.END_POINT_USERS,this.userDto,token)

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

  getMobile(): number {
    return this.user ? this.user.mobile : undefined;
  }

  getName(): string {
    return this.user ? this.user.name : '???';
  }

  getToken(): string {
    return this.user ? this.user.token : undefined;
  }

  private handleError(response): any {
    let error: Error;
    console.log("ERROR  +++++++++++++=> JSON0 " + response.status);
    console.log("ERROR  +++++++++++++=> JSON0 " + response);
    // if (response.status === HttpService.UNAUTHORIZED) {
    //   console.log("HttpService.UNAUTHORIZED => JSON0 " + response);
    //   this.showError('Unauthorized');
    //   this.router.navigate(['']).then();
    //   console.log("HttpService.UNAUTHORIZED +++++> JSON0 " + response);
    //   return EMPTY;
    // } else if (response.status === HttpService.CONNECTION_REFUSE) {
    //   console.log("HttpService.CONNECTION_REFUSE +++++++++++++=> JSON0 " + response.status);

    //   this.showError('Connection Refuse');
    //   return EMPTY;
    // } else {
    //   console.log("HttpServiceERRRROR ============> JSON0 " + response.status);
    //   try {
    //     error = response.error; // with 'text': JSON.parse(response.error);
    //     this.showError(error.error + ' (' + response.status + '): ' + error.message);
    //     return throwError(() => error);
    //   } catch (e) {
    //     console.log("HttpService.CONNECTION_REFUSE => Not response " + response.status);
    //     this.showError('Not response');
    //     return throwError(() => response.error);
    //   }
    // }
  }
}
