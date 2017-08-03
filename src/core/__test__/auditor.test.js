/* eslint-env jest */

import { Auditor } from '../auditor'
import type { ServiceUserAccount, FlaggedInfo } from '../types'

let individualStore = {

}

let groupStore = {

}

let individual, auditor

beforeEach(() => {
  individual = {
    id: "1",
    fullname:"test individual",
    primaryEmail: "test@test.com",
    serviceUserIdentities: {},
    accessRules: {},
    groups: []
  }
  auditor = new Auditor(individualStore, groupStore)
})

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
    expect(flaggedInfo).not.toBeNull()
    expect(flaggedInfo).not.toBeUndefined()
    if (flaggedInfo) {
      expect(flaggedInfo.individual).toBeNull()
      expect(flaggedInfo.identity).toEqual({ userId: "test123" })
      expect(flaggedInfo.assets).toEqual([{ name: "project a", role: "member" }])
    }
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
    expect(flaggedInfo).not.toBeNull()
    expect(flaggedInfo).not.toBeUndefined()
    if(flaggedInfo) {
      expect(flaggedInfo.individual).toBeNull()
      expect(flaggedInfo.identity).toEqual({ fullname: "test individual", userId: "some user id" })
      expect(flaggedInfo.assets).toEqual([{ name: "project a", role: "member" }])
    }
  })
})

const matchingIndividualTests = (account) => {
  test("it flags if they have no service access rule at all", () => {

    // arrange

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expect(false).toBe(true)
  })

  test("it flags if they have a service access rule, with full access, for different roles", () => {
    // arrange

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expect(false).toBe(true)
  })

  test("it flags if they have per asset access for the wrong assets", () => {
    // arrange

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expect(false).toBe(true)
  })

  test("it flags if they have per asset access for the wrong roles", () => {
    // arrange

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expect(false).toBe(true)
  })

  test("it flags if they have full access through group membership, for the wrong role", () => {
    // arrange

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expect(false).toBe(true)
  })

  test("it does not flag if they have full access for the same role", () => {
    // arrange

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expect(false).toBe(true)
  })

  test("it does not flag if they have full access through group membership, for the same role", () => {
    // arrange

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expect(false).toBe(true)
  })

  test("it does not flag if they have matching per asset access for the same role", () => {
    // arrange

    // act
    let flaggedInfo = auditor.auditAccount(account)

    // assert
    expect(false).toBe(true)
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
        { name: "project a", role: "member" }
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
        { name: "project a", role: "member" }
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
