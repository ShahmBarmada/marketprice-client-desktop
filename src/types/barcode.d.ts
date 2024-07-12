declare interface IBarcode {
  id: number;
  value: string;
  product: IProduct;
  productFK: number;
}