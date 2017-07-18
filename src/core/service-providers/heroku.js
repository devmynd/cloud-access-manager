// @flow
import type { ServiceProvider, ServiceProviderModule } from '../types'
import Heroku from 'heroku-client'

let configKeys = ['Heroku Api Token']

class HerokuProvider implements ServiceProvider {
  heroku: Heroku

  constructor (config: { 'Heroku Api Token': string }) {
    const apiToken = config['Heroku Api Token']
    this.heroku = new Heroku({ token: apiToken })
  }

  async listAccounts () {
    const apps = await this.heroku.get('/apps')
    const promises = apps.map((app) => {
      return this.heroku.get(`/apps/${app.id}/collaborators`)
    })
    const appCollaborators = await Promise.all(promises)
    const userLookup = appCollaborators.reduce((userLookup, collaborators) => {
      collaborators.forEach((collaborator) => {
        const email = collaborator.user.email
        let userAccount = userLookup[email] || { email: email, assets: [] }
        userAccount.assets.push(collaborator.app.name)
        userLookup[email] = userAccount
      })
      return userLookup
    }, [])
    return Object.keys(userLookup).map((email) => userLookup[email])
  }
}

export const herokuProviderModule: ServiceProviderModule = {
  id: 'heroku',
  displayName: 'Heroku',
  hasRoles: false,
  configKeys: configKeys,
  providerFactory (config) {
    return new HerokuProvider(config)
  }
}
