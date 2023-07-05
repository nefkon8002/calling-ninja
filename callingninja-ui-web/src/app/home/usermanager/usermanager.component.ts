import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '@core/http.service';
import { UsermanagerService } from './usermanager.service';
import { ProfileService } from '../profile/profile.service';
import { UserDto } from '../profile/profile.model';
import { Role } from '@core/role.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-usermanager',
  templateUrl: './usermanager.component.html',
  styleUrls: ['./usermanager.component.css']
})
export class UsermanagerComponent implements OnInit {
  displayedColumns: string[] = ['id', 'mobile', 'firstName', 'lastName', 'email', 'registrationDate', 'role', 'active'];
  pageSizes = [5, 10, 100];

  constructor(
    private usermanagerService: UsermanagerService,
    private httpService: HttpService,
    private profileService: ProfileService
  ) { }

  usersList: UserDto[];
  roles: string[];
  dataSource: MatTableDataSource<UserDto>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
    }
  }

  ngOnInit(): void {
    this.roles = Object.values(Role);
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.usermanagerService.fetchAllUsers().subscribe((users: UserDto[]) => {
      this.usersList = users;
      this.dataSource = new MatTableDataSource(users);
      this.dataSource.paginator = this.paginator;
    });
  }

  updateUser(user: UserDto): void {
    console.log(user);
    this.profileService.updateProfile(user).subscribe(() => {
      console.log('User updated successfully.');
    });
  }
}
