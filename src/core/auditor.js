// @flow
import type { UserServiceSummary, User } from './types'
import lodash from 'lodash'

export function performAudit (userServiceSummaries: Array<UserServiceSummary>, users: Array<User>): Array<UserServiceSummary> {
  const userLookup = users.reduce((userHash, user) => {
    userHash[user.email] = user
    return userHash
  }, {})

  return userServiceSummaries.reduce((flaggedSummaries, summary) => {
    const user = userLookup[summary.email]

    if (!user) {
      // flag the whole summary
      flaggedSummaries.push(summary)
    } else {
      // todo: refactor to another reduce
      summary.services = summary.services.reduce((flaggedServices, service) => {
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

      if (summary.services.length > 0) {
        flaggedSummaries.push(summary)
      }
    }

    return flaggedSummaries
  }, [])
}
