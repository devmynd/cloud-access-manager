// @flow
import type { Group } from './../types'
import fs from 'file-system'
import * as helpers from './helpers'

process.env.GROUPS_PATH = process.env.GROUPS_PATH || './.groups.store.json'

const defaultGroup: Group = {
  name: 'employee',
  accessRules: {}
}

export const groupStore = {
  save (group: Group) {
    const data = helpers.readData(process.env.GROUPS_PATH, defaultGroup)
    data[group.name] = group.accessRules
    fs.writeFileSync(process.env.GROUPS_PATH, JSON.stringify(data))
  },

  get (groupName: string): Group {
    const data = helpers.readData(process.env.GROUPS_PATH, defaultGroup)
    return { name: groupName, accessRules: data[groupName] }
  }
}
