#!/usr/bin/env node
// @flow
import program from 'commander'
import * as commands from './commands'

program
  .command('config [service]')
  .description('configures a service provider with the required api keys')
  .action((service) => {
    if (service) {
      commands.configureService(service)
    } else {
      commands.listAllConfigs()
    }
  })

program
  .command('list [service]')
  .description('lists all user email addresses by service')
  .action((service) => {
    if (service) {
      commands.listByService(service)
    } else {
      commands.listAll()
    }
  })

program
  .command('audit')
  .option('-p, --print', 'non-interactive audit that just prints the non-whitelisted users')
  .description('searches through all services to find any non-whitelisted user accounts')
  .action((options) => {
    if (options.print) {
      commands.audit()
    } else {
      commands.interactiveAudit()
    }
  })

program
  .command('groups')
  .description('lists all available groups')
  .action(commands.listGroups)

program
  .command('group <groupName>')
  .option('-c, --create', 'creates a new group')
  .option('-D, --delete', 'deletes a group')
  .option('-s, --configService <service>', 'adds/updates a service for a group, along with role selection')
  .option('-r, --removeService <service>', 'removes a service from the group')
  .description('operations for managing groups')
  .action((groupName, options) => {
    if (options.create) {
      commands.createGroup(groupName)
    } else if (options.delete) {
      commands.deleteGroup(groupName)
    } else if (options.configService) {
      commands.configureServiceForGroup(options.configService, groupName)
    } else if (options.removeService) {
      commands.removeServiceFromGroup(options.removeService, groupName)
    } else {
      commands.showGroup(groupName)
    }
  })

program.parse(process.argv)
