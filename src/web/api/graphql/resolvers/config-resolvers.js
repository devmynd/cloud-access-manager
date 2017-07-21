// @flow

import { configStore } from '../../../../core/data/config-store'
import { manager } from '../../../../core/service-providers/manager'

export function configKeys (args: { serviceId: string }) {
  return manager.getConfigKeys(args.serviceId)
}

export async function configureService (args: { serviceId: string, configJson: string }) {
  const config = JSON.parse(args.configJson)
  configStore.save(args.serviceId, config)
  let provider = manager.getProvider(args.serviceId)
  if (provider) {
    await provider.testConnection()
    return `${args.serviceId} configured!`
  }
}

export function listServices (isConfigured: ?boolean) {
  manager.listServiceIds()
}
