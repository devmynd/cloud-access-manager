// @flow

export type Asset = {
  name: string,
  role?: string
}

export type UserIdentity = {
  email?: string,
  userId?: string,
  fullname?: string,
}

export type UserAccount = {
  identity: UserIdentity,
  assets: Array<Asset>
}

export type ServiceUserAccount = {
  serviceId: string,
  userAccount: UserAccount
}
