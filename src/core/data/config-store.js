// @flow
import fs from 'file-system'
import * as helpers from './helpers'

process.env.CONFIG_PATH = process.env.CONFIG_PATH || './.services.store.json'

export const configStore = {
  save (serviceId: string, config: { [string]: string }) {
    const data = helpers.readData(process.env.CONFIG_PATH, {})
    data[serviceId] = config
    fs.writeFileSync(process.env.CONFIG_PATH, JSON.stringify(data))
  },

  remove (serviceId: string) {
    const data = helpers.readData(process.env.CONFIG_PATH, {})
    delete data[serviceId]
    fs.writeFileSync(process.env.CONFIG_PATH, JSON.stringify(data))
  },

  get (serviceId: string) {
    const data = helpers.readData(process.env.CONFIG_PATH, {})
    return data[serviceId]
  },

  configuredServiceIds (): Array<string> {
    const data = helpers.readData(process.env.CONFIG_PATH, {})
    return Object.keys(data)
  }
}
