// @flow

export type Asset = {
  name: string,
  role?: string
}

export type ServiceUserAccount = {
  email?: string,
  userId?: string,
  fullname?: string,
  assets: Array<Asset>
}
