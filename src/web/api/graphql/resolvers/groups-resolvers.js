// @flow

import type { AccessRule, Group } from '../../../../core/types'
import { groupStore } from '../../../../core/data/group-store'
import { serviceManager } from '../../../../core/service-providers/service-manager'
import { mapGroup } from '../mappers'

export function setGroupAccessRules (args: {
  name: string,
  serviceAccessRules: [{
    serviceId: string,
    accessRules: Array<AccessRule>
  }]
}) {
  const group = groupStore.get(args.name) || { name: args.name, accessRules: {} }
  const newAccessRules = {}
  args.serviceAccessRules.forEach((serviceAccessRuleList) => {
    newAccessRules[serviceAccessRuleList.serviceId] = serviceAccessRuleList.accessRules
  })
  group.accessRules = newAccessRules
  groupStore.save(group)
  return `Group ${group.name} saved successfully!`
}

export function getGroup (args: {name: string}) {
  const group = groupStore.get(args.name)
  if (group) { return mapGroup(group) }
}

export function listGroups () {
  const groups = groupStore.getAll()
  return groups.map(mapGroup)
}

export function deleteGroup (args: { name: string }) {
  groupStore.delete(args.name)
  return `Group ${args.name} deleted!`
}
