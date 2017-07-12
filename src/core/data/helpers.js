// @flow
import fs from 'file-system'

export function readData<T> (filePath: any, defaultData: T): T {
  let data = defaultData
  if (fs.existsSync(filePath)) {
    let json = fs.readFileSync(filePath, 'utf8')
    data = JSON.parse(json)
  }
  return data
}
