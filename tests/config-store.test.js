/* eslint-env jest */
import { configStore as store } from '../lib/data/config-store'

test('persist config keys by service', () => {
  store.save('someService', { someKey: 'someValue' })
  store.save('someOtherService', { anotherKey: 'anotherValue' })

  let retrieved = store.get('someService')

  expect(retrieved.someKey).toBe('someValue')
  expect(typeof (retrieved.anotherValue)).toBe('undefined')
})
