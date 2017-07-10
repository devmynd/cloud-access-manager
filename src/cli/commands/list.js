// @flow
import * as serviceProviders from './../../service-providers'
import { terminal as term } from 'terminal-kit'

function print (summaries, displayServices: bool = true) {
  summaries.forEach((summary) => {
    term.green(`${summary.email}`)
    summary.services.forEach((service) => {
      if (displayServices) {
        term.cyan(`\n\t${service.name}`)
      }
      if (service.assets.length > 0) {
        term.magenta(' (')
      }
      term.magenta(service.assets.join(' | '))
      if (service.assets.length > 0) {
        term.magenta(')')
      }
      term('\n')
    })
  })
}

export function listAll () {
  const configuredProviders = serviceProviders.getAllConfiguredProviders()

  serviceProviders.download(configuredProviders).then((summaries) => {
    print(summaries)
  })
}

export const listByService = (serviceName: string) => {
  const provider = serviceProviders.getProvider(serviceName)
  if (!provider) {
    throw new Error(`You have not configured ${serviceName}.`)
  }

  serviceProviders.download([provider]).then((summaries) => {
    print(summaries, false)
  })
}
