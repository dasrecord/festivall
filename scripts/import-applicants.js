#!/usr/bin/env node

/**
 * import-applicants.js
 *
 * Reads all CSV files from public/data/applicants/, cleans and normalizes each
 * record into a canonical schema, then imports them into the `leads` collection
 * in festivall_db.
 *
 * Cleaning pipeline (per record):
 *   1. Normalize phone  — digits only; prepend '1' for 10-digit NA numbers
 *   2. Normalize email  — lowercase + trim; null if no '@'
 *   3. Drop test entries (e.g. @stilton.com, known dummy names)
 *   4. Drop records with no email AND no phone
 *   5. Within-source dedup by email — keep the record with most filled fields
 *   6. Cross-source dedup detection — flag duplicate_email + also_found_in[]
 *
 * Usage:
 *   node ./scripts/import-applicants.js                          # dry-run
 *   node ./scripts/import-applicants.js --write                  # write all
 *   node ./scripts/import-applicants.js --write --source reunion # one source
 */

import { createReadStream } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import csv from 'csv-parser'
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))

dotenv.config({ path: resolve(__dirname, '../.env.festivall') })
dotenv.config() // fallback: also load .env for any remaining vars

const APPLICANTS_DIR = resolve(__dirname, '../public/data/applicants')

const WRITE = process.argv.includes('--write')
const SOURCE_ARG = (() => {
  const idx = process.argv.indexOf('--source')
  return idx !== -1 ? process.argv[idx + 1] : null
})()

// ─── Firebase ──────────────────────────────────────────────────────────────────

const REQUIRED_ENV = [
  'VITE_APP_FESTIVALL_API_KEY',
  'VITE_APP_FESTIVALL_AUTH_DOMAIN',
  'VITE_APP_FESTIVALL_PROJECT_ID',
  'VITE_APP_FESTIVALL_APP_ID',
]
const missingEnv = REQUIRED_ENV.filter((k) => !process.env[k])
if (missingEnv.length) {
  console.error(`\nMissing required env vars:\n  ${missingEnv.join('\n  ')}`)
  console.error('\nEnsure .env contains VITE_APP_FESTIVALL_* variables.\n')
  process.exit(1)
}

const FestivallConfig = {
  apiKey: process.env.VITE_APP_FESTIVALL_API_KEY?.trim(),
  authDomain: process.env.VITE_APP_FESTIVALL_AUTH_DOMAIN?.trim(),
  projectId: process.env.VITE_APP_FESTIVALL_PROJECT_ID?.trim(),
  storageBucket: process.env.VITE_APP_FESTIVALL_STORAGE_BUCKET?.trim(),
  messagingSenderId: process.env.VITE_APP_FESTIVALL_MESSAGING_SENDER_ID?.trim(),
  appId: process.env.VITE_APP_FESTIVALL_APP_ID?.trim(),
}

const app = initializeApp(FestivallConfig, 'festivall')
const db = getFirestore(app)

// ─── Utilities ─────────────────────────────────────────────────────────────────

/** Trim string; return null for empty/null/undefined */
function n(val) {
  if (val == null) return null
  const s = String(val).trim()
  return s === '' ? null : s
}

/** Lowercase + trim email; null if missing '@' */
function normalizeEmail(raw) {
  if (!raw) return null
  const e = String(raw).toLowerCase().trim()
  return e.includes('@') ? e : null
}

/**
 * Strip non-digits from phone number.
 * Prepends '1' for 10-digit North American numbers.
 * Returns null if fewer than 7 digits remain.
 */
function normalizePhone(raw) {
  if (!raw) return null
  const digits = String(raw).replace(/\D/g, '')
  if (!digits || digits.length < 7) return null
  if (digits.length === 10) return '1' + digits
  if (digits.length === 11 && digits[0] === '1') return digits
  return digits
}

