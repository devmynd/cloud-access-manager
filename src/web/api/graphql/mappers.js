// @flow
import type { FlaggedInfo, Individual } from '../../../core/types'
import { serviceManager } from '../../../core/service-providers/service-manager'

export function mapFlag (flag: FlaggedInfo) {
  return {
    individual: mapIndividual(flag.individual),
    serviceId: flag.serviceId,
    userIdentity: flag.userIdentity,
    assets: flag.assets
  }
}

export function mapIndividual (individual: ?Individual) {
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
            service: serviceManager.getServiceInfo(serviceId),
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
