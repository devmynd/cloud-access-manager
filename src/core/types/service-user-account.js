// @flow

export type Asset = {
  name: string,
  role?: string
}

export type UserAccount = {
  email?: string,
  userId?: string,
  fullname?: string,
  assets: Array<Asset>
}

export type ServiceUserAccount = {
  serviceId: string,
  userAccount: UserAccount
}
