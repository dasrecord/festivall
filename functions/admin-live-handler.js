function validateInput(kind, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) ||
      typeof input.id_code !== 'string' || !input.id_code.trim() ||
      input.id_code.length > 100 || typeof input.name !== 'string' || input.name.length > 24 ||
      typeof input.color !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(input.color)) return null
  const common = { id_code: input.id_code.trim(), name: input.name, color: input.color }
  if (kind === 'paint') {
    if (!Array.isArray(input.points) || !input.points.length || input.points.length > 60 ||
        input.points.length % 2 || !input.points.every((n) => typeof n === 'number' && Number.isFinite(n)) ||
        typeof input.end !== 'boolean') return null
    return { ...common, points: input.points, end: input.end }
  }
  if (kind === 'text') {
    if (typeof input.text !== 'string' || !input.text.trim() || input.text.length > 140 ||
        typeof input.fullname !== 'string' || input.fullname.length > 80 ||
        typeof input.font !== 'string' || input.font.length > 200 ||
        !['none', 'glow', 'pulse'].includes(input.fx)) return null
    return { ...common, text: input.text, fullname: input.fullname, font: input.font, fx: input.fx }
  }
  return null
}

export function createAdminLiveHandler({ verifyToken, isAdmin, save, logError }) {
  return async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed')
      return
    }
    const token = /^Bearer (.+)$/.exec(req.get('Authorization') || '')?.[1]
    if (!token) {
      res.status(401).send('Authentication required')
      return
    }
    try {
      const user = await verifyToken(token)
      if (!isAdmin(user.uid)) {
        res.status(403).send('Admin access required')
        return
      }
      const kind = req.body?.kind
      const input = validateInput(kind, req.body?.input)
      if (!input) {
        res.status(400).send('Invalid live input')
        return
      }
      await save(kind, input, user.uid)
      res.status(200).json({ ok: true })
    } catch (error) {
      if (['auth/argument-error', 'auth/invalid-id-token', 'auth/id-token-expired',
        'auth/id-token-revoked'].includes(error.code)) {
        res.status(401).send('Invalid or expired authentication')
        return
      }
      logError(error)
      res.status(500).send('Could not send live input')
    }
  }
}
