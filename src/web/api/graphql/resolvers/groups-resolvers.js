// @flow

import type { AccessRule } from '../../../../core/types'
import { groupStore } from '../../../../core/data/group-store'

export function setGroupAccessRules (args: {
  name: string,
  serviceAccessRules: [{
    serviceId: string,
    accessRules: Array<AccessRule>
  }]
}) {
  const group = groupStore.get(args.name) || { name: args.name, accessRules: {} }
  args.serviceAccessRules.forEach((serviceAccessRuleList) => {
    group.accessRules[serviceAccessRuleList.serviceId] = serviceAccessRuleList.accessRules
  })

  groupStore.save(group)
  return `Group ${group.name} saved successfully!`
}
