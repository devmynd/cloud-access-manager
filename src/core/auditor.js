// @flow
import type { UserAccountAggregate, User } from './types'
import lodash from 'lodash'

export function performAudit (accounts: Array<UserAccountAggregate>, users: Array<User>): Array<UserAccountAggregate> {
  const userLookup = users.reduce((userHash, user) => {
    userHash[user.email] = user
    return userHash
  }, {})

  return accounts.reduce((flaggedAccounts, account) => {
    const user = userLookup[account.email]

    if (!user) {
      // flag the whole account
      flaggedAccounts.push(account)
    } else {
      // todo: refactor to another reduce
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
    }

    return flaggedAccounts
  }, [])
}
