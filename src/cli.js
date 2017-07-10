#!/usr/bin/env node
// @flow

import { modules } from './services'
import { ConfigStore } from './data/config-store'
import inquirer from 'inquirer'
import program from 'commander'

program
  .command('config <service>')
  .description('configures a service provider with the required api keys')
  .action(function (service) {
    let module = modules[service]
    if (!module) {
      throw new Error(`unknown module: '${service}'`)
    }

    var questions = []
    module.configKeys.forEach(function (key) {
      questions.push({
        type: 'input',
        name: key,
        message: `enter ${key}:`
      })
    })

    inquirer.prompt(questions).then(function (values) {
      let store = new ConfigStore()
      store.save(service, values)
    })
  })

program.parse(process.argv)
