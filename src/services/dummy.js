// @flow
import type { ServiceProvider } from '../types/service-provider'
import type { UserAccount } from '../types/user-account'

export const dummyConfigKeys = ['apiToken']

export class DummyProvider implements ServiceProvider {
  apiToken: string

  constructor (apiToken: string) {
    this.apiToken = apiToken
  }

  listAccounts (): Array<UserAccount> {
    return []
  }
}
