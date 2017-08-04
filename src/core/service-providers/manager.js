// @flow
import { modules } from './../service-providers/index'
import { configStore } from './../data/config-store'
import type { ServiceProvider, ServiceProviderModule, ServiceInfo, ServiceUserAccount } from './../types'
import lodash from 'lodash'

const moduleLookup = modules.reduce((hash, module) => {
  hash[module.id] = module
  return hash
}, {})

export type Manager = {
  getProvider (serviceId: string): ?ServiceProvider,
  download (serviceId: 'all' | string): Promise<Array<ServiceUserAccount>>,
  getServiceInfos (): Array<ServiceInfo>,
  getServiceInfo (serviceId: string): ?ServiceInfo
}

export const manager: Manager = {
  getProvider (serviceId: string) {
    const config = configStore.get(serviceId)
    if (config) {
      return moduleLookup[serviceId].providerFactory(config)
    }
  },

  async download (serviceId: 'all' | string) {
    const serviceIds = serviceId === 'all' ? Object.keys(moduleLookup) : [serviceId]

    const services: Array<{ serviceId: string, provider: ServiceProvider }> = serviceIds.reduce((providers, id) => {
      const provider = this.getProvider(id)
      if (provider) {
        providers.push({ serviceId: id, provider: provider })
      }
      return providers
    }, [])

    const promises: Array<Promise<Array<ServiceUserAccount>>> = services.map(async (service) => {
      const accounts = await service.provider.listAccounts()
      return accounts.map((a) => { return { serviceId: service.serviceId, userAccount: a } })
    })

    const userAccountLists: Array<Array<ServiceUserAccount>> = await Promise.all(promises)

    let flattenedArray = []

    userAccountLists.forEach((list) => {
      flattenedArray = flattenedArray.concat(list)
    })

    return flattenedArray
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
      configKeys: module.configKeys
    }
  }
}
