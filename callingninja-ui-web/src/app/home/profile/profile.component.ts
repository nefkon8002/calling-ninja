import { Component, OnInit, Inject } from '@angular/core';
import { ProfileService } from './profile.service';
import { HttpService } from '@core/http.service';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth.service';
import { Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

// import {User} from '@core/user.model';
import { UserDto } from './profile.model';
import { User } from '@core/user.model';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  //mobile: number;

  profile: UserDto;
  profilesrv: ProfileService;
  title = 'Profile';
  load: boolean = false;
  company: string = "";
  twilio_sid: string = "";
  twilio_auth: string = "";
  //password: string;

  balance: string;

  public authorizer: AuthService;

  constructor(private tokensService: AuthService, private httpService: HttpService) {
    this.profilesrv = new ProfileService(httpService);
    this.authorizer = tokensService;

  }

  ngOnInit(): void {
    this.profileUser()
      .subscribe(user => {
        console.log("PROFILE USER -> " + JSON.stringify(user))
        this.profile = user;
        this.balance = user.balance;
        this.company = user.company;
        this.twilio_sid = user.twilio_sid;
        this.twilio_auth = user.twilio_auth;
        this.load = true;
      });

  }

  // ngOnInit(): void {
  //    this.pointsService.getMyPoints()
  //     .subscribe( points => {
  //       this.userPoints = points.value;
  //       this.userPointsLastDate = points.lastDate || null;
  //     });
  // }


  // getMyPoints() : Observable<Points>{
  //   return this.httpService
  //     .get(EndPoints.POINTS + PointsService.MYPOINTS);
  // }




  isObject(value: any): boolean { return typeof value === 'object'; }

  profileUser(): Observable<UserDto> {
    return this.profilesrv.getProfilebyMDN(this.tokensService.getMobile());
  }

  updateUser(user: UserDto): void {
    this.profilesrv.updateProfile(user).subscribe(
      () => {
        console.log("Update user ok");
      }
    );
  }

  // login(): void {
  //   this.auth.login(this.mobile, this.password).subscribe(
  //     () => {
  //       if (this.auth.untilOperator()) {
  //         this.router.navigate(['shop']).then().finally(() => this.dialog.closeAll());
  //       } else {
  //         this.dialog.closeAll();
  //       }
  //     }
  //   );
  // }

}

