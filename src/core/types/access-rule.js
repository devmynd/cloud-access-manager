// @flow

export type AccessRule = string// { asset: string, role: string }

export type ServiceAccessHash = {
  [string]: Array<AccessRule>
}
