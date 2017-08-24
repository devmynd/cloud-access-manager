// @flow
import {
  buildSchema
} from 'graphql'
import resolvers from './resolvers'

export const schema = buildSchema(`
  type ServiceInfo {
    id: String!
    displayName: String!
    roles: [String]!
    isConfigured: Boolean!
    cachedDate: String
    configKeys: [String]
  }

  type AccessRule {
    asset: String!
    role: String!
  }

  type Asset {
    name: String!
    role: String
  }

  type UserIdentity {
    email: String
    userId: String
    fullName: String
  }

  type ServiceAccessRuleList {
    service: ServiceInfo!,
    accessRules: [AccessRule]!
  }

  type ServiceUserIdentity {
    serviceId: String!
    userIdentity: UserIdentity!
  }

  type UserAccount {
    identity: UserIdentity!
    assets: [Asset]!
  }

  type ServiceUserAccount {
    serviceId: String!
    userAccount: UserAccount!
  }

  type Group {
    name: String!
    serviceAccessRules: [ServiceAccessRuleList]!
  }

  type Individual {
    id: String!,
    fullName: String!,
    primaryEmail: String,
    serviceUserIdentities: [ServiceUserIdentity],
    accessRules: [ServiceAccessRuleList]!,
    groups: [String]!
  }

  type FlaggedInfo {
    individual: Individual,
    serviceId: String!,
    userIdentity: UserIdentity!,
    assets: [Asset]!
  }

  type Query {
    auditService(serviceId: String!, skipCache: Boolean): [FlaggedInfo]
    auditServiceUserAccount(serviceId: String!, email: String, userId: String): FlaggedInfo
    services(isConfigured: Boolean): [ServiceInfo]
    groups: [Group]
    group(name: String): Group
    individuals(fuzzySearch: String, limit: Int): [Individual]
  }

  input AccessRuleInput {
    asset: String!
    role: String!
  }

  input NewIndividualInput {
    fullName: String!,
    primaryEmail: String,
    groups: [String]!
  }

  input ServiceAccessRuleListInput {
    serviceId: String!
    accessRules: [AccessRuleInput]!
  }

  type Mutation {
    createIndividual(individual: NewIndividualInput!): Individual
    linkServiceToIndividual(serviceId: String!, individualId: String!, fullName: String, email: String, userId: String): String
    unlinkService(serviceId: String!, individualId: String!): String
    addIndividualAccessRules(individualId: String!, serviceId: String!, accessRules: [AccessRuleInput]!): String
    configureService(serviceId: String!, configJson: String!): String
    disableService(serviceId: String!): String
    setGroupAccessRules(name: String!, serviceAccessRules: [ServiceAccessRuleListInput]!): String
    deleteGroup(name: String!): String
    updateIndividualGroups(individualId: String!, groups: [String]!): String
    updateIndividualAccessRules(individualId: String!, accessRules: [ServiceAccessRuleListInput]!): String
    deleteIndividual(individualId: String!): String
    updatePrimaryEmail(individualId: String!, primaryEmail: String): String
  }
`)

export const root = {
  createIndividual: resolvers.individuals.createIndividual,
  linkServiceToIndividual: resolvers.individuals.linkServiceToIndividual,
  addIndividualAccessRules: resolvers.individuals.addIndividualAccessRules,
  updateIndividualGroups: resolvers.individuals.updateIndividualGroups,
  updateIndividualAccessRules: resolvers.individuals.updateIndividualAccessRules,
  individuals: resolvers.individuals.getIndividuals,
  auditService: resolvers.accounts.auditService,
  auditServiceUserAccount: resolvers.accounts.auditServiceUserAccount,
  configureService: resolvers.services.configureService,
  disableService: resolvers.services.disableService,
  services: resolvers.services.listServices,
  setGroupAccessRules: resolvers.groups.setGroupAccessRules,
  group: resolvers.groups.getGroup,
  groups: resolvers.groups.listGroups,
  deleteGroup: resolvers.groups.deleteGroup,
  deleteIndividual: resolvers.individuals.deleteIndividual,
  unlinkService: resolvers.individuals.unlinkService,
  updatePrimaryEmail: resolvers.individuals.updatePrimaryEmail
}
