// @flow
import fs from 'file-system'
import * as helpers from './helpers'
import type {Individual, UserIdentity} from '../types'
import lodash from 'lodash'

process.env.INDIVIDUALS_PATH = process.env.INDIVIDUALS_PATH || './.individuals.store.json'

export type IndividualStore = {
  save(user : Individual): void,
  getAll(): Array < Individual >,
  getByFuzzySearch(search : string): Array < Individual >,
  getById(id : string): Individual,
  getByServiceUserIdentity(serviceId : string, userIdentity : UserIdentity):
    ? Individual
}

export const individualStore : IndividualStore = {
  save(individual : Individual) {
    let individuals : Array < Individual > = helpers.readData(process.env.INDIVIDUALS_PATH, [])
    let existingIndex = lodash.findIndex(individuals, (entry) => {
      return entry.id === individual.id
    })
    if (existingIndex >= 0) {
      individuals[existingIndex] = individual
    } else {
      individuals.push(individual)
    }

    fs.writeFileSync(process.env.INDIVIDUALS_PATH, JSON.stringify(individuals))
  },

  getAll() {
    const individuals : Array < Individual > = helpers.readData(process.env.INDIVIDUALS_PATH, [])
    return individuals
  },

  getByFuzzySearch(search : string) {
    search = search.trim().toLowerCase()
    let individuals = this.getAll()
    return individuals.filter((i) => {
      if (i.primaryEmail) {
        return i.primaryEmail.toLowerCase().includes(search)
      } else {
        return i.fullName.toLowerCase().includes(search)
      }
    })
  },

  getById(id : string) {
    const individuals : Array < Individual > = helpers.readData(process.env.INDIVIDUALS_PATH, [])
    const individual = lodash.find(individuals, (i) => i.id === id)
    if (individual) {
      return individual
    }
    throw new Error(`No individual exists with id: '${id}'`)
  },

  getByServiceUserIdentity(serviceId : string, userIdentity : UserIdentity) {
    const individuals : Array < Individual > = helpers.readData(process.env.INDIVIDUALS_PATH, [])
    if (userIdentity.email) {
      return lodash.find(individuals, (u) => {
        if (u.primaryEmail === userIdentity.email) {
          return true
        } else if (u.serviceUserIdentities[serviceId]) {
          return u.serviceUserIdentities[serviceId].email === userIdentity.email
        }
      })
    } else if (userIdentity.userId) {
      return lodash.find(individuals, (u) => {
        const identity = u.serviceUserIdentities[serviceId]
        return identity
          ? identity.userId === userIdentity.userId
          : false
      })
    }
    throw new Error('Cannot match a service account that has no email or userId')
  }
}
