import test from 'node:test'
import assert from 'node:assert/strict'
import { createAdminLiveHandler } from '../functions/admin-live-handler.js'

const text = {
  id_code: ' a2c4e ', name: 'Admin', color: '#ffffff', text: 'Hello',
  fullname: 'Admin', font: 'Arial', fx: 'none'
}
const paint = { id_code: 'a2c4e', name: 'Admin', color: '#ffffff', points: [0.2, 0.3], end: true }

function harness() {
  const saved = []
  const errors = []
  const handle = createAdminLiveHandler({
    verifyToken: async (token) => {
      if (token === 'invalid') throw Object.assign(new Error('bad token'), { code: 'auth/invalid-id-token' })
      if (token === 'offline') throw new Error('offline')
      return { uid: token }
    },
    isAdmin: (uid) => uid === 'admin',
    save: async (...args) => saved.push(args),
    logError: (error) => errors.push(error.message)
  })
  async function send(token, body, method = 'POST') {
    const result = {}
    const res = {
      status(code) { result.status = code; return this },
      send(value) { result.body = value },
      json(value) { result.body = value }
    }
    await handle({ method, body, get: () => token && `Bearer ${token}` }, res)
    return result
  }
  return { send, saved, errors }
}

test('only verified admins can submit valid live input', async () => {
  const { send, saved } = harness()
  assert.equal((await send(null, { kind: 'text', input: text })).status, 401)
  assert.equal((await send('invalid', { kind: 'text', input: text })).status, 401)
  assert.equal((await send('other', { kind: 'text', input: text })).status, 403)
  assert.equal((await send('admin', { kind: 'paint', input: { ...paint, points: [1] } })).status, 400)
  assert.equal((await send('admin', { kind: 'text', input: text }, 'GET')).status, 405)
  assert.deepEqual(saved, [])
  assert.equal((await send('admin', { kind: 'text', input: text })).status, 200)
  assert.equal((await send('admin', { kind: 'paint', input: paint })).status, 200)
  assert.deepEqual(saved, [
    ['text', { ...text, id_code: 'a2c4e' }, 'admin'],
    ['paint', paint, 'admin']
  ])
})

test('server failures are reported without saving', async () => {
  const { send, saved, errors } = harness()
  assert.equal((await send('offline', { kind: 'text', input: text })).status, 500)
  assert.deepEqual(errors, ['offline'])
  assert.deepEqual(saved, [])
})
