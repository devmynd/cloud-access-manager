// @flow
import type { ServiceProvider, ServiceProviderModule } from '../types'

let configKeys = ['Dummy Api Token']

class DummyProvider implements ServiceProvider {
  apiToken: string

  constructor (config: { 'Dummy Api Token': string }) {
    this.apiToken = config['Dummy Api Token']
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