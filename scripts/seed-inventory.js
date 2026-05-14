#!/usr/bin/env node

/**
 * seed-inventory.js
 *
 * Populates the `inventory` Firestore collection (reunion_db) with a first-pass
 * set of items derived from the volunteer manual task definitions.
 *
 * Usage:
 *   node ./scripts/seed-inventory.js            # dry-run (prints items, no writes)
 *   node ./scripts/seed-inventory.js --write     # write to Firestore
 *   node ./scripts/seed-inventory.js --write --force  # re-seed even if items exist
 */

import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import dotenv from 'dotenv'
import process from 'process'

dotenv.config()

const WRITE = process.argv.includes('--write')
const FORCE = process.argv.includes('--force')

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

// ─── Inventory seed data ──────────────────────────────────────────────────────
//
// Fields match useInventory schema:
//   name, description, location, sub_location, departments[], task_ids[],
//   needs_restock, notes
//
// Locations are kept as slug-style strings matching the map SVG IDs you use
// elsewhere (front_gate_icon, stage_icon, etc. minus the _icon suffix).

const ITEMS = [
  // ── FRONT GATE ──────────────────────────────────────────────────────────────
  {
    name: 'Front Gate Tent / Canopy',
    description: 'Entry canopy shelter for the gate booth',
    location: 'front_gate',
    sub_location: 'Storage shed',
    departments: ['front_gate'],
    task_ids: ['frontgate_001', 'frontgate_008'],
    needs_restock: false,
    notes: ''
  },
  {
    name: 'Folding Table',
    description: 'Table for the gate scanning station',
    location: 'front_gate',
    sub_location: '',
    departments: ['front_gate'],
    task_ids: ['frontgate_001', 'frontgate_008'],
    needs_restock: false,
    notes: ''
  },
  {
    name: 'Folding Chairs (×2)',
    description: 'Seating for gate operators',
    location: 'front_gate',
    sub_location: '',
    departments: ['front_gate'],
    task_ids: ['frontgate_001'],
    needs_restock: false,
    notes: ''
  },
  {
    name: 'Entry Rope & Stanchions',
    description: 'Queue management barriers at the entrance',
    location: 'front_gate',
    sub_location: '',
    departments: ['front_gate'],
    task_ids: ['frontgate_001'],
    needs_restock: false,
    notes: ''
  },
  {
    name: 'Entry Signage',
    description: 'Welcome and directional signs for the gate area',
    location: 'front_gate',
    sub_location: '',
    departments: ['front_gate'],
    task_ids: ['frontgate_001'],
    needs_restock: false,
    notes: ''
  },
  {
    name: 'QR Ticket Scanner (Tablet)',
    description: 'Primary device running the ticket scanner app',
    location: 'front_gate',
    sub_location: '',
    departments: ['front_gate'],
    task_ids: ['frontgate_002', 'frontgate_003', 'frontgate_005', 'frontgate_006'],
    needs_restock: false,
    notes: 'Confirm device is charged before each shift'
  },
  {
    name: 'Mobile Hotspot Device',
    description: 'Provides internet connection for the scanner tablet',
    location: 'front_gate',
    sub_location: '',
    departments: ['front_gate'],
    task_ids: ['frontgate_002'],
    needs_restock: false,
    notes: 'Hotspot plan must have sufficient data'
  },
  {
    name: 'Backup Scanner Device',
    description: 'Secondary phone/tablet in case primary fails',
    location: 'front_gate',
    sub_location: '',
    departments: ['front_gate'],
    task_ids: ['frontgate_006'],
    needs_restock: false,
    notes: 'Keep fully charged at start of every shift'
  },
  {
    name: 'Cash Box',
    description: 'Lockable box for cash transactions at the gate',
    location: 'front_gate',
    sub_location: '',
    departments: ['front_gate'],
    task_ids: ['frontgate_004', 'frontgate_008'],
    needs_restock: false,
    notes: 'Count starting cash before opening gate'
  },
  {
    name: 'Device Charger / Power Bank',
    description: 'Charging cable and portable battery for scanner devices',
    location: 'front_gate',
    sub_location: '',
    departments: ['front_gate'],
    task_ids: ['frontgate_006'],
    needs_restock: false,
    notes: ''
  },
  {
    name: 'Guest Wristbands',
    description: 'Fabric/Tyvek entry wristbands for festival attendees',
    location: 'front_gate',
    sub_location: '',
    departments: ['front_gate'],
    task_ids: ['frontgate_001'],
    needs_restock: false,
    notes: 'Flag needs_restock if stock drops below ~50'
  },

  // ── FOOD TEAM ───────────────────────────────────────────────────────────────
  {
    name: 'Self-Serve Kiosk (iPad)',
    description: 'iPad running the self-serve order kiosk software',
    location: 'food_tent',
    sub_location: 'Service counter',
    departments: ['food_team'],
    task_ids: ['food_002', 'food_006'],
    needs_restock: false,
    notes: 'Confirm kiosk software is loaded before service opens'
  },
  {
    name: 'Meal Scanner App Device',
    description: 'Phone or tablet running the meal QR scanner app',
    location: 'food_tent',
    sub_location: '',
    departments: ['food_team'],
    task_ids: ['food_004', 'food_005'],
    needs_restock: false,
    notes: 'Confirm Operator ID is entered at start of shift'
  },
  {
    name: 'Service Handout Table',
    description: 'Table for the food handout / pick-up station',
    location: 'food_tent',
    sub_location: '',
    departments: ['food_team'],
    task_ids: ['food_001'],
    needs_restock: false,
    notes: 'Set up per Angela\'s direction before service opens'
  },
  {
    name: 'Napkins & Utensil Stock',
    description: 'Disposable napkins, forks, spoons, and knives for service',
    location: 'food_tent',
    sub_location: 'Supply shelf',
    departments: ['food_team'],
    task_ids: ['food_007'],
    needs_restock: false,
    notes: 'Restock at mid-shift; flag if running low'
  },
  {
    name: 'Trash Bags (Service Area)',
    description: 'Garbage bags for the food service area bins',
    location: 'food_tent',
    sub_location: 'Supply shelf',
    departments: ['food_team'],
    task_ids: ['food_007'],
    needs_restock: false,
    notes: ''
  },

  // ── SETUP CREW ──────────────────────────────────────────────────────────────
  {
    name: 'Shop Vac (+ Filter)',
    description: 'Wet/dry shop vacuum for clearing dust from barn and FOH surfaces',
    location: 'barn',
    sub_location: 'Equipment corner',
    departments: ['setup_crew'],
    task_ids: ['setup_001'],
    needs_restock: false,
    notes: 'Check filter is clean before use'
  },
  {
    name: 'Weed Whacker',
    description: 'Gas or electric string trimmer for cutting overgrowth',
    location: 'shed',
    sub_location: '',
    departments: ['setup_crew'],
    task_ids: ['setup_002'],
    needs_restock: false,
    notes: 'Check fuel / charge before starting'
  },
  {
    name: 'Extension Cord (Heavy Duty / Outdoor)',
    description: 'Outdoor-rated 25–50 ft extension cord',
    location: 'shed',
    sub_location: '',
    departments: ['setup_crew'],
    task_ids: ['setup_002', 'setup_007'],
    needs_restock: false,
    notes: ''
  },
  {
    name: 'Wading Pool',
    description: 'Inflatable or hard-shell wading pool for children\'s area',
    location: 'shed',
    sub_location: '',
    departments: ['setup_crew'],
    task_ids: ['setup_004'],
    needs_restock: false,
    notes: 'Clean before filling; inspect for holes'
  },
  {
    name: 'Garden Hose',
    description: 'Hose for filling the wading pool and general outdoor use',
    location: 'barn',
    sub_location: 'East wall',
    departments: ['setup_crew'],
    task_ids: ['setup_004'],
    needs_restock: false,
    notes: ''
  },
  {
    name: 'Garbage Bags (Heavy Duty)',
    description: 'Large contractor-grade bags for pre-event garbage removal',
    location: 'barn',
    sub_location: 'Supply shelf',
    departments: ['setup_crew', 'cleanup_crew'],
    task_ids: ['setup_005'],
    needs_restock: false,
    notes: ''
  },
  {
    name: 'Rolling Trash Bins',
    description: 'Large outdoor rolling waste bins for barn and FOH areas',
    location: 'barn',
    sub_location: '',
    departments: ['setup_crew'],
    task_ids: ['setup_005'],
    needs_restock: false,
    notes: ''
  },
  {
    name: 'BBQ / Propane Grill',
    description: 'Grill used by food team — cleaned and prepped by setup crew',
    location: 'kitchen',
    sub_location: '',
    departments: ['setup_crew', 'food_team'],
    task_ids: ['setup_007'],
    needs_restock: false,
    notes: 'Check propane level; refill if under half-tank'
  },
  {
    name: 'Oven & Grill Cleaning Supplies',
    description: 'Degreasers, scrubbers, and cleaning cloths for kitchen equipment',
    location: 'kitchen',
    sub_location: 'Under sink',
    departments: ['setup_crew'],
    task_ids: ['setup_007'],
    needs_restock: false,
    notes: ''
  },

  // ── STAGE CREW ──────────────────────────────────────────────────────────────
  {
    name: 'PA System (Mains / Tops)',
    description: 'Main full-range PA speaker tops',
    location: 'stage',
    sub_location: 'Stage left + right',
    departments: ['stage_crew'],
    task_ids: ['stage_001', 'stage_003', 'stage_007'],
    needs_restock: false,
    notes: ''
  },
  {
    name: 'Subwoofer Stack',
    description: 'Low-frequency subwoofer cabinets',
    location: 'stage',
    sub_location: 'Stage front',
    departments: ['stage_crew'],
    task_ids: ['stage_001', 'stage_002', 'stage_007'],
    needs_restock: false,
    notes: ''
  },
  {
    name: 'Stage Monitors',
    description: 'Wedge or side-fill stage monitors for performers',
    location: 'stage',
    sub_location: 'Stage deck',
    departments: ['stage_crew'],
    task_ids: ['stage_003', 'stage_007'],
    needs_restock: false,
    notes: ''
  },
  {
    name: 'DI Boxes',
    description: 'Direct input boxes for instrument line signals',
    location: 'stage',
    sub_location: 'Cable/gear crate',
    departments: ['stage_crew'],
    task_ids: ['stage_005'],
    needs_restock: false,
    notes: ''
  },
  {
    name: 'XLR Cables (Assorted)',
    description: 'Balanced XLR microphone / line cables in various lengths',
    location: 'stage',
    sub_location: 'Cable crate',
    departments: ['stage_crew'],
    task_ids: ['stage_002', 'stage_003', 'stage_005', 'stage_007'],
    needs_restock: false,
    notes: 'Test for continuity before running cable runs'
  },
  {
    name: 'Amplifier Rack',
    description: 'Rack-mounted power amplifier(s) for the PA system',
    location: 'stage',
    sub_location: 'Stage right rack position',
    departments: ['stage_crew'],
    task_ids: ['stage_004'],
    needs_restock: false,
    notes: ''
  },
  {
    name: 'FOH Mixing Console',
    description: 'Front-of-house digital mixing desk',
    location: 'foh',
    sub_location: '',
    departments: ['stage_crew'],
    task_ids: ['stage_005', 'stage_007'],
    needs_restock: false,
    notes: 'Load show file before line check'
  },
  {
    name: 'Projector',
    description: 'High-lumen projector for projection mapping',
    location: 'foh',
    sub_location: '',
    departments: ['stage_crew'],
    task_ids: ['stage_006'],
    needs_restock: false,
    notes: ''
  },
  {
    name: 'Projection Mapping Computer',
    description: 'Laptop running projection mapping software (Resolume / MadMapper)',
    location: 'foh',
    sub_location: '',
    departments: ['stage_crew'],
    task_ids: ['stage_006'],
    needs_restock: false,
    notes: 'Confirm mapping files are loaded and tested before show'
  },
  {
    name: 'Power Strips / Stage Extension Cords',
    description: 'Rack-mount or floor power strips for stage and FOH equipment',
    location: 'stage',
    sub_location: 'Racks',
    departments: ['stage_crew'],
    task_ids: ['stage_004', 'stage_005'],
    needs_restock: false,
    notes: ''
  },

  // ── CLEANUP CREW ────────────────────────────────────────────────────────────
  {
    name: 'Tool Inventory Checklist',
    description: 'Printed checklist for cataloguing tools being returned to storage',
    location: 'shed',
    sub_location: '',
    departments: ['cleanup_crew'],
    task_ids: ['cleanup_001', 'cleanup_006', 'cleanup_007'],
    needs_restock: false,
    notes: 'Update and reprint each year'
  },
  {
    name: 'Labelled Storage Bins',
    description: 'Sealed plastic bins for sorting and storing decorations and supplies',
    location: 'shed',
    sub_location: '',
    departments: ['cleanup_crew'],
    task_ids: ['cleanup_002', 'cleanup_004', 'cleanup_005'],
    needs_restock: false,
    notes: 'Use pest-proof lids; elevate off ground if possible'
  },
  {
    name: 'Marker & Label Tape',
    description: 'Permanent markers and masking / label tape for bin labelling',
    location: 'shed',
    sub_location: 'Supply crate',
    departments: ['cleanup_crew'],
    task_ids: ['cleanup_002', 'cleanup_007'],
    needs_restock: false,
    notes: ''
  },
  {
    name: 'Rodent Deterrent Packs',
    description: 'Moth balls or rodent deterrent pouches for storage areas',
    location: 'shed',
    sub_location: '',
    departments: ['cleanup_crew'],
    task_ids: ['cleanup_004'],
    needs_restock: false,
    notes: 'Replace if older than 6 months'
  },
  {
    name: 'Tarps / Weather Covers',
    description: 'Waterproof tarps for covering stored equipment and large items',
    location: 'shed',
    sub_location: '',
    departments: ['cleanup_crew', 'setup_crew'],
    task_ids: ['cleanup_001', 'cleanup_003'],
    needs_restock: false,
    notes: ''
  },
  {
    name: 'Camera / Phone (Photo Inventory)',
    description: 'Device for photographing item conditions before storage',
    location: 'shed',
    sub_location: '',
    departments: ['cleanup_crew'],
    task_ids: ['cleanup_007'],
    needs_restock: false,
    notes: 'Upload photos to shared folder after session'
  },

  // ── ARCADE ──────────────────────────────────────────────────────────────────
  {
    name: 'Generator',
    description: 'Portable generator providing power to the arcade trailer',
    location: 'arcade_trailer',
    sub_location: 'Exterior — generator pad',
    departments: ['arcade_attendant'],
    task_ids: ['arcade_001', 'arcade_009'],
    needs_restock: false,
    notes: 'Check fuel level before start-up; keep spare fuel can nearby'
  },
  {
    name: 'Arcade Cabinets',
    description: 'All arcade gaming units inside the trailer',
    location: 'arcade_trailer',
    sub_location: 'Interior',
    departments: ['arcade_attendant'],
    task_ids: ['arcade_002', 'arcade_006', 'arcade_008'],
    needs_restock: false,
    notes: 'Boot in sequence; report any cabinet faults immediately'
  },
  {
    name: 'Flipbook Computer & Camera Booth',
    description: 'Computer, camera rig, and booth setup for the flipbook station',
    location: 'arcade_trailer',
    sub_location: 'Flipbook corner',
    departments: ['arcade_attendant'],
    task_ids: ['arcade_003', 'arcade_005', 'arcade_007'],
    needs_restock: false,
    notes: 'Run a test print at start of day to confirm alignment'
  },
  {
    name: 'Paper Cutter',
    description: 'Guillotine or rotary paper cutter for trimming flipbook pages',
    location: 'arcade_trailer',
    sub_location: 'Flipbook corner',
    departments: ['arcade_attendant'],
    task_ids: ['arcade_003', 'arcade_005', 'arcade_007'],
    needs_restock: false,
    notes: 'Keep blade guard on when not in use'
  },
  {
    name: 'Heavy-Duty Stapler',
    description: 'Long-reach stapler for binding flipbook page sets',
    location: 'arcade_trailer',
    sub_location: 'Flipbook corner',
    departments: ['arcade_attendant'],
    task_ids: ['arcade_003', 'arcade_005', 'arcade_007'],
    needs_restock: false,
    notes: ''
  },
  {
    name: 'Flipbook Paper Stock',
    description: 'Pre-cut or full-sheet paper for flipbook print jobs',
    location: 'arcade_trailer',
    sub_location: 'Flipbook supply shelf',
    departments: ['arcade_attendant'],
    task_ids: ['arcade_003', 'arcade_004', 'arcade_005', 'arcade_007'],
    needs_restock: false,
    notes: 'Flag needs_restock when fewer than 2 reams remain'
  },
  {
    name: 'Staple Refills',
    description: 'Spare staple cartridges for the heavy-duty stapler',
    location: 'arcade_trailer',
    sub_location: 'Flipbook supply shelf',
    departments: ['arcade_attendant'],
    task_ids: ['arcade_004'],
    needs_restock: false,
    notes: 'Keep at least 2 spare boxes on hand'
  }
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const colRef = collection(db, 'inventory')

  if (!FORCE && WRITE) {
    const existing = await getDocs(colRef)
    if (!existing.empty) {
      console.log(
        `⚠️  inventory collection already has ${existing.size} item(s). ` +
        `Run with --force to overwrite.\n` +
        `No items were written.`
      )
      process.exit(0)
    }
  }

  console.log(`\n${WRITE ? '🔥 WRITE MODE' : '🔍 DRY RUN'} — ${ITEMS.length} items to seed\n`)

  const deptCounts = {}

  for (const item of ITEMS) {
    const dept = item.departments[0]
    deptCounts[dept] = (deptCounts[dept] || 0) + 1

    console.log(
      `  [${String(deptCounts[dept]).padStart(2, '0')}] ` +
      `${dept.padEnd(20)} ${item.name} ` +
      `(tasks: ${item.task_ids.join(', ')})`
    )

    if (WRITE) {
      await addDoc(colRef, {
        ...item,
        updated_at: serverTimestamp()
      })
    }
  }

  console.log(`\n── Summary ──────────────────────────────────`)
  for (const [dept, count] of Object.entries(deptCounts)) {
    console.log(`  ${dept.padEnd(22)} ${count} items`)
  }
  console.log(`  ${'TOTAL'.padEnd(22)} ${ITEMS.length} items`)

  if (!WRITE) {
    console.log(`\n✅ Dry run complete. Run with --write to seed Firestore.`)
  } else {
    console.log(`\n✅ ${ITEMS.length} items written to Firestore inventory collection.`)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
