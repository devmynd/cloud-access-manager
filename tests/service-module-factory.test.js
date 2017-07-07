/* eslint-env jest */
import { factory } from '../lib/factories/service-module-factory'

test('reads config keys', () => {
  let module = factory('dummy')

  expect(module.configKeys).toEqual(['apiToken'])
  expect(module.Provider.name).toBe('DummyProvider')
})
