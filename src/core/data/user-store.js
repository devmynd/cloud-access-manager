// @flow
import fs from 'file-system'
import * as helpers from './helpers'
import type { User } from '../types'
import lodash from 'lodash'

process.env.USERS_PATH = process.env.USERS_PATH || './.users.store.json'

export type UserStore = {
  save (user: User): void,
  getAll (): Array<User>,
  getByEmail (email: string): User
}

export const userStore: UserStore = {
  save (user: User) {
    let users: Array<User> = helpers.readData(process.env.USERS_PATH, [])
    let existingIndex = lodash.findIndex(users, (entry) => {
      return entry.email === user.email
    })
    if (existingIndex >= 0) {
      users[existingIndex] = user
    } else {
      users.push(user)
    }

    fs.writeFileSync(process.env.USERS_PATH, JSON.stringify(users))
  },

  getAll () {
    const users: Array<User> = helpers.readData(process.env.USERS_PATH, [])
    return users
  },

  getByEmail (email: string) {
    const users: Array<User> = helpers.readData(process.env.USERS_PATH, [])
    return lodash.find(users, (u) => u.email === email)
  }
}
