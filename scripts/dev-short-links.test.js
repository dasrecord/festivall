import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdtemp, readFile, rmdir, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { createShortLinkDevMiddleware } from './dev-short-links.js'

test('local HTTP endpoint authenticates, stores, updates and redirects links across restarts', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'festivall-short-links-'))
  const filePath = join(directory, 'links.local')
  t.after(async () => {
    try {
      await unlink(filePath)
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
    await rmdir(directory)
  })

  const middleware = () => createShortLinkDevMiddleware({
    filePath,
    verifyToken: async (token) => {
      if (token === 'invalid') throw Object.assign(new Error('Invalid token'), { code: 'auth/invalid-id-token' })
      return { uid: token }
    },
    isAdmin: (uid) => uid === 'admin'
  })
  const server = createServer((req, res) => middlewareInstance(req, res, () => {
    res.statusCode = 404
    res.end('Not found')
  }))
  let middlewareInstance = middleware()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())))
  const base = `http://127.0.0.1:${server.address().port}`
  const request = (path, method = 'GET', token, body) => fetch(`${base}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual'
  })

  assert.equal((await request('/api/short-links')).status, 401)
  assert.equal((await request('/api/short-links', 'GET', 'invalid')).status, 401)
  assert.equal((await request('/api/short-links', 'GET', 'visitor')).status, 403)
  assert.equal((await request('/api/short-links', 'POST', 'admin', {
    slug: 'tickets', targetUrl: 'https://example.com/old'
  })).status, 201)
  assert.equal((await request('/api/short-links', 'POST', 'admin', {
    slug: 'tickets', targetUrl: 'https://example.com/duplicate'
  })).status, 409)
  const simultaneous = await Promise.all(['one', 'two'].map((slug) =>
    request('/api/short-links', 'POST', 'admin', { slug, targetUrl: `https://example.com/${slug}` })
  ))
  assert.deepEqual(simultaneous.map((response) => response.status), [201, 201])

  middlewareInstance = middleware()
  const list = await (await request('/api/short-links', 'GET', 'admin')).json()
  assert.deepEqual(new Set(list.links.map((link) => link.slug)), new Set(['tickets', 'one', 'two']))
  assert.equal((await request('/s/tickets?from=test')).headers.get('location'), 'https://example.com/old')
  assert.equal((await request('/api/short-links', 'PUT', 'admin', {
    slug: 'tickets', targetUrl: 'https://example.com/new'
  })).status, 200)
  assert.equal((await request('/s/tickets')).headers.get('location'), 'https://example.com/new')
  assert.equal(JSON.parse(await readFile(filePath, 'utf8')).find((link) => link.slug === 'tickets').targetUrl, 'https://example.com/new')
  assert.equal((await request('/api/short-links', 'DELETE', 'admin', { slug: 'tickets' })).status, 200)
  assert.equal((await request('/s/tickets')).status, 404)
})
