// @flow
import type { ServiceAccessHash } from './'

export type Individual = {
  id: String,
  fullname: string,
  email: Array<string>,
  serviceUserIds: { [string]: string }, // { "github": "shamwow16" }
  accessRules: ServiceAccessHash,
  groups: Array<string>
}
