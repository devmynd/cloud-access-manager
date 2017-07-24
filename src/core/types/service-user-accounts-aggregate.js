// @flow
import type { Asset, ServiceInfo } from './'

export type AssetAssignment = {
  service: ServiceInfo,
  assets: Array<Asset>
}

export type ServiceUserAccountsAggregate = {
  email: string,
  assetAssignments: Array<AssetAssignment>
}
