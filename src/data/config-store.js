// @flow
import fs from 'file-system'

const filePath = './.services.json'

export class ConfigStore {
  save (moduleName: string, config: any): void {
    var data

    if (fs.existsSync(filePath)) {
      let json = fs.readFileSync(filePath, 'utf8')
      data = JSON.parse(json)
    } else {
      data = {}
    }

    data[moduleName] = config
    fs.writeFileSync(filePath, JSON.stringify(data))
  }

  get (moduleName: string): any {
    let json = fs.readFileSync(filePath, 'utf8')
    let data = JSON.parse(json)
    return data[moduleName]
  }
}
