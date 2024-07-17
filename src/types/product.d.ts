declare interface IProduct {
  id: number
  label: string
  price: number
  active: boolean
  image?: number
  category?: ICategory
  categoryFK?: number
  unit?: IUnit
  unitFK?: number
  barcodes?: IBarcode[]
  createdAt: string
  deletedAt?: string
}
