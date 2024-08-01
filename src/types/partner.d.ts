declare interface IPartner {
  id: number
  label: string
  phones: string[]
  email?: string
  activated: string
  type: string
  branch?: IBranch
  branchFK: number
  addresses: IAddress[]
  createdAt: string
  updatedAt?: string
  deletedAt?: string
}
