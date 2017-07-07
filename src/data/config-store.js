// @flow
var fs = require('file-system')

const filePath = './.services.json'

export class ConfigStore {
  save (moduleName: string, config: any): void {
    let json = fs.readFileSync(filePath, 'utf8')
    var data = JSON.parse(json)
    data[moduleName] = config

    fs.writeFileSync(filePath, JSON.stringify(data))
  }

  get (moduleName: string): any {
    let json = fs.readFileSync(filePath, 'utf8')
    let data = JSON.parse(json)
    return data[moduleName]
  }
}
