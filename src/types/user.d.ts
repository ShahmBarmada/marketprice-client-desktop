declare interface IUser {
  id: number;
  label: string;
  activated: boolean;
  role?: IRole;
  roleFK: number;
  createdAt: string;
  deletedAt?: string;
}