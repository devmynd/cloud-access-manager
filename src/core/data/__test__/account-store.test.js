/* eslint-env jest */
import { accountStore as store } from '../account-store'
import fs from 'file-system'
process.env.ACCOUNTS_PATH = './.accounts.test.store.json'

test('persists accounts initially when service accounts are downloaded', () => {
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

test.only('updates existing account when service accounts are downloaded', () => {
  if (fs.existsSync(process.env.ACCOUNTS_PATH)) {
    fs.unlinkSync(process.env.ACCOUNTS_PATH)
  }

  store.save({
    serviceId: "test-service",
    userAccount: {
      identity: { email: "test@test.com" },
      assets: [{name: "repo A", role: "member"}, {name: "repo B", role: "owner"}]
      }
  })

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
