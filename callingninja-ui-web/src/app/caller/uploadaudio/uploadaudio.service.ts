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
export class AudioUploadService {
    static END_POINT = environment.REST_FASTAPI;

    constructor(private http: HttpClient) { }


    uploadAudio(file: File) {
        const formData = new FormData();
        formData.append('uploaded_audio', file);

        interface ResponseData {
            file_key: string;
            file_url: string;
        }

        return this.http.put<ResponseData>(EndPoints.UPLOADAUDIO + 'upload_audio_async', formData);
    }

    queryAudios() {
        return this.http.get(EndPoints.UPLOADAUDIO + 'query_audios')
    }
}