// @flow
import { getConfigKeys } from './../../core/service-providers'
import { configStore } from './../../core/data/config-store'
import inquirer from 'inquirer'

export function config (serviceName: string) {
  const configKeys = getConfigKeys(serviceName)
  if (!configKeys) {
    throw new Error(`undefined module ${serviceName}`)
  }

  const questions = configKeys.map((key) => ({
    type: 'input',
    name: key,
    message: `enter ${key}:`
  }))

  inquirer.prompt(questions).then(function (values) {
    configStore.save(serviceName, values)
  })
}
