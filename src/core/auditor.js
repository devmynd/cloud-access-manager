// @flow
import type { ServiceUserAccount, FlaggedInfo } from './types'
import type { IndividualStore } from './data/individual-store'
import type { GroupStore } from './data/group-store'
// import lodash from 'lodash'

// type IndividualLookup = { [string]: Individual }
// type GroupAccessRuleLookup = { [string]: ServiceAccessHash }

export class Auditor {
  individualStore: IndividualStore
  groupStore: GroupStore

  constructor (individualStore: IndividualStore, groupStore: GroupStore) {
    this.individualStore = individualStore
    this.groupStore = groupStore
  }

  auditAccount (account: ServiceUserAccount): ?FlaggedInfo {
    
  }

  // performAudit (accounts: Array<ServiceUserAccountsAggregate>) {
  //   const individuals = this.individualStore.getAll()
  //   const groups = this.groupStore.getAll()
  //
  //   const individualLookup: IndividualLookup = {}
  //   individuals.forEach((individual) => { individualLookup[individual.email] = individual })
  //
  //   const groupAccessRules: GroupAccessRuleLookup = {}
  //   groups.forEach((group) => { groupAccessRules[group.name] = group.accessRules })
  //
  //   return this._performAudit(accounts, individualLookup, groupAccessRules)
  // }
  //
  // _performAudit (accounts: Array<ServiceUserAccountsAggregate>, individualLookup: IndividualLookup, groupAccessRules: GroupAccessRuleLookup): Array<FlaggedInfo> {
  //   return accounts.reduce((flaggedAccounts, account) => {
  //     const individual = individualLookup[account.email]
  //
  //     let flaggedAccount: FlaggedInfo = {
  //       email: account.email,
  //       assetAssignments: account.assetAssignments,
  //       isNewIndividual: !individual,
  //       groups: individual ? individual.groups : []
  //     }
  //
  //     if (!individual) {
  //       this.individualStore.save({ email: flaggedAccount.email, accessRules: {}, groups: [] })
  //       flaggedAccounts.push(flaggedAccount)
  //     } else {
  //       flaggedAccount.assetAssignments = account.assetAssignments.reduce((flaggedAssignments, assetAssignment) => {
  //         const accessRules = this._getAccessRules(individual, assetAssignment.service.id, groupAccessRules)
  //         const unauthorizedAssets = this._findUnauthorizedAssets(assetAssignment.assets, accessRules)
  //
  //         if (unauthorizedAssets.length > 0) {
  //           assetAssignment.assets = unauthorizedAssets
  //           flaggedAssignments.push(assetAssignment)
  //         }
  //
  //         return flaggedAssignments
  //       }, [])
  //
  //       if (flaggedAccount.assetAssignments.length > 0) {
  //         flaggedAccounts.push(flaggedAccount)
  //       }
  //     }
  //
  //     return flaggedAccounts
  //   }, [])
  // }

  // Private

  // _findUnauthorizedAssets (assets: Array<Asset>, accessRules: Array<AccessRule>) {
  //   return assets.reduce((unauthorizedAssets, asset) => {
  //     const isAuthorized = lodash.find(accessRules, (rule) => {
  //       const assetsMatch = rule.asset === '*' || rule.asset === asset.name
  //       const rolesMatch = rule.role === '*' || rule.role === asset.role
  //       return assetsMatch && rolesMatch
  //     })
  //
  //     if (!isAuthorized) {
  //       unauthorizedAssets.push(asset)
  //     }
  //
  //     return unauthorizedAssets
  //   }, [])
  // }
  //
  // _getAccessRules (individual: Individual, serviceId: string, groupAccessRules: GroupAccessRuleLookup) {
  //   let allAccessRules: Array<Array<AccessRule>> = []
  //
  //   if (individual.accessRules.hasOwnProperty(serviceId)) {
  //     allAccessRules.push(individual.accessRules[serviceId])
  //   }
  //
  //   individual.groups.forEach((group) => {
  //     const accessRules = groupAccessRules[group]
  //     if (accessRules && accessRules.hasOwnProperty(serviceId)) {
  //       allAccessRules.push(accessRules[serviceId])
  //     }
  //   })
  //
  //   let flattened: Array<AccessRule> = []
  //   allAccessRules.forEach((accessRule) => {
  //     flattened = flattened.concat(accessRule)
  //   })
  //   return flattened
  // }
}
