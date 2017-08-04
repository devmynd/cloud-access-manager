// @flow
import type { ServiceProvider, ServiceProviderModule } from '../types'

let configKeys = ['Organization Login']

class GitHubProvider implements ServiceProvider {
  login: string

  constructor (config: Object) {
    this.login = config['Organization Login']
  }

  listAccounts () {
    return new Promise((resolve, reject) => {
      resolve([
        {
          identity: {
            userId: 'shamwow',
            fullName: 'Shamyle Ghazali'
          },
          assets: [{
            name: 'repo a',
            role: 'read'
          }, {
            name: 'repo b',
            role: 'write'
          }]
        },
        {
          identity: {
            userId: 'evansmd01',
            fullName: 'Michael'
          },
          assets: [{
            name: 'repo a',
            role: 'admin'
          }, {
            name: 'repo b',
            role: 'write'
          }]
        },
        {
          identity: {
            email: 'ty@devmynd.com'
          },
          assets: [{
            name: 'repo a',
            role: 'admin'
          }, {
            name: 'repo b',
            role: 'write'
          }]
        }
      ])
    })
  }

  async testConnection () {
    // todo: implement test connection
  }
}

export const gitHubProviderModule: ServiceProviderModule = {
  id: 'github',
  displayName: 'GitHub',
  roles: ['read', 'write', 'admin'],
  configKeys: configKeys,
  providerFactory (config) {
    return new GitHubProvider(config)
  }
}
