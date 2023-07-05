import { Component, OnInit } from '@angular/core';
import { UsermanagerService } from './usermanager.service';

@Component({
  selector: 'app-usermanager',
  templateUrl: './usermanager.component.html',
  styleUrls: ['./usermanager.component.css']
})
export class UsermanagerComponent implements OnInit {

  constructor(private usermanagerService: UsermanagerService) { }
  usersList: any[] = [];

  ngOnInit(): void {
    this.usermanagerService.fetchAllUsers().subscribe((users: any[]) => {
      this.usersList = users;
    });
  }



}
