// @flow

// Ensure every module is imported here
import { dummyProviderModule, dummyProviderModule2 } from './dummy'
import { configStore } from './../data/config-store'
import type { UserServiceSummary, ServiceProvider } from './../types'

// Ensure every module is included in this array
const modules = [
  dummyProviderModule, dummyProviderModule2
]

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

export async function download (serviceId: 'all' | string) : Promise<Array<UserServiceSummary>> {
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
}

export function getConfigKeys (serviceId: string): ?Array<string> {
  const module = moduleLookup[serviceId]
  if (module) {
    return module.configKeys
  }
}

export function isConfigured (serviceId: string): boolean {
  const config = configStore.get(serviceId)
  return !!config
}
