// @flow
import type { ServiceProvider, ServiceProviderModule } from '../types/service-provider'
import type { UserAccount } from '../types/user-account'

class DummyProvider implements ServiceProvider {
  apiToken: string

  constructor (config: { apiToken: string }) {
    this.apiToken = config.apiToken
  }

  listAccounts (): Array<UserAccount> {
    return []
  }
}

export const dummyProviderModule: ServiceProviderModule = {
  configKeys: ['apiToken'],
  providerFactory (config) {
    return new DummyProvider(config)
  }
}
