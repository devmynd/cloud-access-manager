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

  // TODO: is there a use case that requires us to save one at a time? Would it be more efficient to save an array of accoutns?
  save(account: ServiceUserAccount) {
    // TODO: is this the ideal structure for storing and accessing the data?
    // How would access change if we stored it like: { [serviceId]: [UserAccount] }
    // How would it affect the getall method? How would it affect sorting?
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
    // TODO: confirm use case for this.
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
