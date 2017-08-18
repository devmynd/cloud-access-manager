// @flow

export type ServiceInfo = {
  id: string,
  displayName: string,
  roles: Array<string>,
  isConfigured: boolean,
  cachedDate: ?Date,
  configKeys: Array<string>
}
