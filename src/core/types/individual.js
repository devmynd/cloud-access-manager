// @flow
import type { ServiceAccessHash, UserIdentity } from './'

export type Individual = {
  id: string,
  fullName: string,
  primaryEmail: ?string,
  serviceUserIdentities: { [string]: UserIdentity },
  accessRules: ServiceAccessHash,
  groups: Array<string>
}
