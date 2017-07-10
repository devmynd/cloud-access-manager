#!/usr/bin/env node
// @flow
import program from 'commander'
import * as commands from './commands'

program
  .command('config <service>')
  .description('configures a service provider with the required api keys')
  .action(commands.config)

program
  .command('list')
  .description('lists all user email addresses by service')
  .action(commands.listAll)

program.parse(process.argv)
