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

export const configStore = {
  save: (serviceId: string, config: any) => {
    const data = readConfig()
    data[serviceId] = config
    fs.writeFileSync(filePath, JSON.stringify(data))
  },

  get: (serviceId: string) => {
    const data = readConfig()
    return data[serviceId]
  }
}
