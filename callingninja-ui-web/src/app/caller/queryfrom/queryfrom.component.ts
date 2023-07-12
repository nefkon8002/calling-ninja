import { Component, OnInit } from '@angular/core';
import { QueryfromService } from './queryfrom.service';

@Component({
  selector: 'app-queryfrom',
  templateUrl: './queryfrom.component.html',
  styleUrls: ['./queryfrom.component.css']
})
export class QueryfromComponent implements OnInit {
  fromNumbers: string[] = [];
  //fromNumbers: string;
  availableFromNumbers: string;
  numbersLoaded: boolean = false;
  selectedNumber: string = '';
  isFetching: boolean = false;

  constructor(private queryfromservice: QueryfromService) { }

  ngOnInit(): void {
    const availableNumbers = JSON.parse(sessionStorage.getItem('available_from_numbers'));
    const selectedNumber = sessionStorage.getItem('selected_number');

    if (availableNumbers && availableNumbers.length > 0) {
      this.availableFromNumbers = availableNumbers;
      this.numbersLoaded = true;
    }

    if (selectedNumber) {
      this.selectedNumber = selectedNumber;
    }
  }



  queryFromNumbers() {
    this.queryfromservice.queryFromNumbers()
      .subscribe(response => {
        this.isFetching = true;
        this.availableFromNumbers = response.from_numbers;
        sessionStorage.setItem('available_from_numbers', JSON.stringify(this.availableFromNumbers));
        console.log('Response from querying numbers:', this.availableFromNumbers);
        this.numbersLoaded = true;
        setTimeout(() => {
          this.isFetching = false; // Hide the spinner after a slight delay
        }, 100);
      });
  }


  selectNumber(number: string) {
    this.selectedNumber = number;
    sessionStorage.setItem('selected_number', number);
    console.log('Selected number:', number);
  }

}
