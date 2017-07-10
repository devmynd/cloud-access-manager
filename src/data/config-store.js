// @flow
import fs from 'file-system'

const filePath = './.services.json'

function readConfig () {
  var data
  if (fs.existsSync(filePath)) {
    let json = fs.readFileSync(filePath, 'utf8')
    data = JSON.parse(json)
  } else {
    data = {}
  }
  return data
}

export class ConfigStore {


  save (moduleName: string, config: any): void {
    const data = readConfig()
    data[moduleName] = config
    fs.writeFileSync(filePath, JSON.stringify(data))
  }

  get (moduleName: string): any {
    const data = readConfig()
    return data[moduleName]
  }
}
