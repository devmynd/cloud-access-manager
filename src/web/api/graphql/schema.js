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

  type UserAccountServiceInfo {
    id: String!
    displayName: String!
    hasRoles: Boolean!
    assets: [Asset]
  }

  type UserAccountAggregate {
    email: String!
    isNewUser: Boolean
    services: [UserAccountServiceInfo]!
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
  accounts: accountsResolvers.listAccounts ,
  configKeys: configResolvers.configKeys,
  configureService: configResolvers.configureService
}
