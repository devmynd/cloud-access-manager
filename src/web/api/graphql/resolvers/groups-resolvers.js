// @flow

import type { AccessRule, Group } from '../../../../core/types'
import { groupStore } from '../../../../core/data/group-store'
import { manager } from '../../../../core/service-providers/manager'

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
  return mapGroup(group)
}

export function listGroups () {
  const groups = groupStore.getAll()
  return groups.map(mapGroup)
}

export function deleteGroup (args: { name: string }) {
  groupStore.deleteGroup(args.name)
  return `Group ${args.name} deleted!`
}

function mapGroup (group: Group) {
  return {
    name: group.name,
    serviceAccessRules: Object.keys(group.accessRules).map((serviceId) => {
      return {
        service: manager.getServiceInfo(serviceId),
        accessRules: group.accessRules[serviceId]
      }
    })
  }
}
