// @flow

export type Asset = {
  name: string,
  role?: string
}

export type IndividualAccount = {
  email: string,
  assets: Array<Asset>
}
