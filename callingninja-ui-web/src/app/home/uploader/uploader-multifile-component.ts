import {Component} from '@angular/core';

//declare function uploadAndTrackFiles(): void;

@Component({
  templateUrl: 'uploader-multifile.html',
  styleUrls: ['uploader-multifile.css','normalizer.css'],
})
export class UploaderMultifileComponent {



public loadScript():Promise<any> {
  // let body = <HTMLDivElement> document.body;
  let header = <HTMLDivElement> document.head;
  let script = document.createElement('script');
  script.innerHTML = '';
  script.src = "../../../assets/js/uploader.js";
  script.async = true;
  script.defer = true;
  // body.appendChild(script);
  header.appendChild(script)
  return new Promise( ( resolve, reject) => {
    script.onload= resolve;
  });
}

constructor(){
  this.loadScript();
}



}


