/* eslint-env jest */
import { groupStore as store } from '../group-store'
import fs from 'file-system'
process.env.GROUPS_PATH = './.groups.test.store.json'


function deleteFile() {
  if (fs.existsSync(process.env.GROUPS_PATH)) {
    fs.unlinkSync(process.env.GROUPS_PATH)
  }
}

describe('crud', () => {
  beforeEach(() => {
    deleteFile()
    store.save({ name: 'some group', accessRules: { 'someService': [{ asset: "*", role: "*" }] } })
    store.save({ name: 'some other group', accessRules: { 'a different service': [{ asset: "a", role: "b" }] } })
  })

  test('it has a default employee group', () => {
    const employeeGroup = store.get('Employees')
    expect(employeeGroup).not.toBeNull()
  })

  test('get(groupName)', () => {
    let retrieved = store.get('some group')

    expect(retrieved.name).toBe('some group')
    expect(retrieved.accessRules).toEqual({ 'someService': [{ asset: "*", role: "*" }] })
  })

  test('getAll()', () => {
    let retrieved = store.getAll()

    expect(retrieved.length).toBe(3)
    expect(retrieved).toEqual([
      { name: "Employees", accessRules: {} },
      { name: 'some group', accessRules: { 'someService': [{ asset: "*", role: "*" }] } },
      { name: 'some other group', accessRules: { 'a different service': [{ asset: "a", role: "b" }] } }
     ])
  })

  test('getAccessRules(groupName, serviceId)', () => {
    let accessRules = store.getAccessRules('some group', 'someService')

    expect(accessRules).toEqual([{ asset: "*", role: "*" }])
  })

  test('exists(groupName)', () => {
    expect(store.exists('some group')).toBe(true)
    expect(store.exists('unknown group')).toBe(false)
  })

  test('save(group)', () => {
    store.save({ name: 'some group', accessRules: {} })
    let retrieved = store.get('some group')

    expect(retrieved).toEqual({ name: 'some group', accessRules: {} })
  })

  test('delete(groupName)', () => {
    store.delete('some group')
    let retrieved = store.get('some group')

    expect(retrieved).toBeNull()
  })
})
