export function createSupporterAccess(db, flag, { now = () => Date.now(), ttlMs = 30_000 } = {}) {
  const cache = new Map()

  return async function hasSupporterAccess(idCode) {
    if (typeof idCode !== 'string' || !idCode.trim()) return false
    const id = idCode.trim()
    const timestamp = now()
    const hit = cache.get(id)
    if (hit && timestamp - hit.at < ttlMs) return hit.ok

    const year = new Date(timestamp).getFullYear()
    let ok = false
    for (const ticketYear of [year + 1, year, year - 1]) {
      const snap = await db.collection(`participants_${ticketYear}`)
        .where('id_code', '==', id).limit(1).get()
      if (!snap.empty) {
        ok = snap.docs[0].data()[flag] === true
        break
      }
    }
    cache.set(id, { ok, at: now() })
    return ok
  }
}

export async function filterSupporterShoutouts(docs, hasSupporterAccess, isAdminInput = () => false) {
  const allowed = await Promise.all(docs.map((doc) =>
    isAdminInput(doc) || hasSupporterAccess(doc.data().id_code)
  ))
  return docs.filter((_, index) => allowed[index])
}
