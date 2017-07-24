// @flow
import type { IndividualAccount } from './user-account'

export interface ServiceProvider {
  listAccounts (): Promise<Array<IndividualAccount>>;
  testConnection (): Promise<void>;
}

export type ServiceProviderModule = {
  id: string,
  displayName: string,
  hasRoles: boolean,
  configKeys: Array<string>,
  providerFactory: Object => ServiceProvider
}
