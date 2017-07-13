// @flow

// todo: refactor access rule to have no properties
export type AccessRule = 'full' | Array<string>

export type ServiceAccessHash = {
  [string]: AccessRule
}
