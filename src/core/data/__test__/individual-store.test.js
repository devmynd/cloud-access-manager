/* eslint-env jest */
import { individualStore as store } from '../individual-store'
import fs from 'file-system'
process.env.INDIVIDUALS_PATH = './.individuals.test.store.json'

describe('integration test', () => {
  test('inserts, updates, and reads', () => {
    if (fs.existsSync(process.env.INDIVIDUALS_PATH)) {
      fs.unlinkSync(process.env.INDIVIDUALS_PATH)
    }

    let entry = {
      id: "user1",
      fullname: "User 1",
      primaryEmail: 'test-1@test.com',
      serviceUserIdentities: {
        "some-service": {
          userId: "user-1"
        },
        "another-service": {
          email: "user-1@email.com",
          fullname: "User One"
        }
      },
      accessRules: {
        "some-service": [{ asset: "*", role: "member" }],
        "another-service": [{ asset: "a", role: "owner" }]
      },
      groups: ["employees", "admins"]
    }

    // Insert new record
    store.save(entry)

    // Find the user based on a matching email for a new service the individual doesn't have yet.
    let retrieved = store.getByServiceUserIdentity("non-existing-service", {
      email: "test-1@test.com"
    })
    expect(retrieved).not.toBeUndefined()
    expect(retrieved).not.toBeNull()

    // Find the user by an existing service user identity
    retrieved = store.getByServiceUserIdentity("some-service", {
      userId: "user-1"
    })

    expect(retrieved).toEqual({
      id: "user1",
      fullname: "User 1",
      primaryEmail: 'test-1@test.com',
      serviceUserIdentities: {
        "some-service": {
          userId: "user-1"
        },
        "another-service": {
          email: "user-1@email.com",
          fullname: "User One"
        }
      } ,
      accessRules: {
        "some-service": [{ asset: "*", role: "member" }],
        "another-service": [{ asset: "a", role: "owner" }]
      },
      groups: ["employees", "admins"]
    })

    // Update the record
    entry.fullname = "User One"
    entry.primaryEmail = "testOne@test.com"
    entry.serviceUserIdentities["new-service"] = {
      userId: "testOne"
    }
    entry.accessRules["some-service"].push({ asset: "project", role: "*" })
    entry.groups.push("management")

    store.save(entry)

    // Retrieve and test the updated record
    retrieved = store.getAll()

    expect(retrieved.length).toBe(1)
    expect(retrieved[0]).toEqual({
      id: "user1",
      fullname: "User One",
      primaryEmail: 'testOne@test.com',
      serviceUserIdentities: {
        "some-service": {
          userId: "user-1"
        },
        "another-service": {
          email: "user-1@email.com",
          fullname: "User One"
        },
        "new-service": {
          userId: "testOne"
        }
      } ,
      accessRules: {
        "some-service": [{ asset: "*", role: "member" }, { asset: "project", role: "*" }],
        "another-service": [{ asset: "a", role: "owner" }]
      },
      groups: ["employees", "admins", "management"]
    })

    // Insert a second record
    store.save({
      id: "user2",
      fullname: "User 2",
      primaryEmail: 'test-2@test.com',
      serviceUserIdentities: {},
      accessRules: {},
      groups: []
    })

    // Check that a second entry was inserted instead of overwriting the other entry
    // Retrieve and test the new record
    retrieved = store.getAll()
    expect(retrieved.length).toBe(2)
  })
})
