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

program.parse(process.argv)
