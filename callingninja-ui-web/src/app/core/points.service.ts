import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {Points} from "./points.model";
import {EndPoints} from "@shared/end-points";
import {HttpService} from "@core/http.service";

@Injectable({
  providedIn: 'root'
})
export class PointsService {

  private static MYPOINTS = '/my-points/';
  private static APPLICABLE = '/applicable';

  public static readonly POINTS_BARCODE : string = '2';
  public static readonly POINTS_DESCRIPTION : string = 'Puntos';
  public static readonly POINTS_RETAIL_PRICE : number = -0.01;

  constructor(private httpService: HttpService) { }

  getMyPoints() : Observable<Points>{
    return this.httpService
      .get(EndPoints.POINTS + PointsService.MYPOINTS);
  }

  getPointsFromMobile(mobile: number, totalPurchase: number) : Observable<Points>{
    return this.httpService
      .param('totalPurchase', totalPurchase.toString())
      .get(EndPoints.POINTS + '/' + mobile + PointsService.APPLICABLE);
  }

  updatePointsFromMobileReturnTotal(mobile: number, usedPointsInEuros: number = 0, totalPurchase: number) : Observable<Points>{
    return this.httpService
      .patch(EndPoints.POINTS + '/' + mobile,  {usedPoints: PointsService.eurosToPoints(usedPointsInEuros), totalPurchase: totalPurchase})
  }

  static pointsToEuros(value: number) : number {
    return -value * PointsService.POINTS_RETAIL_PRICE;
  }

  static eurosToPoints(value: number) : number {
    return -value / PointsService.POINTS_RETAIL_PRICE;
  }
}
