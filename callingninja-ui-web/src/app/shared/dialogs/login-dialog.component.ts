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

import { MatSnackBar,MatSnackBarConfig } from '@angular/material/snack-bar';
import { SignUPDialogComponent } from './signup-dialog.component';

import {
  Input,
  Ripple,
  initTE,
} from "tw-elements";

import { Title } from "@angular/platform-browser";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { MatPasswordStrengthComponent } from "@angular-material-extensions/password-strength";


import { AbstractControl, FormBuilder, FormGroup, FormControl, Validators  } from '@angular/forms';
import Validation from './utils/validation';


@Component({
  templateUrl: 'login-dialog.component.html',
  styleUrls: ['./dialog.component.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginDialogComponent implements OnInit{

  //User:User;
  // mobile: number;
  mobile: string;
  password: string;
  inputType: string;
  formControl:string;
  //onStrengthChanged:string;
  input:string;
  passwordComponent:{color:string};

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
  // mobile: number;
  // password: string;
  email: string;

  @ViewChild('passwordComponent2', {static: true})
  passwordComponent2: MatPasswordStrengthComponent;
  constructor(private formBuilder: FormBuilder,private auth: AuthService, private router: Router, private dialog: MatDialog,private snackBar: MatSnackBar) {
  }


  onStrengthChanged(strength: number) {
    console.log('password login strength = ', strength);
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

  signup(): void {
    // console.log("MOBILE " +this.mobile + " PASSWORD " + this.password );

       this.dialog.open(SignUPDialogComponent)
         .afterClosed()
         .subscribe(

           //() => this.mobile = this.authService.getName()

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
      email: ['', [ Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
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
          this.login();
          //this.signup();
        }


        console.log(JSON.stringify(this.form.value, null, 2));
      }

      onReset(): void {
        this.submitted = false;
        this.form.reset();
      }





}
