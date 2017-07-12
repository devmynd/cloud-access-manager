// @flow
import fs from 'file-system'
import * as helpers from './helpers'
import type { WhitelistEntry } from '../types'
import lodash from 'lodash'

process.env.WHITELIST_PATH = process.env.WHITELIST_PATH || './.whitelist.json'

export const whitelistStore = {
  save (whitelistEntry: WhitelistEntry) {
    let whitelist: Array<WhitelistEntry> = helpers.readData(process.env.WHITELIST_PATH, [])
    let existingIndex = lodash.findIndex(whitelist, (entry) => {
      return entry.email === whitelistEntry.email
    })
    if (existingIndex >= 0) {
      whitelist[existingIndex] = whitelistEntry
    } else {
      whitelist.push(whitelistEntry)
    }

    fs.writeFileSync(process.env.WHITELIST_PATH, JSON.stringify(whitelist))
  },

  getAll (): Array<WhitelistEntry> {
    const whitelist: Array<WhitelistEntry> = helpers.readData(process.env.WHITELIST_PATH, [])
    return whitelist
  }
}
