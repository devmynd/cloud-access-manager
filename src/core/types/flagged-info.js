// @flow
import type { Individual, UserIdentity, Asset } from './'

export type FlaggedInfo = {
  individualId: ?string,
  serviceId: string,
  userIdentity: UserIdentity,
  assets: Array<Asset>
}
