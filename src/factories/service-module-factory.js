// Ensure every module is imported here and included in the `modules` hash below
import * as dummy from '../services/dummy'

let modules = {
  'dummy': dummy
}

export function factory (moduleName: string): { config: any, provider: any } {
  var module = modules[moduleName]
  if (typeof (module) === 'undefined') {
    let err: string = `undefined module: '${moduleName}'`
    throw err
  }
  return module
}
