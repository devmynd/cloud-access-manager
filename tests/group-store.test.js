/* eslint-env jest */
import { groupStore as store } from '../lib/core/data/group-store'
import fs from 'file-system'
process.env.GROUPS_PATH = './.groups.test.store.json'

beforeEach(() => {
  if (fs.existsSync(process.env.GROUPS_PATH)) {
    fs.unlinkSync(process.env.GROUPS_PATH)
  }
})

test('it has a default employee group', () => {
  const employeeGroup = store.get('employee')
  expect(employeeGroup).not.toBeNull()
})

test('persists groups', () => {
  store.save({ name: 'some group', accessRules: { 'someService': 'full' } })
  store.save({ name: 'some other group', accessRules: { 'a different service': 'full' } })

  let retrieved = store.get('some group')

  expect(retrieved.name).toBe('some group')
  expect(retrieved.accessRules).toEqual({ 'someService': 'full' })
})
