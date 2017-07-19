/* eslint-env jest */
import { manager } from '../manager'

test('reads config keys', () => {
  expect(manager.getConfigKeys('dummy')).toEqual(['Dummy Api Key', 'Dummy Api Secret'])
})
