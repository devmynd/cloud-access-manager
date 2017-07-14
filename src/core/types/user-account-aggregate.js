// @flow

export type UserAccountServiceInfo = {
  id: string,
  displayName: string,
  assets: Array<string>
}

export type UserAccountAggregate = {
  email: string,
  services: Array<UserAccountServiceInfo>
}
