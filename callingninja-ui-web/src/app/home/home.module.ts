import {NgModule} from '@angular/core';

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

@NgModule({
  declarations: [
    AdviserComponent,
    //ComplaintsComponent,
    //ComplaintCreationDialogComponent,
    HomeComponent,
    // PointsComponent,
    ProfileComponent,
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
