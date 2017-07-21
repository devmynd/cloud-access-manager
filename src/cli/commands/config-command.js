// @flow
import { manager } from './../../core/service-providers/manager'
import { configStore } from './../../core/data/config-store'
import inquirer from 'inquirer'
import { terminal as term } from 'terminal-kit'
import lodash from 'lodash'

export function configureService (serviceId: string) {
  const serviceInfo = manager.getServiceInfo(serviceId)
  if (!serviceInfo) {
    term.red('invalid service id')
  } else {
    const questions = serviceInfo.configKeys.map((key) => ({
      type: 'input',
      name: key,
      message: `enter ${key}:`
    }))

    inquirer.prompt(questions).then(async function (values) {
      configStore.save(serviceId, values)
      const provider = manager.getProvider(serviceId)
      if (provider) {
        try {
          await provider.testConnection()
        } catch (error) {
          term.red('An error occurred testing the connection with the supplied config values.\n\n')
          term.red(error)
          term('\n')
        }
      }
    })
  }
}

export function listAllConfigs () {
  const serviceInfos = manager.getServiceInfos()
  const servicesPartition = lodash.partition(serviceInfos, (serviceInfo) => serviceInfo.isConfigured)
  const configuredServices = servicesPartition[0]
  const unconfiguredServices = servicesPartition[1]

  term.cyan.bold('Configured Services:\n')
  if (configuredServices.length > 0) {
    configuredServices.forEach((serviceInfo) => {
      term.green(`\t${serviceInfo.id}\n`)
    })
  } else {
    term.red('None')
  }
  term('\n')

  term.cyan.bold('Unconfigured Services:\n')
  if (unconfiguredServices.length > 0) {
    unconfiguredServices.forEach((serviceInfo) => {
      term.red(`\t${serviceInfo.id}\n`)
    })
  } else {
    term.green('None')
  }
  term('\n')

  term.cyan.bold('To configure a service, run: \n')
  term('\tcam config <service>\n\n')
}
