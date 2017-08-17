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
  return (Math.random() * 16).toString()
}

export function newIndividualFactory (fullName: string, primaryEmail: ?string, groups: Array<string>): Individual {
  return {
    id: generateUUID(),
    fullName,
    primaryEmail,
    serviceUserIdentities: {},
    accessRules: {},
    groups
  }
}

// TODO: implement sortIndividuals method
