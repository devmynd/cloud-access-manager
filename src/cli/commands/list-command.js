// @flow
import { manager } from './../../core/service-providers/manager'
import { terminal as term } from 'terminal-kit'
import type { ServiceUserAccount } from '../../core/types'

function printSummaries (accounts: Array<ServiceUserAccount>) {
  accounts.sort((lhs, rhs) => lhs.serviceId < rhs.serviceId ? 0 : 1)

  let serviceId = ''
  accounts.forEach((account) => {
    if (account.serviceId !== serviceId) {
      serviceId = account.serviceId
      term.cyan(`\n${serviceId}\n`)
    }
    const userAccount = account.userAccount
    const userIdentity = userAccount.identity.email || userAccount.identity.userId || userAccount.identity.fullName || ''
    term.green(`\t${userIdentity}\n`)
    userAccount.assets.forEach((asset) => {
      term.magenta(`\t\t${asset.name}\t`)
      if (asset.role) {
        term.yellow(`${asset.role}\n`)
      }
    })
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
