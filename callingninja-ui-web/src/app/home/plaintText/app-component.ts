import { Component, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { FormControl } from '@angular/forms';
import { AlertComponent } from './plaint-component';

@Component({
  template: `
    <textarea [formControl]="control"></textarea>
    <div [innerHTML]="control.value"></div>
  `
})
export class AppComponent {
  control = new FormControl('<app-alert>This is neat</app-alert>');

  constructor(private injector: Injector) {}

  ngOnInit() {
    const element = createCustomElement(AlertComponent, { injector: this.injector });
    customElements.define('app-alert', element);
  }
}