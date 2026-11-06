import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { badgeDocumentId, buildBadges, normalizeEmail } from './badge-history.js'

test('merges case-insensitive emails and counts each year only once', () => {
  const { badges, skipped } = buildBadges(
    [{ 'Email Address': '  USER@example.com ', '2021+ Count': '2' }],
    {
      orders_2025: [{ email: 'user@example.com', id_code: 'abc' }],
      applications_2025: [{ email: 'USER@example.com', id_code: 'def' }],
      participants_2026: [{ contact: { email: 'user@example.com' }, id_code: 'ghi' }]
    }
  )
  assert.deepEqual(badges, [{
    email: 'user@example.com', historicalCount: 2, years: [2025, 2026],
    idCodes: ['abc', 'def', 'ghi'], badgeNumber: 4, durationSeconds: 40
  }])
  assert.equal(Object.values(skipped).reduce((a, b) => a + b, 0), 0)
  assert.equal(badgeDocumentId(badges[0].email), badgeDocumentId(normalizeEmail(' USER@example.com ')))
})

test('counts participants without history and skips invalid email addresses', () => {
  const { badges, skipped } = buildBadges([], {
    orders_2025: [{ email: 'bad email' }],
    applications_2025: [],
    participants_2026: [{ contact: { email: 'new@example.com' }, id_code: 'new' }]
  })
  assert.equal(skipped.orders_2025, 1)
  assert.equal(badges[0].badgeNumber, 1)
  assert.equal(badges[0].durationSeconds, 10)
})

test('rejects duplicate or invalid historical counts', () => {
  const row = { 'Email Address': 'x@example.com', '2021+ Count': '1' }
  assert.throws(() => buildBadges([row, row], {}), /Duplicate email/)
  assert.throws(() => buildBadges([{ ...row, '2021+ Count': '' }], {}), /Invalid/)
  assert.throws(() => buildBadges([{ ...row, '2021+ Count': '5' }], {}), /Invalid/)
  assert.throws(() => buildBadges([{ ...row, '2021+ Count': '1.0' }], {}), /Invalid/)
})

test('includes manual 2021–2022 history without exceeding six years', () => {
  const { badges } = buildBadges(
    [{ 'Email Address': 'veteran@example.com', '2021+ Count': '4' }],
    {
      orders_2025: [{ email: 'veteran@example.com' }],
      applications_2025: [],
      participants_2026: [{ contact: { email: 'veteran@example.com' } }]
    }
  )
  assert.equal(badges[0].badgeNumber, 6)
  assert.equal(badges[0].durationSeconds, 60)
})
