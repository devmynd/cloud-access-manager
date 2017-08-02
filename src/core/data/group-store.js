// @flow
import type { Group, ServiceAccessHash } from './../types'
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
  get (groupName: string): Group,
  getAll (): Array<Group>,
  deleteGroup (groupName: string): void
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
    return { name: groupName, accessRules: data[groupName] || {} }
  },

  getAll () {
    const data = loadData()
    return Object.keys(data).map((groupName) => {
      return { name: groupName, accessRules: data[groupName] }
    })
  },

  deleteGroup (groupName: string) {
    const data = loadData()
    delete data[groupName]
    fs.writeFileSync(process.env.GROUPS_PATH, JSON.stringify(data))
  }
}
