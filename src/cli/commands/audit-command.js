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

    const flag = auditor.auditAccount(account)
    if (flag) {
      if (flag.individual) {
        await auditForIndividual(flag.individual, flag.serviceId, flag.assets)
      } else {
        const shouldCreateIndividual = await(handleUnknownUser(flag))
        if (shouldCreateIndividual) {
          const newIndividual = await(createNewIndividual(flag))
          await auditForIndividual(newIndividual, flag.serviceId, flag.assets)
        } else {
          console.log("todo: add to an existing individual")
        }
        // prompt to ask about creating individual or adding to existing individual
        // for now, maybe just only create individuals, as we will have to think about how to design the CLI for searching and matching existing individuals.
        // then call:
        // auditForIndividual(createdOrUpdatedIndividual, flag.serviceId, flag.assets)
      }
    }
  }

  // re-run the audit with the non-interactive version.
  audit()
}

async function handleUnknownUser(flag: FlaggedInfo) {
 let userIdentity =  flag.userIdentity.email !== "" ? flag.userIdentity.email : flag.userIdentity.userId

 if(userIdentity) {
   term.cyan(`${userIdentity} is an unknown user.\n`)
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
}

async function createNewIndividual(flag: FlaggedInfo) : Promise<Individual> {
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

  return newIndividual
}

async function auditForIndividual (individual: Individual, serviceId: string, assets: Array<Asset>): Promise<void> {
  //

  const selectedAssets = await(selectNewAssets(assets, serviceId))

  // const whitelistedPartition = lodash.partition(individual.accessRules[serviceId], (assetAssignment) => individual.accessRules.hasOwnProperty(assetAssignment.service.id))
  //
  // let auditableAssetAssignments = whitelistedPartition[0]
  // const newServices = whitelistedPartition[1]
  //
  // if (newServices.length > 0) {
  //   const selectedAssetAssignments = await selectServices(newServices)
  //   auditableAssetAssignments = auditableAssetAssignments.concat(selectedAssetAssignments)
  // }
  //
  // const newAccessRules = await auditServices(auditableAssetAssignments)
  // Object.keys(newAccessRules).forEach((serviceId) => {
  //   const newServiceAccessRules = newAccessRules[serviceId]
  //   let individualServiceAccessRules = individual.accessRules[serviceId]
  //   if (individualServiceAccessRules) {
  //     individual.accessRules[serviceId] = individualServiceAccessRules.concat(newServiceAccessRules)
  //   } else {
  //     individual.accessRules[serviceId] = newServiceAccessRules
  //   }
  // })
  //
  // individualStore.save(individual)
}
//
// async function auditServices (assetAssignments: Array<AssetAssignment>): Promise<ServiceAccessHash> {
//   const serviceAccess: ServiceAccessHash = {}
//
//   // loop through new selected assetAssignments and get full or partial access and if partial, ask for assets
//   for (let i = 0; i < assetAssignments.length; i++) {
//     const assetAssignment = assetAssignments[i]
//     let accessRules: Array<AccessRule>
//     const fullAccess = await selectFullAccess(assetAssignment.service)
//
//     if (fullAccess) {
//       if (assetAssignment.service.roles.length > 0) {
//         const selectedRoles = await selectRoles(assetAssignment)
//         accessRules = selectedRoles.map((role) => {
//           return { asset: '*', role: role }
//         })
//       } else {
//         accessRules = [{ asset: '*', role: '*' }]
//       }
//     } else {
//       accessRules = await selectNewAssets(assetAssignment)
//     }
//     serviceAccess[assetAssignment.service.id] = accessRules
//   }
//
//   return serviceAccess
// }
//
async function selectNewAssets (assets: Array<Asset>, serviceId: string): Promise<Array<AccessRule>> {
  const question = {
    type: 'checkbox',
    name: 'selectedAssets',
    choices: assets.map((asset) => {
      const roleStr = asset.role ? ` (${asset.role})` : ''
      return {
        name: `${asset.name}${roleStr}`, value: { asset: asset.name, role: asset.role ? asset.role : '*' }
      }
    }),
    message: `${serviceId}: allow the following assets?`
  }
  const selectedAssets = (await inquirer.prompt([question])).selectedAssets

  return selectedAssets
}
//
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
//
// async function selectRoles (assetAssignment: AssetAssignment): Promise<Array<string>> {
//   const availableRoles = lodash.uniq(assetAssignment.assets.filter((asset) => !!asset.role).map((asset) => asset.role))
//   if (availableRoles.length === 0) {
//     term.red.bold('Error: No role property defined for the asset by the service provider implementation.\n')
//     term.red.bold('Please add roles to your service provider or update your ServiceProviderModule to have the property: hasRole: false\n')
//     return []
//   }
//
//   const question = {
//     type: 'checkbox',
//     name: 'selectedRoles',
//     choices: availableRoles.map((role) => {
//       return { name: role, value: role }
//     }),
//     message: `${assetAssignment.service.id}: grant full access to which roles?`
//   }
//
//   return (await inquirer.prompt([question])).selectedRoles
// }
//
// async function selectFullAccess (service: ServiceInfo): Promise<boolean> {
//   const question = {
//     type: 'list',
//     name: 'fullAccess',
//     choices: [{
//       name: 'Full',
//       value: true
//     }, {
//       name: 'Per Asset',
//       value: false
//     }],
//     message: `${service.id}: grant which access level?`
//   }
//
//   return (await inquirer.prompt([question])).fullAccess
// }
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
