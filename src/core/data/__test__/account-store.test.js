/* eslint-env jest */
import { accountStore as store } from '../account-store'
import fs from 'file-system'
process.env.ACCOUNTS_PATH = './.accounts.test.store.json'

test('persists accounts initially when service accounts are downloaded', () => {
  // TODO: should this be in a beforeEach? Same with other tests. 
  if (fs.existsSync(process.env.ACCOUNTS_PATH)) {
    fs.unlinkSync(process.env.ACCOUNTS_PATH)
  }

  let downloadedAccount =
    {
    serviceId: "test-service",
    userAccount: {
      identity: { email: "test@test.com" },
      assets: [{name: "repo A", role: "member"}, {name: "repo B", role: "owner"}]
      }
    }

    store.save(downloadedAccount)

    let retrieved = store.getAll()

    expect(retrieved).not.toBeUndefined()
    expect(retrieved).toEqual([
      {
      serviceId: "test-service",
      userAccount: {
        identity: { email: "test@test.com" },
        assets: [{name: "repo A", role: "member"}, {name: "repo B", role: "owner"}]
        }
      }
    ])
})

test('updates existing account when service accounts are downloaded', () => {
  if (fs.existsSync(process.env.ACCOUNTS_PATH)) {
    fs.unlinkSync(process.env.ACCOUNTS_PATH)
  }

  store.save({
    serviceId: "test-service",
    userAccount: {
      identity: { email: "test@test.com" },
      assets: [{name: "repo A", role: "member"}, {name: "repo B", role: "owner"}]
      }
    }
  )

  let downloadedAccount = {
      serviceId: "test-service",
      userAccount: {
        identity: { email: "test@test.com" },
        assets: [{name: "repo C", role: "member"}]
        }
  }

  store.save(downloadedAccount)

  let retrieved = store.getAll()
  expect(retrieved).not.toBeUndefined()
  expect(retrieved).toEqual([
    {
      serviceId: "test-service",
      userAccount: {
        identity: { email: "test@test.com" },
        assets: [{name: "repo C", role: "member"}]
        }
    }
  ])
})

test('gets an existing account', () => {
  if (fs.existsSync(process.env.ACCOUNTS_PATH)) {
    fs.unlinkSync(process.env.ACCOUNTS_PATH)
  }

  let existingAccounts = [{
    serviceId: "test-service",
    userAccount: {
      identity: { email: "test@test.com" },
      assets: [{name: "repo A", role: "member"}, {name: "repo B", role: "owner"}]
      }
  },
  {
    serviceId: "test-service",
    userAccount: {
      identity: { userId: "test" },
      assets: [{name: "repo A", role: "member"}, {name: "repo B", role: "owner"}]
      }
  }]

  existingAccounts.forEach((account) => store.save(account))

  const userIdentity = { email: "test@test.com" }

  let retrieved = store.get("test-service", userIdentity)

  expect(retrieved).not.toBeUndefined()
  expect(retrieved).toEqual({
    serviceId: "test-service",
    userAccount: {
      identity: { email: "test@test.com" },
      assets: [{name: "repo A", role: "member"}, {name: "repo B", role: "owner"}]
      }
    })
})
