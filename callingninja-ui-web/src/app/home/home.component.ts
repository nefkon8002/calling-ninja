import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {LoginDialogComponent} from '@shared/dialogs/login-dialog.component';
import {ProfileComponent} from './profile/profile.component';
import {SignUPDialogComponent} from '@shared/dialogs/signup-dialog.component';
import {AuthService} from '@core/auth.service';
import {
  Collapse,
  initTE,
} from "tw-elements";

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css'],
})
export class HomeComponent {
  title = 'Calling Ninja';
  username = undefined;

  constructor(private dialog: MatDialog, public authService: AuthService) {
  }

  login(): void {
    this.dialog.open(LoginDialogComponent)
      .afterClosed()
      .subscribe(() => this.username = this.authService.getName());
  }
  signup(): void {
    this.dialog.open(SignUPDialogComponent)
      .afterClosed()
      .subscribe(() => this.username = this.authService.getName());
  }
  profiler(): void {
    this.dialog.open(ProfileComponent).afterClosed().subscribe(() => this.dialog.closeAll());
  }


  // test1(): void {
  //   this.dialog.open(ProfileComponent).afterClosed().subscribe(() => this.username = this.authService.getName());
  // }


  logout(): void {
    this.authService.logout();
  }

  cart(): void {
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  search(value): void {
  }
  ngOnInit() {
    initTE({ Collapse });
  }

}
