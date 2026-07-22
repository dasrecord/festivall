/**
 * useBbpSchedule
 *
 * Provides reactive BBP schedule data (itinerary, screenings, djs) backed by
 * Firestore. Falls back to the static config on first load and auto-seeds the
 * Firestore doc if it does not yet exist.
 *
 * Singleton pattern — module-level refs shared across all consumers so the
 * fetch only runs once per page load.
 */

import { ref, readonly } from 'vue'
import { festivall_db } from '@/firebase.js'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { BITCOIN_BLOCK_PARTY as BBP } from '@/config/bitcoinBlockPartyConfig.js'

// ── Firestore path ──────────────────────────────────────────────────────────
const COLLECTION = 'bbp_config_2026'
const DOC_ID = 'schedule'

// ── Singleton state ──────────────────────────────────────────────────────────
const itinerary = ref([...BBP.itinerary])
const screenings = ref([...BBP.screenings])
const djs = ref([...BBP.djs])
const loading = ref(false)
const initialized = ref(false)

// ── Load (and optionally seed) ───────────────────────────────────────────────
async function loadSchedule() {
  if (initialized.value) return
  loading.value = true

  try {
    const scheduleRef = doc(festivall_db, COLLECTION, DOC_ID)
    const snap = await getDoc(scheduleRef)

    if (snap.exists()) {
      const data = snap.data()
      if (Array.isArray(data.itinerary) && data.itinerary.length > 0) {
        itinerary.value = data.itinerary
      }
      if (Array.isArray(data.screenings) && data.screenings.length > 0) {
        screenings.value = data.screenings
      }
      if (Array.isArray(data.djs) && data.djs.length > 0) {
        djs.value = data.djs
      }
    } else {
      // First run — seed from static config
      await setDoc(scheduleRef, {
        itinerary: BBP.itinerary,
        screenings: BBP.screenings,
        djs: BBP.djs,
      })
    }
  } catch (err) {
    console.error('[useBbpSchedule] Failed to load schedule from Firestore:', err)
    // Stay on static config values already set above
  } finally {
    loading.value = false
    initialized.value = true
  }
}

// ── Save a single field ─────────────────────────────────────────────────────
async function saveSchedule(field, array) {
  const scheduleRef = doc(festivall_db, COLLECTION, DOC_ID)
  await setDoc(scheduleRef, { [field]: array }, { merge: true })

  // Mirror locally
  if (field === 'itinerary') itinerary.value = array
  if (field === 'screenings') screenings.value = array
  if (field === 'djs') djs.value = array
}

// ── Public API ───────────────────────────────────────────────────────────────
export function useBbpSchedule() {
  if (!initialized.value && !loading.value) {
    loadSchedule()
  }

  return {
    itinerary: readonly(itinerary),
    screenings: readonly(screenings),
    djs: readonly(djs),
    loading: readonly(loading),
    saveSchedule,
    loadSchedule,
  }
}
