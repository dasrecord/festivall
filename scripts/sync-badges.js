import 'dotenv/config'
import { createReadStream } from 'node:fs'
import csv from 'csv-parser'
import { initializeApp, cert } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { badgeDocumentId, buildBadges } from './badge-history.js'

const args = process.argv.slice(2)
if (args.some((arg) => arg !== '--write')) throw new Error('Usage: node scripts/sync-badges.js [--write]')
if (!process.env.FIREBASE_SERVICE_ACCOUNT) throw new Error('FIREBASE_SERVICE_ACCOUNT is missing')
const app = initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) })
const db = getFirestore(app)
const history = []
for await (const row of createReadStream(new URL('../src/data/badge_history.csv', import.meta.url)).pipe(csv())) {
  history.push(row)
}
const sourceNames = ['orders_2025', 'applications_2025', 'participants_2026']
const snapshots = await Promise.all(sourceNames.map((name) => db.collection(name).get()))
const sources = Object.fromEntries(snapshots.map((snapshot, i) => [
  sourceNames[i], snapshot.docs.map((doc) => doc.data())
]))
const { badges, skipped } = buildBadges(history, sources)
const collection = db.collection('participant_badges')
const existing = await collection.get()
const ids = new Set(badges.map((badge) => badgeDocumentId(badge.email)))
const stale = existing.docs.filter((doc) => !ids.has(doc.id) && doc.data().active !== false)
const codeOwners = new Map()
for (const badge of badges) {
  for (const code of badge.idCodes) codeOwners.set(code, (codeOwners.get(code) || 0) + 1)
}
const collisions = [...codeOwners.values()].filter((count) => count > 1).length
const counts = Object.fromEntries([1, 2, 3, 4, 5, 6].map((n) => [
  n, badges.filter((badge) => badge.badgeNumber === n).length
]))
console.log(`Participants: ${badges.length}; badge distribution: ${JSON.stringify(counts)}`)
console.log(`Rows skipped for missing/invalid email: ${JSON.stringify(skipped)}; stale records: ${stale.length}`)
console.log(`Participants without a ticket ID: ${badges.filter((badge) => !badge.idCodes.length).length}; ambiguous ticket IDs: ${collisions}`)
console.log('Badge records are keyed by normalized email hash; ticket IDs link shout-outs to those records.')
console.log('Historical records without ticket IDs remain in the collection for future syncs.')
if (collisions) throw new Error('Resolve ambiguous ticket IDs before syncing badges')

if (args.includes('--write')) {
  const operations = [
    ...badges.map(({ email, ...badge }) => ({
      ref: collection.doc(badgeDocumentId(email)),
      data: { ...badge, active: true, updatedAt: FieldValue.serverTimestamp() }
    })),
    ...stale.map((doc) => ({ ref: doc.ref, data: { active: false, updatedAt: FieldValue.serverTimestamp() } }))
  ]
  for (let i = 0; i < operations.length; i += 400) {
    const batch = db.batch()
    for (const { ref, data } of operations.slice(i, i + 400)) batch.set(ref, data, { merge: true })
    await batch.commit()
  }
  console.log(`Updated ${badges.length} badge records; marked ${stale.length} stale records inactive.`)
} else {
  console.log('Dry run only. Add --write to update Firestore.')
}
