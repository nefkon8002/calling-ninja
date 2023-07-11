import { Injectable, Output } from '@angular/core';
import {Router} from '@angular/router';
import { Observable, of,throwError } from 'rxjs';
// import {map} from 'rxjs/operators';
import {JwtHelperService} from '@auth0/angular-jwt';

import {environment} from '@env';
import {User,UserDto,account_dto} from '@core/user.model';

import {HttpService} from '@core/http.service';
import {Role} from '@core/role.model';
import { HttpClient, HttpHeaders ,HttpErrorResponse} from '@angular/common/http';
import {catchError,map} from 'rxjs/operators';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarModule,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  static END_POINT = environment.REST_USER + '/users/token';
  static END_POINT_USERS = environment.REST_USER + '/users';

  private user: User;
  private userDto: UserDto;
  private account_dto: account_dto;
  constructor(private httpService: HttpService,private http:HttpClient, private router: Router,private snackBar: MatSnackBar) {
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

  errorMsg: string;
  loading: boolean = false;
  adminlogin(admin_login:string , admin_p:string,mobile: number, password: string, mail: string): void {

    const expression_email: RegExp = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
    const email: string = mail;
    const result_email: boolean = expression_email.test(email);

    console.log('e-mail is ' + (result_email ? 'correct' : 'incorrect'));

    const expression_mdn: RegExp = /^[0-9]*$/;
    const mdn: string = mobile.toString();
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

   try {

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
              mobile: (result_mdn ? mobile.toString() : ''),
              firstName: "TESTERBOT",
              lastName: "string",
              familyName: "string",
              email:(result_email ? mail : 'testerbot@plusnetwork.com.mx'),
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

          // try {

            // this.http.post(AuthService.END_POINT_USERS,this.userDto,httpOptionsSR)
            // .subscribe( (homeworld: any) => {
            //  console.log("RESONSE CRETE USERS " + homeworld)
            // })

            this.http.post(AuthService.END_POINT_USERS,this.userDto,httpOptionsSR)
            .subscribe(
            (next: any) => {
             console.log("RESONSE CRETE USERS OK")
             this.openSnackBar();
            },
            (error) => {                              //Error callback

              this.errorMsg = error;
              this.loading = false;
              if (error.error instanceof ErrorEvent) {
                    this.errorMsg = `Error: ${error.error.message}`;
                  } else {
                    this.errorMsg = this.getServerErrorMessage(error);
                  }
                    console.error('error caught in component4' + this.errorMsg)
                    return this.openSnackBarError(this.errorMsg);
                    // return throwError(()=>{

                    //   console.error("ERROR ++++++=> " + this.errorMsg);
                    //   this.openSnackBarError(this.errorMsg);
                    // });
            }

            )

          //   this.http.post(AuthService.END_POINT_USERS,this.userDto,httpOptionsSR)
          //   .pipe(
          //     catchError(error => {
          //       let errorMsg: string;
          //               if (error.error instanceof ErrorEvent) {
          //                   this.errorMsg = `Error: ${error.error.message}`;
          //               } else {
          //                   this.errorMsg = this.getServerErrorMessage(error);
          //               }

          //               return throwError(errorMsg);
          //     })
          // );

          // } catch (error) {
          //   console.log("-------------------------ERROR " + error.message);
          //   throw new Error(error.message);
          // }


    })

   } catch (error) {
    throw new Error(error.message);

   }



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


  private getServerErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
        case 404: {
            return `Not Found: ${error.message}`;
        }
        case 409: {
          return `API-USER : ${error.error.message}`;
      }
        case 403: {
            return `Access Denied: ${error.message}`;
        }
        case 500: {
            return `Internal Server Error: ${error.message}`;
        }
        default: {
            return `Unknown Server Error: ${error.message}`;
        }

    }
  }

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  openSnackBarError(error : string) {
    this.snackBar.open(
      'Account registration failed due to : '  + error + ' ', 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: ['yellow-snackbar']
    });
  }

  openSnackBar() {
    this.snackBar.open(
      'The registration of your account with the following cellphone number ' + this.userDto.mobile + ' and email  '+this.userDto.email + ' was successful', 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      panelClass: ['blue-snackbar']
    });
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
