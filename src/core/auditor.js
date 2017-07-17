// @flow
import type { UserAccountAggregate, User, AccessRule, ServiceAccessHash } from './types'
import type { UserStore } from './data/user-store'
import type { GroupStore } from './data/group-store'
import lodash from 'lodash'

type UserLookup = { [string]: User }
type GroupAccessRuleLookup = { [string]: ServiceAccessHash }

export class Auditor {
  userStore: UserStore
  groupStore: GroupStore

  constructor (userStore: UserStore, groupStore: GroupStore) {
    this.userStore = userStore
    this.groupStore = groupStore
  }

  performAudit (accounts: Array<UserAccountAggregate>) {
    const users = this.userStore.getAll()
    const groups = this.groupStore.getAll()

    const userLookup: UserLookup = {}
    users.forEach((user) => { userLookup[user.email] = user })

    const groupAccessRules: GroupAccessRuleLookup = {}
    groups.forEach((group) => { groupAccessRules[group.name] = group.accessRules })

    return this._performAudit(accounts, userLookup, groupAccessRules)
  }

  _performAudit (accounts: Array<UserAccountAggregate>, userLookup: UserLookup, groupAccessRules: GroupAccessRuleLookup) {
    return accounts.reduce((flaggedAccounts, account) => {
      const user = userLookup[account.email]

      if (!user) {
        account.isNewUser = true
        flaggedAccounts.push(account)
      } else {
        account.services = account.services.reduce((flaggedServices, service) => {
          const accessRules = this._getAccessRules(user, service.id, groupAccessRules)

          let shouldFlag = true

          if (this._hasFullAccess(accessRules)) {
            shouldFlag = false
          } else {
            const unauthorizedAssets = this._findUnauthorizedAssets(accessRules, service.assets)
            service.assets = unauthorizedAssets

            if (unauthorizedAssets.length === 0) {
              shouldFlag = false
            }
          }

          if (shouldFlag) {
            flaggedServices.push(service)
          }
          return flaggedServices
        }, [])

        if (account.services.length > 0) {
          flaggedAccounts.push(account)
        }
      }

      return flaggedAccounts
    }, [])
  }

  // Private

  _getAccessRules (user: User, serviceId: string, groupAccessRules: GroupAccessRuleLookup) {
    let appliedAccessRules: Array<AccessRule> = []

    if (user.accessRules.hasOwnProperty(serviceId)) {
      appliedAccessRules.push(user.accessRules[serviceId])
    }

    user.groups.forEach((group) => {
      const accessRules = groupAccessRules[group]
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
