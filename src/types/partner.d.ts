declare interface IPartner {
  id: number
  readonly counter: number
  label: string
  phones: string[]
  email?: string
  activated: string
  type: string
  branch?: IBranch
  branchFK: number
  createdAt: string
  updatedAt?: string
  deletedAt?: string
}
