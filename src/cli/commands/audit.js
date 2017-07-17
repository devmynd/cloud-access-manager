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
  const existingWhitelistedServices = whitelistedPartition[0]
  const newServices = whitelistedPartition[1]

  if (newServices.length > 0) {
    const selectedServices = await selectNewServices(newServices)
    user.accessRules = Object.assign(user.accessRules, selectedServices)
  }

  await updateExistingServices(existingWhitelistedServices, user)

  userStore.save(user)
}

async function selectNewServices (services: Array<UserAccountServiceInfo>): Promise<ServiceAccessHash> {
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

  const selectedServices = (await inquirer.prompt([question])).selectedServices
  const serviceAccess: ServiceAccessHash = {}

  // loop through new selected services and get full or partial access and if partial, ask for assets
  for (let i = 0; i < selectedServices.length; i++) {
    const service = selectedServices[i]
    let accessRules: Array<AccessRule>
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

    const fullAccess = (await inquirer.prompt([question])).fullAccess

    if (!fullAccess) {
      let selectedAssets = await selectNewAssets(service)
      accessRules = selectedAssets
    } else {
      accessRules = [{ asset: '*', role: '*' }]
    }
    serviceAccess[service.id] = accessRules
  }

  return serviceAccess
}

async function updateExistingServices (services: Array<UserAccountServiceInfo>, user: User) {
  // loop thorugh all existing whitelisted services and ask about assets
  for (let i = 0; i < services.length; i++) {
    const service = services[i]
    let selectedAssets = await selectNewAssets(service)
    const accessRule = user.accessRules[service.id]
    if (accessRule && typeof accessRule !== 'string') {
      user.accessRules[service.id] = accessRule.concat(selectedAssets)
    } else {
      throw new Error('unexpectedly did not find service access rule in the existing user record or found unexpected \'full\' access')
    }
  }
}

async function selectNewAssets (service: UserAccountServiceInfo): Promise<Array<AccessRule>> {
  const question = {
    type: 'checkbox',
    name: 'selectedAssets',
    choices: service.assets.map((asset) => {
      return {
        name: `${asset.name} (${asset.role})`, value: { asset: asset.name, role: asset.role }
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
