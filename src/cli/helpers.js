// @flow
import type { UserServiceSummary } from '../core/types'
import { terminal as term } from 'terminal-kit'

export function printSummaries (summaries: Array<UserServiceSummary>, displayServices: bool = true) {
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
