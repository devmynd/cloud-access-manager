/* eslint-env jest */

import { Auditor } from '../auditor'
import type { ServiceUserAccount, FlaggedInfo } from '../types'

let individualStore = {

}

let groupStore = {
  groups: []
}

let individual, auditor



beforeEach(() => {
  individual = {
    id: "123",
    fullname:"test individual",
    primaryEmail: "test@test.com",
    serviceUserIdentities: {},
    accessRules: {},
    groups: []
  }
  groupStore.groups = []
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

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expectFlaggedInfo(flaggedInfo, () => {
      expect(flaggedInfo.individualId).toBeNull()
      expect(flaggedInfo.identity).toEqual({ userId: "test123" })
      expect(flaggedInfo.assets).toEqual([{ name: "project a", role: "member" }])
    })
  })

  test("it should not match based on full name", () => {
    // arrange
    let identity = {
      fullname: "test individual",
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
      fullname: "test individual",
      email: "test@test.com"
    }

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expectFlaggedInfo(flaggedInfo, () => {
      expect(flaggedInfo.individualId).toBeNull()
      expect(flaggedInfo.identity).toEqual({ fullname: "test individual", userId: "some user id" })
      expect(flaggedInfo.assets).toEqual([{ name: "project a", role: "member" }])
    })
  })
})

const matchingIndividualTests = (account) => {
  test("it flags if they have no service access rule at all", () => {
    // arrange
    individual.accessRules = {}

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expectFlaggedInfo(flaggedInfo, () => {
      expect(flaggedInfo.individualId).toBe("123")
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

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expectFlaggedInfo(flaggedInfo, () => {
      expect(flaggedInfo.individualId).toBe("123")
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

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expectFlaggedInfo(flaggedInfo, () => {
      expect(flaggedInfo.individualId).toBe("123")
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

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expectFlaggedInfo(flaggedInfo, () => {
      expect(flaggedInfo.individualId).toBe("123")
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
    groupStore.groups = [{
      name: "employee",
      accessRules: {
        "test service": [{ asset: "*", role: "member"}]
      }
    }]

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expectFlaggedInfo(flaggedInfo, () => {
      expect(flaggedInfo.individualId).toBe("123")
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

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expect(flaggedInfo).toBeUndefined()
  })

  test("it does not flag if they have full access through group membership, for the same role", () => {
    // arrange
    individual.accessRules = {}
    individual.groups = ["employee"]
    groupStore.groups = [{
      name: "employee",
      accessRules: {
        "test service": [
          { asset: "*", role: "member"},
          { asset: "*", role: "owner"}
        ]
      }
    }]

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

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expect(flaggedInfo).toBeUndefined()
  })

  test("it does not flag, if they have full access through group membership", () => {
    // arrange
    individual.accessRules = {}
    individual.groups = ["employee"]
    groupStore.groups = [{
      name: "employee",
      accessRules: {
        "test service": [
          { asset: "*", role: "*"}
        ]
      }
    }]

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

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expectFlaggedInfo(flaggedInfo, () => {
      expect(flaggedInfo.individualId).toBe("123")
      expect(flaggedInfo.serviceId).toBe("test service")
      expect(flaggedInfo.userIdentity).toEqual(account.userAccount.identity)
      expect(flaggedInfo.assets).toEqual([
        { name: "project a" }
      ])
    })
  })

})
