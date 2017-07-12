// @flow

export type WhitelistEntry = {
  email: string,
  services: [{ id: string, access: "full" | Array<string> }]
}
