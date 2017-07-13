/* eslint-env jest */
import { manager } from '../lib/core/service-providers'

test('reads config keys', () => {
  expect(manager.getConfigKeys('dummy')).toEqual(['dummyApiToken'])
})
