import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
} from "@angular/core";


import {Router} from '@angular/router';

import {AuthService} from '@core/auth.service';
import {MatDialog} from '@angular/material/dialog';
import {LoginDialogComponent} from '@shared/dialogs/login-dialog.component';
import {environment} from '@env';

import { Title } from "@angular/platform-browser";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { MatPasswordStrengthComponent } from "@angular-material-extensions/password-strength";
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarModule,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

import { AbstractControl, FormBuilder, FormGroup, FormControl, Validators  } from '@angular/forms';
import Validation from './utils/validation';



import {
  Input,
  Ripple,
  initTE,
} from "tw-elements";

@Component({
  templateUrl: 'signup-dialog.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class SignUPDialogComponent implements OnInit {

  // @ViewChild('password2', {static: true})
  // password2: MatPasswordStrengthComponent;

  //User:User;
  // mobile: number;
  //formGroup : FormGroup
  // form: FormGroup = new FormGroup({
  //   mobile: new FormControl(''),
  //   username: new FormControl(''),
  //   email: new FormControl(''),
  //   password: new FormControl(''),
  //   confirmPassword: new FormControl(''),
  //   acceptTerms: new FormControl(false),
  // });

  form: FormGroup = new FormGroup({
    // mobile: new FormControl(''),
    mobile:  new FormControl('', [
      Validators.required,
      Validators.pattern("^[0-9]*$"),
      Validators.minLength(10),
      Validators.maxLength(10),
    ]),

    password: new FormControl(''),
    email: new FormControl(''),
  });


  submitted = false;

  // mobile: string;string
  mobile: number;
  password: string;
  email: string;
  inputType: string;
  formControl:string;
  passwordFormControl:string;
  //onStrengthChanged:string;
  //
  // password2;
  showDetails: boolean;
  showResponse:boolean;
  color = '';

  //passwordComponent2:{color:string};

  @ViewChild('passwordComponent2', {static: true})
  passwordComponent2: MatPasswordStrengthComponent;


  // formGroup: FormGroup = new FormGroup({
  //   mobile: new FormControl(''),
  //   username: new FormControl(''),
  //   email: new FormControl(''),
  //   password: new FormControl(''),
  //   confirmPassword: new FormControl(''),
  //   acceptTerms: new FormControl(false),
  // });

  // value="start">Start</mat-option>
  //   <mat-option value="center">Center</mat-option>
  //   <mat-option value="end">End</mat-option>
  //   <mat-option value="left">Left</mat-option>
  //   <mat-option value="right">Right</mat-option>

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';



  constructor(private formBuilder: FormBuilder,private auth: AuthService,private auth2: AuthService, private router: Router, private dialog: MatDialog,private snackBar: MatSnackBar) {
  }

  token:string = '';

  signup(): void {
    console.log("MOBILE " +this.mobile  + "P2 ++++++> " + this.password);

    try {
      this.auth.adminlogin(environment.USER_A,environment.USER_P,this.mobile,this.password,this.email)
      this.showResponse=true;
      //this.openSnackBar();
    } catch (error) {
      console.log("++++++===========================================================");
      console.log(error);
      this.openSnackBarError(error.message);
      // this.openSnackBar();

    }

  }

  onStrengthChanged(strength: number) {
    console.log('password strength = ', strength);
  }

  login(): void {
    //console.log("MOBILE " +this.mobile + " PASSWORD " + this.password );
    this.dialog.open(LoginDialogComponent,{id:"loginDialog"});
    // .afterClosed()
    // .subscribe(
    //   () => {}
    //   );


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
  console.log('home on init');

  this.form = this.formBuilder.group(
    {
      //mobile: ['', Validators.required],
      mobile: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10)
        ]
      ],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(40)
        ]
      ],
      //confirmPassword: ['', Validators.required],
      //acceptTerms: [false, Validators.requiredTrue]
    },
    {
      //validators: [Validation.match('password', 'confirmPassword')]
    }
  );

 }

 get f(): { [key: string]: AbstractControl } {
  return this.form.controls;
}

onSubmit(): void {

  this.submitted = true;

  if (this.form.invalid) {
    console.log(" --------------------------------------------------------------------- INVALID FORM " + this.form.value.email);
    return;
  }else {
    console.log(" --------------------------------------------------------------------- FORM OK " + this.form.value.password);
    console.log(" --------------------------------------------------------------------- FORM OK " + this.form.value.mobile);
    console.log(" --------------------------------------------------------------------- FORM OK " + this.form.value.email);
    this.mobile = this.form.value.mobile;
    this.password = this.form.value.password;
    this.email = this.form.value.email;
    this.signup();
  }


  console.log(JSON.stringify(this.form.value, null, 2));
}

onReset(): void {
  this.submitted = false;
  this.form.reset();
}



openSnackBar() {
  this.snackBar.open(
    'The registration of your account with the following mobile number ' + this.mobile + ' and email  '+this.email + ' was successful', 'Close', {
    horizontalPosition: this.horizontalPosition,
    verticalPosition: this.verticalPosition,
  });
}

openSnackBarError(error : any) {
  this.snackBar.open(
    'Account registration failed due to: '  + error + ' ', 'Close', {
    horizontalPosition: this.horizontalPosition,
    verticalPosition: this.verticalPosition,
  });
}





}
