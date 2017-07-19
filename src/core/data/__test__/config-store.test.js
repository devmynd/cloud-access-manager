/* eslint-env jest */
import { configStore as store } from '../config-store'
import fs from 'file-system'
process.env.CONFIG_PATH = './.services.test.store.json'

test('persist config keys by service', () => {
  if (fs.existsSync(process.env.CONFIG_PATH)) {
    fs.unlinkSync(process.env.CONFIG_PATH)
  }

  store.save('someService', { someKey: 'someValue' })
  store.save('someOtherService', { anotherKey: 'anotherValue' })

  let retrieved = store.get('someService')

  expect(retrieved.someKey).toBe('someValue')
  expect(typeof (retrieved.anotherValue)).toBe('undefined')
})
