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

      service.assets.forEach((asset) => {
        term.magenta(`\n\t\t${asset.name} `)
        if (asset.role) {
          term.yellow(`(${asset.role})`)
        }
      })
      term('\n')
    })
  })
}
