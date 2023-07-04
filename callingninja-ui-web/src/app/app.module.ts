import {NgModule} from '@angular/core';
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {CoreModule} from '@core/core.module';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';
import { MatPasswordStrengthModule } from "@angular-material-extensions/password-strength";


@NgModule({
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    PasswordStrengthMeterModule.forRoot(),
    MatPasswordStrengthModule.forRoot(),
    // HomeModule // eager load //carga temprana
    // ShopModule // eager load
  ],
  declarations: [
    AppComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
