// @flow

export type Asset = {
  name: string,
  role?: string
}

export type ServiceUserAccount = {
  email: string,
  assets: Array<Asset>
}
