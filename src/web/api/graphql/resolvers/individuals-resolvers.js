// @flow
import { individualStore } from '../../../../core/data/individual-store'
import { newIndividualFactory } from '../../../../core/types'

export function createIndividual(args: { individual: { fullName: string, primaryEmail: string, groups: Array<string> } }) {
  const individual = newIndividualFactory( args.individual.fullName, args.individual.primaryEmail, args.individual.groups )
  individualStore.save(individual)
  return individual.id
}
