import test from 'node:test'
import assert from 'node:assert/strict'
import { createShoutoutLimiter } from './shoutout-limiter.js'

function setup(limits) {
  let t = 1_000_000
  const limiter = createShoutoutLimiter(limits, () => t)
  return { limiter, advance: (ms) => { t += ms } }
}

test('enforces per-ticket cooldown', () => {
  const { limiter, advance } = setup()
  assert.equal(limiter.check('a').ok, true)
  assert.deepEqual(limiter.check('a'), { ok: false, reason: 'cooldown' })
  assert.equal(limiter.check('b').ok, true)
  advance(15_000)
  assert.equal(limiter.check('a').ok, true)
})

test('enforces hourly cap and recovers', () => {
  const { limiter, advance } = setup({ perHour: 2, globalMax: 100 })
  assert.equal(limiter.check('a').ok, true)
  advance(15_000)
  assert.equal(limiter.check('a').ok, true)
  advance(15_000)
  assert.deepEqual(limiter.check('a'), { ok: false, reason: 'hourly' })
  advance(3_600_000)
  assert.equal(limiter.check('a').ok, true)
})

test('enforces global cap and rejected attempts do not count', () => {
  const { limiter, advance } = setup({ globalMax: 2 })
  assert.equal(limiter.check('a').ok, true)
  assert.equal(limiter.check('b').ok, true)
  assert.deepEqual(limiter.check('c'), { ok: false, reason: 'global' })
  advance(10_000)
  assert.equal(limiter.check('c').ok, true)
})
