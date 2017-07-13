// @flow
import * as serviceProvidersModule from './../../core/service-providers'
import { terminal as term } from 'terminal-kit'
import * as auditor from './../../core/auditor'
import * as helpers from '../helpers'
import { whitelistStore } from '../../core/data/whitelist-store'
import inquirer from 'inquirer'
import type { UserServiceSummary, ServiceSummary, WhitelistEntry, ServiceAccess } from '../../core/types'
import lodash from 'lodash'

export async function audit () {
  const summaries = await serviceProvidersModule.download('all')
  const whitelist = whitelistStore.getAll()

  const flaggedSummaries = auditor.performAudit(summaries, whitelist)
  if (flaggedSummaries.length > 0) {
    term.red('The following users have been flagged:\n\n')
    helpers.printSummaries(flaggedSummaries)
  } else {
    term.green('No suspicious accounts found. Take a break. Have a 🍺\n\n')
  }
}

export async function interactiveAudit () {
  const summaries = await serviceProvidersModule.download('all')
  const whitelist = whitelistStore.getAll()

  const flaggedSummaries = auditor.performAudit(summaries, whitelist)

  for (let i = 0; i < flaggedSummaries.length; i++) {
    const summary = flaggedSummaries[i]
    const whitelistEntry = lodash.find(whitelist, (entry) => entry.email === summary.email)
    await auditForUser(summary, whitelistEntry)
    term('\n')
  }

  audit()
}

async function auditForUser (summary: UserServiceSummary, existingWhitelistEntry: ?WhitelistEntry): Promise<void> {
  term.cyan.bold(`${summary.email}\n`)

  let whitelistEntry = existingWhitelistEntry || { email: summary.email, services: [] }

  const whitelistedPartition = lodash.partition(summary.services, (service) => {
    return !!lodash.find(whitelistEntry.services, (s) => s.id === service.id)
  })
  const existingWhitelistedServices = whitelistedPartition[0]
  const newServices = whitelistedPartition[1]

  if (newServices.length > 0) {
    const selectedServices = await selectNewServices(newServices)
    whitelistEntry.services = whitelistEntry.services.concat(selectedServices)
  }

  await updateExistingServices(existingWhitelistedServices, whitelistEntry)

  whitelistStore.save(whitelistEntry)
}

async function selectNewServices (services: Array<ServiceSummary>): Promise<Array<ServiceAccess>> {
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
  const newWhitelistedServices: Array<ServiceAccess> = []

  // loop through new whitelisted services and get full or partial access and if partial, ask for assets
  for (let i = 0; i < selectedServices.length; i++) {
    const service = selectedServices[i]
    let accessEntry: ServiceAccess
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
      accessEntry = { id: service.id, access: selectedAssets }
    } else {
      accessEntry = { id: service.id, access: 'full' }
    }
    newWhitelistedServices.push(accessEntry)
  }

  return newWhitelistedServices
}

async function updateExistingServices (services: Array<ServiceSummary>, entry: WhitelistEntry) {
  // loop thorugh all existing whitelisted services and ask about assets
  for (let i = 0; i < services.length; i++) {
    const service = services[i]
    let selectedAssets = await selectNewAssets(service)
    const accessEntry = entry.services.find((serviceAccess) => serviceAccess.id === service.id)
    if (accessEntry && typeof accessEntry.access !== 'string') {
      accessEntry.access = accessEntry.access.concat(selectedAssets)
    } else {
      throw new Error('unexpectedly did not find service in the existing whitelist entry or found service with unexpected \'full\' access')
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
