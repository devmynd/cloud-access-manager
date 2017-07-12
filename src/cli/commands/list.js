// @flow
import * as serviceProvidersModule from './../../core/service-providers'
import { terminal as term } from 'terminal-kit'

function print (summaries, displayServices: bool = true) {
  summaries.sort((lhs, rhs) => lhs.email < rhs.email ? 0 : 1)
  summaries.forEach((summary) => {
    term.green(`${summary.email}`)
    summary.services.forEach((service) => {
      if (displayServices) {
        term.cyan(`\n\t${service.displayName}`)
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
  const summaries = await serviceProvidersModule.download('all')
  print(summaries)
}

export async function listByService (serviceId: string) {
  if (!serviceProvidersModule.isConfigured(serviceId)) {
    term.red(`Service '${serviceId}' is not configured. Run 'cam config ${serviceId}'\n`)
    return
  }

  const summaries = await serviceProvidersModule.download(serviceId)
  print(summaries, false)
}
