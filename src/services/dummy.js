// @flow
import type { ServiceProvider } from '../types/service-provider'
import type { UserAccount } from '../types/user-account'

export class Config {
  apiToken: string
}

export class Provider implements ServiceProvider {
  config: Config

  constructor (config: Config) {
    this.config = config
  }

  listAccounts (): Array<UserAccount> {
    return []
  }
}
