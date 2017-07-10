// @flow

// Ensure every module is imported here and included in the `modules` hash below
import type { ServiceProviderModule } from '../types/service-provider'
import { dummyProviderModule } from '../services/dummy'

let modules = {
  'dummy': dummyProviderModule
}

export function factory (moduleName: string): ServiceProviderModule {
  var module = modules[moduleName]
  if (typeof (module) === 'undefined') {
    let err: string = `undefined module: '${moduleName}'`
    throw err
  }
  return module
}
