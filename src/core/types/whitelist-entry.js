// @flow

export type WhitelistEntry = {
  email: string,
  services: [{ name: string, access: "full" | Array<string> }]
}
