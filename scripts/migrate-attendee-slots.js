#!/usr/bin/env node

/**
 * Migration Script: Backfill Attendee Slots for Existing Orders
 * 
 * This script creates stable attendee slots for all existing participants_2026 orders
 * that currently use the legacy ticket_quantity model.
 * 
 * Usage:
 *   node scripts/migrate-attendee-slots.js --dry-run    # Preview changes
 *   node scripts/migrate-attendee-slots.js --apply      # Apply changes
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc as docRef, updateDoc, serverTimestamp } from 'firebase/firestore'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import process from 'process'

// Load environment variables
dotenv.config()

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Firebase (Reunion)
const ReunionConfig = {
  apiKey: process.env.VITE_APP_REUNION_API_KEY,
  authDomain: process.env.VITE_APP_REUNION_AUTH_DOMAIN,
  projectId: process.env.VITE_APP_REUNION_PROJECT_ID,
  storageBucket: process.env.VITE_APP_REUNION_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_APP_REUNION_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_REUNION_APP_ID,
  measurementId: process.env.VITE_APP_REUNION_MEASUREMENT_ID
}

const app = initializeApp(ReunionConfig, 'reunion')
const db = getFirestore(app)

// Migration results tracking
const results = {
  total: 0,
  migrated: 0,
  skipped: 0,
  flagged: 0,
  errors: [],
  flaggedOrders: []
}

/**
 * Generate a new attendee slot
 */
function createAttendeeSlot(passType, validDays = null) {
  const slotId = generateUUID()
  const now = new Date().toISOString()

  return {
    slot_id: slotId,
    attendee_name: '',
    attendee_name_pending: true,
    pass_type: passType,
    valid_days: validDays,
    admission_state: 'not_arrived',
    daily_admission: [],
    waiver: null,
    activity_history: [],
    created_at: now,
    updated_at: now
  }
}

/**
 * Simple UUID v4 generator (compatible with Node.js without crypto.randomUUID)
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Determine if existing entrance history is ambiguous for multi-ticket orders
 */
function isHistoryAmbiguous(entranceHistory, ticketQuantity) {
  if (ticketQuantity === 1) {
    return false // Single ticket - unambiguous
  }

  if (!entranceHistory || entranceHistory.length === 0) {
    return false // No history - create empty slots
  }

  // Multi-ticket orders with any history are ambiguous
  // We can't determine which person did which action
  return true
}

/**
 * Migrate legacy entrance history to slot-based history
 * For single-ticket orders, we can safely migrate all history to the one slot
 */
function migrateLegacyHistory(entranceHistory, slot, ticketQuantity) {
  if (ticketQuantity !== 1 || !entranceHistory || entranceHistory.length === 0) {
    return // Skip for multi-ticket orders or empty history
  }

  // Migrate each legacy activity to the slot
  for (const legacyActivity of entranceHistory) {
    const activity = {
      timestamp: legacyActivity.timestamp || new Date().toISOString(),
      action: legacyActivity.action || 'check_in',
      festival_day: legacyActivity.festival_day || extractDateFromTimestamp(legacyActivity.timestamp),
      admission_state_after: legacyActivity.action === 'check_in' ? 'on_site' : 'returning',
      operator: legacyActivity.operator || 'legacy_migration',
      operator_name: legacyActivity.operator_name || 'Legacy System',
      source: 'operator_scanner',
      notes: 'Migrated from legacy entrance_activity_history'
    }

    if (legacyActivity.action === 'check_out' && legacyActivity.checkout_intent) {
      activity.checkout_intent = legacyActivity.checkout_intent
    }

    slot.activity_history.push(activity)

    // Update daily admission based on activity
    const festivalDay = activity.festival_day
    let dailyAdmission = slot.daily_admission.find(d => d.festival_day === festivalDay)
    
    if (!dailyAdmission) {
      dailyAdmission = {
        festival_day: festivalDay,
        checked_in: false,
        check_in_count: 0,
        check_out_count: 0,
        final_exit_declared: false
      }
      slot.daily_admission.push(dailyAdmission)
    }

    if (activity.action === 'check_in') {
      dailyAdmission.check_in_count += 1
      if (!dailyAdmission.first_check_in_at) {
        dailyAdmission.first_check_in_at = activity.timestamp
      }
      dailyAdmission.last_activity_at = activity.timestamp
    } else if (activity.action === 'check_out') {
      dailyAdmission.check_out_count += 1
      dailyAdmission.last_activity_at = activity.timestamp
      if (activity.checkout_intent === 'final_exit') {
        dailyAdmission.final_exit_declared = true
      }
    }
  }

  // Set admission state based on last activity
  if (slot.activity_history.length > 0) {
    const lastActivity = slot.activity_history[slot.activity_history.length - 1]
    slot.admission_state = lastActivity.admission_state_after
  }
}

/**
 * Extract date from ISO timestamp
 */
function extractDateFromTimestamp(timestamp) {
  if (!timestamp) return new Date().toISOString().split('T')[0]
  return timestamp.split('T')[0]
}

/**
 * Migrate a single order document
 */
