// @flow
import type { UserAccount } from './user-account'

export interface ServiceProvider {
  listAccounts (): Promise<Array<UserAccount>>;
}

export type ServiceProviderModule = {
  id: string,
  displayName: string,
  hasRoles: boolean,
  configKeys: Array<string>,
  providerFactory: Object => ServiceProvider
}
