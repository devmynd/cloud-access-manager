// @flow

export type Asset = {
  name: string,
  role?: string
}

export type UserAccount = {
  email: string,
  assets: Array<Asset>
}
