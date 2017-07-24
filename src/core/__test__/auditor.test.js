/* eslint-env jest */
import { Auditor } from '../auditor'

describe('performAudit', () => {
  let accounts

  let individuals = []
  let individualStore

  let groups = []
  let groupStore
  let auditor

  beforeEach(() => {
    individualStore = {
      getAll () {
        return individuals
      },
      savedIndividuals: [],
      save (individual) {
        this.savedIndividuals.push(individual)
      }
    }

    groupStore = {
      getAll () {
        return groups
      }
    }

    accounts = [{
      email: 'individual@email.com',
      assetAssignments: [
        {
          service: { id: 'test-service' },
          assets: [
            { name: 'Project A', role: 'member' },
            { name: 'Project B', role: 'member' }
          ]
        },
        {
          service: { id: 'another-test-service' },
          assets: [
            { name: 'Repo A', role: 'member' },
            { name: 'Repo B', role: 'member' }
          ]
        }
      ]
    }]

    auditor = new Auditor(individualStore, groupStore)
  })

  test('it flags a new individual', () => {
    individuals = []
    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(1)
    expect(results[0]).toEqual({
      email: 'individual@email.com',
      assetAssignments: [
        {
          service: { id: 'test-service' },
          assets: [{ name: 'Project A', role: 'member' }, { name: 'Project B', role: 'member' }]
        },
        {
          service: { id: 'another-test-service' },
          assets: [{ name: 'Repo A', role: 'member' }, { name: 'Repo B', role: 'member' }]
        }
      ],
      groups: [],
      isNewIndividual: true
    })
    expect(individualStore.savedIndividuals.length).toBe(1)
    expect(individualStore.savedIndividuals[0]).toEqual({ email: 'individual@email.com', groups: [], accessRules: {} })
  })

  test('it does not flag the individual when they have full access to both services', () => {
    individuals = [{
      email: 'individual@email.com',
      groups: [],
      accessRules: {
        'test-service': [{ asset: '*', role: '*' }],
        'another-test-service': [{ asset: '*', role: '*' }]
      }
    }]
    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(0)
    expect(individualStore.savedIndividuals.length).toBe(0)
  })

  test('it does not flag the individual when they are whitelisted for each asset in each service', () => {
    individuals = [{
      email: 'individual@email.com',
      groups: [],
      accessRules: {
        'test-service': [{ asset: 'Project A', role: '*' }, { asset: 'Project B', role: '*' }],
        'another-test-service': [{ asset: 'Repo A', role: '*' }, { asset: 'Repo B', role: '*' }]
      }
    }]
    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(0)
    expect(individualStore.savedIndividuals.length).toBe(0)
  })

  test('flags the individual if there is an asset they are not whitelisted for', () => {
    individuals = [{
      email: 'individual@email.com',
      groups: [],
      accessRules: {
        'test-service': [{ asset: '*', role: '*' }],
        'another-test-service': [{ asset: 'Repo A', role: '*' }]
      }
    }]
    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(1)
    expect(results[0]).toEqual({
      email: 'individual@email.com',
      assetAssignments: [
        {
          service: { id: 'another-test-service' },
          assets: [{ name: 'Repo B', role: 'member' }]
        }
      ],
      groups: [],
      isNewIndividual: false
    })
    expect(individualStore.savedIndividuals.length).toBe(0)
  })

  test("flags the individual when they aren't whitelisted for one of the services", () => {
    individuals = [{
      email: 'individual@email.com',
      groups: [],
      accessRules: {
        'test-service': [{ asset: '*', role: '*' }]
      }
    }]
    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(1)
    expect(results[0]).toEqual({
      email: 'individual@email.com',
      assetAssignments: [
        {
          service: { id: 'another-test-service' },
          assets: [{ name: 'Repo A', role: 'member' }, { name: 'Repo B', role: 'member' }]
        }
      ],
      groups: [],
      isNewIndividual: false
    })
    expect(individualStore.savedIndividuals.length).toBe(0)
  })

  test("flags the individual when they aren't whitelisted at all", () => {
    individuals = [{
      email: 'individual@email.com',
      groups: [],
      accessRules: { }
    }]
    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(1)
    expect(results[0]).toEqual({
      email: 'individual@email.com',
      assetAssignments: [
        {
          service: { id: 'test-service' },
          assets: [{ name: 'Project A', role: 'member' }, { name: 'Project B', role: 'member' }]
        },
        {
          service: { id: 'another-test-service' },
          assets: [{ name: 'Repo A', role: 'member' }, { name: 'Repo B', role: 'member' }]
        }
      ],
      groups: [],
      isNewIndividual: false
    })
    expect(individualStore.savedIndividuals.length).toBe(0)
  })

  test('does not flag the individual if one of their groups grants them access', () => {
    individuals = [{
      email: 'individual@email.com',
      groups: ['employee', 'admin'],
      accessRules: { }
    }]
    groups = [{
      name: 'employee',
      accessRules: { 'test-service': [{ asset: '*', role: '*' }] }
    }, {
      name: 'admin',
      accessRules: { 'another-test-service': [{ asset: '*', role: '*' }] }
    }]
    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(0)
    expect(individualStore.savedIndividuals.length).toBe(0)
  })

  test('does not flag the individual for assets which are whitelisted through their group membership', () => {
    individuals = [{
      email: 'individual@email.com',
      groups: ['employee'],
      accessRules: { }
    }]
    groups = [{
      name: 'employee',
      accessRules: {
        'test-service': [{ asset: 'Project B', role: '*' }],
        'another-test-service': [{ asset: 'Repo A', role: '*' }]
      }
    }]
    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(1)
    expect(results[0]).toEqual({
      email: 'individual@email.com',
      assetAssignments: [
        {
          service: { id: 'test-service' },
          assets: [{ name: 'Project A', role: 'member' }]
        },
        {
          service: { id: 'another-test-service' },
          assets: [{ name: 'Repo B', role: 'member' }]
        }
      ],
      groups: ['employee'],
      isNewIndividual: false
    })
    expect(individualStore.savedIndividuals.length).toBe(0)
  })

  test('flags individuals if they have access but for the wrong role', () => {
    individuals = [{
      email: 'individual@email.com',
      groups: ['employee'],
      accessRules: {
        'test-service': [{ asset: 'Project A', role: 'not-member' }]
      }
    }]
    groups = [{
      name: 'employee',
      accessRules: {
        'test-service': [{ asset: 'Project B', role: 'not-member' }],
        'another-test-service': [{ asset: '*', role: 'not-member' }]
      }
    }]

    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(1)
    expect(results[0]).toEqual({
      email: 'individual@email.com',
      assetAssignments: [
        {
          service: { id: 'test-service' },
          assets: [{ name: 'Project A', role: 'member' }, { name: 'Project B', role: 'member' }]
        },
        {
          service: { id: 'another-test-service' },
          assets: [{ name: 'Repo A', role: 'member' }, { name: 'Repo B', role: 'member' }]
        }
      ],
      groups: ['employee'],
      isNewIndividual: false
    })
    expect(individualStore.savedIndividuals.length).toBe(0)
  })

  test('does not flag individuals who have access with the correct role', () => {
    individuals = [{
      email: 'individual@email.com',
      groups: ['employee'],
      accessRules: {
        'test-service': [{ asset: 'Project A', role: 'member' }]
      }
    }]
    groups = [{
      name: 'employee',
      accessRules: {
        'test-service': [{ asset: 'Project B', role: 'member' }],
        'another-test-service': [{ asset: '*', role: 'member' }]
      }
    }]

    const results = auditor.performAudit(accounts)

    expect(results.length).toBe(0)
    expect(individualStore.savedIndividuals.length).toBe(0)
  })
})
