// @flow
import fs from 'file-system'
import * as helpers from './helpers'
import type { UserAccount } from '../types'
import lodash from 'lodash'

process.env.ACCOUNTS_PATH = process.env.ACCOUNTS_PATH || './.accounts.store.json'

const timeToLiveHours = 12

type AccountCacheEntry = {
  userAccounts: Array<UserAccount>,
  cachedDate: string
}

type CacheSchema = { [string]: AccountCacheEntry }

export type AccountCache = {
  set(serviceId: string, userAccounts: Array<UserAccount>, asOfDate?: Date): void,
  get(serviceId: string): Array<UserAccount>,
  isCached(serviceId: string): boolean,
  getCachedDate(serviceId: string): ?Date,
  getAccountByEmail(serviceId: string, email: string): ?UserAccount,
  getAccountByUserId(serviceId: string, userId: string): ?UserAccount
}

export const accountCache: AccountCache = {
  set (serviceId: string, userAccounts: Array<UserAccount>, asOfDate?: Date) {
    let data: CacheSchema = helpers.readData(process.env.ACCOUNTS_PATH, {})
    data[serviceId] = {
      userAccounts: userAccounts,
      cachedDate: (asOfDate || new Date()).toString()
    }
    fs.writeFileSync(process.env.ACCOUNTS_PATH, JSON.stringify(data))
  },

  get (serviceId: string): Array<UserAccount> {
    let data: CacheSchema = helpers.readData(process.env.ACCOUNTS_PATH, {})
    return data.hasOwnProperty(serviceId)
      ? data[serviceId].userAccounts
      : []
  },

  isCached (serviceId: string): boolean {
    return !!this.getCachedDate(serviceId)
  },

  getCachedDate (serviceId): ?Date {
    let data: CacheSchema = helpers.readData(process.env.ACCOUNTS_PATH, {})
    if (data.hasOwnProperty(serviceId)) {
      let cachedDate = new Date(data[serviceId].cachedDate)
      const ttlMillis = timeToLiveHours * 60 * 60 * 1000
      const now = new Date()
      const expired = (now - cachedDate > ttlMillis)
      return expired ? null : cachedDate
    }
    return null
  },

  getAccountByEmail (serviceId: string, email: string) {
    let data: CacheSchema = helpers.readData(process.env.ACCOUNTS_PATH, {})
    if (data.hasOwnProperty(serviceId)) {
      return lodash.find(data[serviceId].userAccounts, (u) => u.identity.email === email)
    }
  },

  getAccountByUserId (serviceId: string, userId: string) {
    let data: CacheSchema = helpers.readData(process.env.ACCOUNTS_PATH, {})
    if (data.hasOwnProperty(serviceId)) {
      return lodash.find(data[serviceId].userAccounts, (u) => u.identity.userId === userId)
    }
  }
}
