// @flow
import {
  buildSchema
} from 'graphql'
import { configResolvers, accountsResolvers } from './resolvers'

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
  }

  type AssetAssignment {
    service: ServiceInfo!
    assets: [Asset]!
  }

  type UserAccountAggregate {
    email: String!
    isNewUser: Boolean
    assetAssignments: [AssetAssignment]!
  }

  type Query {
    accounts(serviceId: String): [UserAccountAggregate]
    configKeys(serviceId: String!): [String]
  }

  type Mutation {
    configureService(serviceId: String, configJson: String): String
  }
`)

export const root = {
  accounts: accountsResolvers.listAccounts,
  configKeys: configResolvers.configKeys,
  configureService: configResolvers.configureService,
  services: configResolvers.listServices
}
