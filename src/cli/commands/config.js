// @flow
import { getModule } from './../../services'
import { configStore } from './../../data/config-store'
import inquirer from 'inquirer'

export function config (serviceName: string) {
  const module = getModule(serviceName)
  const questions = module.configKeys.map((key) => ({
    type: 'input',
    name: key,
    message: `enter ${key}:`
  }))

  inquirer.prompt(questions).then(function (values) {
    configStore.save(serviceName, values)
  })
}
