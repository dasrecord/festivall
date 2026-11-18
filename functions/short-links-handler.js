const slugPattern = /^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$/
const invalidTokenCodes = new Set([
  'auth/argument-error',
  'auth/invalid-id-token',
  'auth/id-token-expired',
  'auth/id-token-revoked'
])

function validTargetUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) return false
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
  } catch {
    return false
  }
}

function validSlug(value) {
  return typeof value === 'string' && slugPattern.test(value)
}

function sendError(res, status, message) {
  res.status(status).json({ error: message })
}

export function createShortLinksHandler({
  verifyToken,
  isAdmin,
  findLink,
  listLinks,
  createLink,
  updateLink,
  deleteLink,
  logError
}) {
  return async (req, res) => {
    res.set('Cache-Control', 'no-store')
    const path = req.path

    if (path.startsWith('/s/')) {
      const match = /^\/s\/([^/]+)$/.exec(path)
      if (req.method !== 'GET' || !match || !validSlug(match[1])) {
        res.status(404).send('Short link not found')
        return
      }

      try {
        const link = await findLink(match[1])
        if (!link || !validTargetUrl(link.targetUrl)) {
          res.status(404).send('Short link not found')
          return
        }
        res.redirect(302, link.targetUrl)
      } catch (error) {
        logError(error)
        res.status(500).send('Short link could not be resolved')
      }
      return
    }

    if (path !== '/api/short-links') {
      res.status(404).send('Not found')
      return
    }

    if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) {
      res.set('Allow', 'GET, POST, PUT, DELETE')
      sendError(res, 405, 'Method not allowed')
      return
    }

    const token = /^Bearer (.+)$/.exec(req.get('authorization') ?? '')?.[1]
    if (!token) {
      sendError(res, 401, 'Authentication required')
      return
    }

    let user
    try {
      user = await verifyToken(token)
    } catch (error) {
      if (invalidTokenCodes.has(error.code)) {
        sendError(res, 401, 'Invalid or expired authentication')
        return
      }
      logError(error)
      sendError(res, 500, 'Could not verify authentication')
      return
    }

    if (!isAdmin(user.uid)) {
      sendError(res, 403, 'Admin access required')
      return
    }

    try {
      if (req.method === 'GET') {
        res.status(200).json({ links: await listLinks() })
        return
      }

      const { slug, targetUrl } = req.body ?? {}
      if (!validSlug(slug)) {
        sendError(res, 400, 'Use a lowercase slug with letters, numbers, and interior hyphens (up to 48 characters)')
        return
      }

      if (req.method === 'POST' || req.method === 'PUT') {
        if (!validTargetUrl(targetUrl)) {
          sendError(res, 400, 'Enter a valid HTTP or HTTPS destination URL without credentials')
          return
        }

        if (req.method === 'POST') {
          try {
            await createLink(slug, targetUrl.trim(), user.uid)
          } catch (error) {
            if (error.code === 'already-exists' || error.code === 6) {
              sendError(res, 409, 'That short URL is already in use')
              return
            }
            throw error
          }
          res.status(201).json({ slug, targetUrl: targetUrl.trim() })
          return
        }

        if (!(await updateLink(slug, targetUrl.trim(), user.uid))) {
          sendError(res, 404, 'Short link not found')
          return
        }
        res.status(200).json({ slug, targetUrl: targetUrl.trim() })
        return
      }

      if (!(await deleteLink(slug))) {
        sendError(res, 404, 'Short link not found')
        return
      }
      res.status(200).json({ ok: true })
    } catch (error) {
      logError(error)
      sendError(res, 500, 'Short link could not be saved')
    }
  }
}
