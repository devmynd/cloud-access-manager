// @flow
import {
  buildSchema
} from 'graphql'
import { serviceResolvers, accountsResolvers } from './resolvers'

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

  type Query {
    accounts(serviceId: String): [ServiceUserAccountsAggregate]
    service(serviceId: String!): ServiceInfo
    services(isConfigured: Boolean): [ServiceInfo]
    audit: [ServiceUserAccountsAggregate]
  }

  type Mutation {
    configureService(serviceId: String, configJson: String): String
  }
`)

export const root = {
  accounts: accountsResolvers.listAccounts,
  audit: accountsResolvers.performAudit,
  configureService: serviceResolvers.configureService,
  services: serviceResolvers.listServices,
  service: serviceResolvers.getService
}
