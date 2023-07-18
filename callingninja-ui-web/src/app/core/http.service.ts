import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Error } from '@core/error.model';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  static CONNECTION_REFUSE = 0;
  static UNAUTHORIZED = 401;

  private headers: HttpHeaders;
  private params: HttpParams;
  private responseType: string;
  private successfulNotification = undefined;
  private errorNotification = undefined;

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private router: Router) {
    this.resetOptions();
  }

  param(key: string, value: string): HttpService {
    if (value != null) {
      this.params = this.params.append(key, value); // This class is immutable
    }
    return this;
  }

  paramsFrom(dto: any): HttpService {
    Object.getOwnPropertyNames(dto)
      .forEach(item => this.param(item, dto[item]));
    return this;
  }

  successful(notification = 'Successful'): HttpService {
    this.successfulNotification = notification;
    return this;
  }

  error(notification: string): HttpService {
    this.errorNotification = notification;
    return this;
  }

  pdf(): HttpService {
    this.responseType = 'blob';
    this.header('Accept', 'application/pdf , application/json');
    return this;
  }

  post(endpoint: string, body?: object): Observable<any> {
    return this.http
      .post(endpoint, body, this.createOptions())
      .pipe(
        map(response => this.extractData(response)),
        catchError(error => this.handleError(error))
      );
  }
  postSR(endpoint: string, body?: object, token?: string): Observable<any> {
    this.resetOptionsSecureRequest(token);
    return this.http
      .post(endpoint, body, this.createOptionsSR())
      .pipe(
        map(response => this.extractData(response)),
        catchError(error => this.handleError(error))
      );
  }

  get(endpoint: string): Observable<any> {
    return this.http
      .get(endpoint, this.createOptions())
      .pipe(
        map(response => this.extractData(response)),
        catchError(error => this.handleError(error))
      );
  }

  put(endpoint: string, body?: object): Observable<any> {
    return this.http
      .put(endpoint, body, this.createOptions())
      .pipe(
        map(response => this.extractData(response)),
        catchError(error => this.handleError(error))
      );
  }

  patch(endpoint: string, body?: object): Observable<any> {
    return this.http
      .patch(endpoint, body, this.createOptions())
      .pipe(
        map(response => this.extractData(response)),
        catchError(error => this.handleError(error))
      );
  }

  delete(endpoint: string): Observable<any> {
    return this.http
      .delete(endpoint, this.createOptions())
      .pipe(
        map(response => this.extractData(response)),
        catchError(error => this.handleError(error)));
  }

  // authBasic(mobile: number, password: string): HttpService {
  //   return this.header('Authorization', 'Basic ' + btoa(mobile + ':' + password));
  // }
  authBasic(mobile: string, password: string): HttpService {
    this.header('Access-Control-Allow-Origin', '*');
    return this.header('Authorization', 'Basic ' + btoa(mobile + ':' + password));
  }
  authRequestHeaderContent(): HttpService {

    this.header('accept', '*/*');
    return this.header('Content-Type', 'application/json')

  }
  authRequestHeaders(jsonToken: string): HttpService {
    this.header('accept', '*/*');
    this.header('Content-Type', 'application/json')
    return this.header('Authorization', `Bearer ${jsonToken}`)

  }
  //HttpService
  header(key: string, value: string): HttpService {
    if (value != null) {
      this.headers = this.headers.append(key, value); // This class is immutable
    }
    return this;
  }

  private resetOptions(): void {
    this.headers = new HttpHeaders();
    this.params = new HttpParams();
    this.responseType = 'json';
  }
  private createOptions(): any {
    const options: any = {
      headers: this.headers,
      params: this.params,
      responseType: this.responseType,
      observe: 'response'
    };
    this.resetOptions();
    return options;
  }

  private resetOptionsSecureRequest(jsonToken: string): void {
    this.headers = new HttpHeaders({
      'accept': '*/*',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jsonToken}`
    });
    this.params = new HttpParams();
    this.responseType = 'json';
  }
  private createOptionsSR(): any {
    const options: any = {
      headers: this.headers,
      params: this.params,
      responseType: this.responseType,
      observe: 'response'
    };
    //this.resetOptions();
    return options;
  }


  private extractData(response): any {
    console.log("RESPONSE => JSON0 1" + response);
    if (this.successfulNotification) {
      this.snackBar.open(this.successfulNotification, '', {
        duration: 2000
      });
      this.successfulNotification = undefined;
    }
    const contentType = response.headers.get('content-type');
    if (contentType) {
      if (contentType.indexOf('application/pdf') !== -1) {
        const blob = new Blob([response.body], { type: 'application/pdf' });
        window.open(window.URL.createObjectURL(blob));
      } else if (contentType.indexOf('application/json') !== -1) {
        console.log("RESPONSE => JSON0 " + response.body);
        return response.body; // with 'text': JSON.parse(response.body);
      }
    } else {
      console.log("RESPONSE => NO JSON0 " + response);
      return response;
    }
  }

  private showError(notification: string): void {
    if (this.errorNotification) {
      this.snackBar.open(this.errorNotification, 'Error', { duration: 5000 });
      this.errorNotification = undefined;
    } else {
      this.snackBar.open(notification, 'Error - Verfica que REST API USER este online.', { duration: 5000 });
    }
  }

  private handleError(response): any {
    let error: Error;
    if (response.status === HttpService.UNAUTHORIZED) {
      console.log("HttpService.UNAUTHORIZED => JSON0 " + response);
      this.showError('Unauthorized');
      this.router.navigate(['']).then();
      console.log("HttpService.UNAUTHORIZED +++++> JSON0 " + response);
      return EMPTY;
    } else if (response.status === HttpService.CONNECTION_REFUSE) {
      console.log("HttpService.CONNECTION_REFUSE +++++++++++++=> JSON0 " + response.status);

      this.showError('Connection Refuse');
      return EMPTY;
    } else {
      console.log("HttpServiceERRRROR ============> JSON0 " + response.status);
      try {
        error = response.error; // with 'text': JSON.parse(response.error);
        this.showError(error.error + ' (' + response.status + '): ' + error.message);
        return throwError(() => error);
      } catch (e) {
        console.log("HttpService.CONNECTION_REFUSE => Not response " + response.status);
        this.showError('Not response');
        return throwError(() => response.error);
      }
    }
  }

}
