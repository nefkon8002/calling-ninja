import {Component} from '@angular/core';
import {Router} from '@angular/router';

import {AuthService} from '@core/auth.service';
import {MatDialog} from '@angular/material/dialog';

import { MatSnackBar,MatSnackBarConfig } from '@angular/material/snack-bar';
//import {User} from '../../core/user.model'
import {
  Input,
  Ripple,
  initTE,
} from "tw-elements";


@Component({
  templateUrl: 'login-dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class LoginDialogComponent {

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

  login(): void {
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

  openSnackBar(message: string,
    duration: number = 5000,
    appearance: 'fill' | 'outline' | 'soft' = 'fill',
    type: 'info' | 'success' | 'error' = 'info'): void {

      const config: MatSnackBarConfig = {
      duration: duration,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: [`alert-type-${appearance}-${type}`]
      };
      this.snackBar.open(message, '', config);
      }

      onStrengthChanged():void{}

      ngOnInit() {
        initTE({ Input, Ripple });
      }






}
