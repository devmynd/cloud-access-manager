// @flow
import { manager } from './../../core/service-providers/manager'
import { terminal as term } from 'terminal-kit'
import { Auditor } from './../../core/auditor'
// import * as helpers from '../helpers'
import { individualStore } from '../../core/data/individual-store'
import { groupStore } from '../../core/data/group-store'
import inquirer from 'inquirer'
import type { ServiceUserAccount, FlaggedInfo, Asset, Individual, AccessRule } from '../../core/types'
import lodash from 'lodash'

export async function audit () {
  const accounts: Array<ServiceUserAccount> = await manager.download('all')
  const auditor = new Auditor(individualStore, groupStore)

  const flags = []
  accounts.forEach((account) => {
    const flag = auditor.auditAccount(account)
    if (flag) {
      flags.push(flag)
    }
  })

   printFlaggedAccounts(flags)
}

export async function interactiveAudit () {
  const accounts: Array<ServiceUserAccount> = await manager.download('all')
  const auditor = new Auditor(individualStore, groupStore)

  for (let accountIndex = 0; accountIndex < accounts.length; accountIndex++) {
    const account = accounts[accountIndex]

    let flag = auditor.auditAccount(account)

    if (flag && !flag.individual) {
      const shouldCreateIndividual = await shouldCreateNewIndividual(flag)
      if (shouldCreateIndividual) {
        // since create method will save the new individual, we don't need it returned to us
        await createNewIndividual(flag)
      } else {
        throw new Error("Link to existing individual not yet implemented")
        // TODO: link to existing individual (and save the individual record)
      }

      // recheck the account to see if it is still flagged after creating or linking to an individual who may have groups or access rules.
      flag = auditor.auditAccount(account)
    }

    if (flag && flag.individual) {
      await auditForIndividual(flag.individual, flag.serviceId, flag.assets)
    }
    term('\n\n')
  }
  audit()
}

async function shouldCreateNewIndividual(flag: FlaggedInfo) {
 let name
 if (flag.userIdentity.email) {
   name = flag.userIdentity.email
 }
 else if (flag.userIdentity.userId) {
   name = flag.userIdentity.userId
 }
 else {
   // throw error instead of returning early,
   // because if we return early the code in audit will fall through to link to an existing individual and we'll have this problem again.
   throw new Error(`Account does not have a valid user identity (email or userId). Check ${flag.serviceId} implementation. It should not return invalid accounts.`)
 }

 term.cyan(`${name} is an unknown user.\n`)
 const question = {
     type: 'list',
     name: 'shouldCreateIndividual',
     choices: [{
           name: 'Create a New Individual',
           value: true
         }, {
           name: 'Link to an Existing Individual',
           value: false
         }],
     message: `How would you like to proceed with this user?`
   }

   return (await inquirer.prompt([question])).shouldCreateIndividual
}

async function createNewIndividual(flag: FlaggedInfo) {
  const groupNames = groupStore.getAll().map((group) => group.name)
  const newIndividual = {
    id: generateUUID(),
    fullName: flag.userIdentity.fullName || "",
    primaryEmail: flag.userIdentity.email || "",
    serviceUserIdentities: {},
    accessRules: {},
    groups: []
  }
  newIndividual.serviceUserIdentities[flag.serviceId] = flag.userIdentity
  newIndividual.groups = await(selectGroups(newIndividual.primaryEmail, groupNames))
  individualStore.save(newIndividual)
}

async function auditForIndividual (individual: Individual, serviceId: string, assets: Array<Asset>): Promise<void> {
  assets = [...assets]
 
  const allowFullAccess = await selectFullAccess(serviceId)
  if(allowFullAccess) {
    const selectedRoles = await selectRoles(serviceId, assets)
    // filter out assets that have one of the selected roles
    assets = lodash.filter(assets, (asset) => !lodash.find(selectedRoles, (role) => asset.role === role))
  }

  // select per asset access for any remaning assets that were not filtered out by full access roles.
  if (assets.length === 0) {
    return
  }
  const selectedAccessRules = await selectNewAssets(assets, serviceId, individual.primaryEmail)
  const individualServiceAccessRules = individual.accessRules[serviceId]
  if (individualServiceAccessRules) {
      individual.accessRules[serviceId] = individualServiceAccessRules.concat(selectedAccessRules)
    } else {
      individual.accessRules[serviceId] = selectedAccessRules
    }
  individualStore.save(individual)
}

