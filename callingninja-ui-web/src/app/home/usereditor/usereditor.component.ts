import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core/auth.service';
import { UsereditorService } from './usereditor.service';
import { Observable } from 'rxjs';
import { UserDto } from './usereditor.models';
import { HttpService } from '@core/http.service';

@Component({
  selector: 'app-usereditor',
  templateUrl: './usereditor.component.html',
  styleUrls: ['./usereditor.component.css']
})
export class UsereditorComponent implements OnInit {

  //mobile: number;
  userprofile: UserDto;
  profile: UserDto;
  usereditorservice: UsereditorService;
  title = 'Profile';
  load: boolean = false;
  company: string = "";
  twilio_sid: string = "";
  twilio_auth: string = "";
  //password: string;

  balance: string;

  public authorizer: AuthService;

  constructor(private tokensService: AuthService, private httpService: HttpService) {
    this.usereditorservice = new UsereditorService(httpService);
    this.authorizer = tokensService;
  }

  ngOnInit(): void {
    this.profileUser(this.userprofile)
      .subscribe(userprofile => {
        console.log("PROFILE USER -> " + JSON.stringify(userprofile))
        this.profile = userprofile;
        this.balance = userprofile.balance;
        this.company = userprofile.company;
        this.twilio_sid = userprofile.twilio_sid;
        this.twilio_auth = userprofile.twilio_auth;
        this.load = true;
      });
  }

  profileUser(userprofile): Observable<UserDto> {
    return this.usereditorservice.getProfilebyMDN(userprofile.mobile);
  }

  updateUser(user: UserDto): void {
    this.usereditorservice.updateProfile(user).subscribe(
      () => {
        console.log("Update user ok");
      }
    );
  }

}
