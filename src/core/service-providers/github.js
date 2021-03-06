// @flow
import type { ServiceProvider, ServiceProviderModule } from '../types'
import GitHub from 'github-api'
import lodash from 'lodash'

let configKeys = ['Organization Name', 'OAuth Token for Organization Owner Account']

class GitHubProvider implements ServiceProvider {
  api: GitHub
  orgName: string

  constructor (config: Object) {
    this.api = new GitHub({
      token: config['OAuth Token for Organization Owner Account']
    })
    this.orgName = config['Organization Name']
  }

  async listAccounts () {
    const org = this.api.getOrganization(this.orgName)
    let repos = (await org.getRepos()).data

    let repoCollabs = []

    await Promise.all(repos.map(async (repo) => {
      let repoWrapper = this.api.getRepo(repo.owner.login, repo.name)
      try {
        const collabs = (await repoWrapper.getCollaborators()).data
        repoCollabs.push({
          repo: repo,
          collabs: collabs
        })
      } catch (error) {
        console.log(error)
      }
    }))

    repoCollabs = lodash.filter(repoCollabs, (rc) => !!rc)

    let accountsHash = {}

    repoCollabs.forEach((repoCollab) => {
      repoCollab.collabs.forEach((collaborator) => {
        if (!accountsHash.hasOwnProperty(collaborator.login)) {
          accountsHash[collaborator.login] = { identity: { userId: collaborator.login }, assets: [] }
        }
        const account = accountsHash[collaborator.login]

        account.assets.push({
          name: repoCollab.repo.full_name,
          role: collaborator.permissions.admin ? 'admin' : collaborator.permissions.push ? 'read/write' : 'read-only'
        })
      })
    })

    await Promise.all(Object.keys(accountsHash).map(async (userId) => {
      const profile = (await this.api.getUser(userId).getProfile()).data

      if (profile.name) {
        accountsHash[userId].identity.fullName = profile.name
      }
      if (profile.email) {
        accountsHash[userId].identity.email = profile.email
      }
    }))

    return Object.keys(accountsHash).map((key) => accountsHash[key])
  }

  async testConnection () {
    const org = this.api.getOrganization(this.orgName)
    const repos = await org.getRepos()
    if (!repos) {
      throw new Error('Could not access repositories on GitHub')
    }
  }
}

export const gitHubProviderModule: ServiceProviderModule = {
  id: 'github',
  displayName: 'GitHub',
  roles: ['read-only', 'read/write', 'admin'],
  configKeys: configKeys,
  providerFactory (config) {
    return new GitHubProvider(config)
  }
}
