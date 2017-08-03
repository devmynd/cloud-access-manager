// @flow
import type { ServiceAccessHash, Identity } from './'

export type Individual = {
  id: String,
  fullname: string,
  email: Array<string>,
  serviceIdentities: { [string]: Identity }, // { "github": "shamwow16" }
  accessRules: ServiceAccessHash,
  groups: Array<string>
}
