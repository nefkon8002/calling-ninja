import { Component, OnInit } from '@angular/core';
import { HttpService } from '@core/http.service';
import { UsermanagerService } from './usermanager.service';
import { ProfileService } from '../profile/profile.service';
import { UserDto } from '../profile/profile.model';
import { Role } from '@core/role.model';

@Component({
  selector: 'app-usermanager',
  templateUrl: './usermanager.component.html',
  styleUrls: ['./usermanager.component.css']
})
export class UsermanagerComponent implements OnInit {


  constructor(private usermanagerService: UsermanagerService,
    private httpService: HttpService,
    private profileService: ProfileService) { }
  usersList: any[] = [];
  roles: string[];

  ngOnInit(): void {
    this.roles = Object.values(Role);
    this.usermanagerService.fetchAllUsers().subscribe((users: any[]) => {
      this.usersList = users;
    });
  }

  fetchUsers(): void {
    this.usermanagerService.fetchAllUsers().subscribe((users: any[]) => {
    });
  }
  updateUser(user: UserDto): void {
    console.log(user);
    this.profileService.updateProfile(user).subscribe(() => {
      console.log('User updated successfully.');
    });
  }


}
