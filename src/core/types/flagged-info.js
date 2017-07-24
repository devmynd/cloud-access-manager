// @flow
import type { AssetAssignment } from './'

export type FlaggedInfo = {
  email: string,
  isNewIndividual: boolean,
  groups: Array<string>,
  assetAssignments: Array<AssetAssignment>
}
