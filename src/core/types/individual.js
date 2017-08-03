// @flow
import type { ServiceAccessHash, UserIdentity } from './'

export type Individual = {
  id: String,
  fullname: string,
  primaryEmail: ?string,
  serviceUserIdentities: { [string]: UserIdentity },
  accessRules: ServiceAccessHash,
  groups: Array<string>
}
