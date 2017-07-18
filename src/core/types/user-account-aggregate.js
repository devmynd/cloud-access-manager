// @flow
import type { Asset } from './'

export type UserAccountServiceInfo = {
  id: string,
  displayName: string,
  hasRoles: boolean,
  assets: Array<Asset>
}

export type UserAccountAggregate = {
  email: string,
  isNewUser?: boolean,
  services: Array<UserAccountServiceInfo>
}
