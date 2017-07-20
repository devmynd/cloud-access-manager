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
  }

  type Mutation {
    configureService(serviceId: String, config: [String]): String
  }
`)

export const root = {
  accounts: function (args: { serviceId: string }) {
    return manager.download(args.serviceId || 'all')
  },
  configureService: function (args: { serviceId: string }) {
    configStore.save(args.serviceId, args.config)
    const service = configStore.get(args.serviceId)
    return `${service} configured!`
  }
}
