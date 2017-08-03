// @flow
import type { ServiceAccessHash, Identity } from './'

export type Individual = {
  id: String,
  fullname: string,
  primaryEmail: ?string,
  serviceIdentities: { [string]: Identity },
  accessRules: ServiceAccessHash,
  groups: Array<string>
}
