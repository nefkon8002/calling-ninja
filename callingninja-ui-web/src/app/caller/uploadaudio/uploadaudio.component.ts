import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { EndPoints } from '@shared/end-points';
import { AudioUploadService } from './uploadaudio.service';

@Component({
  selector: 'app-uploadaudio',
  templateUrl: './uploadaudio.component.html',
  styleUrls: ['./uploadaudio.component.css']
})
export class UploadaudioComponent {
  fileName = '';
  fromNumbers: string = '';
  selectedNumber: string = '';

  constructor(private audioUploadService: AudioUploadService) { }

  ngOnInit() {
    //this.queryFromNumbers();
  }

  onFileSelected(event) {
    const file: File = event.target.files[0];

    if (file && file.type.split('/')[0] == 'audio') {
      this.fileName = file.name;
      let fileType = file.type.split('/')
      console.log(fileType[0])

      this.audioUploadService.uploadAudio(file)
        .subscribe(response => {
          // Store the response in a session variable
          sessionStorage.setItem('audio_file', JSON.stringify(response));
          console.log('Response stored in session variable.');
          console.log('Response from audio upload', sessionStorage.getItem('response'));

          // Retrieve the response from the session variable
          // const storedResponse = JSON.parse(sessionStorage.getItem('response'));
          // console.log('Stored Response:', storedResponse);
        });
    } // close if file and if audio
    else if (file && file.type.split('/')[0] == 'text') {
      this.fileName = file.name;
      let fileType = file.type.split('/')
      console.log(fileType[0])

      this.audioUploadService.uploadText(file).subscribe(response => {
        let toNumbersArray = response.to_numbers;
        sessionStorage.setItem('to_numbers', JSON.stringify(toNumbersArray));

        console.log('Response stored in session variable.');
        console.log('Response from numbers upload', sessionStorage.getItem('to_numbers'));
      });
    } // close if file and if text
    else {
      console.log(file.type.split('/'))
      console.log("FILE TYPE NOT ALLOWED")
    }
  }



}
