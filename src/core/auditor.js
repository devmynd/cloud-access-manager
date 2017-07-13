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

      // loop through the summary's services and strip out any services that are whitelisted
      for (let i = summary.services.length - 1; i >= 0; i--) {
        let service = summary.services[i]

        const accessRules = user.accessRules[service.id]
        // not whitelisted
        if (!accessRules) {
          continue
        }

        // whitelisted full access
        if (accessRules.access === 'full') {
          summary.services.splice(i, 1)
          continue
        }

        // whitelisted for specific assets
        // loop through the service's assets, and strip out any assets that are whitelisted
        service.assets = lodash.difference(service.assets, accessRules.access)

        // if we stripped out all assets, we have acess to all assets, so strip out the service
        if (service.assets.length === 0) {
          summary.services.splice(i, 1)
        }
      }

      // if the summary has not been stripped empty, then add it to the list of flagged summaries
      if (summary.services.length > 0) {
        flaggedSummaries.push(summary)
      }
    }

    return flaggedSummaries
  }, [])
}
