// @flow
import type { UserServiceSummary, WhitelistEntry } from './types'
import lodash from 'lodash'

export function performAudit (userServiceSummaries: Array<UserServiceSummary>, whitelist: Array<WhitelistEntry>): Array<UserServiceSummary> {
  const whitelistLookup = whitelist.reduce((userHash, entry) => {
    userHash[entry.email] = entry.services.reduce((serviceHash, service) => {
      serviceHash[service.name] = service.access
      return serviceHash
    }, {})
    return userHash
  }, {})

  return userServiceSummaries.reduce((flaggedSummaries, summary) => {
    const whitelistEntry = whitelistLookup[summary.email]

    if (!whitelistEntry) {
      // flag the whole summary
      flaggedSummaries.push(summary)
    } else {
      // loop through the summary's services and strip out any services that are whitelisted
      for (let i = summary.services.length - 1; i >= 0; i--) {
        let service = summary.services[i]

        const whitelistServiceEntry = whitelistEntry[service.name]

        // not whitelisted
        if (!whitelistServiceEntry) {
          continue
        }

        // whitelisted full access
        if (whitelistServiceEntry === 'full') {
          summary.services.splice(i, 1)
          continue
        }

        // whitelisted for specific assets
        // loop through the service's assets, and strip out any assets that are whitelisted
        service.assets = lodash.difference(service.assets, whitelistServiceEntry)

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
