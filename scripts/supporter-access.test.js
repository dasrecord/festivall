import test from 'node:test'
import assert from 'node:assert/strict'
import { createSupporterAccess, filterSupporterShoutouts } from './supporter-access.js'

function fakeDb(records, calls) {
  return {
    collection(name) {
      return {
        where(field, operator, id) {
          assert.equal(field, 'id_code')
          assert.equal(operator, '==')
          return {
            limit(count) {
              assert.equal(count, 1)
              return {
                async get() {
                  calls.push([name, id])
                  const record = records[name]?.[id]
                  if (record instanceof Error) throw record
                  return { empty: !record, docs: record ? [{ data: () => record }] : [] }
                }
              }
            }
          }
        }
      }
    }
  }
}

test('supporter access uses the newest matching ticket and expires its cache', async () => {
  let time = new Date(2026, 10, 14).getTime()
  const records = {
    participants_2027: { supporter: { paint_access: true }, revoked: { paint_access: false } },
    participants_2026: { revoked: { paint_access: true }, previous: { paint_access: true } }
  }
  const calls = []
  const access = createSupporterAccess(fakeDb(records, calls), 'paint_access', { now: () => time })

  assert.equal(await access(' supporter '), true)
  assert.equal(await access('revoked'), false)
  assert.equal(await access('previous'), true)
  assert.equal(await access('missing'), false)
  assert.equal(await access(''), false)
  assert.equal(await access(null), false)
  const count = calls.length
  records.participants_2027.supporter.paint_access = false
  assert.equal(await access('supporter'), true)
  assert.equal(calls.length, count)
  time += 30_000
  assert.equal(await access('supporter'), false)
})

test('access lookup errors propagate rather than granting or caching access', async () => {
  const records = { participants_2027: { user: new Error('database unavailable') } }
  const calls = []
  const access = createSupporterAccess(fakeDb(records, calls), 'paint_access', {
    now: () => new Date(2026, 10, 14).getTime()
  })
  await assert.rejects(access('user'), /database unavailable/)
  records.participants_2027.user = { paint_access: true }
  assert.equal(await access('user'), true)
  assert.equal(calls.length, 2)
})

test('shout-out and paint permissions are independent, including their caches', async () => {
  const records = {
    participants_2027: {
      painter: { paint_access: true, shoutout_access: false },
      speaker: { paint_access: false, shoutout_access: true },
      both: { paint_access: true, shoutout_access: true },
      neither: {}
    }
  }
  const db = fakeDb(records, [])
  const options = { now: () => new Date(2026, 10, 14).getTime() }
  const paint = createSupporterAccess(db, 'paint_access', options)
  const shoutout = createSupporterAccess(db, 'shoutout_access', options)

  for (const [id, paintAllowed, shoutoutAllowed] of [
    ['painter', true, false],
    ['speaker', false, true],
    ['both', true, true],
    ['neither', false, false]
  ]) {
    assert.equal(await paint(id), paintAllowed)
    assert.equal(await shoutout(id), shoutoutAllowed)
    assert.equal(await paint(id), paintAllowed)
    assert.equal(await shoutout(id), shoutoutAllowed)
  }
})

test('replay retains only supporter messages in their original order', async () => {
  const docs = ['yes', 'no', null, 'also'].map((id) => ({ data: () => ({ id_code: id }) }))
  const filtered = await filterSupporterShoutouts(docs, async (id) => id === 'yes' || id === 'also')
  assert.deepEqual(filtered, [docs[0], docs[3]])
  await assert.rejects(filterSupporterShoutouts(docs, async () => {
    throw new Error('database unavailable')
  }), /database unavailable/)
})

test('replay includes verified admin messages without granting unverified ones', async () => {
  const docs = ['admin', 'forged', 'supporter'].map((id) => ({
    id, data: () => ({ id_code: id })
  }))
  const filtered = await filterSupporterShoutouts(
    docs, async (id) => id === 'supporter', (doc) => doc.id === 'admin'
  )
  assert.deepEqual(filtered, [docs[0], docs[2]])
})
