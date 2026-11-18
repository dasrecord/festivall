import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import { readFile, rename, unlink, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { REUNION_ADMIN_UIDS } from '../functions/admin-uids.js'
import { createShortLinksHandler } from '../functions/short-links-handler.js'

export function createLocalShortLinkStore(filePath) {
  let pending = Promise.resolve()

  async function readLinks() {
    let content
    try {
      content = await readFile(filePath, 'utf8')
    } catch (error) {
      if (error.code === 'ENOENT') return []
      throw error
    }
    const links = JSON.parse(content)
    if (!Array.isArray(links)) throw new Error('Invalid local short-link data')
    return links
  }

  async function saveLinks(links) {
    const temporaryFile = join(dirname(filePath), `.short-links-${randomUUID()}.local`)
    try {
      await writeFile(temporaryFile, JSON.stringify(links, null, 2) + '\n', { mode: 0o600, flag: 'wx' })
      await rename(temporaryFile, filePath)
    } catch (error) {
      try {
        await unlink(temporaryFile)
      } catch (cleanupError) {
        if (cleanupError.code !== 'ENOENT') console.error('Unable to remove temporary short-link file:', cleanupError)
      }
      throw error
    }
  }

  function run(operation) {
    const result = pending.then(operation)
    pending = result.then(() => undefined, () => undefined)
    return result
  }

  return {
    findLink: (slug) => run(async () => (await readLinks()).find((link) => link.slug === slug) ?? null),
    listLinks: () => run(async () => (await readLinks()).reverse()),
    createLink: (slug, targetUrl, uid) => run(async () => {
      const links = await readLinks()
      if (links.some((link) => link.slug === slug)) {
        throw Object.assign(new Error('Short link already exists'), { code: 'already-exists' })
      }
      const now = new Date().toISOString()
      links.push({ slug, targetUrl, createdAt: now, updatedAt: now, createdBy: uid, updatedBy: uid })
      await saveLinks(links)
    }),
    updateLink: (slug, targetUrl, uid) => run(async () => {
      const links = await readLinks()
      const link = links.find((item) => item.slug === slug)
      if (!link) return false
      Object.assign(link, { targetUrl, updatedAt: new Date().toISOString(), updatedBy: uid })
      await saveLinks(links)
      return true
    }),
    deleteLink: (slug) => run(async () => {
      const links = await readLinks()
      const index = links.findIndex((link) => link.slug === slug)
      if (index === -1) return false
      links.splice(index, 1)
      await saveLinks(links)
      return true
    })
  }
}

export function createShortLinkDevMiddleware({ filePath, verifyToken, isAdmin, logError = console.error }) {
  const handler = createShortLinksHandler({
    ...createLocalShortLinkStore(filePath),
    verifyToken,
    isAdmin,
    logError
  })

  return async (req, res, next) => {
    const path = new URL(req.url, 'http://localhost').pathname
    if (path !== '/api/short-links' && !path.startsWith('/s/')) {
      next()
      return
    }

    res.set = (name, value) => { res.setHeader(name, value); return res }
    res.status = (status) => { res.statusCode = status; return res }
    res.send = (body) => { res.end(body); return res }
    res.json = (body) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify(body))
      return res
    }
    res.redirect = (status, target) => {
      res.statusCode = status
      res.setHeader('Location', target)
      res.end()
      return res
    }

    req.path = path
    req.get = (name) => req.headers[name.toLowerCase()]
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      try {
        let body = ''
        for await (const chunk of req) {
          body += chunk.toString('utf8')
          if (Buffer.byteLength(body) > 16384) {
            res.status(413).json({ error: 'Request body is too large' })
            return
          }
        }
        req.body = body ? JSON.parse(body) : {}
      } catch (error) {
        if (error instanceof SyntaxError) {
          res.status(400).json({ error: 'Invalid JSON request body' })
        } else {
          logError('Unable to read short-link request:', error)
          res.status(500).json({ error: 'Could not read the request' })
        }
        return
      }
    }
    await handler(req, res)
  }
}

/** @returns {import('vite').Plugin} */
export function shortLinkDevPlugin() {
  return {
    name: 'local-short-links',
    apply: 'serve',
    configureServer(server) {
      const appName = 'short-links-dev-auth'
      const projectId = process.env.VITE_APP_FESTIVALL_PROJECT_ID || 'festivall-6969'
      const app = getApps().find((item) => item.name === appName) ||
        initializeApp({ projectId }, appName)
      server.middlewares.use(createShortLinkDevMiddleware({
        filePath: join(server.config.root, '.short-links.local'),
        verifyToken: (token) => getAuth(app).verifyIdToken(token),
        isAdmin: (uid) => REUNION_ADMIN_UIDS.includes(uid),
        logError: (...args) => console.error('Local short-link request failed:', ...args)
      }))
    }
  }
}
