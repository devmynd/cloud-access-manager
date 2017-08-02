// @flow
// import { manager } from './../../core/service-providers/manager'
// import { terminal as term } from 'terminal-kit'
// import * as helpers from '../helpers'

export async function listAll () {
  // const summaries = await manager.download('all')
  // helpers.printSummaries(summaries)
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
  //   helpers.printSummaries(summaries, false)
  // } else {
  //   term.red(`Invalid service id`)
  // }
  console.log('todo: refactor listByService')
}
