// @flow
import type { UserAccountAggregate } from '../core/types'
import { terminal as term } from 'terminal-kit'

export function printSummaries (accounts: Array<UserAccountAggregate>, displayServices: bool = true) {
  accounts.sort((lhs, rhs) => lhs.email < rhs.email ? 0 : 1)
  accounts.forEach((account) => {
    term.green(`${account.email}`)
    account.services.forEach((service) => {
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
