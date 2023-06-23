import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadaudioComponent } from './uploadaudio/uploadaudio.component';
import { CallerComponent } from './initcall/initcall.component';



@NgModule({
  declarations: [
    UploadaudioComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    UploadaudioComponent,
    CallerComponent
  ]
})
export class CallerModule { }
