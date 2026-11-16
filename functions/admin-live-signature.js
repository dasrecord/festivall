import { createHmac, timingSafeEqual } from 'node:crypto'

const fields = {
  text: ['text', 'name', 'fullname', 'id_code', 'font', 'color', 'fx'],
  paint: ['id_code', 'name', 'color', 'points', 'end']
}

function payload(kind, id, data) {
  if (!fields[kind] || typeof id !== 'string' || typeof data.admin_uid !== 'string' ||
      typeof data.createdAt?.toMillis !== 'function') return null
  const values = fields[kind].map((field) => data[field])
  if (values.some((value) => value === undefined)) return null
  return JSON.stringify([kind, id, data.admin_uid, data.createdAt.toMillis(), ...values])
}

export function signAdminLiveInput(secret, kind, id, data) {
  const content = payload(kind, id, data)
  if (!secret || content === null) throw new Error('Cannot sign invalid admin live input')
  return createHmac('sha256', secret).update(content).digest('hex')
}

export function verifyAdminLiveInput(secret, kind, doc) {
  const data = doc.data()
  if (!secret || typeof data.admin_signature !== 'string' ||
      !/^[0-9a-f]{64}$/.test(data.admin_signature)) return false
  const content = payload(kind, doc.id, data)
  if (content === null) return false
  const expected = createHmac('sha256', secret).update(content).digest()
  return timingSafeEqual(expected, Buffer.from(data.admin_signature, 'hex'))
}
