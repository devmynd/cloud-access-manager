/* eslint-env jest */
import { accountCache as cache } from '../account-cache'
import fs from 'file-system'
process.env.ACCOUNTS_PATH = './.accounts.test.store.json'

beforeEach(() => {
  if (fs.existsSync(process.env.ACCOUNTS_PATH)) {
    fs.unlinkSync(process.env.ACCOUNTS_PATH)
  }
})

describe('crud', () => {
  beforeEach(() => {
    cache.set('test-service', [{
      identity: { email: 'test1@test.com' },
      assets: [{name: 'repo A', role: 'member'}, {name: 'repo B', role: 'owner'}]
    }, {
      identity: { userId: 'test2' },
      assets: [{name: 'repo A', role: 'member'}]
    }])
  })

  test('persists accounts initially when service accounts are downloaded', () => {
    let retrieved = cache.get('test-service')

    expect(retrieved).not.toBeUndefined()
    expect(retrieved).toEqual([{
      identity: { email: 'test1@test.com' },
      assets: [{name: 'repo A', role: 'member'}, {name: 'repo B', role: 'owner'}]
    }, {
      identity: { userId: 'test2' },
      assets: [{name: 'repo A', role: 'member'}]
    }])
  })

  test('distinguishes between services', () => {
    let retrieved = cache.get('some-other-service')

    expect(retrieved).toEqual([])
  })

  test('replaces accounts for existing service when service accounts are downloaded', () => {
    let newAccounts = [{
      identity: { email: 'test1@test.com' },
      assets: [{name: 'repo B', role: 'owner'}]
    }]

    cache.set('test-service', newAccounts)

    let retrieved = cache.get('test-service')
    expect(retrieved).not.toBeUndefined()
    expect(retrieved).toEqual([{
      identity: { email: 'test1@test.com' },
      assets: [{name: 'repo B', role: 'owner'}]
    }])
  })

  test('gets an existing account by email', () => {
    let retrieved = cache.getAccountByEmail('test-service', 'test1@test.com')

    expect(retrieved).not.toBeUndefined()
    expect(retrieved).toEqual({
      identity: { email: 'test1@test.com' },
      assets: [{name: 'repo A', role: 'member'}, {name: 'repo B', role: 'owner'}]
    })
  })

  test('gets an existing account by userId', () => {
    let retrieved = cache.getAccountByUserId('test-service', 'test2')

    expect(retrieved).not.toBeUndefined()
    expect(retrieved).toEqual({
      identity: { userId: 'test2' },
      assets: [{name: 'repo A', role: 'member'}]
    })
  })
})

describe('isCached', () => {
  test('returns false if no data', () => {
    const result = cache.isCached('test-service')
    expect(result).toBe(false)
  })

  test('returns true if data is available and not expired', () => {
    const twelveHours = 1000 * 60 * 60 * 12
    const oneMinute = 1000 * 60
    const oneMinuteFromExpiration = new Date(new Date() - twelveHours + oneMinute)
    cache.set('test-service', [], oneMinuteFromExpiration)
    const result = cache.isCached('test-service')
    expect(result).toBe(true)
  })

  test('returns false if data is expired', () => {
    const twelveHours = 1000 * 60 * 60 * 12
    const oneMinute = 1000 * 60
    const oneMinuteAfterExpiration = new Date(new Date() - twelveHours - oneMinute)
    cache.set('test-service', [], oneMinuteAfterExpiration)
    const result = cache.isCached('test-service')
    expect(result).toBe(false)
  })
})
