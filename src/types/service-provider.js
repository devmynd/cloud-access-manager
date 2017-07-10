// @flow
import type { UserAccount } from './user-account'

export interface ServiceProvider {
  serviceName: string;
  listAccounts (): Promise<Array<UserAccount>>;
}

export type ServiceProviderModule = {
  configKeys: Array<string>,
  providerFactory: Object => ServiceProvider
}
