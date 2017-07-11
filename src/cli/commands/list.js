// @flow
import * as serviceProvidersModule from './../../core/service-providers'
import { terminal as term } from 'terminal-kit'

function print (summaries, displayServices: bool = true) {
  summaries.sort((lhs, rhs) => lhs.email < rhs.email ? 0 : 1)
  summaries.forEach((summary) => {
    term.green(`${summary.email}`)
    summary.services.forEach((service) => {
      if (displayServices) {
        term.cyan(`\n\t${service.name}`)
      }
      if (service.assets.length > 0) {
        term.magenta('\n\t\t')
      }
      term.magenta(service.assets.join('\n\t\t'))
      term('\n')
    })
  })
}

export async function listAll () {
  const configuredProviders = serviceProvidersModule.getAllConfiguredProviders()

  const summaries = await serviceProvidersModule.download(configuredProviders)
  print(summaries)
}

export async function listByService (serviceName: string) {
  const provider = serviceProvidersModule.getProvider(serviceName)
  if (!provider) {
    throw new Error(`You have not configured ${serviceName}.`)
  }

  const summaries = await serviceProvidersModule.download([provider])
  print(summaries, false)
}
