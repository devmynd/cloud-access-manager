// @flow
import type { Asset } from './'

export type ServiceInfo = {
  id: string,
  displayName: string,
  hasRoles: boolean
}

export type AssetAssignment = {
  service: ServiceInfo,
  assets: Array<Asset>
}

export type UserAccountAggregate = {
  email: string,
  isNewUser?: boolean,
  assetAssignments: Array<AssetAssignment>
}
