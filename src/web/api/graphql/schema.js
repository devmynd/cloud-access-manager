// @flow
import {
  buildSchema
} from 'graphql'
import { serviceResolvers, accountsResolvers, individualsResolvers, groupsResolvers } from './resolvers'

export const schema = buildSchema(`
  type Asset {
    name: String!
    role: String
  }

  type AssetAssignment {
    service: ServiceInfo!
    assets: [Asset]!
  }

  type ServiceInfo {
    id: String!
    displayName: String!
    hasRoles: Boolean!
    isConfigured: Boolean!
    configKeys: [String]
  }

  type AccessRule {
    asset: String!
    role: String!
  }

  type ServiceAccessRuleList {
    service: ServiceInfo!,
    accessRules: [AccessRule]!
  }

  type Group {
    name: String!
    serviceAccessRules: [ServiceAccessRuleList]!
  }

  type ServiceUserAccountsAggregate {
    email: String!
    assetAssignments: [AssetAssignment]!
  }

  type FlaggedInfo {
    email: String!
    isNewIndividual: Boolean!
    groups: [String]!
    assetAssignments: [AssetAssignment]!
  }

  type Query {
    accounts(serviceId: String): [ServiceUserAccountsAggregate]
    service(serviceId: String!): ServiceInfo
    services(isConfigured: Boolean): [ServiceInfo]
    audit: [FlaggedInfo]
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
    setGroupAccessRules(name: String, serviceAccessRules: [ServiceAccessRuleListInput]): String
    addAccessRules(email: String, serviceAccessRules: [ServiceAccessRuleListInput]): String
    deleteGroup(name: String): String
  }
`)

export const root = {
  accounts: accountsResolvers.listAccounts,
  audit: accountsResolvers.performAudit,
  configureService: serviceResolvers.configureService,
  services: serviceResolvers.listServices,
  service: serviceResolvers.getService,
  addAccessRules: individualsResolvers.addAccessRules,
  setGroupAccessRules: groupsResolvers.setGroupAccessRules,
  group: groupsResolvers.getGroup,
  groups: groupsResolvers.listGroups,
  deleteGroup: groupsResolvers.deleteGroup
}
