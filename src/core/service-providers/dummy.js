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
          assets: ['repo a', 'repo b']
        },
        {
          email: 'ty@devmynd.com',
          assets: ['repo a', 'repo b']
        },
        {
          email: 'mevans@devmynd.com',
          assets: ['repo a', 'repo b']
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

export const dummyProviderModule2: ServiceProviderModule = {
  id: 'dummy2',
  displayName: 'Dummy Service 2',
  configKeys: configKeys,
  providerFactory (config) {
    return new DummyProvider(config)
  }
}