async function selectNewAssets (assets: Array<Asset>, serviceId: string, primaryUserEmail: string): Promise<Array<AccessRule>> {
  const question = {
    type: 'checkbox',
    name: 'selectedAssets',
    choices: assets.map((asset) => {
      const roleStr = asset.role ? ` (${asset.role})` : ''
      return {
        name: `${asset.name}${roleStr}`, value: { asset: asset.name, role: asset.role ? asset.role : '*' }
      }
    }),
    message: `${serviceId}: allow the following assets for ${primaryUserEmail}?`
  }
  const selectedAssets = (await inquirer.prompt([question])).selectedAssets

  return selectedAssets
}

async function selectGroups (email: string, groupNames: Array<string>): Promise<Array<string>> {
  const question = {
    type: 'checkbox',
    name: 'selectedGroups',
    choices: groupNames.map((groupName) => {
      return {
        name: groupName, value: groupName
      }
    }),
    message: `Select group membership for ${email}`
  }
  const selectedGroups = (await inquirer.prompt([question])).selectedGroups

  return selectedGroups
}

async function selectRoles (serviceId: string, assets: Array<Asset>): Promise<Array<string>> {
  const availableRoles = lodash.uniq(assets.filter((asset) => !!asset.role).map((asset) => asset.role))
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
    message: `${serviceId}: grant full access to which roles?`
  }

  return (await inquirer.prompt([question])).selectedRoles
}

async function selectFullAccess (serviceId: string): Promise<boolean> {
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
    message: `${serviceId}: grant which access level?`
  }

  return (await inquirer.prompt([question])).fullAccess
}
//
// async function selectServices (assetAssignments: Array<AssetAssignment>): Promise <Array<AssetAssignment>> {
//   const question = {
//     type: 'checkbox',
//     name: 'selectedAssignments',
//     // create choices for every service that isn't at least partially whitelisted yet
//     choices: assetAssignments
//       .map((assetAssignment) => {
//         return {
//           name: assetAssignment.service.id,
//           value: assetAssignment
//         }
//       }),
//     message: `Allow the following services?`
//   }
//
//   return (await inquirer.prompt([question])).selectedAssignments
// }


function selectSortField (flag: FlaggedInfo): string {
  if (flag.individual) {
    if (flag.individual.primaryEmail) {
      return flag.individual.primaryEmail
    }
    if (flag.individual.fullName) {
      return flag.individual.fullName
    }
  }
  if (flag.userIdentity.email) {
    return flag.userIdentity.email
  }
  if (flag.userIdentity.userId) {
    return flag.userIdentity.userId
  }
  if (flag.userIdentity.fullName) {
    return flag.userIdentity.fullName
  }
  return ""
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function printFlaggedAccounts (flags: Array<FlaggedInfo>) {
  if (flags.length > 0) {
    term.red('The following individuals have been flagged:\n\n')

    flags.sort((lhs, rhs) => {
      const left = selectSortField(lhs)
      const right = selectSortField(rhs)
      return left > right ? 0 : 1
    })
    flags.forEach((flag) => {
      term.cyan(`Flag for: ${flag.serviceId}\n`)
      if (flag.individual) {
        term.green(`Known Individual => name: '${flag.individual.fullName}', primaryEmail: '${flag.individual.primaryEmail || ""}'`)
      } else {
        term.green(`Unknown Individual => name: '${flag.userIdentity.fullName || ''}', email: '${flag.userIdentity.email || ''}', userId: '${flag.userIdentity.userId || ''}'`)
      }

      flag.assets.forEach((asset) => {
        term.magenta(`\n\t${asset.name} `)
        if (asset.role) {
          term.yellow(`(${asset.role})`)
        }
      })
      term('\n\n')
    })
  } else {
    term.green('No suspicious accounts found. Take a break. Have a 🍺\n\n')
  }
}
