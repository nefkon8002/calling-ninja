import {Shopping} from "../shop/cashier-opened/shopping-cart/shopping.model";

export interface Ticket {

  id: string;
  reference: string;
  shoppingList: Shopping[];
  creationDate: Date;
  cash: number;
  card: number;
  voucher: number;
  note: string;
  userMobile: string;

}
