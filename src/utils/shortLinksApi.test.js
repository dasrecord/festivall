import assert from 'node:assert/strict'
import test from 'node:test'
import { readShortLinksResponse } from './shortLinksApi.js'

test('reports an HTML fallback as a deployment problem instead of a JSON error', async () => {
  const response = new Response('<!doctype html><html></html>', {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  })

  await assert.rejects(readShortLinksResponse(response), /shortLinks function and Firebase Hosting rewrites/)
})

test('reports non-JSON server errors with their status', async () => {
  const response = new Response('Service unavailable', { status: 503 })
  await assert.rejects(readShortLinksResponse(response), /HTTP 503/)
})

test('preserves API errors and accepts successful JSON', async () => {
  const error = Response.json({ error: 'Admin access required' }, { status: 403 })
  await assert.rejects(readShortLinksResponse(error), /Admin access required/)

  const success = Response.json({ links: [{ slug: 'tickets', targetUrl: 'https://example.com' }] })
  assert.deepEqual(await readShortLinksResponse(success), {
    links: [{ slug: 'tickets', targetUrl: 'https://example.com' }]
  })
})

test('reports malformed JSON explicitly', async () => {
  const response = new Response('{', { headers: { 'Content-Type': 'application/json' } })
  await assert.rejects(readShortLinksResponse(response), /invalid JSON/)
})
