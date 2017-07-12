// @flow
import * as serviceProvidersModule from './../../core/service-providers'
import { terminal as term } from 'terminal-kit'
import * as auditor from './../../core/auditor'
import * as helpers from '../helpers'

export async function audit () {
  const summaries = await serviceProvidersModule.download('all')

  const temporaryFakeWhitelist = [{
    email: 'shamyle@devmynd.com',
    services: [{
      id: 'dummy',
      access: 'full'
    }]
  }, {
    email: 'ty@devmynd.com',
    services: [{
      id: 'dummy',
      access: ['Project B']
    }]
  }]

  const flaggedSummaries = auditor.performAudit(summaries, temporaryFakeWhitelist)
  term.red('The following users have been flagged:\n\n')
  helpers.printSummaries(flaggedSummaries)
}
