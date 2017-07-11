/* eslint-env jest */
import { getConfigKeys } from '../lib/core/service-providers'

test('reads config keys', () => {
  expect(getConfigKeys('dummy')).toEqual(['dummyApiToken'])
})
