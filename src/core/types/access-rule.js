// @flow

// todo: refactor access rule to have no properties
export type AccessRule = Array<string>

export type ServiceAccessHash = {
  [string]: AccessRule
}
