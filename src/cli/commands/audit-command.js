// @flow
import { manager } from './../../core/service-providers/manager'
import { terminal as term } from 'terminal-kit'
import { Auditor } from './../../core/auditor'
import * as helpers from '../helpers'
import { userStore } from '../../core/data/user-store'
import { groupStore } from '../../core/data/group-store'
import inquirer from 'inquirer'
import type { UserAccountAggregate, UserAccountServiceInfo, User, AccessRule, ServiceAccessHash } from '../../core/types'
import lodash from 'lodash'

function printFlaggedAccounts (flaggedAccounts: Array<UserAccountAggregate>) {
  if (flaggedAccounts.length > 0) {
    term.red('The following users have been flagged:\n\n')
    helpers.printSummaries(flaggedAccounts)
  } else {
    term.green('No suspicious accounts found. Take a break. Have a 🍺\n\n')
  }
}

export async function audit () {
  const accounts = await manager.download('all')
  const auditor = new Auditor(userStore, groupStore)

  const flaggedAccounts = auditor.performAudit(accounts)
  printFlaggedAccounts(flaggedAccounts)
}

export async function interactiveAudit () {
  const accounts = await manager.download('all')
  const auditor = new Auditor(userStore, groupStore)

  let flaggedAccounts = auditor.performAudit(accounts)

  const newUserEmails = flaggedAccounts
    .filter((account) => account.isNewUser)
    .map((account) => account.email)

  if (newUserEmails.length > 0) {
    const groupNames = groupStore.getAll().map((group) => group.name)
    for (let i = 0; i < newUserEmails.length; i++) {
      const email = newUserEmails[i]
      const selectedGroups = await selectGroupsForEmail(email, groupNames)
      userStore.save({ email: email, groups: selectedGroups, accessRules: { } })
    }

    // Perform another audit to refresh after having selected group membership
    flaggedAccounts = auditor.performAudit(accounts)
  }

  for (let i = 0; i < flaggedAccounts.length; i++) {
    const account = flaggedAccounts[i]
    const user = userStore.getByEmail(account.email)
    await auditForUser(account, user)
    term('\n')
  }

  flaggedAccounts = auditor.performAudit(accounts)
  printFlaggedAccounts(flaggedAccounts)
}

async function auditForUser (account: UserAccountAggregate, user: User): Promise<void> {
  term.cyan.bold(`${account.email}\n`)

  const whitelistedPartition = lodash.partition(account.services, (service) => user.accessRules.hasOwnProperty(service.id))

  let auditableServices = whitelistedPartition[0]
  const newServices = whitelistedPartition[1]

  if (newServices.length > 0) {
    const selectedServices = await selectServices(newServices)
    auditableServices = auditableServices.concat(selectedServices)
  }

  const newAccessRules = await auditServices(auditableServices)
  Object.keys(newAccessRules).forEach((serviceId) => {
    const newServiceAccessRules = newAccessRules[serviceId]
    let userServiceAccessRules = user.accessRules[serviceId]
    if (userServiceAccessRules) {
      user.accessRules[serviceId] = userServiceAccessRules.concat(newServiceAccessRules)
    } else {
      user.accessRules[serviceId] = newServiceAccessRules
    }
  })

  userStore.save(user)
}

async function auditServices (services: Array<UserAccountServiceInfo>): Promise<ServiceAccessHash> {
  const serviceAccess: ServiceAccessHash = {}

  // loop through new selected services and get full or partial access and if partial, ask for assets
  for (let i = 0; i < services.length; i++) {
    const service = services[i]
    let accessRules: Array<AccessRule>
    const fullAccess = await selectFullAccess(service)

    if (fullAccess) {
      if (service.hasRoles) {
        const selectedRoles = await selectRoles(service)
        accessRules = selectedRoles.map((role) => {
          return { asset: '*', role: role }
        })
      } else {
        accessRules = [{ asset: '*', role: '*' }]
      }
    } else {
      accessRules = await selectNewAssets(service)
    }
    serviceAccess[service.id] = accessRules
  }

  return serviceAccess
}

async function selectNewAssets (service: UserAccountServiceInfo): Promise<Array<AccessRule>> {
  const question = {
    type: 'checkbox',
    name: 'selectedAssets',
    choices: service.assets.map((asset) => {
      const roleStr = asset.role ? ` (${asset.role})` : ''
      return {
        name: `${asset.name}${roleStr}`, value: { asset: asset.name, role: asset.role ? asset.role : '*' }
      }
    }),
    message: `${service.displayName}: allow the following assets?`
  }
  const selectedAssets = (await inquirer.prompt([question])).selectedAssets

  return selectedAssets
}

async function selectGroupsForEmail (email: string, groupNames: Array<string>): Promise<Array<string>> {
  const question = {
    type: 'checkbox',
    name: 'selectedGroups',
    choices: groupNames.map((groupName) => {
      return {
        name: groupName, value: groupName
      }
    }),
    message: `${email}: Select group membership`
  }
  const selectedGroups = (await inquirer.prompt([question])).selectedGroups

  return selectedGroups
}

async function selectRoles (service: UserAccountServiceInfo): Promise<Array<string>> {


  const availableRoles = lodash.uniq(service.assets.filter((asset) => !!asset.role).map((asset) => asset.role))
  if (availableRoles.length === 0) {
    term.red.bold('Error: No role property defined for the asset by the service provider implementation.\n')
    term.red.bold('Please add roles to your service provider or update your ServiceProviderModule to have the property: hasRole: false\n')
    return []
  }

  const question = {
    type: 'checkbox',
    name: 'selectedRoles',
    choices: availableRoles.map((role) => {
      return { name: role, value: role }
    }),
    message: `${service.displayName}: grant full access to which roles?`
  }

  return (await inquirer.prompt([question])).selectedRoles
}

async function selectFullAccess (service: UserAccountServiceInfo): Promise<boolean> {
  const question = {
    type: 'list',
    name: 'fullAccess',
    choices: [{
      name: 'Full',
      value: true
    }, {
      name: 'Per Asset',
      value: false
    }],
    message: `${service.displayName}: grant which access level?`
  }

  return (await inquirer.prompt([question])).fullAccess
}

async function selectServices (services: Array<UserAccountServiceInfo>): Promise <Array<UserAccountServiceInfo>> {
  const question = {
    type: 'checkbox',
    name: 'selectedServices',
    // create choices for every service that isn't at least partially whitelisted yet
    choices: services
      .map((service) => {
        return {
          name: service.displayName,
          value: service
        }
      }),
    message: `Allow the following services?`
  }

  return (await inquirer.prompt([question])).selectedServices
}
