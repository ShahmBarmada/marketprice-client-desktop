declare interface IWarehouse {
  id: number
  label: string
  branch?: IBranch
  branchFK: number
  createdAt: string
  deletedAt?: string
}
