// @flow
import type { UserAccountAggregate, User, Group } from './types'
import lodash from 'lodash'

export function performAudit (accounts: Array<UserAccountAggregate>, users: Array<User>, groups: Array<Group>): Array<UserAccountAggregate> {
  let userLookup = {}
  users.forEach((user) => { userLookup[user.email] = user })

  let groupAccessRules = {}
  groups.forEach((group) => { groupAccessRules[group.name] = group.accessRules })

  return accounts.reduce((flaggedAccounts, account) => {
    const user = userLookup[account.email]

    account.services = account.services.reduce((flaggedServices, service) => {
      const accessRule = user.accessRules[service.id]

      if (!accessRule) {
        flaggedServices.push(service)
      } else if (accessRule !== 'full') {
        // Strip out any assets that are whitelisted
        service.assets = lodash.difference(service.assets, accessRule)
        if (service.assets.length > 0) {
          flaggedServices.push(service)
        }
      }

      return flaggedServices
    }, [])

    if (account.services.length > 0) {
      flaggedAccounts.push(account)
    }

    return flaggedAccounts
  }, [])
}
