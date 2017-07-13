// @flow

// Ensure every module is imported here
import { dummyProviderModule } from './dummy'
import { herokuProviderModule } from './heroku'

// Ensure every module is included in this array
export const modules = [
  dummyProviderModule, herokuProviderModule
]
