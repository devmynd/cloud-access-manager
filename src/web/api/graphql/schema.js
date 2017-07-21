// @flow
import { manager } from '../../../core/service-providers/manager'
import { configStore } from '../../../core/data/config-store'

import {
  buildSchema
} from 'graphql'

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

  type ServiceProviderModule {
    id: String!
    displayName: String!
    hasRoles: Boolean!
    configKeys: [String]
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
  accounts (args: { serviceId: string }) {
    return manager.download(args.serviceId || 'all')
  },
  configKeys (args: { serviceId: string }) {
    return manager.getConfigKeys(args.serviceId)
  },
  async configureService (args: { serviceId: string, configJson: string }) {
    const config = JSON.parse(args.configJson)
    configStore.save(args.serviceId, config)
    let provider = manager.getProvider(args.serviceId)
    await provider.testConnection()
    return `${args.serviceId} configured!`
  }
}
