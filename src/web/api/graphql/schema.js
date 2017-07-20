// @flow

import { manager } from '../../../core/service-providers/manager'

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

  type Query {
    accounts(serviceId: String): [UserAccountAggregate]
  }
`)

export const root = {
  accounts: function ({ serviceId }) {
    return manager.download(serviceId || 'all')
  }
}
