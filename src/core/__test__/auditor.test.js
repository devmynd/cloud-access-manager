/* eslint-env jest */
import { Auditor } from '../auditor'
import type { ServiceUserAccount, FlaggedInfo } from '../types'
import { groupStore } from '../data/group-store'
import { individualStore } from '../data/individual-store'
import fs from 'file-system'

process.env.INDIVIDUALS_PATH = './.individuals.test.store.json'
process.env.GROUPS_PATH = './.groups.test.store.json'

let individual, auditor

beforeEach(() => {
  if (fs.existsSync(process.env.INDIVIDUALS_PATH)) {
    fs.unlinkSync(process.env.INDIVIDUALS_PATH)
  }
  if (fs.existsSync(process.env.GROUPS_PATH)) {
    fs.unlinkSync(process.env.GROUPS_PATH)
  }

  individual = {
    id: "123",
    fullName:"test individual",
    primaryEmail: "test@test.com",
    serviceUserIdentities: {},
    accessRules: {},
    groups: []
  }

  auditor = new Auditor(individualStore, groupStore)
})

function expectFlaggedInfo(flaggedInfo, expectationsBlock) {
  expect(flaggedInfo).not.toBeNull()
  expect(flaggedInfo).not.toBeUndefined()
  if (flaggedInfo) {
    expectationsBlock()
  }
}

describe("without a matching individual record", () => {

  test("it should not match based on user id for different services", () => {
    // arrange
    let identity = {
      userId: "test123"
    }
    let account = {
      serviceId: "service in question",
      userAccount: {
        identity: identity,
        assets: [
          { name: "project a", role: "member" }
        ]
      }
    }
    individual.serviceUserIdentities["a different service"] = identity
    individualStore.save(individual)

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expectFlaggedInfo(flaggedInfo, () => {
      expect(flaggedInfo.individual).toBeNull()
      expect(flaggedInfo.userIdentity).toEqual({ userId: "test123" })
      expect(flaggedInfo.assets).toEqual([{ name: "project a", role: "member" }])
    })
  })

  test("it should not match based on full name", () => {
    // arrange
    let identity = {
      fullName: "test individual",
      userId: "some user id"
    }

    let account = {
      serviceId: "service in question",
      userAccount: {
        identity: identity,
        assets: [
          { name: "project a", role: "member" }
        ]
      }
    }
    individual.serviceUserIdentities["some other service"] = {
      fullName: "test individual",
      email: "test@test.com"
    }
    individualStore.save(individual)

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expectFlaggedInfo(flaggedInfo, () => {
      expect(flaggedInfo.individual).toBeNull()
      expect(flaggedInfo.userIdentity).toEqual({ fullName: "test individual", userId: "some user id" })
      expect(flaggedInfo.assets).toEqual([{ name: "project a", role: "member" }])
    })
  })
})

