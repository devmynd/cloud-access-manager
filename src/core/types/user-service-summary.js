// @flow

export type UserServiceSummary = {
  email: string,
  services: Array<{ name: string, assets: Array<string> }>
}
