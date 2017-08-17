// @flow
import { modules } from './../service-providers/index'
import { configStore } from './../data/config-store'
import { accountCache } from './../data/account-cache'
import type { ServiceProvider, ServiceProviderModule, ServiceInfo, UserAccount } from './../types'
import lodash from 'lodash'

const moduleLookup = modules.reduce((hash, module) => {
  hash[module.id] = module
  return hash
}, {})

export type ServiceManager = {
  getProvider (serviceId: string): ?ServiceProvider,
  getAccountsForService(serviceId: string): Promise<Array<UserAccount>>,
  getServiceInfos (): Array<ServiceInfo>,
  getServiceInfo (serviceId: string): ?ServiceInfo
}

export const serviceManager: ServiceManager = {
  getProvider (serviceId: string) {
    const config = configStore.get(serviceId)
    if (config) {
      return moduleLookup[serviceId].providerFactory(config)
    }
  },

  async getAccountsForService (serviceId: string): Promise<Array<UserAccount>> {
    let accounts
    if (accountCache.isCached(serviceId)) {
      accounts = accountCache.get(serviceId)
    } else {
      const provider = this.getProvider(serviceId)
      accounts = await provider.listAccounts()
      accountCache.set(serviceId, accounts)
    }
    return accounts
  },

  getServiceInfo (serviceId: string): ?ServiceInfo {
    const module = moduleLookup[serviceId]
    if (module) {
      return this._mapToServiceInfo(module, !!configStore.get(serviceId))
    }
  },

  getServiceInfos (): Array<ServiceInfo> {
    const configuredServiceIds = configStore.configuredServiceIds()
    return Object.keys(moduleLookup).map((serviceId) => {
      const module = moduleLookup[serviceId]
      return this._mapToServiceInfo(module, lodash.includes(configuredServiceIds, serviceId))
    })
  },

  _mapToServiceInfo (module: ServiceProviderModule, configured: boolean): ServiceInfo {
    return {
      id: module.id,
      displayName: module.displayName,
      roles: module.roles,
      isConfigured: configured,
      isCached: accountCache.isCached(module.id),
      configKeys: module.configKeys
    }
  }
}
