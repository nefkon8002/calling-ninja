import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadaudioComponent } from './uploadaudio/uploadaudio.component';
import { InitcallComponent } from './initcall/initcall.component';
import { QueryfromComponent } from './queryfrom/queryfrom.component';



@NgModule({
  declarations: [
    UploadaudioComponent,
    QueryfromComponent,
    InitcallComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    UploadaudioComponent,
    QueryfromComponent,
    InitcallComponent
  ]
})
export class CallerModule { }