/**
 * Parse a submission timestamp. Handles:
 *   - ISO strings (YYYY-MM-DD ...)
 *   - M/D/YYYY HH:MM:SS  (Google Forms legacy)
 *   - DD/MM/YYYY HH:MM:SS (cream_collective)
 */
function parseDate(val) {
  if (!val) return null
  const s = String(val).trim()

  // DD/MM/YYYY HH:MM:SS — day > 12 means it can't be M/D/YYYY
  const dmyMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(.+)$/)
  if (dmyMatch) {
    const [, d, m, y, time] = dmyMatch
    if (parseInt(d, 10) > 12) {
      const dt = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${time}`)
      if (!isNaN(dt.getTime())) return dt
    }
  }

  const dt = new Date(s)
  return isNaN(dt.getTime()) ? null : dt
}

/** Score a record by count of non-null, non-empty top-level values (for dedup). */
function score(rec) {
  return Object.entries(rec).filter(
    ([k, v]) => k !== 'extra' && v !== null && v !== undefined && v !== '',
  ).length
}

const TEST_EMAIL_DOMAINS = ['@stilton.com', '@example.com', '@test.com']
const TEST_NAMES = new Set(['geronimo stilton'])

function isTestEntry(email, fullName) {
  if (email && TEST_EMAIL_DOMAINS.some((d) => email.includes(d))) return true
  if (fullName && TEST_NAMES.has(fullName.toLowerCase())) return true
  return false
}

/**
 * Sanitize a string for use as a Firestore map key.
 * Firestore rejects field names containing '/' (path separator) and '.'.
 * Replaces runs of invalid characters with '_'; truncates to 200 chars.
 */
function sanitizeKey(k) {
  return (
    String(k)
      .replace(/[.\[\]#$/]/g, '_') // known problematic chars
      .replace(/_{2,}/g, '_')      // collapse consecutive underscores
      .replace(/^_+|_+$/g, '')     // trim leading/trailing underscores
      .slice(0, 200) || 'field'
  )
}

/**
 * Collect all row fields NOT in mappedKeys into an `extra` map.
 * Only includes non-empty values to avoid bloat.
 * Keys are sanitized to be valid Firestore field names.
 */
function buildExtra(row, mappedKeys) {
  const extra = {}
  for (const [k, v] of Object.entries(row)) {
    if (mappedKeys.has(k)) continue
    const val = n(v)
    if (val !== null) extra[sanitizeKey(k)] = val
  }
  return Object.keys(extra).length ? extra : null
}

/** Parse a CSV file → array of raw row objects */
function parseCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = []
    createReadStream(filePath)
      .pipe(csv({ bom: true }))
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject)
  })
}

// ─── Schema Normalizers ────────────────────────────────────────────────────────
//
// Each normalizer maps a raw CSV row → canonical lead document.
// Fields not mapped to canonical slots are captured in `extra` (non-empty only).

// ── reunion (Typeform v2, 2024) ────────────────────────────────────────────────
const REUNION_MAPPED = new Set([
  'id_code_long', 'id_code', 'first_name', 'last_name', 'fullname', 'dob',
  'email', 'phone', 'country', 'city', 'province', 'Other', 'applicant_type',
  'act_type', 'act_name', 'genre', 'bio', 'url', 'social_url', 'mix_track_url',
  'spotify_url', 'logo_url', 'headshot_url', 'producer', 'original_production',
  'Submit Date (UTC)', 'Start Date (UTC)', 'Stage Date (UTC)', 'Network ID',
  'Tags', 'Response Type',
])

function normalizeReunion(row, sourceFile) {
  const fname = n(row.first_name)
  const lname = n(row.last_name)
  return {
    source: 'reunion',
    source_file: sourceFile,
    first_name: fname,
    last_name: lname,
    full_name: n(row.fullname) || [fname, lname].filter(Boolean).join(' ') || null,
    email: normalizeEmail(row.email),
    phone: normalizePhone(row.phone),
    city: n(row.city),
    province: n(row.province),
    country: n(row.country),
    dob: n(row.dob),
    applicant_type: n(row.applicant_type),
    act_name: n(row.act_name),
    genre: n(row.genre),
    bio: n(row.bio),
    url: n(row.url) || n(row.social_url) || n(row.spotify_url) || n(row.mix_track_url),
    submitted_at: parseDate(row['Submit Date (UTC)']),
    extra: buildExtra(row, REUNION_MAPPED),
  }
}

// ── impact (Typeform v1, 2020) ─────────────────────────────────────────────────
const IMPACT_MAPPED = new Set([
  'id', 'full_name', 'dob', 'email', 'phone', 'country', 'city', 'province',
  'region', 'applicant_type', 'act_name', 'genre', 'bio', 'url', 'mix_track_url',
  'personal_statement', 'response_type', 'application_started', 'staged',
  'submitted', 'network_id', 'tags',
])

function normalizeImpact(row, sourceFile) {
  const parts = n(row.full_name)?.split(' ') ?? []
  return {
    source: 'impact',
    source_file: sourceFile,
    first_name: parts[0] ?? null,
    last_name: parts.slice(1).join(' ') || null,
    full_name: n(row.full_name),
    email: normalizeEmail(row.email),
    phone: normalizePhone(row.phone),
    city: n(row.city),
    province: n(row.province),
    country: n(row.country),
    dob: n(row.dob),
    applicant_type: n(row.applicant_type),
    act_name: n(row.act_name),
    genre: n(row.genre),
    bio: n(row.bio),
    url: n(row.url) || n(row.mix_track_url),
    submitted_at: parseDate(row.submitted),
    extra: buildExtra(row, IMPACT_MAPPED),
  }
}

// ── evolved_music_group ────────────────────────────────────────────────────────
const EMG_MAPPED = new Set([
  'id_code_long', 'id_code', 'fullname', 'region', 'applicant_type',
  'genre', 'email', 'comments', 'mix_track_url',
])

function normalizeEMG(row, sourceFile) {
  const parts = n(row.fullname)?.split(' ') ?? []
  return {
    source: 'evolved_music_group',
    source_file: sourceFile,
    first_name: parts[0] ?? null,
    last_name: parts.slice(1).join(' ') || null,
    full_name: n(row.fullname),
    email: normalizeEmail(row.email),
    phone: null,
    city: null,
    province: null,
    country: n(row.region),
    dob: null,
    applicant_type: n(row.applicant_type),
    act_name: null,
    genre: n(row.genre),
    bio: n(row.comments),
    url: n(row.mix_track_url),
    submitted_at: null,
    extra: buildExtra(row, EMG_MAPPED),
  }
}

// ── blessed_coast (Google Forms 2016-17) ──────────────────────────────────────
const BLESSED_COAST_MAPPED = new Set([
  'timestamp', 'full_name', 'act_name', 'email', 'applicant_type', 'bio',
  'url', 'willing', 'rates', 'comments', 'phone',
  'emergency_contact', 'emergency_phone',
])

function normalizeBlessedCoast(row, sourceFile) {
  const parts = n(row.full_name)?.split(' ') ?? []
  return {
    source: 'blessed_coast',
    source_file: sourceFile,
    first_name: parts[0] ?? null,
    last_name: parts.slice(1).join(' ') || null,
    full_name: n(row.full_name),
    email: normalizeEmail(row.email),
    phone: normalizePhone(row.phone),
    city: null,
    province: null,
    country: null,
    dob: null,
    applicant_type: n(row.applicant_type),
    act_name: n(row.act_name),
    genre: null,
    bio: n(row.bio),
    url: n(row.url),
    submitted_at: parseDate(row.timestamp),
    extra: buildExtra(row, BLESSED_COAST_MAPPED),
  }
}

// ── rapture (event staff form, 2016) ──────────────────────────────────────────
const RAPTURE_MAPPED = new Set([
  'timestamp', 'applicant_type', 'full_name', 'sex', 'age', 'phone', 'email',
  'city', 'major', 'skills', 'url', 'why', 'bio', 'define_entrepreneur',
  'genre', 'experience', 'ideal_party', 'social_sphere', 'management_style',
])

function normalizeRapture(row, sourceFile) {
  const parts = n(row.full_name)?.split(' ') ?? []
  return {
    source: 'rapture',
    source_file: sourceFile,
    first_name: parts[0] ?? null,
    last_name: parts.slice(1).join(' ') || null,
    full_name: n(row.full_name),
    email: normalizeEmail(row.email),
    phone: normalizePhone(row.phone),
    city: n(row.city),
    province: null,
    country: null,
    dob: null,
    applicant_type: n(row.applicant_type),
    act_name: null,
    genre: n(row.genre),
    bio: n(row.bio),
    url: n(row.url),
    submitted_at: parseDate(row.timestamp),
    extra: buildExtra(row, RAPTURE_MAPPED),
  }
}

// ── cream_collective (talent scouting) ────────────────────────────────────────
const CREAM_MAPPED = new Set([
  'timestamp', 'region', 'act_name', 'age', 'phone', 'email',
  'selling_points', 'genre', 'applicant_type', 'comments',
  'strengths_weaknesses', 'mix_track_url',
])

function normalizeCream(row, sourceFile) {
  return {
    source: 'cream_collective',
    source_file: sourceFile,
    first_name: null,
    last_name: null,
    full_name: n(row.act_name),
    email: normalizeEmail(row.email),
    phone: normalizePhone(row.phone),
    city: null,
    province: null,
    country: n(row.region),
    dob: null,
    applicant_type: n(row.applicant_type),
    act_name: n(row.act_name),
    genre: n(row.genre),
    bio: n(row.selling_points),
    url: n(row.mix_track_url),
    submitted_at: parseDate(row.timestamp),
    extra: buildExtra(row, CREAM_MAPPED),
  }
}

// ── partywell (CRM contact list) ───────────────────────────────────────────────
const PARTYWELL_MAPPED = new Set([
  'full_name', 'notes', 'email', 'phone', 'url', 'applicant_type', 'bio',
])

function normalizePartywell(row, sourceFile) {
  const parts = n(row.full_name)?.split(' ') ?? []
  return {
    source: 'partywell',
    source_file: sourceFile,
    first_name: parts[0] ?? null,
    last_name: parts.slice(1).join(' ') || null,
    full_name: n(row.full_name),
    email: normalizeEmail(row.email),
    phone: normalizePhone(row.phone),
    city: null,
    province: null,
    country: null,
    dob: null,
    applicant_type: n(row.applicant_type),
    act_name: null,
    genre: null,
    bio: n(row.bio) || n(row.notes),
    url: n(row.url),
    submitted_at: null,
    extra: buildExtra(row, PARTYWELL_MAPPED),
  }
}

// ── registration (dance_ink, shotokan_karate) ──────────────────────────────────
const REG_MAPPED = new Set([
  'GuardianName', 'LastName', 'Address1', 'Address2', 'City', 'ST', 'Zip', 'Email',
])

function normalizeRegistration(row, sourceFile, source) {
  const guardian = n(row.GuardianName)
  const last = n(row.LastName)
  return {
    source,
    source_file: sourceFile,
    first_name: guardian,
    last_name: last,
    full_name: [guardian, last].filter(Boolean).join(' ') || null,
    email: normalizeEmail(row.Email),
    phone: null,
    city: n(row.City),
    province: n(row.ST),
    country: 'Canada',
    dob: null,
    applicant_type: 'Registration',
    act_name: null,
    genre: null,
    bio: null,
    url: null,
    submitted_at: null,
    extra: buildExtra(row, REG_MAPPED),
  }
}

// ─── Source Definitions ────────────────────────────────────────────────────────

const SOURCES = [
  {
    name: 'reunion',
    file: 'reunion.csv',
    normalizer: (r, f) => normalizeReunion(r, f),
  },
  {
    name: 'impact',
    file: 'impact.csv',
    normalizer: (r, f) => normalizeImpact(r, f),
  },
  {
    name: 'evolved_music_group',
    file: 'evolved_music_group.csv',
    normalizer: (r, f) => normalizeEMG(r, f),
  },
  {
    name: 'blessed_coast',
    file: 'blessed_coast.csv',
    normalizer: (r, f) => normalizeBlessedCoast(r, f),
  },
  {
    name: 'rapture',
    file: 'rapture.csv',
    normalizer: (r, f) => normalizeRapture(r, f),
  },
  {
    name: 'cream_collective',
    file: 'cream_collective.csv',
    normalizer: (r, f) => normalizeCream(r, f),
  },
  {
    name: 'partywell',
    file: 'partywell.csv',
    normalizer: (r, f) => normalizePartywell(r, f),
  },
  {
    name: 'dance_ink',
    file: 'dance_ink.csv',
    normalizer: (r, f) => normalizeRegistration(r, f, 'dance_ink'),
  },
  {
    name: 'shotokan_karate',
    file: 'shotokan_karate.csv',
    normalizer: (r, f) => normalizeRegistration(r, f, 'shotokan_karate'),
  },
]

// ─── Deduplication ─────────────────────────────────────────────────────────────

/**
 * Within a single source: dedup by email, keeping the record with the highest
 * score (most non-null canonical fields). Records without an email pass through.
 */
function dedupWithinSource(records) {
  const best = new Map() // email → record
  const noEmail = []

  for (const rec of records) {
    if (!rec.email) {
      noEmail.push(rec)
      continue
    }
    const existing = best.get(rec.email)
    if (!existing || score(rec) > score(existing)) {
      best.set(rec.email, rec)
    }
  }

  return [...best.values(), ...noEmail]
}

/**
 * Build a registry of email → Set<source> across all sources.
 * Used to detect and flag cross-source duplicates.
 */
function buildEmailRegistry(allSourceRecords) {
  const registry = new Map()
  for (const { name, records } of allSourceRecords) {
    for (const rec of records) {
      if (!rec.email) continue
      if (!registry.has(rec.email)) registry.set(rec.email, new Set())
      registry.get(rec.email).add(name)
    }
  }
  return registry
}

/** Annotate each record with cross-source duplicate flags. */
function annotateDupes(records, emailRegistry, sourceName) {
  return records.map((rec) => {
    if (!rec.email) return { ...rec, duplicate_email: false, also_found_in: [] }
    const sources = emailRegistry.get(rec.email) ?? new Set()
    const others = [...sources].filter((s) => s !== sourceName)
    return { ...rec, duplicate_email: others.length > 0, also_found_in: others }
  })
}

// ─── Firestore Write ───────────────────────────────────────────────────────────

const BATCH_SIZE = 499 // Firestore limit is 500 operations per batch

async function writeInBatches(records) {
  const leadsRef = collection(db, 'leads')
  let written = 0

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const chunk = records.slice(i, i + BATCH_SIZE)
    const batch = writeBatch(db)

    for (const rec of chunk) {
      const docRef = doc(leadsRef)
      // Build payload: strip undefined values (Firestore rejects them),
      // convert Date to ISO string for portability.
      const payload = {}
      for (const [k, v] of Object.entries(rec)) {
        if (v === undefined) continue
        payload[k] = v instanceof Date ? v.toISOString() : v
      }
      payload.submitted_at =
        rec.submitted_at instanceof Date ? rec.submitted_at.toISOString() : null
      payload.imported_at = serverTimestamp()
      batch.set(docRef, payload)
    }

    await batch.commit()
    written += chunk.length
    process.stdout.write(`\r  writing... ${written}/${records.length}`)
  }
  process.stdout.write('\n')
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  const modeLabel = WRITE ? 'WRITE MODE' : 'DRY RUN'
  console.log(`\n[${modeLabel}] festivall_db → leads`)
  console.log(`  Project: ${process.env.VITE_APP_FESTIVALL_PROJECT_ID}`)
  if (SOURCE_ARG) console.log(`  Filtering to source: ${SOURCE_ARG}`)
  console.log()

  // Validate --source argument
  const validNames = SOURCES.map((s) => s.name)
  if (SOURCE_ARG && !validNames.includes(SOURCE_ARG)) {
    console.error(`Unknown source "${SOURCE_ARG}". Valid values:\n  ${validNames.join(', ')}`)
    process.exit(1)
  }

  const activeSources = SOURCE_ARG
    ? SOURCES.filter((s) => s.name === SOURCE_ARG)
    : SOURCES

  // ── Pass 1: Parse, normalize, clean, within-source dedup ────────────────────
  const allSourceRecords = []
  let totalRaw = 0

  for (const source of activeSources) {
    const filePath = resolve(APPLICANTS_DIR, source.file)
    let rawRows

    try {
      rawRows = await parseCsv(filePath)
    } catch (err) {
      console.warn(`  [${source.name}] Could not read ${source.file}: ${err.message}`)
      continue
    }

    totalRaw += rawRows.length

    const normalized = []
    let skippedTest = 0
    let skippedEmpty = 0

    for (const row of rawRows) {
      const rec = source.normalizer(row, source.file)

      if (isTestEntry(rec.email, rec.full_name)) {
        skippedTest++
        continue
      }
      if (!rec.email && !rec.phone) {
        skippedEmpty++
        continue
      }

      normalized.push(rec)
    }

    const unique = dedupWithinSource(normalized)
    const dupesRemoved = normalized.length - unique.length

    const parts = [`${rawRows.length} rows`, `→ ${unique.length} to import`]
    const skips = []
    if (skippedTest) skips.push(`${skippedTest} test`)
    if (skippedEmpty) skips.push(`${skippedEmpty} empty`)
    if (dupesRemoved) skips.push(`${dupesRemoved} within-source dupe`)
    if (skips.length) parts.push(`(skipped: ${skips.join(', ')})`)

    console.log(`  [${source.name}] ${parts.join(' ')}`)
    allSourceRecords.push({ name: source.name, records: unique })
  }

  // ── Pass 2: Cross-source dupe detection ─────────────────────────────────────
  const emailRegistry = buildEmailRegistry(allSourceRecords)
  const crossDupeEmails = [...emailRegistry.values()].filter((s) => s.size > 1)

  if (crossDupeEmails.length > 0) {
    console.log(
      `\n  ${crossDupeEmails.length} email(s) appear in multiple sources` +
        ` — flagged (duplicate_email: true) but kept in each source`,
    )
  }

  const annotated = allSourceRecords.flatMap(({ name, records }) =>
    annotateDupes(records, emailRegistry, name),
  )

  const totalToImport = annotated.length
  console.log(`\n  Total: ${totalToImport} records from ${totalRaw} raw rows`)

  if (!WRITE) {
    console.log('\n  Dry run complete. Run with --write to import.\n')
    process.exit(0)
  }

  // ── Pass 3: Write to Firestore ───────────────────────────────────────────────
  console.log()
  for (const { name } of allSourceRecords) {
    const recs = annotated.filter((r) => r.source === name)
    if (!recs.length) continue
    console.log(`  [${name}] writing ${recs.length} records...`)
    await writeInBatches(recs)
  }

  console.log('\n  Import complete.\n')
  process.exit(0)
}

run().catch((err) => {
  console.error('\nFatal error:', err)
  process.exit(1)
})
