// @flow

export type ServiceAccess = {
  id: string,
  access: "full" | Array<string>
}

export type WhitelistEntry = {
  email: string,
  services: Array<ServiceAccess>
}
