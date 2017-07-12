// @flow

export type UserServiceSummary = {
  email: string,
  services: Array<{ id: string, displayName: string, assets: Array<string> }>
}
