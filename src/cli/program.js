#!/usr/bin/env node
// @flow
import program from 'commander'
import * as commands from './commands'
import { terminal as term } from 'terminal-kit'

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
  .command('groups [groupName]')
  .option('-c, --config', 'interactively configures a group (must supply the groupName parameter with it)')
  .description('shows or configures a group or groups')
  .action((groupName, options) => {
    if (options.config) {
      if (groupName) {
        commands.configureGroup(groupName)
      } else {
        term.red('Missing parameter: groupName\n')
      }
    } else {
      if (groupName) {
        commands.showGroup(groupName)
      } else {
        commands.listGroups()
      }
    }
  })

program.parse(process.argv)
