import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient } from '@angular/common/http';

import { environment } from '@env';
import { HttpService } from '@core/http.service';
import { Role } from '@core/role.model';
import { EndPoints } from '@shared/end-points';
import { User } from '@core/user.model';

@Injectable({
    providedIn: 'root',
})
export class NumbersUploadService {
    static END_POINT = environment.REST_FASTAPI;

    constructor(private http: HttpClient) { }

    //queryFromNumbers() {

    //    interface ResponseData {
    //        from_numbers: string;
    //    }
    //    return this.http.get<ResponseData>(EndPoints.UPLOADAUDIO + 'get_from_numbers');
    //}

    uploadText(file: File) {
        const formData = new FormData();
        formData.append('uploaded_numbers', file);

        interface ResponseData {
            to_numbers: string;
        }

        return this.http.post<ResponseData>(EndPoints.UPLOADAUDIO + 'upload_numbers', formData);
    }
}