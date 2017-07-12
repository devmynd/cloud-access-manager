// @flow
import { getConfigKeys } from './../../core/service-providers'
import { configStore } from './../../core/data/config-store'
import inquirer from 'inquirer'
import { terminal as term } from 'terminal-kit'

export function config (serviceId: string) {
  const configKeys = getConfigKeys(serviceId)
  if (!configKeys) {
    term.red(`undefined module ${serviceId}\n`)
    return
  }

  const questions = configKeys.map((key) => ({
    type: 'input',
    name: key,
    message: `enter ${key}:`
  }))

  inquirer.prompt(questions).then(function (values) {
    configStore.save(serviceId, values)
  })
}
