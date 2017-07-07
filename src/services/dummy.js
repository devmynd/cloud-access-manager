// @flow
import type { ServiceProvider } from '../types/service-provider'
import type { UserAccount } from '../types/user-account'

export const dummyConfigKeys = ['apiToken']

export class DummyProvider implements ServiceProvider {
  apiToken: string

  constructor (config: { apiToken: string }) {
    this.apiToken = config.apiToken
  }

  listAccounts (): Array<UserAccount> {
    return []
  }
}
