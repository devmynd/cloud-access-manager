
// @flow
import { manager } from '../../../../core/service-providers/manager'
import { Auditor } from '../../../../core/auditor'
import { individualStore } from '../../../../core/data/individual-store'
import { groupStore } from '../../../../core/data/group-store'
import { accountStore } from '../../../../core/data/account-store'
import * as mappers from '../mappers'
import lodash from 'lodash'

export function listAccounts (args: { serviceId: string }) {
  return manager.download(args.serviceId || 'all')
}

export async function performAudit () {
  let accounts
  accounts = accountStore.getAll()
  if (accounts.length === 0) {
      accounts = await manager.download('all')
      accounts.forEach((account) => {
        accountStore.save(account)
      })
  }
  const auditor = new Auditor(individualStore, groupStore)
  return accounts.reduce((result, account) => {
    const flag = auditor.auditAccount(account)
    if (flag) {
      result.push(mappers.mapFlag(flag))
    }
    return result
  }, [])
}

export async function auditServiceUserAccount (args: { serviceId: string, email: ?string, userId: ?string }) {
  let matchOnEmail
  let matchValue
  if (args.email) {
    matchOnEmail = true
    matchValue = args.email
  } else if (args.userId) {
    matchOnEmail = false
    matchValue = args.userId
  } else {
    throw new Error("Must supply either an email or a userId")
  }

  // TODO: replace this inefficient method with finding hte account in a local cache
  const accounts = await manager.download(args.serviceId)
  const account = lodash.find(accounts, (a) => matchOnEmail
      ? a.userAccount.identity.email === matchValue
      : a.userAccount.identity.userId === matchValue)

  let flag = new Auditor(individualStore, groupStore).auditAccount(account)
  return flag
    ? mappers.mapFlag(flag)
    : null
}
