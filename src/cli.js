#!/usr/bin/env node
// @flow

import { modules } from './services'
import { ConfigStore } from './data/config-store'
import inquirer from 'inquirer'
import program from 'commander'
import { terminal as term }  from 'terminal-kit'

function getModule (service) {
  const module = modules[service]
  if (!module) {
    throw new Error(`unknown service: '${service}'`)
  }
  return module
}

program
  .command('config <service>')
  .description('configures a service provider with the required api keys')
  .action(function (service) {
    const module = getModule(service)
    const questions = module.configKeys.map((key) => ({
      type: 'input',
      name: key,
      message: `enter ${key}:`
    }))

    inquirer.prompt(questions).then(function (values) {
      const store = new ConfigStore()
      store.save(service, values)
    })
  })

program
  .command('list')
  .description('lists all user email addresses by service')
  .action(function () {
    const configStore = new ConfigStore()

    const serviceProviders = Object.keys(modules).map((serviceName) => {
      const config = configStore.get(serviceName)
      if (!config) {
        throw new Error(`Service '${serviceName}' not yet configured. Run 'cam config ${serviceName}'`)
      }
      return modules[serviceName].providerFactory(config)
    })

    const promises = serviceProviders.map((provider) =>
      new Promise((resolve, reject) => {
        provider.listAccounts().then(
          (accounts) => {
            resolve({ serviceName: provider.serviceName, accounts: accounts})
          },
          (error) => {
            reject(error)
          })
      })
    )

    Promise.all(promises).then((serviceAccountLists) => {
      const users = serviceAccountLists.reduce((users, serviceAccountList) => {
        serviceAccountList.accounts.forEach((account) => {
          let userInfo = users[account.email] || { services: {} }
          userInfo.services[serviceAccountList.serviceName] = { assets: account.assets }
          users[account.email] = userInfo
        })
        return users
      }, {})

      for (let email in users) {
        term.green(`${email}\n`)
        for (let serviceName in users[email].services) {
          term.cyan(`\t${serviceName}`)
          const service = users[email].services[serviceName]
          if (service.assets.length > 0) {
            term.magenta(' (')
          }
          term.magenta(service.assets.join(' | '))
          if (service.assets.length > 0) {
            term.magenta(')')
          }
          term('\n')
        }
        term('\n')
      }
    })
  })

program.parse(process.argv)
