import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Ticket} from "@core/ticket.model";
import {ShoppingState} from "../shop/cashier-opened/shopping-cart/shopping-state.model";

@Injectable({
  providedIn: 'root',
})
export class TicketArticleService {

  tickets: Ticket[] = [];

  constructor() {
    for (let i = 0; i < 5; i++) {
      this.tickets.push({
        id: this.createGuid(),
        reference: this.createGuid(),
        card: 0,
        creationDate: new Date(),
        note: "",
        shoppingList: [{
          "barcode": "1",
          "description": "Example 1",
          "retailPrice": 10 * (i + 1),
          "amount": (i + 1),
          "discount": 0,
          "total": (10 * (i + 1)) * (i + 1),
          "state": ShoppingState.IN_STOCK,
          "updateTotal": () => {
          },
          "updateDiscount": () => {
          }
        }, {
          "barcode": "2",
          "description": "Example 2",
          "retailPrice": 20 * (i + 1),
          "amount": (i + 1),
          "discount": 0,
          "total": (20 * (i + 1)) * (i + 1),
          "state": ShoppingState.IN_STOCK,
          "updateTotal": () => {
          },
          "updateDiscount": () => {
          }
        }, {
          "barcode": "3",
          "description": "Example 3",
          "retailPrice": 30 * (i + 1),
          "amount": (i + 1),
          "discount": 0,
          "total": (30 * (i + 1)) * (i + 1),
          "state": ShoppingState.IN_STOCK,
          "updateTotal": () => {
          },
          "updateDiscount": () => {
          }
        }],
        userMobile: this.randomPhone().toString(),
        voucher: 0,
        cash: (10 * (i + 1)) + (20 * (i + 1)) + (30 * (i + 1)),
      });
    }
  }

  createGuid() {
    function _p8(s = null) {
      const p = (Math.random().toString(16) + "000000000").substr(2, 8);
      return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
    }

    return _p8() + _p8(true) + _p8(true) + _p8();
  }

  randomPhone() {
    return Math.floor(Math.random() * (700000000 - 600000000 + 1) + 600000000)
  }


}
