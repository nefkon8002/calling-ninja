import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

import { environment } from '@env';
// import {User} from '@core/user.model';
import { HttpService } from '@core/http.service';
import { Role } from '@core/role.model';
import { EndPoints } from '@shared/end-points';
import { UserDto } from './usereditor.models';
import { User } from '@core/user.model';

@Injectable({
    providedIn: 'root',
})
export class UsereditorService {
    static END_POINT = environment.REST_USER + '/users/token';

    private user: UserDto;


    constructor(private httpService: HttpService) {
    }

    getProfilebyMDN(mobile: number): Observable<UserDto> {
        return this.httpService.get(EndPoints.USERS + '/' + mobile)
    }

    getProfilebyMail(mail: string): Observable<UserDto> {
        return this.httpService
            .get(EndPoints.USERS + '/' + mail)

    }

    updateProfilebyMDN(mobile: number): Observable<void> {
        return this.httpService
            .put(EndPoints.USERS + '/' + mobile)

    }

    updateProfile(user: UserDto): Observable<void> {
        return this.httpService
            .put(EndPoints.USERS + '/' + user.mobile, user)
    }



}
