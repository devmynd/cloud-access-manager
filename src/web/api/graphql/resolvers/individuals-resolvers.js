// @flow

import type { AccessRule } from '../../../../core/types'
import { individualStore } from '../../../../core/data/individual-store'

export function addAccessRules (args: {
  email: string,
  serviceAccessRules: [{
    serviceId: string,
    accessRules: Array<AccessRule>
  }]
}) {
  let individual = individualStore.getByEmail(args.email)

  args.serviceAccessRules.forEach((serviceAccessRuleList) => {
    const existingRules = individual.accessRules[serviceAccessRuleList.serviceId] || []
    individual.accessRules[serviceAccessRuleList.serviceId] = existingRules.concat(serviceAccessRuleList.accessRules)
  })

  individualStore.save(individual)
  return 'rules added successfully'
}
