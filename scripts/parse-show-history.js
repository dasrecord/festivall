#!/usr/bin/env node
/**
 * parse-show-history.js
 *
 * Reads the wonky Google-Calendar-exported show history CSV at
 *   src/data/show_history.csv
 * and emits a clean, deduplicated JSON file at
 *   src/data/shows.json
 *
 * Dedup rules:
 *  - Any event whose title ends with "(Day X/Y)" where X > 1 is treated as a
 *    continuation of the corresponding "(Day 1/Y)" event and is dropped from
 *    the output. The base title strips the "(Day n/N)" suffix.
 *  - For multi-day events (Y > 1), the output entry records `days: Y`.
 *
 * Run: node scripts/parse-show-history.js
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

const INPUT = path.join(ROOT, 'src/data/show_history.csv')
const MANUAL = path.join(ROOT, 'src/data/shows_manual.json')
const OUTPUT = path.join(ROOT, 'src/data/shows.json')

// ── Helpers ────────────────────────────────────────────────────────────────

const MONTHS = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sept: 9, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
}

const RE_DAY = /^\d{1,2}$/
const RE_MONTH_YEAR = /^"?\s*([A-Z][a-z]{2,4})\s+(\d{4}),\s*([A-Za-z]{3})\s*"?$/
const RE_TIME = /^(\d{1,2}:\d{2}\s*[–-]\s*\d{1,2}:\d{2}|All day|Until\s+\d{1,2}:\d{2}|\d{1,2}:\d{2})$/i
const RE_DAY_SUFFIX = /\s*\(Day\s+(\d+)\s*\/\s*(\d+)\)\s*$/i

// Heuristic: a line is a "venue/address" if it contains commas + a typical
// city/country marker, OR is wrapped in quotes, OR contains a postal code.
function looksLikeVenue(line) {
  if (!line) return false
  if (line.startsWith('"') && line.endsWith('"')) return true
  if (/[A-Z]{2}\s+[A-Z0-9]{3}/.test(line)) return true // SK S7K
  if (/Canada$|, [A-Z]{2}$|, [A-Z]{2}\s+[A-Z0-9]/.test(line)) return true
  if (/^https?:\/\//.test(line)) return false
  if (/^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(line)) return true // coords
  return false
}

function stripQuotes(s) {
  if (!s) return s
  return s.replace(/^"+|"+$/g, '').trim()
}

function parseCity(venue) {
  if (!venue) return ''
  // Try "..., City, XX YYY YYY, Canada" → City
  const parts = venue.split(',').map(s => s.trim()).filter(Boolean)
  if (parts.length === 0) return ''
  // Common known cities
  const known = [
    'Saskatoon', 'Vancouver', 'North Vancouver', 'Regina', 'Squamish',
    'Smithers', 'Waskesiu Lake', 'Yellowhead County', 'Grasswood',
    'Caron No. 162', 'Elstow',
  ]
  for (const k of known) {
    if (venue.includes(k)) return k
  }
  // Fallback: second-to-last meaningful chunk that isn't "Canada"
  const filtered = parts.filter(p => p !== 'Canada' && !/^[A-Z]{2}\s+[A-Z0-9]/.test(p))
  return filtered[filtered.length - 1] || ''
}

function parseProvince(venue) {
  if (!venue) return ''
  const m = venue.match(/\b(SK|BC|AB|MB|ON|QC|NS|NB|NL|PE|YT|NT|NU)\b/)
  return m ? m[1] : ''
}

// ── Parse ──────────────────────────────────────────────────────────────────

const raw = fs.readFileSync(INPUT, 'utf8')
const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0)

const events = []
let curDay = null
let curMonth = null
let curYear = null
let curWeekday = null

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]

  // Day number
  if (RE_DAY.test(line)) {
    curDay = parseInt(line, 10)
    continue
  }

  // Month/year/weekday
  const m = line.match(RE_MONTH_YEAR)
  if (m) {
    curMonth = MONTHS[m[1]] || null
    curYear = parseInt(m[2], 10)
    curWeekday = m[3]
    continue
  }

  // Time
  if (RE_TIME.test(line)) {
    const time = line
    const title = lines[i + 1] ? stripQuotes(lines[i + 1]) : ''
    let venue = ''
    if (lines[i + 2] && looksLikeVenue(lines[i + 2])) {
      venue = stripQuotes(lines[i + 2])
      i += 2
    } else {
      i += 1
    }

    if (!curDay || !curMonth || !curYear || !title) continue

    events.push({
      day: curDay,
      month: curMonth,
      year: curYear,
      weekday: curWeekday,
      time,
      title,
      venue,
    })
    continue
  }

  // Unknown line — skip silently
}

// ── Dedupe ────────────────────────────────────────────────────────────────

const shows = []
for (const e of events) {
  const suffix = e.title.match(RE_DAY_SUFFIX)
  if (suffix) {
    const partNum = parseInt(suffix[1], 10)
    const totalParts = parseInt(suffix[2], 10)
    if (partNum > 1) continue // continuation; skip

    // Day 1 of N — record with `days: N`
    const baseTitle = e.title.replace(RE_DAY_SUFFIX, '').trim()
    shows.push({ ...e, title: baseTitle, days: totalParts })
  } else {
    shows.push({ ...e, days: 1 })
  }
}

// Sort chronologically
shows.sort((a, b) => {
  if (a.year !== b.year) return a.year - b.year
  if (a.month !== b.month) return a.month - b.month
  if (a.day !== b.day) return a.day - b.day
  return (a.time || '').localeCompare(b.time || '')
})

// ── Merge manual extras ───────────────────────────────────────────────────
let manualCount = 0
if (fs.existsSync(MANUAL)) {
  const manualRaw = JSON.parse(fs.readFileSync(MANUAL, 'utf8'))
  const existingKeys = new Set(
    shows.map(s => `${s.year}-${s.month}-${s.day}|${s.title.toLowerCase().trim()}`)
  )
  for (const m of (manualRaw.shows || [])) {
    const [yy, mm, dd] = m.date.split('-').map(Number)
    const key = `${yy}-${mm}-${dd}|${(m.title || '').toLowerCase().trim()}`
    if (existingKeys.has(key)) continue
    shows.push({
      year: yy,
      month: mm,
      day: dd,
      title: m.title,
      venue: m.venue || '',
      time: m.time || '',
      days: m.days || 1,
      manualTags: Array.isArray(m.tags) ? m.tags : [],
    })
    manualCount++
  }
  // Re-sort after merging
  shows.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    if (a.month !== b.month) return a.month - b.month
    if (a.day !== b.day) return a.day - b.day
    return (a.time || '').localeCompare(b.time || '')
  })
}

// Format display fields
const formatted = shows.map(s => {
  const pad = (n) => String(n).padStart(2, '0')
  const isoDate = `${s.year}-${pad(s.month)}-${pad(s.day)}`
  const monthNames = [
    'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',
  ]
  const displayDate = s.days > 1
    ? `${monthNames[s.month - 1]} ${s.day}, ${s.year} (${s.days}d)`
    : `${monthNames[s.month - 1]} ${s.day}, ${s.year}`

  const city = parseCity(s.venue)
  const province = parseProvince(s.venue)
  const cityLabel = city && province ? `${city}, ${province}` : city || province || ''

  // Pull a short "venue name" — first comma-separated chunk
  const venueShort = s.venue
    ? s.venue.split(',')[0].trim()
    : ''

  // Tags from #hashtags in title
  const tags = []
  const tagRe = /#(\w+)/g
  let tm
  const cleanTitle = s.title.replace(tagRe, (_, t) => { tags.push(t); return '' }).replace(/\s+/g, ' ').trim()
  if (Array.isArray(s.manualTags)) {
    for (const t of s.manualTags) if (!tags.includes(t)) tags.push(t)
  }

  return {
    date: isoDate,
    displayDate,
    title: cleanTitle,
    venue: venueShort,
    city: cityLabel,
    fullVenue: s.venue,
    time: s.time,
    days: s.days,
    tags,
  }
})

// ── Stats ──────────────────────────────────────────────────────────────────

const venues = new Set(formatted.map(s => s.venue).filter(Boolean))
const cities = new Set(formatted.map(s => s.city).filter(Boolean))
const years = formatted.length
  ? [formatted[0].date.slice(0, 4), formatted[formatted.length - 1].date.slice(0, 4)]
  : []

const stats = {
  total: formatted.length,
  uniqueVenues: venues.size,
  uniqueCities: cities.size,
  yearRange: years.length ? `${years[0]}–${years[1]}` : '',
  generated: new Date().toISOString(),
}

// ── Write ──────────────────────────────────────────────────────────────────

const output = { stats, shows: formatted }
fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2))

console.log(`✓ Parsed ${events.length} raw events`)
console.log(`✓ Deduplicated to ${formatted.length} unique shows`)
if (manualCount) console.log(`✓ Merged ${manualCount} manual extras from shows_manual.json`)
console.log(`✓ ${venues.size} venues, ${cities.size} cities, range ${stats.yearRange}`)
console.log(`✓ Wrote ${path.relative(ROOT, OUTPUT)}`)
