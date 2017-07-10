/* eslint-env jest */
import { modules } from '../lib/services'

test('reads config keys', () => {
  let module = modules['dummy']

  expect(module.configKeys).toEqual(['dummyApiToken'])
})
