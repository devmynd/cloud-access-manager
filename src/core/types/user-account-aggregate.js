// @flow
import type { Asset, ServiceInfo } from './'

export type AssetAssignment = {
  service: ServiceInfo,
  assets: Array<Asset>
}

export type UserAccountAggregate = {
  email: string,
  isNewUser?: boolean,
  assetAssignments: Array<AssetAssignment>
}
