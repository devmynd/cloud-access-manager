// @flow
import type { ServiceProvider, ServiceProviderModule } from '../types/service-provider'

let configKeys = ['dummyApiToken']
type DummyConfig = {
  dummyApiToken: string
}

class DummyProvider implements ServiceProvider {
  serviceName = 'Dummy Service'

  config: DummyConfig

  constructor (config: DummyConfig) {
    this.config = config
  }

  listAccounts () {
    return new Promise((resolve, reject) => {
      resolve([
        {
          email: 'shamyle@devmynd.com',
          assets: ['Project A', 'Project B']
        },
        {
          email: 'ty@devmynd.com',
          assets: []
        }
      ])
    })
  }
}

export const dummyProviderModule: ServiceProviderModule = {
  configKeys: configKeys,
  providerFactory (config) {
    return new DummyProvider(config)
  }
}
