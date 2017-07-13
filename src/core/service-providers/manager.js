// @flow
import { modules } from './../service-providers/index'
import { configStore } from './../data/config-store'
import type { ServiceProvider } from './../types'

const moduleLookup = modules.reduce((hash, module) => {
  hash[module.id] = module
  return hash
}, {})

function getProvider (serviceId: string): ?ServiceProvider {
  const config = configStore.get(serviceId)
  if (config) {
    return moduleLookup[serviceId].providerFactory(config)
  }
}

export const manager = {
  download: async (serviceId: 'all' | string) => {
    const serviceIds = serviceId === 'all' ? Object.keys(moduleLookup) : [serviceId]

    const services: Array<{ serviceId: string, provider: ServiceProvider }> = serviceIds.reduce((providers, id) => {
      const provider = getProvider(id)
      if (provider) {
        providers.push({ serviceId: id, provider: provider })
      }
      return providers
    }, [])

    const promises = services.map(async (service) => {
      const accounts = await service.provider.listAccounts()
      return {
        serviceId: service.serviceId,
        accounts: accounts }
    })

    const serviceAccountLists = await Promise.all(promises)

    const userSummaryLookup = serviceAccountLists.reduce((userSummaryLookup, serviceAccountList) => {
      serviceAccountList.accounts.forEach((account) => {
        let userServiceSummary = userSummaryLookup[account.email] || { email: account.email, services: [] }
        userServiceSummary.services.push({
          id: serviceAccountList.serviceId,
          displayName: moduleLookup[serviceAccountList.serviceId].displayName,
          assets: account.assets })
        userSummaryLookup[account.email] = userServiceSummary
      })
      return userSummaryLookup
    }, {})

    return Object.keys(userSummaryLookup).map((key) => userSummaryLookup[key])
  },

  getConfigKeys: (serviceId: string) => {
    const module = moduleLookup[serviceId]
    if (module) {
      return module.configKeys
    }
  },

  isConfigured: (serviceId: string) => {
    const config = configStore.get(serviceId)
    return !!config
  },

  listServiceIds: () => {
    return Object.keys(moduleLookup)
  }
}
