// @flow
import * as serviceProvidersModule from './../../core/service-providers'
import { terminal as term } from 'terminal-kit'

export async function audit () {
  const providers = serviceProvidersModule.getAllConfiguredProviders()
  const summaries = await serviceProvidersModule.download(providers)

  console.log(summaries)
  term('Todo: pass whitelist and summaries to auditor')
}
