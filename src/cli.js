#!/usr/bin/env node
// @flow

import { factory } from './factories/service-module-factory'
import { ConfigStore } from './data/config-store'

var program = require('commander')
var inquirer = require('inquirer')

program
  .command('config <service>')
  .description('configures a service provider with the required api keys')
  .action(function (service) {
    let configKeys = factory(service).configKeys

    var questions = []
    configKeys.forEach(function (key) {
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
