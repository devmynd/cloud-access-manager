/* eslint-env jest */
const Factory = require('../lib/factories/config-factory')

test('reads config keys', () => {
  var factory = Factory()

  expect(factory.getKeys('dummy')).toBe(['apiToken'])
})
