// @flow
import type { ServiceProvider, ServiceProviderModule } from '../types/service-provider'
import type { UserAccount } from '../types/user-account'

let configKeys = ['apiToken']
type DummyConfig = {
  apiToken: string
}

class DummyProvider implements ServiceProvider {
  config: DummyConfig

  constructor (config: DummyConfig) {
    this.config = config
  }

  listAccounts (): Array<UserAccount> {
    return []
  }
}

export const dummyProviderModule: ServiceProviderModule = {
  configKeys: configKeys,
  providerFactory (config) {
    return new DummyProvider(config)
  }
}
