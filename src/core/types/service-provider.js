// @flow
import type { UserAccount } from './user-account'

export interface ServiceProvider {
  listAccounts (): Promise<Array<UserAccount>>;
  testConnection (): Promise<void>;
}

export type ServiceProviderModule = {
  id: string,
  displayName: string,
  hasRoles: boolean,
  configKeys: Array<string>,
  providerFactory: Object => ServiceProvider
}
