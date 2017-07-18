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

  serviceIds.forEach((serviceId) => {
    const serviceName = manager.getDisplayName(serviceId)
    term.cyan(`\t${serviceName}`)
    if (group.accessRules.hasOwnProperty(serviceId)) {
      term.yellow(' (')
      term.yellow(
        group.accessRules[serviceId]
          .filter((rule) => rule.asset === '*')
          .map((rule) => rule.role)
          .join(','))
      term.yellow(')')
    }
    term('\n')
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
          checked: !!lodash.find(group.accessRules[serviceId], (accessRule) => accessRule.asset === '*')
        }
      }),
    message: `Grant members full access to which services?`
  }

  const selectedServiceIds = (await inquirer.prompt([question])).selectedServiceIds
  let newAccessRules = {}


  for (let i = 0; i < selectedServiceIds.length; i++) {
    let serviceId = selectedServiceIds[i]
    let allowedRoles = []
    if(manager.hasRoles(serviceId)) {
      const question = {
        type: 'input',
        name: 'roles',
        message: `${manager.getDisplayName(serviceId)}: Enter allowed roles seperated by comma (or leave blank to allow all):`
      }

      const specifiedRoles = (await inquirer.prompt([question]))
        .roles
        .split(',')
        .map((role) => role.trim())

      if (specifiedRoles.length === 0) {
        allowedRoles.push('*')
      } else {
        allowedRoles = allowedRoles.concat(specifiedRoles)
      }
    } else {
      allowedRoles.push('*')
    }

    newAccessRules[serviceId] = allowedRoles.map((role) => { return { asset: '*', role: role }})
  }


  group.accessRules = newAccessRules

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
