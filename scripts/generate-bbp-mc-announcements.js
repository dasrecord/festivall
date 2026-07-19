#!/usr/bin/env node

/**
 * Generates Bitcoin Block Party MC announcement copy from config.
 *
 * Usage:
 *   node scripts/generate-bbp-mc-announcements.js
 *   node scripts/generate-bbp-mc-announcements.js --length short
 *   node scripts/generate-bbp-mc-announcements.js --length long
 *   node scripts/generate-bbp-mc-announcements.js --out ./public/docs/bbp_mc_2026.txt
 *   node scripts/generate-bbp-mc-announcements.js --json ./public/docs/bbp_mc_2026.json
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BITCOIN_BLOCK_PARTY as BBP } from '../src/config/bitcoinBlockPartyConfig.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

function getArgValue(flag, fallback = null) {
  const index = process.argv.indexOf(flag)
  if (index === -1 || index + 1 >= process.argv.length) return fallback
  return process.argv[index + 1]
}

function toAbs(targetPath, fallbackPath) {
  const resolved = targetPath || fallbackPath
  return path.isAbsolute(resolved) ? resolved : path.resolve(ROOT, resolved)
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

function fillTemplate(template, vars) {
  return template
    .replace(/{{year}}/g, String(vars.year))
    .replace(/{{venue}}/g, vars.venue)
    .replace(/{{city}}/g, vars.city)
    .replace(/{{date}}/g, vars.date)
}

function naturalList(items) {
  if (!items.length) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

function itineraryTime(label) {
  const row = BBP.itinerary.find((item) => item.label.toLowerCase().includes(label.toLowerCase()))
  return row?.time || 'TBA'
}

function normalizeLength(value) {
  const normalized = String(value || 'long').toLowerCase()
  if (normalized === 'short' || normalized === 'long') return normalized
  throw new Error(`Invalid --length value "${value}". Use "short" or "long".`)
}

function groupedSponsors() {
  const tiers = new Map(BBP.sponsorTiers.map((tier) => [tier.id, tier]))
  const confirmed = BBP.sponsors.filter((sponsor) => sponsor.status === 'confirmed')

  const grouped = {}
  for (const sponsor of confirmed) {
    const tierName = tiers.get(sponsor.tier)?.name || sponsor.tier.toUpperCase()
    if (!grouped[tierName]) grouped[tierName] = []
    grouped[tierName].push(sponsor.displayName)
  }
  return grouped
}

function sponsorsByTierId() {
  const out = {
    satoshi: [],
    whale: [],
    bull: [],
  }

  for (const sponsor of BBP.sponsors) {
    if (sponsor.status !== 'confirmed') continue
    if (!out[sponsor.tier]) out[sponsor.tier] = []
    out[sponsor.tier].push(sponsor.displayName)
  }

  return out
}

function buildWovenRunOfShow(vars, length) {
  const tiered = sponsorsByTierId()
  const presenting = naturalList(tiered.satoshi)
  const whales = naturalList(tiered.whale)
  const bulls = naturalList(tiered.bull)

  const doorsTime = itineraryTime('doors open')
  const filmOneTime = BBP.itinerary.find((item) => item.label === 'Film Screening')?.time || 'TBA'
  const speakerTime = itineraryTime('speakers')
  const filmTwoTime = BBP.itinerary
    .filter((item) => item.label === 'Film Screening')
    .map((item) => item.time)[1] || 'TBA'
  const dinnerTime = itineraryTime('dinner')
  const ackTime = itineraryTime('acknowledgements')
  const djTime = itineraryTime('djs')
  const closeTime = itineraryTime('doors close')

  const firstFilm = BBP.screenings?.[0]
  const secondFilm = BBP.screenings?.[1]

  if (length === 'short') {
    return [
      `Good afternoon and welcome to Bitcoin Block Party ${vars.year} at ${vars.venue}, ${vars.city}, on ${vars.date}.`,
      `Doors open at ${doorsTime}. Programming proceeds with screening segments at ${filmOneTime} and ${filmTwoTime}, speakers at ${speakerTime}, and dinner service at ${dinnerTime}.`,
      `At ${ackTime}, we recognize our sponsors${presenting ? `, led by ${presenting}` : ''}${whales ? `, with valued support from ${whales}` : ''}${bulls ? ` and ${bulls}` : ''}.`,
      `The evening mixer begins at ${djTime}${BBP.dj?.name ? ` with music by ${BBP.dj.name}` : ''}, and the event concludes at ${closeTime}.`,
    ]
  }

  const lines = [
    `Good afternoon and welcome to Bitcoin Block Party ${vars.year} at ${vars.venue}, ${vars.city}, on ${vars.date}.`,
    `At ${doorsTime}, doors open and we begin a full day of Bitcoin-focused programming, community dialogue, and live performances.`,
    `At ${filmOneTime}, we transition to the first screening${firstFilm?.title ? `, ${firstFilm.title}` : ''}, followed by our speaker program at ${speakerTime}.${presenting ? ` We gratefully acknowledge ${presenting} as our presenting sponsor during this segment.` : ''}`,
    `At ${filmTwoTime}, we present the second screening${secondFilm?.title ? `, ${secondFilm.title}` : ''}, continuing the discussion on Bitcoin education and adoption.`,
    `At ${dinnerTime}, dinner service begins.${whales ? ` We thank ${whales} for their significant support in delivering today's guest experience.` : ''}`,
    `At ${ackTime}, formal sponsor acknowledgements will be delivered${presenting ? ` with recognition of ${presenting}` : ''}${bulls ? `, alongside support from ${bulls}` : ''}.`,
    `At ${djTime}, the evening mixer begins${BBP.dj?.name ? ` featuring ${BBP.dj.name}` : ''}, followed by networking and community connection.`,
    `At ${closeTime}, the event concludes. Thank you for your participation, and we wish everyone safe travels.`,
  ]

  return lines
}

function buildAnnouncementModel(options = {}) {
  const length = normalizeLength(options.length)

  const vars = {
    year: BBP.year,
    venue: BBP.venue,
    city: BBP.city,
    date: BBP.date,
  }

  const sponsorsByTier = groupedSponsors()
  const wovenRunOfShow = buildWovenRunOfShow(vars, length)

  const sponsorSentences = []
  const sponsorOrder = ['SATOSHI', 'WHALE', 'BULL']
  for (const tier of sponsorOrder) {
    const names = sponsorsByTier[tier] || []
    if (!names.length) continue
    sponsorSentences.push(`${tier}: ${naturalList(names)}.`)
  }

  const itinerarySnapshot = BBP.itinerary.map((item) => {
    const note = item.note ? ` (${item.note})` : ''
    return `${item.time} — ${item.label}${note}`
  })

  const sections = [
    {
      key: 'opening',
      title: 'Opening',
      lines: [
        fillTemplate(BBP.mc.opening, vars),
        `Program hours are ${BBP.startTime} to ${BBP.endTime}.`,
      ],
    },
    {
      key: 'woven-runofshow',
      title: 'Woven Run of Show',
      lines: wovenRunOfShow,
    },
    {
      key: 'sponsors',
      title: 'Sponsor Acknowledgements',
      lines: [
        BBP.mc.sponsorIntro,
        ...sponsorSentences,
      ],
    },
  ]

  if (length === 'long') {
    sections.push(
      {
        key: 'runofshow',
        title: 'Run of Show Snapshot',
        lines: itinerarySnapshot,
      },
      {
        key: 'safety',
        title: 'Housekeeping / Safety',
        lines: [BBP.mc.safety],
      }
    )
  }

  sections.push({
    key: 'closing',
    title: 'Closing',
    lines: [BBP.mc.closing],
  })

  return {
    event: {
      name: BBP.name,
      year: BBP.year,
      date: BBP.date,
      venue: BBP.venue,
      city: BBP.city,
    },
    format: {
      tone: 'formal-professional',
      length,
    },
    generatedAt: new Date().toISOString(),
    sections,
  }
}

function toText(model) {
  const lines = []
  lines.push(`${model.event.name} ${model.event.year} — MC Script`)
  lines.push(`${model.event.date} · ${model.event.venue}, ${model.event.city}`)
  lines.push(`Tone: Formal/Professional · Length: ${model.format.length}`)
  lines.push('')

  for (const section of model.sections) {
    lines.push(`## ${section.title}`)
    for (const line of section.lines) {
      lines.push(`- ${line}`)
    }
    lines.push('')
  }

  return lines.join('\n').trim() + '\n'
}

const txtOut = toAbs(
  getArgValue('--out'),
  `public/docs/bbp_mc_announcements_${BBP.year}.txt`
)
const jsonArg = getArgValue('--json')
const jsonOut = jsonArg ? toAbs(jsonArg) : null
const length = normalizeLength(getArgValue('--length', 'long'))

const model = buildAnnouncementModel({ length })
const txt = toText(model)

ensureDir(txtOut)
fs.writeFileSync(txtOut, txt, 'utf8')
console.log(`[bbp-mc] Wrote text announcements: ${path.relative(ROOT, txtOut)}`)

if (jsonOut) {
  ensureDir(jsonOut)
  fs.writeFileSync(jsonOut, JSON.stringify(model, null, 2), 'utf8')
  console.log(`[bbp-mc] Wrote JSON announcements: ${path.relative(ROOT, jsonOut)}`)
}
