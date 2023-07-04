import {NgModule} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import {SharedModule} from '@shared/shared.module';
import {HomeComponent} from './home.component';
import {HomeRoutingModule} from './home-routing.module';
import {ShoppingBasketService} from './shopping-basket/shopping-basket.service';
import {ComplaintCreationDialogComponent} from './complaints/complaint-creation-dialog.component';
import {ComplaintsComponent} from './complaints/complaints.component';
import {AdviserComponent} from './adviser/adviser.component';
//import {PointsComponent} from './points/points.component';
import { ProfileComponent } from './profile/profile.component';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';
//import {MatIconModule} from '@angular/material';// this must add to app module.ts
import { UploaderComponent } from './uploaderV2/uploader-component';
import { AlertComponent } from './plaintText/plaint-component';
import { AppComponent } from './plaintText/app-component';
//import { InjectHTMLDirective } from './plaintText/injecthtml.directive';


@NgModule({
  declarations: [
    AdviserComponent,
    //ComplaintsComponent,
    //ComplaintCreationDialogComponent,
    HomeComponent,
    // PointsComponent,
    ProfileComponent,
    UploaderComponent,
    AlertComponent,
    AppComponent,
    
  ],
  imports: [
    PasswordStrengthMeterModule,
    HomeRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    //MatIconModule,
  ],
  providers: [
    ShoppingBasketService,
  ]
})
export class HomeModule {

}
