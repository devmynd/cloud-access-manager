
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
  // TODO: Is this a reliable way to check if we have all accounts cached? What if we add another service after caching?
  if (accounts.length === 0) {
      accounts = await manager.download('all')
      // TODO: Is there a more appropriate place for this caching logic to live? What is the resolver's primary responsibility?
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
  let userIdentity

  if (args.email) {
    matchOnEmail = true
    userIdentity = { email: args.email }
    matchValue = args.email
  } else if (args.userId) {
    matchOnEmail = false
    userIdentity = { userId: args.userId }
    matchValue = args.userId
  } else {
    throw new Error("Must supply either an email or a userId")
  }

  // TODO: Right now, we know if we have an email or a userId, but when we package it up in a userIdentity, we lose that information.
  // So the accountStore then has to also figure out if it has an email or user id, and what the appropiate field to match on is.
  // What if we had accountStore.getByEmail and accountStore.getByUserId
  let account = accountStore.get(args.serviceId, userIdentity)

  // TODO: If there is not an account already cached, why does the client think it is?
  // Does this scenario represent an error on the client side? If so, how will the client know there was an error?
  // Is it performant on the client to download the entire service to check just one account? And what if we still don't find the account?
  if (!account) {
    const accounts = await manager.download(args.serviceId)
    account = lodash.find(accounts, (a) => matchOnEmail
    ? a.userAccount.identity.email === matchValue
    : a.userAccount.identity.userId === matchValue)
  }

  let flag = new Auditor(individualStore, groupStore).auditAccount(account)
  return flag
    ? mappers.mapFlag(flag)
    : null
}
