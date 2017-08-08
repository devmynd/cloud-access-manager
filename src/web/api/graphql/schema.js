// @flow
import {
  buildSchema
} from 'graphql'
import { serviceResolvers, groupsResolvers, accountsResolvers } from './resolvers'

export const schema = buildSchema(`
  type ServiceInfo {
    id: String!
    displayName: String!
    roles: [String]!
    isConfigured: Boolean!
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
    primaryEmail: String!,
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
    audit: [FlaggedInfo]
    accounts(serviceId: String): [ServiceUserAccount]
    services(isConfigured: Boolean): [ServiceInfo]
    groups: [Group]
    group(name: String): Group
  }

  input AccessRuleInput {
    asset: String!
    role: String!
  }

  input ServiceAccessRuleListInput {
    serviceId: String!
    accessRules: [AccessRuleInput]!
  }

  type Mutation {
    configureService(serviceId: String, configJson: String): String
    disableService(serviceId: String): String
    setGroupAccessRules(name: String, serviceAccessRules: [ServiceAccessRuleListInput]): String
    delete(name: String): String
  }
`)

export const root = {
  audit: accountsResolvers.performAudit,
  accounts: accountsResolvers.listAccounts,
  configureService: serviceResolvers.configureService,
  disableService: serviceResolvers.disableService,
  services: serviceResolvers.listServices,
  setGroupAccessRules: groupsResolvers.setGroupAccessRules,
  group: groupsResolvers.getGroup,
  groups: groupsResolvers.listGroups,
  delete: groupsResolvers.deleteGroup
}
