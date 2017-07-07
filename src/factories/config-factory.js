// @flow

export class ConfigFactory {
  getKeys (moduleName: string): Array<string> {
    let module = require('../services/dummy')

    console.log(module)

    return []
  }
}
