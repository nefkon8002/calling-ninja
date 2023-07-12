import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { UploadaudioComponent } from './uploadaudio/uploadaudio.component';
import { InitcallComponent } from './initcall/initcall.component';
import { QueryfromComponent } from './queryfrom/queryfrom.component';
import { UploadnumbersComponent } from './uploadnumbers/uploadnumbers.component';
import { CallerComponent } from './caller.component';



@NgModule({
  declarations: [
    CallerComponent,
    UploadaudioComponent,
    QueryfromComponent,
    InitcallComponent,
    UploadnumbersComponent,
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    UploadaudioComponent,
    QueryfromComponent,
    InitcallComponent,
    UploadnumbersComponent,
  ]
})
export class CallerModule { }
