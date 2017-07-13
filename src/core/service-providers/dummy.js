// @flow
import type { ServiceProvider, ServiceProviderModule } from '../types'

let configKeys = ['Api Key', 'Api Secret']

class DummyProvider implements ServiceProvider {
  apiKey: string
  apiSecret: string

  constructor (config: { 'Api Key': string, 'Api Secret': string }) {
    this.apiKey = config['Api Key']
    this.apiSecret = config['Api Secret']
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
