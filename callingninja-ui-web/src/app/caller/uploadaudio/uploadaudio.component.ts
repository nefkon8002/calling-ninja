import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { EndPoints } from '@shared/end-points';

@Component({
  selector: 'app-uploadaudio',
  templateUrl: './uploadaudio.component.html',
  styleUrls: ['./uploadaudio.component.css']
})
export class UploadaudioComponent {
  static END_POINT = environment.REST_FASTAPI

  fileName = '';

  constructor(private http: HttpClient) { }

  onFileSelected(event) {
    const file: File = event.target.files[0];

    if (file) {

      this.fileName = file.name;

      const formData = new FormData();

      formData.append("uploaded_audio", file);

      const upload$ = this.http.put(EndPoints.UPLOADAUDIO + 'upload_audio_async', formData);

      upload$.subscribe();
    }
  }

}
