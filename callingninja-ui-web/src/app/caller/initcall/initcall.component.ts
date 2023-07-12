import { Component, OnInit, Inject } from '@angular/core';
import { HttpService } from '@core/http.service';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth.service';
import { Observable, from } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { InitcallService } from './initcall.service';
import { HomeComponent } from 'app/home/home.component';
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
    total_to_count = 0;
    current_to_count = 0;
    private intervalId: any;
    response: any;


    constructor(private initcallservice: InitcallService, homeComponent: HomeComponent) {
        this.homeComponent = homeComponent;
    }


    ngOnInit(): void {
        this.startChecking();
        /*
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
        */
    }

    ngOnDestroy(): void {
        this.stopChecking();
        sessionStorage.removeItem('selected_number');
        sessionStorage.removeItem('to_numbers');
        sessionStorage.removeItem("audio_file");
        sessionStorage.removeItem("new_audio_file");
        sessionStorage.removeItem('audio_url');
        sessionStorage.removeItem('available_from_numbers');
    }


    sendCall() {
        let from_number = sessionStorage.getItem('selected_number');
        let to_numbers = JSON.parse(sessionStorage.getItem('to_numbers'));
        let audio_url = JSON.parse(sessionStorage.getItem("audio_file")).file_url;
        this.total_to_count = JSON.parse(sessionStorage.getItem('to_numbers')).length;
        console.log(from_number);
        console.log(to_numbers);
        console.log(audio_url);
        for (let to of to_numbers) {
            this.initcallservice.postCallManual(from_number, to, audio_url).subscribe(response => {
                //console.log('Response from the call endpoint:', response)
                this.response = response;
                this.current_to_count++
            });
            sessionStorage.clear()
        }
    }

    private startChecking(): void {
        // Set an interval to check for values every second (1000ms)
        this.intervalId = setInterval(() => {
            this.checkValues();
        }, 1000);
    }

    private stopChecking(): void {
        // Clear the interval when the component is destroyed
        clearInterval(this.intervalId);
    }

    private checkValues(): void {
        this.missingData = [];
        // Check for the presence of values in sessionStorage
        const from_number = sessionStorage.getItem('selected_number');
        const to_numbers = sessionStorage.getItem('to_numbers');
        const audio_url = JSON.parse(sessionStorage.getItem("audio_file"))?.file_url;

        if (from_number && to_numbers && audio_url) {
            this.completenessCheck = true;
        }
        else {
            this.completenessCheck = false;
        }
    }
}



