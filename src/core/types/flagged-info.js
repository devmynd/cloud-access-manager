// @flow
import type { Individual, UserIdentity, Asset } from './'

export type FlaggedInfo = {
  individual: ?Individual,
  serviceId: string,
  userIdentity: UserIdentity,
  assets: Array<Asset>
}
