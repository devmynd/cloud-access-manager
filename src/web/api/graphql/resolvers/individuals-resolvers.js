// @flow
import { individualStore } from '../../../../core/data/individual-store'
import { newIndividualFactory } from '../../../../core/types'
import type { AccessRule, Individual, FlaggedInfo } from '../../../../core/types'
import { mapIndividual } from '../mappers'
import lodash from 'lodash'

export function createIndividual(args: { individual: { fullName: string, primaryEmail: string, groups: Array<string> } }) {
  const individual = newIndividualFactory( args.individual.fullName, args.individual.primaryEmail, args.individual.groups )
  individualStore.save(individual)
  return individual.id
}

export function linkServiceToIndividual(args: { serviceId: string, individualId: string, fullName: ?string, email: ?string, userId: ?string }) {
  const individual = individualStore.getById(args.individualId)
  let identity = {}
  if(args.fullName && args.fullName.trim().length > 0) {
    identity.fullName = args.fullName
  }
  if(args.email && args.email.trim().length > 0) {
    identity.email = args.email
  }
  if(args.userId && args.userId.trim().length > 0) {
    identity.userId = args.userId
  }

  if(!(identity.userId || identity.email)) {
    throw new Error("Neither userId nor email were supplied. You must supply at least one of those fields.")
  }

  individual.serviceUserIdentities[args.serviceId] = identity
  individualStore.save(individual)

  return "Service Identity added to individual"
}

export function addIndividualAccessRules(args: { individualId: string, serviceId: string, accessRules: Array<AccessRule>}) {
  const individual = individualStore.getById(args.individualId)

  args.accessRules.forEach((rule) => {
    const existingRules = individual.accessRules[args.serviceId] || []
    existingRules.push(rule)
    individual.accessRules[args.serviceId] = existingRules
  })

  individualStore.save(individual)
  return "Rules added successfully"
}

export function getIndividuals(args: { fuzzySearch: ?string, limit: ?number }) {
  if(args.fuzzySearch && args.fuzzySearch.trim() === "") {
    return []
  }

  let individualList
  if(args.fuzzySearch) {
    individualList = lodash.take(individualStore.getByFuzzySearch(args.fuzzySearch).map(mapIndividual), args.limit || 99999)
  } else {
    individualList = lodash.take(individualStore.getAll().map(mapIndividual), 99999)
  }

  return individualList.sort((lhs,rhs) => lhs.primaryEmail > rhs.primaryEmail || lhs.fullName > rhs.fullName ? 1 : -1 )
}
