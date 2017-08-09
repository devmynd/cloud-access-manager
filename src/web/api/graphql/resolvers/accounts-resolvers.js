
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
      const individual = flag.individual ? mapIndividualInFlag(flag) : null
      result.push({
        individual: individual,
        serviceId: flag.serviceId,
        userIdentity: flag.userIdentity,
        assets: flag.assets
      })
    }
    return result
  }, [])
}

function mapIndividualInFlag(flag: FlaggedInfo) {
  let individual: any = flag.individual
  const serviceUserIdentities = individual.serviceUserIdentities
  individual.serviceUserIdentities = Object.keys(serviceUserIdentities).map((serviceId) => {
    return { serviceId: serviceId, userIdentity: serviceUserIdentities[serviceId] }
  })

  individual.accessRules = Object.keys(individual.accessRules).map((serviceId) => {
    return {
      service: manager.getServiceInfo(serviceId),
      accessRules: individual.accessRules[serviceId]
    }
  })

  return individual
}
