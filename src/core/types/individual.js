// @flow
import type { ServiceAccessHash, UserIdentity } from './'

export type Individual = {
  id: string,
  fullName: string,
  primaryEmail: ?string,
  serviceUserIdentities: { [string]: UserIdentity },
  accessRules: ServiceAccessHash,
  groups: Array<string>
}

function generateUUID () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function newIndividualFactory(fullName: string, primaryEmail: ?string, groups: Array<string>): Individual {
  return {
    id: generateUUID(),
    fullName,
    primaryEmail,
    serviceUserIdentities: {},
    accessRules: {},
    groups
  }
}

//TODO: implement sortIndividuals method
