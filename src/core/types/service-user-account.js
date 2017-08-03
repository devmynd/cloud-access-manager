// @flow

export type Asset = {
  name: string,
  role?: string
}

export type Identity = {
  email?: string,
  userId?: string,
  fullname?: string,
}

export type UserAccount = {
  identity: Identity,
  assets: Array<Asset>
}

export type ServiceUserAccount = {
  serviceId: string,
  userAccount: UserAccount
}
