import {Component} from '@angular/core';
import {Router} from '@angular/router';

import {AuthService} from '@core/auth.service';
import {MatDialog} from '@angular/material/dialog';
import {LoginDialogComponent} from '@shared/dialogs/login-dialog.component';

import { MatSnackBar,MatSnackBarConfig } from '@angular/material/snack-bar';
//import {User} from '../../core/user.model'

import {
  Input,
  Ripple,
  initTE,
} from "tw-elements";

// initTE({ Input, Ripple });


@Component({
  templateUrl: 'signup-dialog.component.html',
  //styleUrls: ['./dialog.component.css']
})
export class SignUPDialogComponent {

  //User:User;
  // mobile: number;
  mobile: string;
  password: string;
  inputType: string;
  formControl:string;
  //onStrengthChanged:string;
  input:string;
  passwordComponent:{color:string};

  constructor(private auth: AuthService, private router: Router, private dialog: MatDialog,private snackBar: MatSnackBar) {
  }

  signup(): void {
    console.log("MOBILE " +this.mobile + " PASSWORD " + this.password );
    this.auth.login(this.mobile, this.password).subscribe(
      () => {
        if (this.auth.untilOperator()) {
          this.router.navigate(['shop']).then().finally(() => this.dialog.closeAll());
        } else {
          this.dialog.closeAll();
        }
      }
    );
  }

  login(): void {
    //console.log("MOBILE " +this.mobile + " PASSWORD " + this.password );
    this.dialog.open(LoginDialogComponent)
    .afterClosed()
    .subscribe(
      () => {}
      );

    //this.dialog.closeAll();

  }



ngOnInit() {
  initTE({ Input, Ripple });
}

}
