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
//import { UserDto } from './profile.model';
import { User } from '@core/user.model';
import { HttpParams } from "@angular/common/http";



@Injectable({
    providedIn: 'root',
})
export class InitcallService {
    //static END_POINT = environment.REST_USER + '/users/token';
    static END_POINT = environment.REST_FASTAPI + '/call_manual';


    constructor(private httpService: HttpService) {
    }

    postCallManual(from_number: string, to_number: string, audio_url: string): Observable<void> {
        let params = new HttpParams()
            .set('from_number', from_number)
            .set('to_number', to_number)
            .set('audio_url', audio_url);
        let queryParams = { "from_number": from_number, "to_number": to_number, "audio_url": audio_url };


        const url = `${EndPoints.CALLER}call_manual?${params.toString()}`;

        return this.httpService.post(url, null);
    }


}
