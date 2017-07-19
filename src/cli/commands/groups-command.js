// @flow
import { groupStore } from '../../core/data/group-store'
import { terminal as term } from 'terminal-kit'
import { manager } from '../../core/service-providers/manager'
import inquirer from 'inquirer'
import lodash from 'lodash'

function isValidGroup (groupName: string): boolean {
  if (!groupStore.exists(groupName)) {
    term.red(`${groupName} does not exist. To create the group, please run: cam group ${groupName} --c \n`)
    return false
  }
  return true
}

export function listGroups () {
  const groups = groupStore.getAll()
  groups.forEach((group) => {
    term.cyan(`${group.name}\n`)
  })
}

export function createGroup (groupName: string) {
  if (groupStore.exists(groupName)) {
    term.red(`${groupName} already exists.\n`)
    return
  }

  groupStore.save({ name: groupName, accessRules: {} })
  term.green(`${groupName} group created.\n\n`)
  term.green(`\tTo add services to the group, run: `)
  term(`cam group ${groupName} --addService <service>\n\n`)
  term.green('\tFor a list of available configured services, run: ')
  term('cam config\n\n')
}

export async function configureServiceForGroup (serviceId: string, groupName: string) {
  if (!isValidGroup(groupName)) { return }
  if (!manager.isConfigured(serviceId)) {
    term.red(`${serviceId} is not configured.\n\n`)
    term.cyan('\tTo configure, run: ')
    term(`cam config ${serviceId}\n\n`)
    return
  }

  const group = groupStore.get(groupName)

  group.accessRules[serviceId] = group.accessRules[serviceId] || [{ asset: '*', role: '*' }]
  const existingRoles = group.accessRules[serviceId]
    .filter((rule) => rule.asset === '*')
    .map((rule) => rule.role)

  if (manager.hasRoles(serviceId)) {
    const question = {
      type: 'input',
      name: 'roles',
      default: existingRoles.join(','),
      message: 'Enter allowed roles seperated by comma (enter * for all roles):'
    }

    const specifiedRoles = (await inquirer.prompt([question]))
      .roles
      .split(',')
      .map((role) => role.trim())

    if (specifiedRoles[0] === '') {
      term.red('No roles defined. Service will not be added. If you meant to grant access to all roles, use *\n\n')
      return
    }

    group.accessRules[serviceId] = specifiedRoles.map((role) => { return { asset: '*', role: role } })
  }

  groupStore.save(group)
}

export function removeServiceFromGroup (serviceId: string, groupName: string) {
  if (!isValidGroup(groupName)) { return }

  const group = groupStore.get(groupName)
  delete group.accessRules[serviceId]
  groupStore.save(group)
}

export function showGroup (groupName: string) {
  if (!isValidGroup(groupName)) { return }

  const group = groupStore.get(groupName)
  term.green('Full access to the following services:\n')
  const serviceIds = Object.keys(group.accessRules)

  if (serviceIds.length === 0) {
    term.red('\tNone\n')
    return
  }

  serviceIds.forEach((serviceId) => {
    term.cyan(`\t${serviceId}`)
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
  const configuredServiceIds = manager.listServiceIds().filter(manager.isConfigured)

  if (configuredServiceIds.length === 0) {
    term.red('No services have been configured yet. Please run: cam config <service>\n')
    return
  }

  const question = {
    type: 'checkbox',
    name: 'selectedServiceIds',
    choices: configuredServiceIds
      .map((serviceId) => {
        return {
          name: serviceId,
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
    if (manager.hasRoles(serviceId)) {
      const question = {
        type: 'input',
        name: 'roles',
        message: `${serviceId}: Enter allowed roles seperated by comma (or leave blank to allow all):`
      }

      const specifiedRoles = (await inquirer.prompt([question]))
        .roles
        .split(',')
        .map((role) => role.trim())

      if (specifiedRoles[0] === '') {
        allowedRoles.push('*')
      } else {
        allowedRoles = allowedRoles.concat(specifiedRoles)
      }
    } else {
      allowedRoles.push('*')
    }

    newAccessRules[serviceId] = allowedRoles.map((role) => { return { asset: '*', role: role } })
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
