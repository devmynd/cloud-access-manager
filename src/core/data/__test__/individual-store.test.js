/* eslint-env jest */
import { individualStore as store } from '../individual-store'
import fs from 'file-system'
process.env.INDIVIDUALS_PATH = './.individuals.test.store.json'

describe('integration test', () => {
  test('inserts, updates, and reads', () => {
    if (fs.existsSync(process.env.INDIVIDUALS_PATH)) {
      fs.unlinkSync(process.env.INDIVIDUALS_PATH)
    }

    let entry1 = {
      email: 'test-1@test.com',
      services: [
        {
          id: 'some-service',
          access: 'full'
        }
      ]
    }
    let entry2 = {
      email: 'test-2@test.com',
      services: [
        {
          id: 'some-service',
          access: 'full'
        }
      ]
    }

    // Insert new record
    store.save(entry1)

    // Retrieve and test the new record
    let retrieved = store.getAll()

    expect(retrieved.length).toBe(1)
    expect(retrieved[0]).toEqual({
      email: 'test-1@test.com',
      services: [
        {
          id: 'some-service',
          access: 'full'
        }
      ]
    })

    // Update the record
    entry1.services[0].access = ['asset a', 'asset b']
    entry1.services.push({ id: 'another-service', access: 'full' })

    store.save(entry1)

    // Retrieve and test the updated record
    retrieved = store.getAll()

    expect(retrieved.length).toBe(1)
    expect(retrieved[0]).toEqual({
      email: 'test-1@test.com',
      services: [
        {
          id: 'some-service',
          access: ['asset a', 'asset b']
        },
        {
          id: 'another-service',
          access: 'full'
        }
      ]
    })

    // Insert a second record
    store.save(entry2)

    // Check that a second entry was inserted instead of overwriting the other entry
    // Retrieve and test the new record
    retrieved = store.getAll()
    expect(retrieved.length).toBe(2)
  })
})
