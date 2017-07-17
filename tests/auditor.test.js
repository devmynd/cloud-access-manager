/* eslint-env jest */
import { Auditor } from '../lib/core/auditor'

describe('performAudit', () => {
  let userServiceSummaries
  beforeEach(() => {
    userServiceSummaries = [{
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
    const users = [{
      email: 'user@email.com',
      groups: [],
      accessRules: {
        'test-service': 'full',
        'another-test-service': 'full'
      }
    }]
    const results = new Auditor(userServiceSummaries, users, []).performAudit()

    expect(results.length).toBe(0)
  })

  test('it does not flag the user when they are whitelisted for each asset in each service', () => {
    const users = [{
      email: 'user@email.com',
      groups: [],
      accessRules: {
        'test-service': ['Project A', 'Project B'],
        'another-test-service': ['Repo A', 'Repo B']
      }
    }]
    const results = new Auditor(userServiceSummaries, users, []).performAudit()

    expect(results.length).toBe(0)
  })

  test('flags the user if there is an asset they are not whitelisted for', () => {
    const users = [{
      email: 'user@email.com',
      groups: [],
      accessRules: {
        'test-service': 'full',
        'another-test-service': ['Repo A']
      }
    }]
    const results = new Auditor(userServiceSummaries, users, []).performAudit()

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
    const users = [{
      email: 'user@email.com',
      groups: [],
      accessRules: {
        'test-service': 'full'
      }
    }]
    const results = new Auditor(userServiceSummaries, users, []).performAudit()

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
    const users = [{
      email: 'user@email.com',
      groups: [],
      accessRules: { }
    }]
    const results = new Auditor(userServiceSummaries, users, []).performAudit()

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
    const users = [{
      email: 'user@email.com',
      groups: ['employee', 'admin'],
      accessRules: { }
    }]
    const groups = [{
      name: 'employee',
      accessRules: { 'test-service': 'full' }
    }, {
      name: 'admin',
      accessRules: { 'another-test-service': 'full' }
    }]
    const results = new Auditor(userServiceSummaries, users, groups).performAudit()

    expect(results.length).toBe(0)
  })

  test('does not flag the user for assets which are whitelisted through their group membership', () => {
    const users = [{
      email: 'user@email.com',
      groups: ['employee'],
      accessRules: { }
    }]
    const groups = [{
      name: 'employee',
      accessRules: {
        'test-service': ['Project B'],
        'another-test-service': ['Repo A']
      }
    }]
    const results = new Auditor(userServiceSummaries, users, groups).performAudit()

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
