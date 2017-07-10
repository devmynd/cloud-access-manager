// @flow
import type { UserAccount } from './user-account'

export interface ServiceProvider {
  listAccounts (): Array<UserAccount>
}

export type ServiceProviderModule = {
  configKeys: Array<string>,
  providerFactory: Object => ServiceProvider
}
