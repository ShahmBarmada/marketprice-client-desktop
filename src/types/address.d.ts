declare interface IAddress {
  id: number
  district?: string
  street?: string
  building: string
  floor: string
  apartment: string
  area?: IArea
  areaFK: number
  partner?: IPartner
  partnerFK: number
  createdAt: string
  deletedAt?: string
}
