/* eslint-env jest */
// @flow
import { Auditor } from '../auditor'
import type { ServiceUserAccount, FlaggedInfo } from '../types'

describe("without a matching individual record", () => {
  test("it should not match based on user id for different services", () => {
    // arrange

    // act

    // assert

  })

  test("it should not match based on full name", () => {
    // arrange

    // act

    // assert

  })
})

const testMatchedIndividuals = () => {
  test("it flags if they have no service access rule at all", () => {
    // arrange

    // act

    // assert

  })

  test("it flags if they have a service access rule, with full access, for different roles", () => {
    // arrange

    // act

    // assert

  })

  test("it flags if they have per asset access for the wrong assets", () => {
    // arrange

    // act

    // assert

  })

  test("it flags if they have per asset access for the wrong roles", () => {
    // arrange

    // act

    // assert

  })

  test("it flags if they have full access through group membership, for the wrong role", () => {
    // arrange

    // act

    // assert

  })

  test("it does not flag if they have full access for the same role", () => {
    // arrange

    // act

    // assert

  })

  test("it does not flag if they have full access through group membership, for the same role", () => {
    // arrange

    // act

    // assert

  })

  test("it does not flag if they have matching per asset access for the same role", () => {
    // arrange

    // act

    // assert

  })
}

describe("with matching individual based on email", () => {
  beforeEach(() => {

  })
  testMatchedIndividuals()
})

describe("with matching individual based on service user id", () => {
  beforeEach(() => {

  })
  testMatchedIndividuals()
})
