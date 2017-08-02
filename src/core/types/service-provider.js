// @flow
import type { UserAccount } from './service-user-account'

export interface ServiceProvider {
  listAccounts (): Promise<Array<UserAccount>>;
  testConnection (): Promise<void>;
}

export type ServiceProviderModule = {
  id: string,
  displayName: string,
  roles: Array<string>,
  configKeys: Array<string>,
  providerFactory: Object => ServiceProvider
}
