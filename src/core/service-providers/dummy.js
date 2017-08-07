// @flow
import type { ServiceProvider, ServiceProviderModule } from '../types'

let configKeys = ['Dummy Api Key', 'Dummy Api Secret']

class DummyProvider implements ServiceProvider {
  apiKey: string
  apiSecret: string

  constructor (config: { 'Dummy Api Key': string, 'Dummy Api Secret': string }) {
    this.apiKey = config['Dummy Api Key']
    this.apiSecret = config['Dummy Api Secret']
  }

  listAccounts () {
    return new Promise((resolve, reject) => {
      resolve([
        {
          identity: {
            email: 'shamyle@devmynd.com'
          },
          assets: [{
            name: 'repo a',
            role: 'owner'
          }, {
            name: 'repo b',
            role: 'member'
          }]
        },
        {
          identity: {
            email: 'ty@devmynd.com'
          },
          assets: [{
            name: 'repo a',
            role: 'member'
          }, {
            name: 'repo b',
            role: 'owner'
          }]
        },
        {
          identity: {
            email: 'mevans@devmynd.com'
          },
          assets: [{
            name: 'repo a',
            role: 'member'
          }, {
            name: 'repo b',
            role: 'member'
          }]
        }
      ])
    })
  }

  async testConnection () {
    if (this.apiKey === 'invalid') {
      throw new Error('Invalid api key')
    }
  }
}

export const dummyProviderModule: ServiceProviderModule = {
  id: 'dummy',
  displayName: 'Dummy Service',
  roles: ['member', 'owner'],
  configKeys: configKeys,
  providerFactory (config) {
    return new DummyProvider(config)
  }
}
