// @flow
import { manager } from './../../core/service-providers/manager'
import { terminal as term } from 'terminal-kit'
import type { ServiceUserAccount } from '../../core/types'

function printSummaries (accounts: Array<ServiceUserAccount>) {
  accounts.sort((lhs, rhs) => lhs.serviceId < rhs.serviceId ? 0 : 1)

  let accountLookup = accounts.reduce((accountLookup, account) => {
    accountLookup[account.serviceId] = (accountLookup[account.serviceId] || []).concat(account)
    return accountLookup
  }, {})

  Object.keys(accountLookup).forEach((serviceId) => {
    term.cyan(`\n${serviceId}\n`)
    accountLookup[serviceId].forEach((account) => {
      const userAccount = account.userAccount
      const userIdentity = userAccount.identity.email ? userAccount.identity.email : userAccount.identity.userId
      term.green(`\t${userIdentity}\n`)
      userAccount.assets.forEach((asset) => {
        term.magenta(`\t\t${asset.name}\t`)
        if (asset.role) {
          term.yellow(`${asset.role}\n`)
        }
      })
    })
    term(`\n\n`)
  })
}

export async function listAll () {
  const summaries = await manager.download('all')
  printSummaries(summaries)
}

export async function listByService (serviceId: string) {
  const serviceInfo = manager.getServiceInfo(serviceId)
  if (serviceInfo) {
    if (!serviceInfo.isConfigured) {
      term.red(`Service '${serviceId}' is not configured. Run 'cam config ${serviceId}'\n`)
      return
    }
    const summaries = await manager.download(serviceId)
    printSummaries(summaries)
  } else {
    term.red(`Invalid service id\n`)
  }
}
