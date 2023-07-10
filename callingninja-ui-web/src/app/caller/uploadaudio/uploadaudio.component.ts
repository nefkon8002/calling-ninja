import { Component, ViewChild, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { EndPoints } from '@shared/end-points';
import { SessionStorageService } from '@shared/services/sessionstorage.service';
import { AudioUploadService } from './uploadaudio.service';
import { Observable } from 'rxjs';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';

@Component({
  selector: 'app-uploadaudio',
  templateUrl: './uploadaudio.component.html',
  styleUrls: ['./uploadaudio.component.css']
})
export class UploadaudioComponent {
  fileName = '';
  fromNumbers: string = '';
  selectedNumber: string = '';
  isUploading: boolean = false;
  uploadComplete: boolean = false;
  queriedAudios: any = {};
  disableAudioUploadRadioButton = true;
  checkedAudioUploadRadioButton = false;
  //@ViewChild('queriedClassRadioGroup', { static: false }) queriedClassRadioGroup: MatRadioGroup;
  @ViewChildren(MatRadioButton) radioButtons: QueryList<MatRadioButton>;

  constructor(private audioUploadService: AudioUploadService, private sessionStorageService: SessionStorageService) { }

  ngOnInit() {
    this.audioUploadService.queryAudios().subscribe(response => {
      this.queriedAudios = response;
      //console.log(this.queriedAudios)
    });
    /*
    setTimeout(() => {
      console.log(this.radioButtons);
    }, 1000);
    */
  }

  onFileSelected(event) {
    const file: File = event.target.files[0];

    if (file && file.type.split('/')[0] == 'audio') {
      this.fileName = file.name;
      let fileType = file.type.split('/')
      //console.log(fileType[0])

      this.isUploading = true;

      this.audioUploadService.uploadAudio(file)
        .subscribe(response => {
          // Store the response in a session variable
          sessionStorage.setItem('new_audio_file', JSON.stringify(response));
          sessionStorage.setItem('audio_file', JSON.stringify(response));
          //console.log('Response stored in session variable.');
          //console.log('Response from audio upload', sessionStorage.getItem('response'));

          // Retrieve the response from the session variable
          // const storedResponse = JSON.parse(sessionStorage.getItem('response'));
          // console.log('Stored Response:', storedResponse);
          this.isUploading = false;
          this.uploadComplete = true;
          this.uncheckQueriedClassRadioButtons();
          this.disableAudioUploadRadioButton = false;
          this.checkedAudioUploadRadioButton = true;


        });
    } // close if file and if audio
    else {
      console.log(file.type.split('/'))
      console.log("FILE TYPE NOT ALLOWED")
    }
  }

  queryAudios(): void {
    setTimeout(() => {
      this.audioUploadService.queryAudios().subscribe(response => {
        this.queriedAudios = response;
        //console.log(this.queriedAudios)
      });
    }, 500);
  }

  toArray(obj: any): any[] {
    if (Array.isArray(obj)) {
      return obj;
    } else if (obj && typeof obj === 'object') {
      return Object.keys(obj).map(key => obj[key]);
    } else {
      return [];
    }
  }

  selectqueriedAudio(file_array?) {
    if (file_array) {
      //console.log(file_array.file_key);
      //console.log(file_array.full_url);
      let audio_file = JSON.stringify({ "file_key": file_array.file_key, "file_url": file_array.full_url });
      sessionStorage.setItem("audio_file", audio_file);
    }
    else {
      let audio_file = sessionStorage.getItem("new_audio_file");
      sessionStorage.setItem("audio_file", audio_file);
    }
  }

  uncheckQueriedClassRadioButtons() {
    if (this.radioButtons) {
      const allRadioButtons: MatRadioButton[] = this.radioButtons.toArray();
      allRadioButtons.forEach((indRadioButton: MatRadioButton) => {
        if (indRadioButton.id != "firstButton") {
          indRadioButton.checked = false;
        }

      });
    }
  }


}
