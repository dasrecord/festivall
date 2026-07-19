#!/usr/bin/env node

/**
 * Generates Bitcoin Block Party MC announcement copy from config.
 *
 * Usage:
 *   node scripts/generate-bbp-mc-announcements.js
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

function buildAnnouncementModel() {
  const vars = {
    year: BBP.year,
    venue: BBP.venue,
    city: BBP.city,
    date: BBP.date,
  }

  const itinerary = BBP.itinerary.map((item) => ({
    time: item.time,
    line: `${item.time} — ${item.label}${item.note ? ` (${item.note})` : ''}`,
  }))

  const sponsorsByTier = groupedSponsors()

  const sections = [
    {
      key: 'opening',
      title: 'Opening',
      lines: [fillTemplate(BBP.mc.opening, vars)],
    },
    {
      key: 'safety',
      title: 'Housekeeping / Safety',
      lines: [BBP.mc.safety],
    },
    {
      key: 'sponsors',
      title: 'Sponsor Acknowledgements',
      lines: [
        BBP.mc.sponsorIntro,
        ...Object.entries(sponsorsByTier).map(([tier, names]) => `${tier}: ${names.join(', ')}`),
      ],
    },
    {
      key: 'transitions',
      title: 'Program Transitions',
      lines: [
        `${BBP.mc.screeningIntro}`,
        `${BBP.mc.speakerIntro}`,
        `${BBP.mc.dinnerIntro}`,
        `${BBP.mc.djIntro}`,
      ],
    },
    {
      key: 'runofshow',
      title: 'Run of Show Snapshot',
      lines: itinerary.map((row) => row.line),
    },
    {
      key: 'closing',
      title: 'Closing',
      lines: [BBP.mc.closing],
    },
  ]

  return {
    event: {
      name: BBP.name,
      year: BBP.year,
      date: BBP.date,
      venue: BBP.venue,
      city: BBP.city,
    },
    generatedAt: new Date().toISOString(),
    sections,
  }
}

function toText(model) {
  const lines = []
  lines.push(`${model.event.name} ${model.event.year} — MC Script`)
  lines.push(`${model.event.date} · ${model.event.venue}, ${model.event.city}`)
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

const model = buildAnnouncementModel()
const txt = toText(model)

ensureDir(txtOut)
fs.writeFileSync(txtOut, txt, 'utf8')
console.log(`[bbp-mc] Wrote text announcements: ${path.relative(ROOT, txtOut)}`)

if (jsonOut) {
  ensureDir(jsonOut)
  fs.writeFileSync(jsonOut, JSON.stringify(model, null, 2), 'utf8')
  console.log(`[bbp-mc] Wrote JSON announcements: ${path.relative(ROOT, jsonOut)}`)
}
