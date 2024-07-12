declare interface IOrder {
  id: number;
  readonly counter: number;
  due?: string;
  finished?: string;
  notes?: string;
  vouchers?: string[];
  type?: IType;
  typeFK: number;
  state?: IState;
  stateFK: number;
  partner?: IPartner;
  partnerFK?: number;
  sales?: IUser;
  salesFK: number;
  delivery?: IUser;
  deliveryFK?: number;
  warehouse?: IWarehouse;
  warehouseFK: number;
  branch?: IBranch;
  branchFK: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}