async function migrateOrder(doc, dryRun = true) {
  const data = doc.data()
  const idCode = doc.id

  // Skip if already migrated (has attendee_slots and slots_active is true)
  if (data.order?.attendee_slots && data.order?.slots_active) {
    console.log(`  ⏭️  ${idCode}: Already migrated, skipping`)
    results.skipped++
    return
  }

  const order = data.order || {}
  const contact = data.contact || {}
  const currentTicketQuantity = order.ticket_quantity || 1
  const originalTicketQuantity = order.original_ticket_quantity || currentTicketQuantity
  const ticketType = order.ticket_type || 'Weekend Pass'
  const selectedDay = order.selected_day
  const entranceHistory = order.entrance_activity_history || []

  // Determine if history is ambiguous
  const ambiguous = isHistoryAmbiguous(entranceHistory, currentTicketQuantity)

  // Create attendee slots based on CURRENT ticket quantity (accounts for transfers)
  const slots = []
  for (let i = 0; i < currentTicketQuantity; i++) {
    const validDays = ticketType === 'Day Pass' && selectedDay ? [selectedDay] : null
    const slot = createAttendeeSlot(ticketType, validDays)

    // For the first slot, default to the order holder's name
    if (i === 0 && contact.fullname) {
      slot.attendee_name = contact.fullname
      slot.attendee_name_pending = false
    }

    // For single-ticket orders, migrate the history
    if (i === 0) {
      migrateLegacyHistory(entranceHistory, slot, currentTicketQuantity)
    }

    slots.push(slot)
  }

  // Create migration record
  const migrationRecord = {
    id_code: idCode,
    migrated_at: new Date().toISOString(),
    slots_created: slots.length,
    ambiguous_history: ambiguous,
    needs_review: ambiguous && entranceHistory.length > 0,
    notes: ambiguous 
      ? 'Multi-ticket order with entrance history - manual reconciliation recommended'
      : 'Clean migration',
    legacy_snapshot: {
      ticket_quantity: order.ticket_quantity,
      checked_in: order.checked_in,
      entrance_activity_history: entranceHistory
    }
  }

  if (migrationRecord.needs_review) {
    results.flaggedOrders.push({
      id_code: idCode,
      fullname: data.contact?.fullname || 'Unknown',
      email: data.contact?.email || 'Unknown',
      ticket_quantity: originalTicketQuantity,
      entrance_history_count: entranceHistory.length,
      reason: 'Ambiguous history - cannot determine which attendee performed which activity'
    })
    results.flagged++
  }

  console.log(
    `  ${ambiguous ? '⚠️ ' : '✅'} ${idCode}: Creating ${slots.length} slots` +
    (ambiguous ? ' [FLAGGED FOR REVIEW]' : '')
  )

  if (!dryRun) {
    // Apply the migration
    const documentRef = docRef(db, 'participants_2026', idCode)
    await updateDoc(documentRef, {
      'order.attendee_slots': slots,
      'order.slots_active': true, // Activate slot-based system
      'order.migration_record': migrationRecord,
      updated_at: serverTimestamp()
    })
  }

  results.migrated++
}

/**
 * Main migration function
 */
async function migrateAllOrders(dryRun = true) {
  console.log('\n' + '='.repeat(70))
  console.log(`🔄 Attendee Slots Migration - ${dryRun ? 'DRY RUN' : 'APPLYING CHANGES'}`)
  console.log('='.repeat(70) + '\n')

  try {
    const participantsRef = collection(db, 'participants_2026')
    const snapshot = await getDocs(participantsRef)
    results.total = snapshot.size

    console.log(`📊 Found ${results.total} orders to process\n`)

    for (const docSnapshot of snapshot.docs) {
      try {
        await migrateOrder(docSnapshot, dryRun)
      } catch (error) {
        console.error(`  ❌ ${docSnapshot.id}: Error - ${error.message}`)
        results.errors.push({
          id_code: docSnapshot.id,
          error: error.message
        })
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(70))
    console.log('📈 Migration Summary')
    console.log('='.repeat(70))
    console.log(`Total orders:        ${results.total}`)
    console.log(`Migrated:            ${results.migrated}`)
    console.log(`Skipped (existing):  ${results.skipped}`)
    console.log(`Flagged for review:  ${results.flagged}`)
    console.log(`Errors:              ${results.errors.length}`)

    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const resultsFile = path.join(__dirname, `migration-results-${timestamp}.json`)
    await fs.writeFile(resultsFile, JSON.stringify(results, null, 2))
    console.log(`\n💾 Full results saved to: ${resultsFile}`)

    // Print flagged orders if any
    if (results.flaggedOrders.length > 0) {
      console.log('\n' + '⚠️ '.repeat(35))
      console.log('⚠️  ORDERS FLAGGED FOR MANUAL REVIEW')
      console.log('⚠️ '.repeat(35))
      console.log('\nThese multi-ticket orders have entrance history that cannot be')
      console.log('automatically attributed to individual attendees:\n')
      
      for (const flagged of results.flaggedOrders) {
        console.log(`  ${flagged.id_code} - ${flagged.fullname} (${flagged.email})`)
        console.log(`    Tickets: ${flagged.ticket_quantity}, History entries: ${flagged.entrance_history_count}`)
        console.log(`    Reason: ${flagged.reason}\n`)
      }

      const flaggedFile = path.join(__dirname, `flagged-orders-${timestamp}.json`)
      await fs.writeFile(flaggedFile, JSON.stringify(results.flaggedOrders, null, 2))
      console.log(`📋 Flagged orders list saved to: ${flaggedFile}`)
    }

    if (dryRun) {
      console.log('\n' + '='.repeat(70))
      console.log('ℹ️  This was a DRY RUN - no changes were applied')
      console.log('   Run with --apply to execute the migration')
      console.log('='.repeat(70))
    } else {
      console.log('\n' + '='.repeat(70))
      console.log('✅ Migration completed successfully!')
      console.log('='.repeat(70))
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const dryRun = !args.includes('--apply')

// Run migration
migrateAllOrders(dryRun)
  .then(() => {
    console.log('\n✨ Migration script completed\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })
