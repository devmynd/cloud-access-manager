// @flow
import fs from 'file-system'
import * as helpers from './helpers'
import type {ServiceUserAccount, UserIdentity} from '../types'
import lodash from 'lodash'

process.env.ACCOUNTS_PATH = process.env.ACCOUNTS_PATH || './.accounts.store.json'

export type AccountStore = {
  save(account: ServiceUserAccount): void,
  getAll(): Array<ServiceUserAccount>,
  get(serviceId: string, userIdentity: UserIdentity): ?ServiceUserAccount
}

export const accountStore: AccountStore = {
  save(account: ServiceUserAccount) {
    let accounts : Array<ServiceUserAccount> = helpers.readData(process.env.ACCOUNTS_PATH, [])
    let existingIndex = lodash.findIndex(accounts, (entry) => {
      return entry.serviceId === account.serviceId && lodash.isEqual(entry.userAccount.identity, account.userAccount.identity)
    })

    if (existingIndex >= 0) {
      accounts[existingIndex] = account
    } else {
      accounts.push(account)
    }

    fs.writeFileSync(process.env.ACCOUNTS_PATH, JSON.stringify(accounts))
  },

  getAll() {
      const accounts: Array<ServiceUserAccount> = helpers.readData(process.env.ACCOUNTS_PATH, [])
      return accounts
  },

  get(serviceId: string, userIdentity: UserIdentity) {
    const accounts : Array<ServiceUserAccount> = helpers.readData(process.env.ACCOUNTS_PATH, [])
    const account = lodash.find(accounts, (a) => {
      return a.serviceId === serviceId && lodash.isEqual(a.userAccount.identity, userIdentity)
    })
    if (account) {
      return account
    }
    return null
  }
}
