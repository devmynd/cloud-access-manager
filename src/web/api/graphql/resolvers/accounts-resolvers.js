
// @flow
import { manager } from '../../../../core/service-providers/manager'
import { Auditor } from '../../../../core/auditor'
import { individualStore } from '../../../../core/data/individual-store'
import { groupStore } from '../../../../core/data/group-store'
import type { FlaggedInfo } from '../../../../core/types'

export function listAccounts (args: { serviceId: string }) {
  return manager.download(args.serviceId || 'all')
}

export async function performAudit () {
  const accounts = await manager.download('all')
  const auditor = new Auditor(individualStore, groupStore)
  return accounts.reduce((result, account) => {
    const flag = auditor.auditAccount(account)
    if (flag) {
      result.push({
        individual: mapIndividual(individual),
        serviceId: flag.serviceId,
        userIdentity: flag.userIdentity,
        assets: flag.assets
      })
    }
    return result
  }, [])
}

function mapIndividual(individual: ?Individual) {
  if (individual) {
    return {
      id: individual.id,
      fullName: individual.fullName,
      primaryEmail: individual.primaryEmail,
      serviceUserIdentities: Object.keys(individual.serviceUserIdentities).map((serviceId) => {
        return { serviceId: serviceId, userIdentity: individual.serviceUserIdentities[serviceId] }
      }),
      accessRules: Object.keys(individual.accessRules).map((serviceId) => {
        return {
          service: manager.getServiceInfo(serviceId),
          accessRules: individual.accessRules[serviceId]
        }
      }),
      groups: individual.groups
    }
  } else {
    return null
  }
}
