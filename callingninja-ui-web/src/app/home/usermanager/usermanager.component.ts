import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '@core/http.service';
import { UsermanagerService } from './usermanager.service';
import { ProfileService } from '../profile/profile.service';
import { UserDto } from '../profile/profile.model';
import { Role } from '@core/role.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-usermanager',
  templateUrl: './usermanager.component.html',
  styleUrls: ['./usermanager.component.css']
})
export class UsermanagerComponent implements OnInit {
  displayedColumns: string[] = ['id', 'mobile', 'firstName', 'lastName', 'email', 'registrationDate', 'role', 'active', 'twilio_sid'];
  pageSizes = [5, 10, 100];
  usersList: UserDto[];
  roles: string[];
  dataSource: MatTableDataSource<UserDto>;
  editMode: boolean = false;

  constructor(
    private usermanagerService: UsermanagerService,
    private httpService: HttpService,
    private profileService: ProfileService,
    private _liveAnnouncer: LiveAnnouncer
  ) {
    this.dataSource = new MatTableDataSource(this.usersList);
  }



  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase(); //trim whitespace and filter based on lowercase input
  }

  ngOnInit(): void {
    this.roles = Object.values(Role);
    this.fetchUsers();
  }

  // used for the filtering in the table


  fetchUsers(): void {
    this.usermanagerService.fetchAllUsers().subscribe((users: UserDto[]) => {
      this.usersList = users;
      this.dataSource = new MatTableDataSource(users);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  updateUser(user: UserDto): void {
    console.log(user);
    this.profileService.updateProfile(user).subscribe(() => {
      console.log('User updated successfully.');
    });
    this.editMode = false;
  }

  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  toggleEditMode(user: any) {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.updateUser(user);
    }
  }
}
