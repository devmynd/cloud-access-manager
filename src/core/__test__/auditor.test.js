/* eslint-env jest */
import { Auditor } from '../auditor'

describe('performAudit', () => {
  let accounts

  let users = []
  const userStore = {
    getAll () {
      return users
    }
  }

  let groups = []
  const groupStore = {
    getAll () {
      return groups
    }
  }
  const auditor = new Auditor(userStore, groupStore)

  beforeEach(() => {
    accounts = [{
      email: 'user@email.com',
      assetAssignments: [
        {
          service: { id: 'test-service' },
          assets: [
            { name: 'Project A', role: 'member' },
            { name: 'Project B', role: 'member' }
          ]
        },
        {
          service: { id: 'another-test-service' },
          assets: [
            { name: 'Repo A', role: 'member' },
            { name: 'Repo B', role: 'member' }
          ]
        }
      ]
    }]
  })

  test('it does not flag the user when they have full access to both services', () => {
    users = [{
      email: 'user@email.com',
      groups: [],
      accessRules: {
        'test-service': [{ asset: '*', role: '*' }],
        'another-test-service': [{ asset: '*', role: '*' }]
      }
    }]
    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(0)
  })

  test('it does not flag the user when they are whitelisted for each asset in each service', () => {
    users = [{
      email: 'user@email.com',
      groups: [],
      accessRules: {
        'test-service': [{ asset: 'Project A', role: '*' }, { asset: 'Project B', role: '*' }],
        'another-test-service': [{ asset: 'Repo A', role: '*' }, { asset: 'Repo B', role: '*' }]
      }
    }]
    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(0)
  })

  test('flags the user if there is an asset they are not whitelisted for', () => {
    users = [{
      email: 'user@email.com',
      groups: [],
      accessRules: {
        'test-service': [{ asset: '*', role: '*' }],
        'another-test-service': [{ asset: 'Repo A', role: '*' }]
      }
    }]
    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(1)
    expect(results[0]).toEqual({
      email: 'user@email.com',
      assetAssignments: [
        {
          service: { id: 'another-test-service' },
          assets: [{ name: 'Repo B', role: 'member' }]
        }
      ]
    })
  })

  test("flags the user when they aren't whitelisted for one of the services", () => {
    users = [{
      email: 'user@email.com',
      groups: [],
      accessRules: {
        'test-service': [{ asset: '*', role: '*' }]
      }
    }]
    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(1)
    expect(results[0]).toEqual({
      email: 'user@email.com',
      assetAssignments: [
        {
          service: { id: 'another-test-service' },
          assets: [{ name: 'Repo A', role: 'member' }, { name: 'Repo B', role: 'member' }]
        }
      ]
    })
  })

  test("flags the user when they aren't whitelisted at all", () => {
    users = [{
      email: 'user@email.com',
      groups: [],
      accessRules: { }
    }]
    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(1)
    expect(results[0]).toEqual({
      email: 'user@email.com',
      assetAssignments: [
        {
          service: { id: 'test-service' },
          assets: [{ name: 'Project A', role: 'member' }, { name: 'Project B', role: 'member' }]
        },
        {
          service: { id: 'another-test-service' },
          assets: [{ name: 'Repo A', role: 'member' }, { name: 'Repo B', role: 'member' }]
        }
      ]
    })
  })

  test('does not flag the user if one of their groups grants them access', () => {
    users = [{
      email: 'user@email.com',
      groups: ['employee', 'admin'],
      accessRules: { }
    }]
    groups = [{
      name: 'employee',
      accessRules: { 'test-service': [{ asset: '*', role: '*' }] }
    }, {
      name: 'admin',
      accessRules: { 'another-test-service': [{ asset: '*', role: '*' }] }
    }]
    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(0)
  })

  test('does not flag the user for assets which are whitelisted through their group membership', () => {
    users = [{
      email: 'user@email.com',
      groups: ['employee'],
      accessRules: { }
    }]
    groups = [{
      name: 'employee',
      accessRules: {
        'test-service': [{ asset: 'Project B', role: '*' }],
        'another-test-service': [{ asset: 'Repo A', role: '*' }]
      }
    }]
    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(1)
    expect(results[0]).toEqual({
      email: 'user@email.com',
      assetAssignments: [
        {
          service: { id: 'test-service' },
          assets: [{ name: 'Project A', role: 'member' }]
        },
        {
          service: { id: 'another-test-service' },
          assets: [{ name: 'Repo B', role: 'member' }]
        }
      ]
    })
  })

  test('flags users if they have access but for the wrong role', () => {
    users = [{
      email: 'user@email.com',
      groups: ['employee'],
      accessRules: {
        'test-service': [{ asset: 'Project A', role: 'not-member' }]
      }
    }]
    groups = [{
      name: 'employee',
      accessRules: {
        'test-service': [{ asset: 'Project B', role: 'not-member' }],
        'another-test-service': [{ asset: '*', role: 'not-member' }]
      }
    }]

    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(1)
    expect(results[0]).toEqual({
      email: 'user@email.com',
      assetAssignments: [
        {
          service: { id: 'test-service' },
          assets: [{ name: 'Project A', role: 'member' }, { name: 'Project B', role: 'member' }]
        },
        {
          service: { id: 'another-test-service' },
          assets: [{ name: 'Repo A', role: 'member' }, { name: 'Repo B', role: 'member' }]
        }
      ]
    })
  })

  test('does not flag users who have access with the correct role', () => {
    users = [{
      email: 'user@email.com',
      groups: ['employee'],
      accessRules: {
        'test-service': [{ asset: 'Project A', role: 'member' }]
      }
    }]
    groups = [{
      name: 'employee',
      accessRules: {
        'test-service': [{ asset: 'Project B', role: 'member' }],
        'another-test-service': [{ asset: '*', role: 'member' }]
      }
    }]

    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(0)
  })
})
