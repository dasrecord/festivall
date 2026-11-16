import test from 'node:test'
import assert from 'node:assert/strict'
import { signAdminLiveInput, verifyAdminLiveInput } from '../functions/admin-live-signature.js'

const secret = 'test-secret'
const createdAt = { toMillis: () => 123456 }

test('only an unmodified message signed for this document and kind is accepted', () => {
  const data = {
    admin_uid: 'admin', createdAt, text: 'hello', name: 'A', fullname: 'Admin',
    id_code: 'ticket', font: 'Arial', color: '#ffffff', fx: 'none'
  }
  data.admin_signature = signAdminLiveInput(secret, 'text', 'doc', data)
  const doc = { id: 'doc', data: () => data }
  assert.equal(verifyAdminLiveInput(secret, 'text', doc), true)
  assert.equal(verifyAdminLiveInput('wrong', 'text', doc), false)
  assert.equal(verifyAdminLiveInput(undefined, 'text', doc), false)
  assert.equal(verifyAdminLiveInput(secret, 'paint', doc), false)
  assert.equal(verifyAdminLiveInput(secret, 'text', { ...doc, id: 'other' }), false)
  data.text = 'changed'
  assert.equal(verifyAdminLiveInput(secret, 'text', doc), false)
})

test('paint signatures cover points, identity, and time', () => {
  const data = {
    admin_uid: 'admin', createdAt, id_code: 'ticket', name: 'A',
    color: '#123456', points: [0.2, 0.3], end: true
  }
  data.admin_signature = signAdminLiveInput(secret, 'paint', 'doc', data)
  const doc = { id: 'doc', data: () => data }
  assert.equal(verifyAdminLiveInput(secret, 'paint', doc), true)
  data.points[0] = 0.4
  assert.equal(verifyAdminLiveInput(secret, 'paint', doc), false)
  data.points[0] = 0.2
  data.createdAt = { toMillis: () => 123457 }
  assert.equal(verifyAdminLiveInput(secret, 'paint', doc), false)
})
