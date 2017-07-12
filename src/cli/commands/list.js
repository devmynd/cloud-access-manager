// @flow
import * as serviceProvidersModule from '../../core/service-providers'
import { terminal as term } from 'terminal-kit'
import * as helpers from '../helpers'

export async function listAll () {
  const summaries = await serviceProvidersModule.download('all')
  helpers.printSummaries(summaries)
}

export async function listByService (serviceId: string) {
  if (!serviceProvidersModule.isConfigured(serviceId)) {
    term.red(`Service '${serviceId}' is not configured. Run 'cam config ${serviceId}'\n`)
    return
  }

  const summaries = await serviceProvidersModule.download(serviceId)
  helpers.printSummaries(summaries, false)
}
