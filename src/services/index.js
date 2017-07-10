// @flow

// Ensure every module is imported here and included in the `modules` hash below
import { dummyProviderModule } from '../services/dummy'

export const modules = {
  'dummy': dummyProviderModule
}

export function getModule (serviceKey: string) {
  const module = modules[serviceKey]
  if (!module) {
    throw new Error(`unknown serviceKey: '${serviceKey}'`)
  }
  return module
}
