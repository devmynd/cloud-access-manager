// @flow

export type AccessRule = { asset: string, role: string }

export type ServiceAccessHash = {
  [string]: Array<AccessRule>
}
