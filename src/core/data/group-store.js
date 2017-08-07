// @flow
import type { Group, ServiceAccessHash, AccessRule } from './../types'
import fs from 'file-system'
import * as helpers from './helpers'

process.env.GROUPS_PATH = process.env.GROUPS_PATH || './.groups.store.json'

type GroupDataModel = { [string]: ServiceAccessHash }

const defaultData: GroupDataModel = { 'Employees': {} }
function loadData (): GroupDataModel {
  return helpers.readData(process.env.GROUPS_PATH, defaultData)
}

export type GroupStore = {
  save (group: Group): void,
  exists (groupName: string): boolean,
  get (groupName: string): ?Group,
  getAll (): Array<Group>,
  delete (groupName: string): void,
  getAccessRules(groupName: string, serviceId: string): Array<AccessRule>
}

export const groupStore: GroupStore = {
  save (group: Group) {
    const data = loadData()
    data[group.name] = group.accessRules
    fs.writeFileSync(process.env.GROUPS_PATH, JSON.stringify(data))
  },

  exists (groupName: string) {
    const data = loadData()
    return data.hasOwnProperty(groupName)
  },

  get (groupName: string) {
    const data = loadData()
    if (data.hasOwnProperty(groupName)) {
      return { name: groupName, accessRules: data[groupName] }
    }
    return null
  },

  getAll () {
    const data = loadData()
    return Object.keys(data).map((groupName) => {
      return { name: groupName, accessRules: data[groupName] }
    })
  },

  delete (groupName: string) {
    const data = loadData()
    delete data[groupName]
    fs.writeFileSync(process.env.GROUPS_PATH, JSON.stringify(data))
  },

  getAccessRules (groupName: string, serviceId: string) {
    const group = this.get(groupName)
    if (group) {
      return group.accessRules[serviceId] || []
    }
    return []
  }

}
