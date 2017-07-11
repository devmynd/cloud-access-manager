// @flow

export type UserServiceSummary = {
  email: string,
  services: [{ name: string, assets: Array<string> }]
}
