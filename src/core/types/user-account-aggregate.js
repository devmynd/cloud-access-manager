// @flow
import type { Asset, ServiceInfo } from './'

export type AssetAssignment = {
  service: ServiceInfo,
  assets: Array<Asset>
}

export type UserAccountAggregate = {
  email: string,
  assetAssignments: Array<AssetAssignment>
}

export type FlaggedUserAccount = {
  email: string,
  isNewUser: boolean,
  groups: Array<string>,
  assetAssignments: Array<AssetAssignment>
}
