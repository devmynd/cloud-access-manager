// @flow

import { configStore } from '../../../../core/data/config-store'
import { manager } from '../../../../core/service-providers/manager'

export async function configureService (args: { serviceId: string, configJson: string }) {
  const config = JSON.parse(args.configJson)
  configStore.save(args.serviceId, config)
  let provider = manager.getProvider(args.serviceId)
  if (provider) {
    try {
      await provider.testConnection()
    } catch (error) {
      configStore.remove(args.serviceId)
      throw error
    }
    return `${args.serviceId} configured!`
  }
}

export function disableService (args: { serviceId: string }) {
  configStore.remove(args.serviceId)
  return `${args.serviceId} disabled!`
}

export function listServices (args: { isConfigured: ?boolean }) {
  const serviceInfos = manager.getServiceInfos()
  if (typeof (args.isConfigured) === 'undefined') {
    return serviceInfos
  }
  return serviceInfos.filter((info) => info.isConfigured === args.isConfigured)
}
