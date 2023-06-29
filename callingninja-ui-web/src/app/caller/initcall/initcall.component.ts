import { Component, OnInit, Inject } from '@angular/core';
import { HttpService } from '@core/http.service';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth.service';
import { Observable, from } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { InitcallService } from './initcall.service';
import { HomeComponent } from 'app/home/home.component';

// import {User} from '@core/user.model';
//import { UserDto } from './caller.model';
import { User } from '@core/user.model';


@Component({
    selector: 'app-initcall',
    templateUrl: './initcall.component.html',
    styleUrls: ['./initcall.component.css']
})

export class InitcallComponent {
    completenessCheck = false;
    missingData = [];
    homeComponent: HomeComponent;

    constructor(private initcallservice: InitcallService, homeComponent: HomeComponent) {
        this.homeComponent = homeComponent;
    }


    ngOnInit(): void {
        let from_number = sessionStorage.getItem('selectedNumber');
        let to_numbers = sessionStorage.getItem('to_numbers');
        let audio_url = JSON.parse(sessionStorage.getItem("audio_file")).file_url;
        if (from_number && to_numbers && audio_url) {
            this.completenessCheck = true;
        }
        else {
            if (!from_number) {
                this.missingData.push("From Number");
            }
            if (!to_numbers) {
                this.missingData.push("To Number(s)");
            }
            if (!audio_url) {
                this.missingData.push("Audio File/URL");
            }
            console.log(`There is data missing ${this.missingData}`)
        }
    }


    sendCall() {

        let from_number = sessionStorage.getItem('selected_number');
        let to_numbers = JSON.parse(sessionStorage.getItem('to_numbers'));
        let audio_url = JSON.parse(sessionStorage.getItem("audio_file")).file_url;
        console.log(from_number);
        console.log(to_numbers);
        console.log(audio_url);
        for (let to of to_numbers) {
            this.initcallservice.postCallManual(from_number, to, audio_url = audio_url).subscribe(response => {
                console.log(`Response from the call endpoint: ${response}`)
            });
        }
    }

}