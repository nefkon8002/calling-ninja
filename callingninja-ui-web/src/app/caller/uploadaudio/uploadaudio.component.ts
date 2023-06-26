import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { EndPoints } from '@shared/end-points';

@Component({
  selector: 'app-uploadaudio',
  templateUrl: './uploadaudio.component.html',
  styleUrls: ['./uploadaudio.component.css']
})
export class UploadaudioComponent {
  static END_POINT = environment.REST_FASTAPI;

  fileName = '';

  constructor(private http: HttpClient) { }

  onFileSelected(event) {
    const file: File = event.target.files[0];

    if (file) {
      this.fileName = file.name;

      const formData = new FormData();
      formData.append('uploaded_audio', file);

      interface ResponseData {
        file_key: string;
        file_url: string;
      }

      this.http.put<ResponseData>(EndPoints.UPLOADAUDIO + 'upload_audio_async', formData)
        .subscribe(response => {
          // Store the response in a session variable
          sessionStorage.setItem('response', JSON.stringify(response));
          console.log('Response stored in session variable.');
          console.log('Response from audio upload', sessionStorage.getItem('response'))

          // Retrieve the response from the session variable
          //const storedResponse = JSON.parse(sessionStorage.getItem('response'));
          //console.log('Stored Response:', storedResponse);
        });

    }
  }
}
