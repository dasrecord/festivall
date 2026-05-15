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
//   name, description, location, sub_location, departments[],
//   needs_restock, missing, notes
//
// location values must match SVG icon IDs from the reunion map (e.g. front_gate_icon).
// Multi-dept shared physical items use departments[] with multiple entries.
// Separate physical instances of the same item type are numbered _1, _2, etc.

const ITEMS = [
  // ── FRONT GATE ──────────────────────────────────────────────────────────────
  {
    name: 'Extension Cord 1',
    description: 'Heavy-duty outdoor extension cord for front gate power needs',
    location: 'front_gate_icon',
    sub_location: '',
    departments: ['front_gate'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Power Bar 1',
    description: 'Power bar for front gate devices',
    location: 'front_gate_icon',
    sub_location: '',
    departments: ['front_gate'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Blue Swivel Chair 1',
    description: 'Blue swivel chair — front gate station',
    location: 'front_gate_icon',
    sub_location: '',
    departments: ['front_gate', 'arcade_attendant'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Blue Swivel Chair 2',
    description: 'Blue swivel chair — front gate station',
    location: 'front_gate_icon',
    sub_location: '',
    departments: ['front_gate', 'arcade_attendant'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Cash Box',
    description: 'Lockable cash box for gate transactions',
    location: 'front_gate_icon',
    sub_location: '',
    departments: ['front_gate'],
    needs_restock: false,
    missing: false,
    notes: 'Count starting cash before opening gate'
  },
  {
    name: 'Kiosk Touchscreen Computer',
    description: 'Touchscreen computer running the front gate kiosk',
    location: 'front_gate_icon',
    sub_location: '',
    departments: ['front_gate'],
    needs_restock: false,
    missing: false,
    notes: 'Confirm device is charged and app is loaded before gate opens'
  },
  {
    name: 'Computer Stand',
    description: 'Stand or mount for the front gate kiosk computer',
    location: 'front_gate_icon',
    sub_location: '',
    departments: ['front_gate'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Mosquito Spray',
    description: 'Insect repellent for gate staff',
    location: 'front_gate_icon',
    sub_location: '',
    departments: ['front_gate'],
    needs_restock: false,
    missing: false,
    notes: 'Flag needs_restock if running low'
  },
  {
    name: 'Fan',
    description: 'Portable fan for front gate booth comfort',
    location: 'front_gate_icon',
    sub_location: '',
    departments: ['front_gate'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'FM Radio',
    description: 'FM radio for front gate area',
    location: 'front_gate_icon',
    sub_location: '',
    departments: ['front_gate'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Walkie Talkie 1',
    description: 'Walkie talkie for front gate communication',
    location: 'front_gate_icon',
    sub_location: '',
    departments: ['front_gate'],
    needs_restock: false,
    missing: false,
    notes: 'Confirm charged and on correct channel before shift'
  },

  // ── FOOD TEAM ───────────────────────────────────────────────────────────────
  {
    name: 'Self-Serve Kiosk Computer',
    description: 'Touchscreen computer running the self-serve meal kiosk',
    location: 'meals_area_icon',
    sub_location: 'Service counter',
    departments: ['food_team'],
    needs_restock: false,
    missing: false,
    notes: 'Confirm kiosk software is loaded before service opens'
  },
  {
    name: 'BBQ A',
    description: 'Primary BBQ grill for food service',
    location: 'shared_kitchen_icon',
    sub_location: '',
    departments: ['food_team'],
    needs_restock: false,
    missing: false,
    notes: 'Check propane level before use'
  },
  {
    name: 'BBQ B',
    description: 'Secondary BBQ grill for food service',
    location: 'shared_kitchen_icon',
    sub_location: '',
    departments: ['food_team'],
    needs_restock: false,
    missing: false,
    notes: 'Check propane level before use'
  },
  {
    name: 'Plates',
    description: 'Plates for food service',
    location: 'shared_kitchen_icon',
    sub_location: 'Supply shelf',
    departments: ['food_team'],
    needs_restock: false,
    missing: false,
    notes: 'Flag needs_restock if supply is running low'
  },
  {
    name: 'Bowls',
    description: 'Bowls for food service',
    location: 'shared_kitchen_icon',
    sub_location: 'Supply shelf',
    departments: ['food_team'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Cutlery',
    description: 'Forks, knives, and spoons for food service',
    location: 'shared_kitchen_icon',
    sub_location: 'Supply shelf',
    departments: ['food_team'],
    needs_restock: false,
    missing: false,
    notes: 'Flag needs_restock if running low mid-service'
  },
  {
    name: 'Napkins',
    description: 'Paper napkins for food service',
    location: 'shared_kitchen_icon',
    sub_location: 'Supply shelf',
    departments: ['food_team'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Dish Soap',
    description: 'Dish soap for food team cleanup',
    location: 'shared_kitchen_icon',
    sub_location: 'Under sink',
    departments: ['food_team'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Rubber Gloves 1',
    description: 'Rubber gloves for food team use',
    location: 'shared_kitchen_icon',
    sub_location: 'Under sink',
    departments: ['food_team'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Water Dispenser',
    description: 'Water cooler / dispenser for meal service area',
    location: 'meals_area_icon',
    sub_location: '',
    departments: ['food_team'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Tongs',
    description: 'BBQ tongs for grilling',
    location: 'shared_kitchen_icon',
    sub_location: '',
    departments: ['food_team'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Grill Brush',
    description: 'Wire brush for cleaning BBQ grates',
    location: 'shared_kitchen_icon',
    sub_location: '',
    departments: ['food_team'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Iron Griddle Pan 1',
    description: 'Cast iron griddle pan for food prep',
    location: 'shared_kitchen_icon',
    sub_location: '',
    departments: ['food_team'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Iron Griddle Pan 2',
    description: 'Cast iron griddle pan for food prep',
    location: 'shared_kitchen_icon',
    sub_location: '',
    departments: ['food_team'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Trash Bags 1',
    description: 'Garbage bags for the food service area',
    location: 'shared_kitchen_icon',
    sub_location: 'Supply shelf',
    departments: ['food_team'],
    needs_restock: false,
    missing: false,
    notes: ''
  },

  // ── SETUP CREW ──────────────────────────────────────────────────────────────
  {
    name: 'Shop Vac',
    description: 'Wet/dry shop vacuum with filter',
    location: 'trailer_C_icon',
    sub_location: '',
    departments: ['setup_crew'],
    needs_restock: false,
    missing: false,
    notes: 'Check filter is clean before use'
  },
  {
    name: 'Weed Whacker',
    description: 'Gas or electric string trimmer for cutting overgrowth',
    location: 'trailer_C_icon',
    sub_location: '',
    departments: ['setup_crew'],
    needs_restock: false,
    missing: false,
    notes: 'Check fuel / charge before starting'
  },
  {
    name: 'Power Washer',
    description: 'Pressure washer for site cleaning',
    location: 'trailer_C_icon',
    sub_location: '',
    departments: ['setup_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Extension Cord 2',
    description: 'Heavy-duty outdoor extension cord for setup tasks',
    location: 'trailer_C_icon',
    sub_location: '',
    departments: ['setup_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Extension Cord 3',
    description: 'Heavy-duty outdoor extension cord for setup tasks',
    location: 'trailer_C_icon',
    sub_location: '',
    departments: ['setup_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Wading Pool',
    description: 'Inflatable or hard-shell wading pool for children\'s area',
    location: 'wading_pool_icon',
    sub_location: '',
    departments: ['setup_crew'],
    needs_restock: false,
    missing: false,
    notes: 'Clean before filling; inspect for holes'
  },
  {
    name: 'Garden Hose 1',
    description: 'Hose for filling the wading pool and outdoor use',
    location: 'trailer_C_icon',
    sub_location: '',
    departments: ['setup_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Garden Hose 2',
    description: 'Hose for filling the wading pool and outdoor use',
    location: 'trailer_C_icon',
    sub_location: '',
    departments: ['setup_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Trash Bags 2',
    description: 'Heavy-duty garbage bags for pre-event site cleanup',
    location: 'trailer_C_icon',
    sub_location: '',
    departments: ['setup_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Propane Tank 1',
    description: 'Propane tank for BBQ / grill use',
    location: 'shared_kitchen_icon',
    sub_location: '',
    departments: ['setup_crew', 'food_team'],
    needs_restock: false,
    missing: false,
    notes: 'Check fill level; flag needs_restock if under half'
  },
  {
    name: 'Propane Tank 2',
    description: 'Propane tank — spare / backup',
    location: 'trailer_C_icon',
    sub_location: '',
    departments: ['setup_crew', 'food_team'],
    needs_restock: false,
    missing: false,
    notes: 'Backup tank; keep sealed until needed'
  },
  {
    name: 'Rake 1',
    description: 'Leaf / ground rake for site preparation',
    location: 'trailer_C_icon',
    sub_location: '',
    departments: ['setup_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Rake 2',
    description: 'Leaf / ground rake for site preparation',
    location: 'trailer_C_icon',
    sub_location: '',
    departments: ['setup_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Shovel 1',
    description: 'Shovel for site preparation',
    location: 'trailer_C_icon',
    sub_location: '',
    departments: ['setup_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Shovel 2',
    description: 'Shovel for site preparation',
    location: 'trailer_C_icon',
    sub_location: '',
    departments: ['setup_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Air Compressor',
    description: 'Portable air compressor for inflatables and pneumatic tools',
    location: 'trailer_C_icon',
    sub_location: '',
    departments: ['setup_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },

  // ── STAGE CREW ──────────────────────────────────────────────────────────────
  {
    name: 'PA System (Mains / Tops)',
    description: 'Main full-range PA speaker tops',
    location: 'stage_area_icon',
    sub_location: 'Stage left + right',
    departments: ['stage_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Subwoofer Stack',
    description: 'Low-frequency subwoofer cabinets',
    location: 'stage_area_icon',
    sub_location: 'Stage front',
    departments: ['stage_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Stage Monitors',
    description: 'Wedge or side-fill stage monitors for performers',
    location: 'stage_area_icon',
    sub_location: 'Stage deck',
    departments: ['stage_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'DI Boxes',
    description: 'Direct input boxes for instrument line signals',
    location: 'stage_area_icon',
    sub_location: 'Cable/gear crate',
    departments: ['stage_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'XLR Cables (Assorted)',
    description: 'Balanced XLR microphone / line cables in various lengths',
    location: 'stage_area_icon',
    sub_location: 'Cable crate',
    departments: ['stage_crew'],
    needs_restock: false,
    missing: false,
    notes: 'Test for continuity before running cable runs'
  },
  {
    name: 'Amplifier Rack',
    description: 'Rack-mounted power amplifier(s) for the PA system',
    location: 'stage_area_icon',
    sub_location: 'Stage right rack',
    departments: ['stage_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'FOH Mixing Console',
    description: 'Front-of-house digital mixing desk',
    location: 'front_of_house_icon',
    sub_location: '',
    departments: ['stage_crew'],
    needs_restock: false,
    missing: false,
    notes: 'Load show file before line check'
  },
  {
    name: 'Projector',
    description: 'High-lumen projector for projection mapping',
    location: 'front_of_house_icon',
    sub_location: '',
    departments: ['stage_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Projection Mapping Computer',
    description: 'Laptop running projection mapping software',
    location: 'front_of_house_icon',
    sub_location: '',
    departments: ['stage_crew'],
    needs_restock: false,
    missing: false,
    notes: 'Confirm mapping files are loaded and tested before show'
  },
  {
    name: 'Power Strips / Stage Extension Cords',
    description: 'Rack-mount or floor power strips for stage and FOH equipment',
    location: 'stage_area_icon',
    sub_location: 'Racks',
    departments: ['stage_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },

  // ── CLEANUP CREW ────────────────────────────────────────────────────────────
  {
    name: 'Storage Bins',
    description: 'Sealed labelled plastic bins for sorting and storing items post-event',
    location: 'trailer_C_icon',
    sub_location: '',
    departments: ['cleanup_crew'],
    needs_restock: false,
    missing: false,
    notes: 'Use pest-proof lids; elevate off ground if possible'
  },
  {
    name: 'Tape',
    description: 'Masking / packing tape for sealing and labelling bins',
    location: 'trailer_C_icon',
    sub_location: 'Supply crate',
    departments: ['cleanup_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Labels',
    description: 'Adhesive labels for storage bins and equipment',
    location: 'trailer_C_icon',
    sub_location: 'Supply crate',
    departments: ['cleanup_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Rubber Gloves 2',
    description: 'Rubber gloves for cleanup crew use',
    location: 'trailer_C_icon',
    sub_location: 'Supply crate',
    departments: ['cleanup_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Trash Bin (Rolling)',
    description: 'Large outdoor rolling waste bin for post-event cleanup',
    location: 'trailer_C_icon',
    sub_location: '',
    departments: ['cleanup_crew'],
    needs_restock: false,
    missing: false,
    notes: ''
  },

  // ── ARCADE ATTENDANT ────────────────────────────────────────────────────────
  {
    name: 'Flipbook Computer',
    description: 'Computer running the flipbook photo booth software',
    location: 'trailer_A_icon',
    sub_location: 'Flipbook station',
    departments: ['arcade_attendant'],
    needs_restock: false,
    missing: false,
    notes: 'Run a test print at start of day to confirm alignment'
  },
  {
    name: 'Webcam',
    description: 'Camera for the flipbook photo capture station',
    location: 'trailer_A_icon',
    sub_location: 'Flipbook station',
    departments: ['arcade_attendant'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Webcam / Computer Stand',
    description: 'Stand or mount for the flipbook webcam and/or computer',
    location: 'trailer_A_icon',
    sub_location: 'Flipbook station',
    departments: ['arcade_attendant'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Printer',
    description: 'Printer for flipbook photo output',
    location: 'trailer_A_icon',
    sub_location: 'Flipbook station',
    departments: ['arcade_attendant'],
    needs_restock: false,
    missing: false,
    notes: 'Check ink / toner before opening'
  },
  {
    name: 'Paper',
    description: 'Paper stock for flipbook print jobs',
    location: 'trailer_A_icon',
    sub_location: 'Flipbook supply shelf',
    departments: ['arcade_attendant'],
    needs_restock: false,
    missing: false,
    notes: 'Flag needs_restock when fewer than 2 reams remain'
  },
  {
    name: 'Paper Cutter',
    description: 'Guillotine or rotary cutter for trimming flipbook pages',
    location: 'trailer_A_icon',
    sub_location: 'Flipbook station',
    departments: ['arcade_attendant'],
    needs_restock: false,
    missing: false,
    notes: 'Keep blade guard on when not in use'
  },
  {
    name: 'Regular Stapler',
    description: 'Standard desktop stapler',
    location: 'trailer_A_icon',
    sub_location: 'Flipbook station',
    departments: ['arcade_attendant'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Regular Staples',
    description: 'Staple refills for the regular stapler',
    location: 'trailer_A_icon',
    sub_location: 'Flipbook supply shelf',
    departments: ['arcade_attendant'],
    needs_restock: false,
    missing: false,
    notes: 'Flag needs_restock if down to last box'
  },
  {
    name: 'Heavy-Duty Stapler',
    description: 'Long-reach stapler for binding flipbook page sets',
    location: 'trailer_A_icon',
    sub_location: 'Flipbook station',
    departments: ['arcade_attendant'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Heavy-Duty Staples',
    description: 'Staple refills for the heavy-duty stapler',
    location: 'trailer_A_icon',
    sub_location: 'Flipbook supply shelf',
    departments: ['arcade_attendant'],
    needs_restock: false,
    missing: false,
    notes: 'Flag needs_restock if down to last box'
  },
  {
    name: 'Arcade Laptop',
    description: 'Laptop for running arcade games or supporting systems',
    location: 'trailer_A_icon',
    sub_location: 'Interior',
    departments: ['arcade_attendant'],
    needs_restock: false,
    missing: false,
    notes: 'Confirm games are loaded and controllers are paired before opening'
  },
  {
    name: 'Controllers',
    description: 'Game controllers for arcade laptop games',
    location: 'trailer_A_icon',
    sub_location: 'Interior',
    departments: ['arcade_attendant'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Blue Swivel Chair 3',
    description: 'Blue swivel chair — arcade trailer',
    location: 'trailer_A_icon',
    sub_location: 'Interior',
    departments: ['arcade_attendant', 'front_gate'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Blue Swivel Chair 4',
    description: 'Blue swivel chair — arcade trailer',
    location: 'trailer_A_icon',
    sub_location: 'Interior',
    departments: ['arcade_attendant', 'front_gate'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'TV',
    description: 'Television screen for arcade display',
    location: 'trailer_A_icon',
    sub_location: 'Interior',
    departments: ['arcade_attendant'],
    needs_restock: false,
    missing: false,
    notes: ''
  },
  {
    name: 'Standing Arcade Booth',
    description: 'Stand-up arcade cabinet booth',
    location: 'trailer_A_icon',
    sub_location: 'Interior',
    departments: ['arcade_attendant'],
    needs_restock: false,
    missing: false,
    notes: ''
  }
]

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
      `${dept.padEnd(22)} ${item.name}`
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
