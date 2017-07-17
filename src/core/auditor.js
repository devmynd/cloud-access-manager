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
          const allowedAssets = accessRules.map((accessRule) => accessRule.asset)

          let shouldFlag = true

          if (allowedAssets.indexOf('*') !== -1) {
            shouldFlag = false
          } else {
            const unauthorizedAssets = lodash.difference(service.assets, allowedAssets)
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
    let allAccessRules: Array<Array<AccessRule>> = []

    if (user.accessRules.hasOwnProperty(serviceId)) {
      allAccessRules.push(user.accessRules[serviceId])
    }

    user.groups.forEach((group) => {
      const accessRules = groupAccessRules[group]
      if (accessRules && accessRules.hasOwnProperty(serviceId)) {
        allAccessRules.push(accessRules[serviceId])
      }
    })

    let flattened: Array<AccessRule> = []
    allAccessRules.forEach((accessRule) => {
      flattened = flattened.concat(accessRule)
    })
    return flattened
  }
}
