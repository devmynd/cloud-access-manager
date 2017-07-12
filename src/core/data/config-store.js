// @flow
import fs from 'file-system'
import * as helpers from './helpers'

process.env.CONFIG_PATH = process.env.CONFIG_PATH || './.services.json'

export const configStore = {
  save: (serviceId: string, config: any) => {
    const data = helpers.readData(process.env.CONFIG_PATH, {})
    data[serviceId] = config
    fs.writeFileSync(process.env.CONFIG_PATH, JSON.stringify(data))
  },

  get: (serviceId: string) => {
    const data = helpers.readData(process.env.CONFIG_PATH, {})
    return data[serviceId]
  }
}
