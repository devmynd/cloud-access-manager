/* eslint-env jest */
import { Auditor } from '../lib/core/auditor'

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
      services: [
        {
          id: 'test-service',
          assets: ['Project A', 'Project B']
        },
        {
          id: 'another-test-service',
          assets: ['Repo A', 'Repo B']
        }
      ]
    }]
  })

  test('it does not flag the user when they have full access to both services', () => {
    users = [{
      email: 'user@email.com',
      groups: [],
      accessRules: {
        'test-service': 'full',
        'another-test-service': 'full'
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
        'test-service': ['Project A', 'Project B'],
        'another-test-service': ['Repo A', 'Repo B']
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
        'test-service': 'full',
        'another-test-service': ['Repo A']
      }
    }]
    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(1)
    expect(results[0]).toEqual({
      email: 'user@email.com',
      services: [
        {
          id: 'another-test-service',
          assets: ['Repo B']
        }
      ]
    })
  })

  test("flags the user when they aren't whitelisted for one of the services", () => {
    users = [{
      email: 'user@email.com',
      groups: [],
      accessRules: {
        'test-service': 'full'
      }
    }]
    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(1)
    expect(results[0]).toEqual({
      email: 'user@email.com',
      services: [
        {
          id: 'another-test-service',
          assets: ['Repo A', 'Repo B']
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
      services: [
        {
          id: 'test-service',
          assets: ['Project A', 'Project B']
        },
        {
          id: 'another-test-service',
          assets: ['Repo A', 'Repo B']
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
      accessRules: { 'test-service': 'full' }
    }, {
      name: 'admin',
      accessRules: { 'another-test-service': 'full' }
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
        'test-service': ['Project B'],
        'another-test-service': ['Repo A']
      }
    }]
    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(1)
    expect(results[0]).toEqual({
      email: 'user@email.com',
      services: [
        {
          id: 'test-service',
          assets: ['Project A']
        },
        {
          id: 'another-test-service',
          assets: ['Repo B']
        }
      ]
    })
  })
})
