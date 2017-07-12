// @flow
import * as serviceProvidersModule from './../../core/service-providers'
import { terminal as term } from 'terminal-kit'
import * as auditor from './../../core/auditor'
import * as helpers from '../helpers'
import { whitelistStore } from '../../core/data/whitelist-store'
import inquirer from 'inquirer'
import type { UserServiceSummary, ServiceSummary, WhitelistEntry } from '../../core/types'
import lodash from 'lodash'

export async function audit () {
  const summaries = await serviceProvidersModule.download('all')
  const whitelist = whitelistStore.getAll()

  const flaggedSummaries = auditor.performAudit(summaries, whitelist)
  if (flaggedSummaries.length > 0) {
    term.red('The following users have been flagged:\n\n')
    helpers.printSummaries(flaggedSummaries)
  } else {
    term.green('No suspicious accounts found. Take a break. Have a drink.')
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
  }

  audit()
}

async function auditForUser (summary: UserServiceSummary, existingWhitelistEntry: ?WhitelistEntry): Promise<void> {
  let whitelistEntry = existingWhitelistEntry || { email: summary.email, services: [] }

  const whitelistedPartition = lodash.partition(summary.services, (service) => {
    return !!lodash.find(whitelistEntry.services, (s) => s.id === service.id)
  })
  const existingWhitelistedServices = whitelistedPartition[0]
  const newServices = whitelistedPartition[1]

  const question = {
    type: 'checkbox',
    name: 'selectedServices',
    // create choices for every service that isn't at least partially whitelisted yet
    choices: newServices
      .map((service) => {
        return {
          name: service.displayName,
          value: service
        }
      }),
    message: `${summary.email}: allow services?`
  }

  const newWhitelistedServices = (await inquirer.prompt([question])).selectedServices

  // loop through new whitelisted services and get full or partial access and if partial, ask for assets
  for (let i = 0; i < newWhitelistedServices.length; i++) {
    const service = newWhitelistedServices[i]
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
      message: `${service.displayName}: access level?`
    }

    const fullAccess = (await inquirer.prompt([question])).fullAccess

    if (!fullAccess) {
      let selectedAssets = await askForAssets(service)
      console.log(selectedAssets)
      // todo: add new servcie to whitelist with seledted assets
    } else {
      // add new service to whitelist with full access
    }
  }

  // loop thorugh all existing whitelisted services and ask about assets
  for (let i = 0; i < existingWhitelistedServices.length; i++) {
    const service = existingWhitelistedServices[i]
    let selectedAssets = await askForAssets(service)
    console.log(selectedAssets)
    // todo: update existing service in whitelist with new assets (without overwriting existing assets)
  }

  term('\n')
  whitelistStore.save(whitelistEntry)
}

async function askForAssets (service: ServiceSummary): Promise<Array<string>> {
  const question = {
    type: 'checkbox',
    name: 'selectedAssets',
    choices: service.assets.map((asset) => {
      return {
        name: asset, value: asset
      }
    }),
    message: `${service.displayName}: allow assets?`
  }
  const selectedAssets = (await inquirer.prompt([question])).selectedAssets

  return selectedAssets
}
