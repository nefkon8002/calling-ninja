import {Component} from '@angular/core';
import {Router} from '@angular/router';

import {AuthService} from '@core/auth.service';
import {MatDialog} from '@angular/material/dialog';
import {LoginDialogComponent} from '@shared/dialogs/login-dialog.component';
import {environment} from '@env';

import { MatSnackBar,MatSnackBarConfig } from '@angular/material/snack-bar';

import {
  Input,
  Ripple,
  initTE,
} from "tw-elements";

@Component({
  templateUrl: 'signup-dialog.component.html',
})
export class SignUPDialogComponent {

  //User:User;
  // mobile: number;
  mobile: string;
  password: string;
  inputType: string;
  formControl:string;
  //onStrengthChanged:string;
  //
  passwordComponent:{color:string};

  constructor(private auth: AuthService,private auth2: AuthService, private router: Router, private dialog: MatDialog,private snackBar: MatSnackBar) {
  }

  token:string = '';
  signup(): void {
    console.log("MOBILE " +this.mobile );

    this.auth.adminlogin(environment.USER_A,environment.USER_P,this.mobile,this.password)
    // .subscribe(
    //   () => {
    //     console.log("ADMINISTRATOR AUTHENTICATED ")
    //     if (this.auth.untilOperator()) {
    //       console.log("ADMINISTRATOR AUTHENTICATED CREATING NEW USER ")
    //       this.token = this.auth.getToken();
    //       this.auth2.signup(this.mobile,this.password,this.token);
    //      // this.router.navigate(['shop']).then().finally(() => this.dialog.closeAll());


    //     } else {
    //       this.dialog.closeAll();
    //     }
    //   });


  }

  login(): void {
    //console.log("MOBILE " +this.mobile + " PASSWORD " + this.password );
    this.dialog.open(LoginDialogComponent)
    .afterClosed()
    .subscribe(
      () => {}
      );


  }
  // console.log("MOBILE " +this.mobile + " PASSWORD " + this.password );
  // this.auth.login(this.mobile, this.password).subscribe(
  //   () => {
  //     if (this.auth.untilOperator()) {
  //       this.router.navigate(['shop']).then().finally(() => this.dialog.closeAll());
  //     } else {
  //       this.dialog.closeAll();
  //     }
  //   }
  // );


ngOnInit() {
  initTE({ Input, Ripple });
}

}