const matchingIndividualTests = (account) => {
  test("it flags if they have no service access rule at all", () => {
    // arrange
    individual.accessRules = {}
    individualStore.save(individual)

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expectFlaggedInfo(flaggedInfo, () => {
      expect(flaggedInfo.individual.id).toBe("123")
      expect(flaggedInfo.serviceId).toBe("test service")
      expect(flaggedInfo.userIdentity).toEqual(account.userAccount.identity)
      expect(flaggedInfo.assets).toEqual([
        { name: "project a", role: "member" },
        { name: "project b", role: "owner" }
      ])
    })
  })

  test("it flags if they have a service access rule, with full access, for different roles", () => {
    // arrange
    individual.accessRules["test service"] = [{ asset: "*", role: "member" }]
    individualStore.save(individual)

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expectFlaggedInfo(flaggedInfo, () => {
      expect(flaggedInfo.individual.id).toBe("123")
      expect(flaggedInfo.serviceId).toBe("test service")
      expect(flaggedInfo.userIdentity).toEqual(account.userAccount.identity)
      expect(flaggedInfo.assets).toEqual([
        { name: "project b", role: "owner" }
      ])
    })
  })

  test("it flags if they have per asset access for the wrong assets", () => {
    // arrange
    individual.accessRules["test service"] = [{ asset: "project b", role: "owner" }]
    individualStore.save(individual)

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expectFlaggedInfo(flaggedInfo, () => {
      expect(flaggedInfo.individual.id).toBe("123")
      expect(flaggedInfo.serviceId).toBe("test service")
      expect(flaggedInfo.userIdentity).toEqual(account.userAccount.identity)
      expect(flaggedInfo.assets).toEqual([
        { name: "project a", role: "member" }
      ])
    })
  })

  test("it flags if they have per asset access for the wrong roles", () => {
    // arrange
    individual.accessRules["test service"] = [
      { asset: "project b", role: "admin" },
      { asset: "project a", role: "admin" }
    ]
    individualStore.save(individual)

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expectFlaggedInfo(flaggedInfo, () => {
      expect(flaggedInfo.individual.id).toBe("123")
      expect(flaggedInfo.serviceId).toBe("test service")
      expect(flaggedInfo.userIdentity).toEqual(account.userAccount.identity)
      expect(flaggedInfo.assets).toEqual([
        { name: "project a", role: "member" },
        { name: "project b", role: "owner" }
      ])
    })
  })

  test("it flags if they have full access through group membership, for the wrong role", () => {
    // arrange
    individual.accessRules = {}
    individual.groups = ["employee"]
    groupStore.save({
      name: "employee",
      accessRules: {
        "test service": [{ asset: "*", role: "member"}]
      }
    })
    individualStore.save(individual)

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expectFlaggedInfo(flaggedInfo, () => {
      expect(flaggedInfo.individual.id).toBe("123")
      expect(flaggedInfo.serviceId).toBe("test service")
      expect(flaggedInfo.userIdentity).toEqual(account.userAccount.identity)
      expect(flaggedInfo.assets).toEqual([
        { name: "project b", role: "owner" }
      ])
    })
  })

  test("it does not flag if they have full access for the same role", () => {
    // arrange
    individual.accessRules["test service"] = [
      { asset: "*", role: "member" },
      { asset: "*", role: "owner" }
    ]
    individualStore.save(individual)

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expect(flaggedInfo).toBeUndefined()
  })

  test("it does not flag if they have full access through group membership, for the same role", () => {
    // arrange
    individual.accessRules = {}
    individual.groups = ["employee"]
    groupStore.save({
      name: "employee",
      accessRules: {
        "test service": [
          { asset: "*", role: "member"},
          { asset: "*", role: "owner"}
        ]
      }
    })
    individualStore.save(individual)

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expect(flaggedInfo).toBeUndefined()
  })

  test("it does not flag if they have matching per asset access for the same role", () => {
    // arrange
    individual.accessRules["test service"] = [
      { asset: "project b", role: "owner" },
      { asset: "project a", role: "member" }
    ]
    individualStore.save(individual)

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expect(flaggedInfo).toBeUndefined()
  })
}


describe("with matching individual based on email", () => {
  let account = {
    serviceId: "test service",
    userAccount: {
      identity: {
        email: "test@test.com"
      },
      assets: [
        { name: "project a", role: "member" },
        { name: "project b", role: "owner" }
      ]
    }
  }
  matchingIndividualTests(account)
})

describe("with matching individual based on service user id", () => {
  let account = {
    serviceId: "test service",
    userAccount: {
      identity: {
        userId: "matching user id"
      },
      assets: [
        { name: "project a", role: "member" },
        { name: "project b", role: "owner" }
      ]
    }
  }
  beforeEach(() => {
    individual.serviceUserIdentities["test service"] = {
      userId: "matching user id"
    }
  })
  matchingIndividualTests(account)
})

describe("with matching individual, when the service doesn't have roles", () => {
  let account = {
    serviceId: "test service",
    userAccount: {
      identity: {
        email: "test@test.com"
      },
      assets: [
        { name: "project a" },
        { name: "project b" }
      ]
    }
  }

  test("it does not flag, if they have full access", () => {
    // arrange
    individual.accessRules["test service"] = [{ asset: "*", role: "*" }]
    individualStore.save(individual)

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expect(flaggedInfo).toBeUndefined()
  })

  test("it does not flag, if they have full access through group membership", () => {
    // arrange
    individual.accessRules = {}
    individual.groups = ["employee"]
    groupStore.save({
      name: "employee",
      accessRules: {
        "test service": [
          { asset: "*", role: "*"}
        ]
      }
    })
    individualStore.save(individual)

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expect(flaggedInfo).toBeUndefined()
  })

  test("it does not flag if they have matching per asset access", () => {
    // arrange
    individual.accessRules["test service"] = [
      { asset: "project b", role: "*" },
      { asset: "project a", role: "*" }
    ]
    individualStore.save(individual)

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expect(flaggedInfo).toBeUndefined()
  })

  test("it does flag assets that do not have access", () => {
    // arrange
    individual.accessRules["test service"] = [
      { asset: "project b", role: "*" }
    ]
    individualStore.save(individual)

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expectFlaggedInfo(flaggedInfo, () => {
      expect(flaggedInfo.individual.id).toBe("123")
      expect(flaggedInfo.serviceId).toBe("test service")
      expect(flaggedInfo.userIdentity).toEqual(account.userAccount.identity)
      expect(flaggedInfo.assets).toEqual([
        { name: "project a" }
      ])
    })
  })

})
