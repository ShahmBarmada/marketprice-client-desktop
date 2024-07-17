declare interface IUser {
  id: number
  label: string
  activated: boolean
  favs: string[]
  role?: IRole
  roleFK: number
  createdAt: string
  deletedAt?: string
}
