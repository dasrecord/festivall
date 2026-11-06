import { createHash } from 'node:crypto'

export function normalizeEmail(value) {
  if (typeof value !== 'string') return null
  const email = value.trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
}

export function badgeDocumentId(email) {
  return createHash('sha256').update(email).digest('hex')
}

export function buildBadges(history, sources) {
  const participants = new Map()
  const skipped = { history: 0, 'orders_2025': 0, 'applications_2025': 0, 'participants_2026': 0 }

  function getParticipant(email) {
    if (!participants.has(email)) {
      participants.set(email, { email, historicalCount: 0, years: new Set(), idCodes: new Set() })
    }
    return participants.get(email)
  }

  const historyEmails = new Set()
  for (const [index, row] of history.entries()) {
    const email = normalizeEmail(row['Email Address'])
    if (!email) { skipped.history++; continue }
    if (historyEmails.has(email)) throw new Error('Duplicate email in badge history; resolve duplicates before syncing')
    historyEmails.add(email)
    const rawCount = row['2021+ Count']
    const count = Number(rawCount)
    if (typeof rawCount !== 'string' || !/^[0-4]$/.test(rawCount.trim())) {
      throw new Error(`Invalid 2021–2024 historical count at CSV row ${index + 2}; expected an integer from 0 to 4`)
    }
    getParticipant(email).historicalCount = count
  }

  for (const [source, records] of Object.entries(sources)) {
    const year = source === 'participants_2026' ? 2026 : 2025
    for (const record of records) {
      const email = normalizeEmail(source === 'participants_2026' ? record.contact?.email : record.email)
      if (!email) { skipped[source]++; continue }
      const participant = getParticipant(email)
      participant.years.add(year)
      if (typeof record.id_code === 'string' && record.id_code.trim()) {
        participant.idCodes.add(record.id_code.trim())
      }
    }
  }

  const badges = [...participants.values()].filter(({ historicalCount, years }) => historicalCount + years.size > 0)
    .map(({ email, historicalCount, years, idCodes }) => {
    const badgeNumber = historicalCount + years.size
    return {
      email,
      historicalCount,
      years: [...years].sort(),
      idCodes: [...idCodes].sort(),
      badgeNumber,
      durationSeconds: badgeNumber * 10
    }
    })
  return { badges, skipped }
}
