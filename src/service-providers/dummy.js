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
          assets: []
        },
        {
          email: 'ty@devmynd.com',
          assets: ['Project A', 'Project B']
        },
        {
          email: 'mevans@devmynd.com',
          assets: ["Project/Repo"]
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
