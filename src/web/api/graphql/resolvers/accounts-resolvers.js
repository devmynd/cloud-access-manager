
// @flow
import { serviceManager } from '../../../../core/service-providers/service-manager'
import { Auditor } from '../../../../core/auditor'
import { individualStore } from '../../../../core/data/individual-store'
import { groupStore } from '../../../../core/data/group-store'
import { accountCache } from '../../../../core/data/account-cache'
import * as mappers from '../mappers'

const auditor = new Auditor(individualStore, groupStore)

export async function auditService (args: { serviceId: string }) {
  const serviceAccounts = await serviceManager.getAccountsForService(args.serviceId)

  let flags = []

  serviceAccounts.forEach((account) => {
    const flag = auditor.auditAccount(args.serviceId, account)
    if (flag) {
      flags.push(mappers.mapFlag(flag))
    }
  })

  return flags
}

export async function auditServiceUserAccount (args: { serviceId: string, email: ?string, userId: ?string }) {
  let account

  if (args.email) {
    account = accountCache.getAccountByEmail(args.serviceId, args.email)
  } else if (args.userId) {
    account = accountCache.getAccountByUserId(args.serviceId, args.userId)
  } else {
    throw new Error('Must supply either an email or a userId')
  }

  if (!account) {
    throw new Error('Account not found. Is the client data out of sync?')
  }

  let flag = auditor.auditAccount(args.serviceId, account)
  return flag
    ? mappers.mapFlag(flag)
    : null
}
