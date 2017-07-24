// @flow
import type { ServiceAccessHash } from './'

export type Individual = {
  email: string,
  accessRules: ServiceAccessHash,
  groups: Array<string>
}
