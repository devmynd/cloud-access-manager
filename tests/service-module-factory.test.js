/* eslint-env jest */
import { factory } from '../lib/services'

test('reads config keys', () => {
  let module = factory('dummy')

  expect(module.configKeys).toEqual(['apiToken'])
})
