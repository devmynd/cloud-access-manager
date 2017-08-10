
// @flow
import { manager } from '../../../../core/service-providers/manager'
import { Auditor } from '../../../../core/auditor'
import { individualStore } from '../../../../core/data/individual-store'
import { groupStore } from '../../../../core/data/group-store'
import type { FlaggedInfo, Individual } from '../../../../core/types'
import lodash from 'lodash'

export function listAccounts (args: { serviceId: string }) {
  return manager.download(args.serviceId || 'all')
}

export async function performAudit () {
  const accounts = await manager.download('all')
  const auditor = new Auditor(individualStore, groupStore)
  return accounts.reduce((result, account) => {
    const flag = auditor.auditAccount(account)
    if (flag) {
      result.push(mapFlag(flag))
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
    ? mapFlag(flag)
    : null
}

function mapFlag(flag: FlaggedInfo) {
  return {
    individual: mapIndividual(flag.individual),
    serviceId: flag.serviceId,
    userIdentity: flag.userIdentity,
    assets: flag.assets
  }
}

function mapIndividual(individual: ?Individual) {
  if (individual && individual.serviceUserIdentities) {
    return {
      id: individual.id,
      fullName: individual.fullName,
      primaryEmail: individual.primaryEmail,
      serviceUserIdentities: Object.keys(individual.serviceUserIdentities).map((serviceId) => {
        if (individual && individual.serviceUserIdentities) {
          return { serviceId: serviceId, userIdentity: individual.serviceUserIdentities[serviceId] }
        }
      }),
      accessRules: Object.keys(individual.accessRules).map((serviceId) => {
        if (individual && individual.accessRules) {
          return {
            service: manager.getServiceInfo(serviceId),
            accessRules: individual.accessRules[serviceId]
          }
        }
      }),
      groups: individual.groups
    }
  } else {
    return null
  }
}
