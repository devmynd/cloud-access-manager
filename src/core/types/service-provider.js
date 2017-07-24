// @flow
import type { ServiceUserAccount } from './service-user-account'

export interface ServiceProvider {
  listAccounts (): Promise<Array<ServiceUserAccount>>;
  testConnection (): Promise<void>;
}

export type ServiceProviderModule = {
  id: string,
  displayName: string,
  hasRoles: boolean,
  configKeys: Array<string>,
  providerFactory: Object => ServiceProvider
}
