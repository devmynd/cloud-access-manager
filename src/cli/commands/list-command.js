// @flow
// import { manager } from './../../core/service-providers/manager'
// import { terminal as term } from 'terminal-kit'
// import * as helpers from '../helpers'

// function printSummaries (accounts: Array<ServiceUserAccount>, displayServices: bool = true) {
//   accounts.sort((lhs, rhs) => lhs.email < rhs.email ? 0 : 1)
//   accounts.forEach((account) => {
//     term.green(`${account.email}`)
//     account.assetAssignments.forEach((assetAssignment) => {
//       if (displayServices) {
//         term.cyan(`\n\t${assetAssignment.service.id}`)
//       }
//
//       assetAssignment.assets.forEach((asset) => {
//         term.magenta(`\n\t\t${asset.name} `)
//         if (asset.role) {
//           term.yellow(`(${asset.role})`)
//         }
//       })
//       term('\n')
//     })
//   })
// }

export async function listAll () {
  // const summaries = await manager.download('all')
  // printSummaries(summaries)
  console.log('todo: refactor listAll')
}

export async function listByService (serviceId: string) {
  // const serviceInfo = manager.getServiceInfo(serviceId)
  // if (serviceInfo) {
  //   if (!serviceInfo.isConfigured) {
  //     term.red(`Service '${serviceId}' is not configured. Run 'cam config ${serviceId}'\n`)
  //     return
  //   }
  //
  //   const summaries = await manager.download(serviceId)
  //   printSummaries(summaries, false)
  // } else {
  //   term.red(`Invalid service id`)
  // }
  console.log('todo: refactor listByService')
}
