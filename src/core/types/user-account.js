// @flow
import type { UserIdentity, Asset } from './'

export type UserAccount = {
  identity: UserIdentity,
  assets: Array<Asset>
}
