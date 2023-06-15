import { Component, OnInit } from '@angular/core';
import {AuthService} from "@core/auth.service";
import {PointsService} from "@core/points.service";

@Component({
  selector: 'app-points',
  templateUrl: './points.component.html',
  styleUrls: ['./points.component.css']
})
export class PointsComponent implements OnInit {

  userPoints: number;
  userPointsLastDate : Date;

  constructor(private pointsService: PointsService, public auth: AuthService) { }

  ngOnInit(): void {
    this.pointsService.getMyPoints()
      .subscribe( points => {
        this.userPoints = points.value;
        this.userPointsLastDate = points.lastDate || null;
      });
  }

}
