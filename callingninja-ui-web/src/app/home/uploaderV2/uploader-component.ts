//import { UploaderComponent } from './../uploader_multifile/uploader_multifile_component';
import {Component} from '@angular/core';
import {HttpClient} from '@angular/common/http'
// import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'file-upload',
  templateUrl: 'uploader-component.html',
  styleUrls: ['uploader-component.css'],
})

// @Component({
//   selector: 'file-upload',
//   templateUrl: "file-upload.component.html",
//   styleUrls: ["file-upload.component.scss"]
// })
export class UploaderComponent {

  fileName = '';

  fileRequests = new WeakMap();

  constructor(private http: HttpClient) {}

  ENDPOINTS = {
    UPLOAD: 'http://localhost:1234/upload',
    UPLOAD_STATUS: 'http://localhost:1234/upload-status',
    UPLOAD_REQUEST: 'http://localhost:1234/upload-request',
    UPLOAD_READ_FILE: 'http://localhost:1234/upload-read',
  }

  uniqueAlphaNumericId = (() => {
		const heyStack = '0123456789abcdefghijklmnopqrstuvwxyz';
		const randomInt = () => Math.floor(Math.random() * Math.floor(heyStack.length));

		return (length = 24) => Array.from({length}, () => heyStack[randomInt()]).join('');
	})();
  

  onFileSelected(event) {

      const file:File = event.target.files[0];
      const defaultOptions = {
        url: this.ENDPOINTS.UPLOAD,
        startingByte: 0,
        fileId: '',
        onAbort() {},
        onProgress() {},
        onError() {},
        onComplete() {}
      };

      if (file) {

          this.fileName = file.name;
          defaultOptions.fileId = this.uniqueAlphaNumericId();

          const formData = new FormData();

          formData.append("thumbnail", file);

          // const upload$ = this.http.post("/api/thumbnail-upload", formData);
          //const upload$ = this.http.post("http://localhost:1234/upload-request", formData);
          //const upload$ = this.http.post("http://localhost:1234/upload", formData);
          // const upload$ = this.uploadFile(file,defaultOptions);
          // upload$.subscribe();
          this.uploadFile(file,defaultOptions);

      }
  }

    // ------------------Firma del client http 
    //   post(url: string, body: any | null, options: {
    //     headers?: HttpHeaders | {
    //         [header: string]: string | string[];
    //     };
    //     observe?: HttpObserve;
    //     params?: HttpParams | {
    //         [param: string]: string | string[];
    //     };
    //     reportProgress?: boolean;
    //     responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
    //     withCredentials?: boolean;
    // } = {}): Observable<any> 

    //----------http client return observable
	  //  uploadFile = (file, options) => {
    //   return this.http.post(this.ENDPOINTS.UPLOAD_REQUEST, 
    //       JSON.stringify({
    //       fileName: file.name,
    //       fileId: options.fileId,
    //     }),{
    //       headers: {
    //         			'Content-Type': 'application/json',
    //         		},
    //       reportProgress: true,
    //     }
    //   ).subscribe({
    //     next: data => {
    //       console.log("RESPONSE -> " + data.toString);
    //       options = {...options , data};
		// 	    this.fileRequests.set(file, {request: null, options});
    //       this.uploadFileChunks(file, options);
    //       },
    //     error: error => {
    //       // this.errorMessage = error.message;
    //       console.error('There was an error!', error);
    //       options.onError({...error, file})
    //   }
    //   })
    // }

  ///---------------------------------------------WORKS---------------------------------------------------------------------
   uploadFile = (file, options) => {

		return fetch(this.ENDPOINTS.UPLOAD_REQUEST, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				fileName: file.name,
        fileId: options.fileId,
				// fileId: file.fileId,
			})
		})
			.then(res => res.json())
			.then(res => {
				options = {...options, ...res};
				this.fileRequests.set(file, {request: null, options});

				this.uploadFileChunks(file, options);
			})
			.catch(e => {
				options.onError({...e, file})
			})
	}

 ///------------------------------------------------------------------------------------------------------------------
  
 uploadFileChunks = (file, options) => {
		const formData = new FormData();
		const req = new XMLHttpRequest();
		const chunk = file.slice(options.startingByte);

		formData.append('chunk', chunk, file.name);
		formData.append('fileId', options.fileId);

		req.open('POST', options.url, true);
		req.setRequestHeader('Content-Range', `bytes=${options.startingByte}-${options.startingByte+chunk.size}/${file.size}`);
		req.setRequestHeader('X-File-Id', options.fileId);

		req.onload = (e) => {
			// it is possible for load to be called when the request status is not 200
			// this will treat 200 only as success and everything else as failure
			if (req.status === 200) {
				options.onComplete(e, file);
			} else {
				options.onError(e, file);
			}
		}

		req.upload.onprogress = (e) => {
			const loaded = options.startingByte + e.loaded;
			options.onProgress({...e,
				loaded,
				total: file.size,
				percentage: loaded * 100 / file.size
			}, file);
		}

		req.ontimeout = (e) => options.onError(e, file);

		req.onabort = (e) => options.onAbort(e, file);

		req.onerror = (e) => options.onError(e, file);

		this.fileRequests.get(file).request = req;

		req.send(formData);
	};


}


