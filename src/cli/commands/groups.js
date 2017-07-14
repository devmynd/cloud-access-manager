// @flow
import { groupStore } from '../../core/data/group-store'
import { terminal as term } from 'terminal-kit'
import { manager } from '../../core/service-providers/manager'
import inquirer from 'inquirer'
import lodash from 'lodash'

export function listGroups () {
  const groups = groupStore.getAll()
  groups.forEach((group) => {
    term.cyan(`${group.name}\n`)
  })
}

export function showGroup (groupName: string) {
  const group = groupStore.get(groupName)
  term.green('Full access to the following services:\n')
  const serviceIds = Object.keys(group.accessRules)

  if (serviceIds.length === 0) {
    term.red('\tNone\n')
    return
  }

  serviceIds.forEach((id) => {
    const serviceName = manager.getDisplayName(id)
    term.cyan(`\t${serviceName}\n`)
  })
}

export async function configureGroup (groupName: string) {
  const group = groupStore.get(groupName)
  const serviceIds = manager.listServiceIds()

  const question = {
    type: 'checkbox',
    name: 'selectedServiceIds',
    choices: serviceIds
      .map((serviceId) => {
        return {
          name: manager.getDisplayName(serviceId),
          value: serviceId,
          checked: group.accessRules[serviceId] === 'full'
        }
      }),
    message: `Grant members full access to which services?`
  }

  const selectedServiceIds = (await inquirer.prompt([question])).selectedServiceIds

  serviceIds.forEach((id) => {
    if (lodash.includes(selectedServiceIds, id)) {
      group.accessRules[id] = 'full'
    } else {
      delete group.accessRules[id]
    }
  })

  groupStore.save(group)
}

export async function deleteGroup (groupName: string) {
  const question = {
    type: 'confirm',
    name: 'confirmed',
    message: `Are you sure you want to delete '${groupName}'?`
  }

  const confirmed = (await inquirer.prompt([question])).confirmed

  if (confirmed) {
    groupStore.deleteGroup(groupName)
  }
}
