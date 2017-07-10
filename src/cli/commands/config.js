// @flow
import { modules } from './../../services'
import { configStore } from './../../data/config-store'
import inquirer from 'inquirer'

function getModule (service) {
  const module = modules[service]
  if (!module) {
    throw new Error(`unknown service: '${service}'`)
  }
  return module
}

export const config = (serviceName: string) => {
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
