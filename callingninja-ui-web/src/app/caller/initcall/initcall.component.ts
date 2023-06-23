import { Component, OnInit, Inject } from '@angular/core';
import { InitcallService } from './initcall.service';
import { HttpService } from '@core/http.service';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth.service';
import { Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

// import {User} from '@core/user.model';
//import { UserDto } from './caller.model';
import { User } from '@core/user.model';


@Component({
    selector: 'app-initcall',
    templateUrl: './initcall.component.html',
    styleUrls: ['./initcall.component.css']
})

export class InitcallComponent {

}