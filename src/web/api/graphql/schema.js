// @flow
import {
  buildSchema
} from 'graphql'
import { serviceResolvers, individualsResolvers, groupsResolvers } from './resolvers'

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

  type ServiceAccessRuleList {
    service: ServiceInfo!,
    accessRules: [AccessRule]!
  }

  type Group {
    name: String!
    serviceAccessRules: [ServiceAccessRuleList]!
  }

  type Query {
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
    addAccessRules(email: String, serviceAccessRules: [ServiceAccessRuleListInput]): String
    deleteGroup(name: String): String
    addIndividualToGroup(email: String, groupName: String): String
  }
`)

export const root = {
  configureService: serviceResolvers.configureService,
  disableService: serviceResolvers.disableService,
  services: serviceResolvers.listServices,
  addAccessRules: individualsResolvers.addAccessRules,
  addIndividualToGroup: individualsResolvers.addGroupMembership,
  setGroupAccessRules: groupsResolvers.setGroupAccessRules,
  group: groupsResolvers.getGroup,
  groups: groupsResolvers.listGroups,
  deleteGroup: groupsResolvers.deleteGroup
}
