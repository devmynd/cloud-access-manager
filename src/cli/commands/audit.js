// @flow
import { manager } from './../../core/service-providers/manager'
import { terminal as term } from 'terminal-kit'
import * as auditor from './../../core/auditor'
import * as helpers from '../helpers'
import { userStore } from '../../core/data/user-store'
import inquirer from 'inquirer'
import type { UserServiceSummary, ServiceSummary, User, AccessRule, ServiceAccessHash } from '../../core/types'
import lodash from 'lodash'

export async function audit () {
  const summaries = await manager.download('all')
  const users = userStore.getAll()

  const flaggedSummaries = auditor.performAudit(summaries, users)
  if (flaggedSummaries.length > 0) {
    term.red('The following users have been flagged:\n\n')
    helpers.printSummaries(flaggedSummaries)
  } else {
    term.green('No suspicious accounts found. Take a break. Have a 🍺\n\n')
  }
}

export async function interactiveAudit () {
  const summaries = await manager.download('all')
  const users = userStore.getAll()

  const flaggedSummaries = auditor.performAudit(summaries, users)

  for (let i = 0; i < flaggedSummaries.length; i++) {
    const summary = flaggedSummaries[i]
    const user = lodash.find(users, (entry) => entry.email === summary.email)
    await auditForUser(summary, user)
    term('\n')
  }

  audit()
}

async function auditForUser (summary: UserServiceSummary, existingUser: ?User): Promise<void> {
  term.cyan.bold(`${summary.email}\n`)

  let user: User = existingUser || { email: summary.email, accessRules: {} }

  const whitelistedPartition = lodash.partition(summary.services, (service) => user.accessRules.hasOwnProperty(service.id))
  const existingWhitelistedServices = whitelistedPartition[0]
  const newServices = whitelistedPartition[1]

  if (newServices.length > 0) {
    const selectedServices = await selectNewServices(newServices)
    user.accessRules = Object.assign(user.accessRules, selectedServices)
  }

  await updateExistingServices(existingWhitelistedServices, user)

  userStore.save(user)
}

async function selectNewServices (services: Array<ServiceSummary>): Promise<ServiceAccessHash> {
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
    let accessRule: AccessRule
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
      accessRule = selectedAssets
    } else {
      accessRule = 'full'
    }
    serviceAccess[service.id] = accessRule
  }

  return serviceAccess
}

async function updateExistingServices (services: Array<ServiceSummary>, user: User) {
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

async function selectNewAssets (service: ServiceSummary): Promise<Array<string>> {
  const question = {
    type: 'checkbox',
    name: 'selectedAssets',
    choices: service.assets.map((asset) => {
      return {
        name: asset, value: asset
      }
    }),
    message: `${service.displayName}: allow the following assets?`
  }
  const selectedAssets = (await inquirer.prompt([question])).selectedAssets

  return selectedAssets
}
