// @flow
import type { UserAccountAggregate, User, AccessRule, ServiceAccessHash, Asset } from './types'
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
        account.assetAssignments = account.assetAssignments.reduce((flaggedAssignments, assetAssignment) => {
          const accessRules = this._getAccessRules(user, assetAssignment.service.id, groupAccessRules)
          const unauthorizedAssets = this._findUnauthorizedAssets(assetAssignment.assets, accessRules)

          if (unauthorizedAssets.length > 0) {
            assetAssignment.assets = unauthorizedAssets
            flaggedAssignments.push(assetAssignment)
          }

          return flaggedAssignments
        }, [])

        if (account.assetAssignments.length > 0) {
          flaggedAccounts.push(account)
        }
      }

      return flaggedAccounts
    }, [])
  }

  // Private

  _findUnauthorizedAssets (assets: Array<Asset>, accessRules: Array<AccessRule>) {
    return assets.reduce((unauthorizedAssets, asset) => {
      const isAuthorized = lodash.find(accessRules, (rule) => {
        const assetsMatch = rule.asset === '*' || rule.asset === asset.name
        const rolesMatch = rule.role === '*' || rule.role === asset.role
        return assetsMatch && rolesMatch
      })

      if (!isAuthorized) {
        unauthorizedAssets.push(asset)
      }

      return unauthorizedAssets
    }, [])
  }

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
