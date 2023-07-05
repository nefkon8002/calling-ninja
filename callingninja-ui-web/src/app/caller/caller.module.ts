import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadaudioComponent } from './uploadaudio/uploadaudio.component';
import { InitcallComponent } from './initcall/initcall.component';
import { QueryfromComponent } from './queryfrom/queryfrom.component';
import { UploadnumbersComponent } from './uploadnumbers/uploadnumbers.component';



@NgModule({
  declarations: [
    UploadaudioComponent,
    QueryfromComponent,
    InitcallComponent,
    UploadnumbersComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    UploadaudioComponent,
    QueryfromComponent,
    InitcallComponent,
    UploadnumbersComponent,
  ]
})
export class CallerModule { }
