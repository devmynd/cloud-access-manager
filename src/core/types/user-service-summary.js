// @flow

export type ServiceSummary = {
  id: string,
  displayName: string, assets: Array<string>
}

export type UserServiceSummary = {
  email: string,
  services: Array<ServiceSummary>
}
