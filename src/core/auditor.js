// @flow
import type { UserAccountAggregate, User, Group, AccessRule, ServiceAccessHash } from './types'
import lodash from 'lodash'

type UserLookup = { [string]: User }
type GroupAccessRuleLookup = { [string]: ServiceAccessHash }

export class Auditor {
  accounts: Array<UserAccountAggregate>
  userLookup: UserLookup
  groupAccessRules: GroupAccessRuleLookup

  constructor (accounts: Array<UserAccountAggregate>, users: Array<User>, groups: Array<Group>) {
    this.accounts = accounts

    this.userLookup = {}
    users.forEach((user) => { this.userLookup[user.email] = user })

    this.groupAccessRules = {}
    groups.forEach((group) => { this.groupAccessRules[group.name] = group.accessRules })
  }

  performAudit () {
    return this.accounts.reduce((flaggedAccounts, account) => {
      const user = this.userLookup[account.email]

      account.services = account.services.reduce((flaggedServices, service) => {
        const accessRules = this._getAccessRules(user, service.id)
        console.log(`service '${service.id}' access rules:`)
        console.log(accessRules)

        let shouldFlag = true

        if (this._hasFullAccess(accessRules)) {
          shouldFlag = false
        } else {
          const unauthorizedAssets = this._findUnauthorizedAssets(accessRules, service.assets)
          console.log('unauthorized assets:')
          console.log(unauthorizedAssets)
          service.assets = unauthorizedAssets

          if (unauthorizedAssets.length === 0) {
            shouldFlag = false
          }
        }

        console.log(`should flag: ${shouldFlag ? 'true' : 'false'}`)

        if (shouldFlag) {
          flaggedServices.push(service)
        }
        return flaggedServices
      }, [])

      if (account.services.length > 0) {
        flaggedAccounts.push(account)
      }

      return flaggedAccounts
    }, [])
  }

  // Private

  _getAccessRules (user: User, serviceId: string) {
    let appliedAccessRules: Array<AccessRule> = []

    if (user.accessRules.hasOwnProperty(serviceId)) {
      appliedAccessRules.push(user.accessRules[serviceId])
    }

    user.groups.forEach((group) => {
      const accessRules = this.groupAccessRules[group]
      if (accessRules && accessRules.hasOwnProperty(serviceId)) {
        appliedAccessRules.push(accessRules[serviceId])
      }
    })

    return appliedAccessRules
  }

  _hasFullAccess (accessRules: Array<AccessRule>) {
    return !!lodash.find(accessRules, (accessRule) => accessRule === 'full')
  }

  _findUnauthorizedAssets (accessRules: Array<AccessRule>, assets: Array<string>) {
    let allowedAssets: Array<string> = []
    accessRules.forEach((accessRule) => {
      if (typeof accessRule !== 'string') {
        allowedAssets = allowedAssets.concat(accessRule)
      }
    })

    return lodash.difference(assets, allowedAssets)
  }
}
