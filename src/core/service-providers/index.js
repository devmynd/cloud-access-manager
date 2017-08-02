// @flow

// Ensure every module is imported here
import { dummyProviderModule } from './dummy'
import { herokuProviderModule } from './heroku'
import { gitHubProviderModule } from './github'

// Ensure every module is included in this array
export const modules = [
  dummyProviderModule, herokuProviderModule, gitHubProviderModule
]
