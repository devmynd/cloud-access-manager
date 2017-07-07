/* eslint-env jest */
const factory = require('../lib/factories/service-module-factory').factory

test('reads config keys', () => {
  let module = factory('dummy')

  expect(module.configKeys).toEqual(['apiToken'])
  expect(module.Provider.name).toBe('DummyProvider')
})
