declare interface IStock {
  product: string
  branch: string
  warehouse: string
  sum: string
}

declare interface IMove {
  id: number
  date: string
  branch: string
  warehouse: string
  qty: string
  price: string
  note: string
  type: string
}
