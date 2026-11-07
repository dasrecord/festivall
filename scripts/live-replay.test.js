import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { createReplaySession } from './live-replay.js'

test('marks history, buffers live messages, and avoids snapshot duplicates', async () => {
  const sent = []
  let resolve
  const session = createReplaySession((message) => sent.push(message),
    () => new Promise((done) => { resolve = done }), assert.fail)
  const replay = session.replay()
  const live = { type: 'text', id: 'new', text: 'live', badgeNumber: 4 }
  session.live(live)
  resolve([{ type: 'text', id: 'old' }, live])
  await replay
  assert.deepEqual(sent, [{ type: 'reset' }, { type: 'text', id: 'old', replay: true }, live])
  session.live({ type: 'text', id: 'later' })
  assert.deepEqual(sent.at(-1), { type: 'text', id: 'later' })
})

test('reports replay failure and delivers messages received while loading', async () => {
  const sent = []
  const errors = []
  let reject
  const session = createReplaySession((message) => sent.push(message),
    () => new Promise((_, fail) => { reject = fail }), (error) => errors.push(error.message))
  const replay = session.replay()
  session.live({ id: 'live' })
  reject(new Error('offline'))
  await replay
  assert.deepEqual(errors, ['offline'])
  assert.deepEqual(sent, [{ id: 'live' }])
})

test('ignores a concurrent replay request', async () => {
  let calls = 0
  let resolve
  const session = createReplaySession(() => {}, () => {
    calls++
    return new Promise((done) => { resolve = done })
  }, assert.fail)
  const first = session.replay()
  await session.replay()
  resolve([])
  await first
  assert.equal(calls, 1)
})
