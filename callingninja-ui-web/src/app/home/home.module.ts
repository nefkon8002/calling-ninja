import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { ShoppingBasketService } from './shopping-basket/shopping-basket.service';
import { ComplaintCreationDialogComponent } from './complaints/complaint-creation-dialog.component';
import { ComplaintsComponent } from './complaints/complaints.component';
import { AdviserComponent } from './adviser/adviser.component';
//import {PointsComponent} from './points/points.component';
import { ProfileComponent } from './profile/profile.component';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';
import { UploadaudioComponent } from 'app/caller/uploadaudio/uploadaudio.component';
import { InitcallComponent } from 'app/caller/initcall/initcall.component';
import { QueryfromComponent } from 'app/caller/queryfrom/queryfrom.component';
import { UploadnumbersComponent } from 'app/caller/uploadnumbers/uploadnumbers.component';

@NgModule({
  declarations: [
    AdviserComponent,
    //ComplaintsComponent,
    //ComplaintCreationDialogComponent,
    HomeComponent,
    // PointsComponent,
    ProfileComponent,
    UploadaudioComponent,
    QueryfromComponent,
    InitcallComponent,
    UploadnumbersComponent

  ],
  imports: [
    PasswordStrengthMeterModule,
    HomeRoutingModule,
    SharedModule,

  ],
  providers: [
    ShoppingBasketService,
  ]
})
export class HomeModule {

}
