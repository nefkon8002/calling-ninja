import {Component} from '@angular/core';
import { Carousel,initTE } from 'tw-elements';

@Component({
  templateUrl: 'adviser.component.html',
  styleUrls: ['adviser.component.css'],
})
export class AdviserComponent {
  ngOnInit() {
    initTE({ Carousel });
  }
  
}
