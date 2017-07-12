// @flow
import * as serviceProvidersModule from './../../core/service-providers'
import { terminal as term } from 'terminal-kit'

export async function audit () {
  const summaries = await serviceProvidersModule.download('all')

  // const temporaryFakeWhitelist = [{
  //     email: 'shamyle@devmynd.com',
  //     services: [{
  //       name: 'dummy',
  //       access: 'full'
  //     }]
  //   },{
  //     email: 'ty@devmynd.com',
  //     services: [{
  //       name: 'dummy',
  //       access: ['Project B']
  //     }]
  //   }]

  console.log(summaries)
  term('Todo: pass whitelist and summaries to auditor')
}
