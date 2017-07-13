/* eslint-env jest */
import { manager } from '../lib/core/service-providers/manager'

test('reads config keys', () => {
  expect(manager.getConfigKeys('dummy')).toEqual(['Dummy Api Key', 'Dummy Api Secret'])
})
