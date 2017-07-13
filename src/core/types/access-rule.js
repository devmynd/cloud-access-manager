// @flow

// todo: refactor access rule to have no properties
export type AccessRule = {
  access: "full" | Array<string>,
}

export type ServiceAccessHash = {
  [string]: AccessRule
}
