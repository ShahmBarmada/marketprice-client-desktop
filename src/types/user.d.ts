declare interface IUser {
  id: number
  label: string
  activated: boolean
  favs: number[]
  role?: IRole
  roleFK: number
  createdAt: string
  deletedAt?: string
}
