import assert from 'node:assert/strict'
import test from 'node:test'
import { createShortLinksHandler } from './short-links-handler.js'

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    status(code) {
      this.statusCode = code
      return this
    },
    set(name, value) {
      this.headers[name] = value
      return this
    },
    json(body) {
      this.body = body
      return this
    },
    send(body) {
      this.body = body
      return this
    },
    redirect(status, url) {
      this.statusCode = status
      this.headers.Location = url
      return this
    }
  }
}

function createHarness(overrides = {}) {
  const links = new Map()
  const handler = createShortLinksHandler({
    verifyToken: async (token) => {
      if (token !== 'valid') throw Object.assign(new Error('Invalid token'), { code: 'auth/invalid-id-token' })
      return { uid: 'admin' }
    },
    isAdmin: (uid) => uid === 'admin',
    findLink: async (slug) => links.get(slug) ?? null,
    listLinks: async () => [...links.entries()].map(([slug, link]) => ({ slug, ...link })),
    createLink: async (slug, targetUrl) => {
      if (links.has(slug)) throw Object.assign(new Error('Already exists'), { code: 'already-exists' })
      links.set(slug, { targetUrl })
    },
    updateLink: async (slug, targetUrl) => {
      if (!links.has(slug)) return false
      links.set(slug, { targetUrl })
      return true
    },
    deleteLink: async (slug) => links.delete(slug),
    logError: () => {},
    ...overrides
  })

  return {
    links,
    async request({ path, method = 'GET', token, body } = {}) {
      const req = {
        path,
        method,
        body,
        get: (name) => name.toLowerCase() === 'authorization' && token ? `Bearer ${token}` : undefined
      }
      const res = createResponse()
      await handler(req, res)
      return res
    }
  }
}

test('creates an admin-owned short link and redirects to its HTTP destination', async () => {
  const app = createHarness()
  const created = await app.request({
    path: '/api/short-links',
    method: 'POST',
    token: 'valid',
    body: { slug: 'tickets-2027', targetUrl: 'https://example.com/tickets' }
  })
  const redirect = await app.request({ path: '/s/tickets-2027' })

  assert.equal(created.statusCode, 201)
  assert.equal(redirect.statusCode, 302)
  assert.equal(redirect.headers.Location, 'https://example.com/tickets')
  assert.equal(redirect.headers['Cache-Control'], 'no-store')
})

test('requires an admin token for management and rejects invalid destinations', async () => {
  const app = createHarness({
    verifyToken: async () => ({ uid: 'visitor' })
  })
  const denied = await app.request({ path: '/api/short-links', token: 'valid' })
  const created = await app.request({
    path: '/api/short-links',
    method: 'POST',
    token: 'valid',
    body: { slug: 'safe-slug', targetUrl: 'javascript:alert(1)' }
  })

  assert.equal(denied.statusCode, 403)
  assert.equal(created.statusCode, 403)
})

test('requires a valid token and supports editing and deleting links', async () => {
  const app = createHarness()
  const missingToken = await app.request({ path: '/api/short-links' })
  const invalidToken = await app.request({ path: '/api/short-links', token: 'expired' })
  await app.request({
    path: '/api/short-links',
    method: 'POST',
    token: 'valid',
    body: { slug: 'tickets', targetUrl: 'https://example.com/old' }
  })
  const updated = await app.request({
    path: '/api/short-links',
    method: 'PUT',
    token: 'valid',
    body: { slug: 'tickets', targetUrl: 'https://example.com/new' }
  })
  const redirect = await app.request({ path: '/s/tickets' })
  const deleted = await app.request({
    path: '/api/short-links',
    method: 'DELETE',
    token: 'valid',
    body: { slug: 'tickets' }
  })
  const missing = await app.request({ path: '/s/tickets' })

  assert.equal(missingToken.statusCode, 401)
  assert.equal(invalidToken.statusCode, 401)
  assert.equal(updated.statusCode, 200)
  assert.equal(redirect.headers.Location, 'https://example.com/new')
  assert.equal(deleted.statusCode, 200)
  assert.equal(missing.statusCode, 404)
})

test('validates slugs and destinations and handles missing links', async () => {
  const app = createHarness()
  const invalidSlug = await app.request({
    path: '/api/short-links',
    method: 'POST',
    token: 'valid',
    body: { slug: '../admin', targetUrl: 'https://example.com' }
  })
  const invalidDestination = await app.request({
    path: '/api/short-links',
    method: 'POST',
    token: 'valid',
    body: { slug: 'safe-slug', targetUrl: 'javascript:alert(1)' }
  })
  const missing = await app.request({ path: '/s/missing' })

  assert.equal(invalidSlug.statusCode, 400)
  assert.equal(invalidDestination.statusCode, 400)
  assert.equal(missing.statusCode, 404)
  assert.equal(missing.headers['Cache-Control'], 'no-store')
})
