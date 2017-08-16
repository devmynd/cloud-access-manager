// @flow
import fs from 'file-system'
import * as helpers from './helpers'
import type { UserAccount, UserIdentity } from '../types'
import lodash from 'lodash'

process.env.ACCOUNTS_PATH = process.env.ACCOUNTS_PATH || './.accounts.store.json'

const timeToLiveHours = 12

type AccountCacheEntry = {
  userAccounts: Array<UserAccount>,
  cachedDate: Date
}

type CacheSchema = { [string]: AccountCacheEntry }
const defaultData: CacheSchema = {}

export type AccountCache = {
  set(serviceId: string, userAccounts: Array<UserAccount>): void,
  get(serviceId: string): Array<UserAccount>,
  isCached(serviceId: string): boolean,
  getAccountByEmail(serviceId: string, email: string): ?UserAccount,
  getAccountByUserId(serviceId: string, userId: string): ?UserAccount
}

export const accountCache: AccountCache = {
  set(serviceId: string, userAccounts: Array<UserAccount>) {
    let data: CacheSchema = helpers.readData(process.env.ACCOUNTS_PATH, defaultData)
    data[serviceId] = {
      userAccounts: userAccounts,
      cachedDate: new Date()
    }
    fs.writeFileSync(process.env.ACCOUNTS_PATH, JSON.stringify(data))
  },

  get(serviceId: string): Array<UserAccount> {
    let data: CacheSchema = helpers.readData(process.env.ACCOUNTS_PATH, defaultData)
    return data[serviceId].userAccounts
  },

  isCached(serviceId: string): boolean {
    let data: CacheSchema = helpers.readData(process.env.ACCOUNTS_PATH, defaultData)
    if (data.hasOwnProperty(serviceId)) {
      const ttlMillis = timeToLiveHours * 60 * 60 * 1000
      const now = new Date()
      const cachedDate = data[serviceId].cachedDate
      const expired =  (now - cachedDate > ttlMillis)
      return !expired
    }
    return false
  },

  getAccountByEmail(serviceId: string, email: string) {
    let data: CacheSchema = helpers.readData(process.env.ACCOUNTS_PATH, defaultData)
    if(data.hasOwnProperty(serviceId)) {
      return lodash.find(data[serviceId].userAccounts, (u) => u.identity.email === email)
    }
  },

  getAccountByUserId(serviceId: string, userId: string) {
    let data: CacheSchema = helpers.readData(process.env.ACCOUNTS_PATH, defaultData)
    if(data.hasOwnProperty(serviceId)) {
      return lodash.find(data[serviceId].userAccounts, (u) => u.identity.userId === userId)
    }
  }
}
