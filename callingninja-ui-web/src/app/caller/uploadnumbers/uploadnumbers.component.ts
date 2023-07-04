import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { EndPoints } from '@shared/end-points';
import { SessionStorageService } from '@shared/services/sessionstorage.service';
import { NumbersUploadService } from './uploadnumbers.service';

@Component({
  selector: 'app-uploadnumbers',
  templateUrl: './uploadnumbers.component.html',
  styleUrls: ['./uploadnumbers.component.css']
})
export class UploadnumbersComponent {
  fileName = '';
  fromNumbers: string = '';
  selectedNumber: string = '';
  isUploading: boolean = false;
  uploadComplete: boolean = false;

  constructor(private numbersUploadService: NumbersUploadService, private sessionStorageService: SessionStorageService) { }

  ngOnInit() {
    //this.queryFromNumbers();
  }

  onFileSelected(event) {
    const file: File = event.target.files[0];



    if (file && file.type.split('/')[0] == 'text') {
      this.fileName = file.name;
      let fileType = file.type.split('/')
      console.log(fileType[0])
      this.isUploading = true;

      this.numbersUploadService.uploadText(file).subscribe(response => {
        let toNumbersArray = response.to_numbers;
        sessionStorage.setItem('to_numbers', JSON.stringify(toNumbersArray));

        console.log('Response stored in session variable.');
        console.log('Response from numbers upload', sessionStorage.getItem('to_numbers'));
        this.isUploading = false;
        this.uploadComplete = true;
      });
    } // close if file and if text

    else {
      console.log(file.type.split('/'))
      console.log("FILE TYPE NOT ALLOWED")
    }
  }



}
