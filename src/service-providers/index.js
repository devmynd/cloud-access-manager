// @flow

// Ensure every module is imported here and included in the `modules` hash below
import { dummyProviderModule } from './dummy'
import { configStore } from './../data/config-store'
import type { UserServiceSummary } from './../types/user-service-summary'
import type { ServiceProvider } from './../types/service-provider'

export const modules = {
  'dummy': dummyProviderModule
}

export function getConfigKeys (serviceName: string): ?Array<string> {
  const module = modules[serviceName]
  if (module) {
    return module.configKeys
  }
}

export function getAllConfiguredProviders (): Array<ServiceProvider> {
  return Object.keys(modules).reduce((serviceProviders, serviceName) => {
    const provider = getProvider(serviceName)
    if (provider) {
      serviceProviders.push(provider)
    }
    return serviceProviders
  }, [])
}

export function getProvider (serviceName: string): ?ServiceProvider {
  const config = configStore.get(serviceName)
  if (config) {
    return modules[serviceName].providerFactory(config)
  }
}

export function download (serviceProviders: Array<ServiceProvider>) : Promise<Array<UserServiceSummary>> {
  const promises = serviceProviders.map((provider) =>
    new Promise((resolve, reject) => {
      provider.listAccounts().then(
        (accounts) => {
          resolve({ serviceName: provider.serviceName, accounts: accounts })
        },
        (error) => {
          reject(error)
        })
    })
  )

  return new Promise((resolve, reject) => {
    Promise.all(promises).then((serviceAccountLists) => {
      const userSummaryLookup = serviceAccountLists.reduce((userSummaryLookup, serviceAccountList) => {
        serviceAccountList.accounts.forEach((account) => {
          let userServiceSummary = userSummaryLookup[account.email] || { email: account.email, services: [] }
          userServiceSummary.services.push({ name: serviceAccountList.serviceName, assets: account.assets })
          userSummaryLookup[account.email] = userServiceSummary
        })
        return userSummaryLookup
      }, {})
      const summaries = Object.keys(userSummaryLookup).map((key) => userSummaryLookup[key])
      resolve(summaries)
    })
  })
}
