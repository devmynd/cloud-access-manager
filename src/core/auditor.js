// @flow
import type { FlaggedInfo, Individual, Asset, AccessRule, UserAccount } from './types'
import type { IndividualStore } from './data/individual-store'
import type { GroupStore } from './data/group-store'
import lodash from 'lodash'

export class Auditor {
  individualStore: IndividualStore
  groupStore: GroupStore

  constructor (individualStore: IndividualStore, groupStore: GroupStore) {
    this.individualStore = individualStore
    this.groupStore = groupStore
  }

  auditAccount (serviceId: string, userAccount: UserAccount): ?FlaggedInfo {
    const individual = this.individualStore.getByServiceUserIdentity(serviceId, userAccount.identity)
    if (individual) {
      // if we auto-matched an individual for the first time, link the service identity before we audit.
      if (!individual.serviceUserIdentities.hasOwnProperty(serviceId)) {
        individual.serviceUserIdentities[serviceId] = userAccount.identity
        this.individualStore.save(individual)
      }
      return this.auditIndividual(individual, serviceId, userAccount)
    } else {
      return {
        individual: null,
        serviceId: serviceId,
        userIdentity: userAccount.identity,
        assets: userAccount.assets
      }
    }
  }

  auditIndividual (individual: Individual, serviceId: string, userAccount: UserAccount): ?FlaggedInfo {
    const accessRules = this._getAccessRules(individual, serviceId)
    const unauthorizedAssets = this._findUnauthorizedAssets(userAccount.assets, accessRules)
    if (unauthorizedAssets.length > 0) {
      return {
        individual: individual,
        serviceId: serviceId,
        userIdentity: userAccount.identity,
        assets: unauthorizedAssets
      }
    }
  }

  // Private

  _findUnauthorizedAssets (assets: Array<Asset>, accessRules: Array<AccessRule>): Array<Asset> {
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

  _getAccessRules (individual: Individual, serviceId: string): Array<AccessRule> {
    let allAccessRules: Array<AccessRule> = []

    if (individual.accessRules.hasOwnProperty(serviceId)) {
      allAccessRules = individual.accessRules[serviceId]
    }

    individual.groups.forEach((group) => {
      const groupAccessRules = this.groupStore.getAccessRules(group, serviceId)
      allAccessRules = allAccessRules.concat(groupAccessRules)
    })

    return allAccessRules
  }
}
