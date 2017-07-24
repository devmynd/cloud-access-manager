// @flow
import type { Asset, ServiceInfo } from './'

export type AssetAssignment = {
  service: ServiceInfo,
  assets: Array<Asset>
}

export type IndividualAccountAggregate = {
  email: string,
  assetAssignments: Array<AssetAssignment>
}

export type FlaggedIndividualAccountInfo = {
  email: string,
  isNewIndividual: boolean,
  groups: Array<string>,
  assetAssignments: Array<AssetAssignment>
}
