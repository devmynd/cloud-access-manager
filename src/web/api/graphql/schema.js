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

  type ServiceInfo {
    id: String!
    displayName: String!
    hasRoles: Boolean!
    isConfigured: Boolean!
    configKeys: [String]
  }

  type AssetAssignment {
    service: ServiceInfo!
    assets: [Asset]!
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
  }

  input AccessRule {
    asset: String!
    role: String!
  }

  input ServiceAccessRuleList {
    serviceId: String!
    accessRules: [AccessRule]!
  }

  type Mutation {
    configureService(serviceId: String, configJson: String): String
    setGroupAccessRules(name: String, serviceAccessRules: [ServiceAccessRuleList]): String
    addAccessRules(email: String, serviceAccessRules: [ServiceAccessRuleList]): String
  }
`)

export const root = {
  accounts: accountsResolvers.listAccounts,
  audit: accountsResolvers.performAudit,
  configureService: serviceResolvers.configureService,
  services: serviceResolvers.listServices,
  service: serviceResolvers.getService,
  addAccessRules: individualsResolvers.addAccessRules,
  setGroupAccessRules: groupsResolvers.setGroupAccessRules
}
