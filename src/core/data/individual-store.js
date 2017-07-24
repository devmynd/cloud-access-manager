// @flow
import fs from 'file-system'
import * as helpers from './helpers'
import type { Individual } from '../types'
import lodash from 'lodash'

process.env.USERS_PATH = process.env.USERS_PATH || './.users.store.json'

export type IndividualStore = {
  save (user: Individual): void,
  getAll (): Array<Individual>,
  getByEmail (email: string): Individual
}

export const individualStore: IndividualStore = {
  save (individual: Individual) {
    let individuals: Array<Individual> = helpers.readData(process.env.USERS_PATH, [])
    let existingIndex = lodash.findIndex(individuals, (entry) => {
      return entry.email === individual.email
    })
    if (existingIndex >= 0) {
      individuals[existingIndex] = individual
    } else {
      individuals.push(individual)
    }

    fs.writeFileSync(process.env.USERS_PATH, JSON.stringify(individuals))
  },

  getAll () {
    const individuals: Array<Individual> = helpers.readData(process.env.USERS_PATH, [])
    return individuals
  },

  getByEmail (email: string) {
    const individuals: Array<Individual> = helpers.readData(process.env.USERS_PATH, [])
    return lodash.find(individuals, (u) => u.email === email)
  }
}
