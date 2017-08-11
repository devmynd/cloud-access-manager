// @flow
import { individualStore } from '../../../../core/data/individual-store'
import { newIndividualFactory } from '../../../../core/types'
import type { AccessRule, Individual } from '../../../../core/types'
import { mapIndividual } from '../mappers'

export function createIndividual(args: { individual: { fullName: string, primaryEmail: string, groups: Array<string> } }) {
  const individual = newIndividualFactory( args.individual.fullName, args.individual.primaryEmail, args.individual.groups )
  individualStore.save(individual)
  return individual.id
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

export function getIndividuals(args: { fuzzySearch: ?string }) {
  if(args.fuzzySearch && args.fuzzySearch.trim() === "") {
    return []
  }
  if(args.fuzzySearch) {
    return individualStore.getByFuzzySearch(args.fuzzySearch).map(mapIndividual)
  }
  return individualStore.getAll().map(mapIndividual)
}
