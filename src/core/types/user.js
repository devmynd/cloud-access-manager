// @flow
import type { ServiceAccessHash } from './'

export type User = {
  email: string,
  accessRules: ServiceAccessHash,
  groups: Array<string>
}
