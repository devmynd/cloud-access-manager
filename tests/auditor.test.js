/* eslint-env jest */
import * as auditor from '../lib/core/auditor'

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
    const whitelistEntries = [{
      email: 'user@email.com',
      services: [{
        id: 'test-service',
        access: 'full'
      }, {
        id: 'another-test-service',
        access: 'full'
      }]
    }]
    const results = auditor.performAudit(userServiceSummaries, whitelistEntries)

    expect(results.length).toBe(0)
  })

  test('it does not flag the user when they are whitelisted for each asset in each service', () => {
    const whitelistEntries = [{
      email: 'user@email.com',
      services: [{
        id: 'test-service',
        access: ['Project A', 'Project B']
      }, {
        id: 'another-test-service',
        access: ['Repo A', 'Repo B']
      }]
    }]
    const results = auditor.performAudit(userServiceSummaries, whitelistEntries)

    expect(results.length).toBe(0)
  })

  test('flags the user if there is an asset they are not whitelisted for', () => {
    const whitelistEntries = [{
      email: 'user@email.com',
      services: [{
        id: 'test-service',
        access: 'full'
      }, {
        id: 'another-test-service',
        access: ['Repo A']
      }]
    }]
    const results = auditor.performAudit(userServiceSummaries, whitelistEntries)

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
    const whitelistEntries = [{
      email: 'user@email.com',
      services: [{
        id: 'test-service',
        access: 'full'
      }]
    }]
    const results = auditor.performAudit(userServiceSummaries, whitelistEntries)

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
    const whitelistEntries = []
    const results = auditor.performAudit(userServiceSummaries, whitelistEntries)

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
})
