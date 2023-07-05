import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Role } from '@core/role.model';
import { RoleGuardService } from '@core/role-guard.service';
import { AdviserComponent } from './adviser/adviser.component';
import { ComplaintsComponent } from './complaints/complaints.component';
import { HomeComponent } from './home.component';
import { ProfileComponent } from './profile/profile.component';
import { PointsComponent } from "./points/points.component";
import { UploaderMultifileComponent } from "./uploader/uploader-multifile-component";
import { UploaderComponent } from "./uploaderV2/uploader-component";
// import {AlertComponent} from "./plaintText/plaint-component";
import { AppComponent } from "./plaintText/app-component";
import { UsermanagerComponent } from './usermanager/usermanager.component';


const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'adviser', component: AdviserComponent }, // public
      { path: 'uploader', component: UploaderMultifileComponent }, // public
      { path: 'uploaderV2', component: UploaderComponent }, // public
      { path: 'renderPlaintext', component: AppComponent }, // public
      {
        path: 'usermanager',
        component: UsermanagerComponent,
        canActivate: [RoleGuardService],
        data: { roles: [Role.MANAGER, Role.ADMIN] }
      },
      {
        path: 'profile-user',
        component: ProfileComponent,
        canActivate: [RoleGuardService],
        data: { roles: [Role.CUSTOMER, Role.ADMIN] }
      },
      {
        path: 'complaints',
        component: ComplaintsComponent,
        canActivate: [RoleGuardService],
        data: { roles: [Role.CUSTOMER] }
      },
      {
        path: 'points',
        component: PointsComponent,
        canActivate: [RoleGuardService],
        data: { roles: [Role.CUSTOMER] }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {
}
