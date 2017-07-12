// @flow
import type { ServiceProvider, ServiceProviderModule } from '../types'

let configKeys = ['dummyApiToken']
type DummyConfig = {
  dummyApiToken: string
}

class DummyProvider implements ServiceProvider {
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
          assets: ['Project/Repo']
        }
      ])
    })
  }
}

export const dummyProviderModule: ServiceProviderModule = {
  id: 'dummy',
  displayName: 'Dummy Service',
  configKeys: configKeys,
  providerFactory (config) {
    return new DummyProvider(config)
  }
}
