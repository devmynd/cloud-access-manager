// @flow
import { individualStore } from '../../../../core/data/individual-store'
import { newIndividualFactory } from '../../../../core/types'
import type { AccessRule } from '../../../../core/types'
import { mapIndividual } from '../mappers'
import lodash from 'lodash'

export function createIndividual (args: { individual: { fullName: string, primaryEmail: ?string, groups: Array<string> } }) {
  const individual = newIndividualFactory(args.individual.fullName, args.individual.primaryEmail, args.individual.groups)
  individualStore.save(individual)
  return mapIndividual(individual)
}

export function deleteIndividual (args: { individualId: string} ) {
  individualStore.delete(args.individualId)
  return "Deleted"
}

export function linkServiceToIndividual (args: { serviceId: string, individualId: string, fullName: ?string, email: ?string, userId: ?string }) {
  const individual = individualStore.getById(args.individualId)
  let identity = {}
  if (args.fullName && args.fullName.trim().length > 0) {
    identity.fullName = args.fullName
  }
  if (args.email && args.email.trim().length > 0) {
    identity.email = args.email
  }
  if (args.userId && args.userId.trim().length > 0) {
    identity.userId = args.userId
  }

  if (!(identity.userId || identity.email)) {
    throw new Error('Neither userId nor email were supplied. You must supply at least one of those fields.')
  }

  individual.serviceUserIdentities[args.serviceId] = identity
  individualStore.save(individual)

  return 'Service Identity added to individual'
}

export function addIndividualAccessRules (args: { individualId: string, serviceId: string, accessRules: Array<AccessRule>}) {
  const individual = individualStore.getById(args.individualId)

  args.accessRules.forEach((rule) => {
    const existingRules = individual.accessRules[args.serviceId] || []
    existingRules.push(rule)
    individual.accessRules[args.serviceId] = existingRules
  })

  individualStore.save(individual)
  return 'Rules added successfully'
}

export function removeIndividualAccessRules (args: { individualId: string, serviceId: string, accessRules: Array<AccessRule>}) {
  const individual = individualStore.getById(args.individualId)

  let existingRules = individual.accessRules[args.serviceId]

  if (existingRules) {
    args.accessRules.forEach((rule) => {
      const ruleIndex = lodash.findIndex(existingRules, (e) => e == rule)
      existingRules.splice(ruleIndex, 1)
    })
  }
  individual.accessRules[args.serviceId] = existingRules

  individualStore.save(individual)
  return 'Rules removed successfully'
}

export function updateIndividualAccessRules ( args: {
  individualId: string,
  accessRules: [{
    serviceId: string,
    accessRules: Array<AccessRule>
  }]
}) {
  const individual = individualStore.getById(args.individualId)

  const updatedAccessRules = {}
  args.accessRules.forEach((ruleList) => {
    updatedAccessRules[ruleList.serviceId] = ruleList.accessRules
  })
  individual.accessRules = updatedAccessRules

  individualStore.save(individual)

  return "Individual updated successfully"
}

export function updateIndividualGroups (args: {
  individualId: string,
  groups: Array<string>
}) {
  const individual = individualStore.getById(args.individualId)
  individual.groups = args.groups

  individualStore.save(individual)

  return "Individual updated successfully"
}


export function getIndividuals (args: { fuzzySearch: ?string, limit: ?number }) {
  if (args.fuzzySearch && args.fuzzySearch.trim() === '') {
    return []
  }

  let individualList = args.fuzzySearch
    ? individualStore.getByFuzzySearch(args.fuzzySearch, args.limit)
    : individualStore.getAll(args.limit)

  return individualList.map(mapIndividual)
}

export function unlinkService (args: { serviceId: string, individualId: string }) {
  const individual = individualStore.getById(args.individualId)
  delete individual.serviceUserIdentities[args.serviceId]
  individualStore.save(individual)

  return "Unlinked successfully"
}

export function updatePrimaryEmail (args: { individualId: string, primaryEmail: ?string }) {
  const individual = individualStore.getById(args.individualId)
  individual.primaryEmail = args.primaryEmail
  individualStore.save(individual)

  return "email updated"
}
