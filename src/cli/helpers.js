// @flow
import { terminal as term } from 'terminal-kit'

export function printSummaries (accounts: Array<any>, displayServices: bool = true) {
  accounts.sort((lhs, rhs) => lhs.email < rhs.email ? 0 : 1)
  accounts.forEach((account) => {
    term.green(`${account.email}`)
    account.assetAssignments.forEach((assetAssignment) => {
      if (displayServices) {
        term.cyan(`\n\t${assetAssignment.service.id}`)
      }

      assetAssignment.assets.forEach((asset) => {
        term.magenta(`\n\t\t${asset.name} `)
        if (asset.role) {
          term.yellow(`(${asset.role})`)
        }
      })
      term('\n')
    })
  })
}
