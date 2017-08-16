// @flow
import type { ServiceUserAccount, FlaggedInfo, Individual, Asset, AccessRule } from './types'
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

  auditAccount (account: ServiceUserAccount): ?FlaggedInfo {
    const individual = this.individualStore.getByServiceUserIdentity(account.serviceId, account.userAccount.identity)
    if (individual) {
      // TODO: it should not be the auditor's responsibility to update and persist the individual, only to audit. 
      individual.serviceUserIdentities[account.serviceId] = account.userAccount.identity
      this.individualStore.save(individual)
      return this.auditIndividual(individual, account)
    } else {
      return {
        individual: null,
        serviceId: account.serviceId,
        userIdentity: account.userAccount.identity,
        assets: account.userAccount.assets
      }
    }
  }

  auditIndividual (individual: Individual, account: ServiceUserAccount): ?FlaggedInfo {
    const accessRules = this._getAccessRules(individual, account.serviceId)
    const unauthorizedAssets = this._findUnauthorizedAssets(account.userAccount.assets, accessRules)
    if (unauthorizedAssets.length > 0) {
      return {
        individual: individual,
        serviceId: account.serviceId,
        userIdentity: account.userAccount.identity,
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
