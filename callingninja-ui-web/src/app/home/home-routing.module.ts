import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Role } from '@core/role.model';
import { RoleGuardService } from '@core/role-guard.service';
import { AdviserComponent } from './adviser/adviser.component';
import { ComplaintsComponent } from './complaints/complaints.component';
import { HomeComponent } from './home.component';
import { ProfileComponent } from './profile/profile.component';
import { PointsComponent } from "./points/points.component";
import { InitcallComponent } from "../caller/initcall/initcall.component";

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'adviser', component: AdviserComponent }, // public
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
      },
      {
        path: 'initcall',
        component: InitcallComponent,
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
