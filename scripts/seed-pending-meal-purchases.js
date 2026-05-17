#!/usr/bin/env node
/**
 * seed-pending-meal-purchases.js
 *
 * Adds 2 dummy pending ad hoc meal purchases to 2 participants in Firestore.
 * Used to test the End Meal Service modal's pending-purchase detection and
 * auto-exemption logic.
 *
 * Usage:
 *   node ./scripts/seed-pending-meal-purchases.js             # dry-run (prints, no writes)
 *   node ./scripts/seed-pending-meal-purchases.js --write     # write to Firestore
 *
 * Set the two target id_codes below before running.
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, updateDoc, arrayUnion } from 'firebase/firestore'
import dotenv from 'dotenv'
import process from 'process'

dotenv.config()

const WRITE = process.argv.includes('--write')

const ReunionConfig = {
  apiKey: process.env.VITE_APP_REUNION_API_KEY,
  authDomain: process.env.VITE_APP_REUNION_AUTH_DOMAIN,
  projectId: process.env.VITE_APP_REUNION_PROJECT_ID,
  storageBucket: process.env.VITE_APP_REUNION_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_APP_REUNION_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_REUNION_APP_ID
}

const app = initializeApp(ReunionConfig, 'reunion')
const db = getFirestore(app)

// ── Configure target participants ────────────────────────────────────────────
// Replace these with real id_codes from participants_2026
const TARGETS = [
  { id_code: 'a2c4e', meal_quantity: 3, payment_type: 'bitcoin' },

]

const MEAL_PRICE = 15 // CAD per ticket

// ── Build pending entries ────────────────────────────────────────────────────
const entries = TARGETS.map(({ id_code, meal_quantity, payment_type }) => ({
  id_code,
  entry: {
    timestamp: new Date().toISOString(),
    meal_quantity,
    payment_type,
    fiat_total: meal_quantity * MEAL_PRICE,
    id_code,
    status: 'pending'
  }
}))

// ── Dry-run output ───────────────────────────────────────────────────────────
console.log('\n── Pending meal purchase entries to write ──')
for (const { id_code, entry } of entries) {
  console.log(`\nParticipant: ${id_code}`)
  console.log(JSON.stringify(entry, null, 2))
}

if (!WRITE) {
  console.log('\n[DRY RUN] No writes made. Pass --write to commit to Firestore.\n')
  process.exit(0)
}

// ── Write to Firestore ───────────────────────────────────────────────────────
console.log('\n── Writing to Firestore... ──')
for (const { id_code, entry } of entries) {
  const ref = doc(db, 'participants_2026', id_code)
  await updateDoc(ref, {
    'order.pending_meal_purchases': arrayUnion(entry)
  })
  console.log(`✅ Written pending entry for ${id_code}`)
}

console.log('\nDone.\n')
