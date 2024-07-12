declare interface IItem {
  order?: IOrder;
  orderFK: number;
  line: number;
  product?: IProduct;
  productFK: number;
  note?: string;
  qty: number;
  price: number;
}