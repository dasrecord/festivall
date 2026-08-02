/**
 * useBbpSchedule
 *
 * Provides reactive BBP schedule data (itinerary, screenings, djs, speakers, features) backed by
 * Firestore. All schedule data is managed via the admin dashboard.
 *
 * Singleton pattern — module-level refs shared across all consumers so the
 * fetch only runs once per page load.
 */

import { ref, readonly } from 'vue'
import { festivall_db } from '@/firebase.js'
import { doc, getDoc, setDoc } from 'firebase/firestore'

// ── Firestore path ──────────────────────────────────────────────────────────
const COLLECTION = 'bbp_config_2026'
const DOC_ID = 'schedule'

// ── Singleton state ──────────────────────────────────────────────────────────
const itinerary = ref([])
const screenings = ref([])
const djs = ref([])
const speakers = ref([])
const features = ref([])
const loading = ref(false)
const initialized = ref(false)

// ── Load from Firestore ──────────────────────────────────────────────────────
async function loadSchedule() {
  if (initialized.value) return
  loading.value = true

  try {
    const scheduleRef = doc(festivall_db, COLLECTION, DOC_ID)
    const snap = await getDoc(scheduleRef)

    if (snap.exists()) {
      const data = snap.data()
      if (Array.isArray(data.itinerary)) {
        itinerary.value = data.itinerary
      }
      if (Array.isArray(data.screenings)) {
        screenings.value = data.screenings
      }
      if (Array.isArray(data.djs)) {
        djs.value = data.djs
      }
      if (Array.isArray(data.speakers)) {
        speakers.value = data.speakers
      }
      if (Array.isArray(data.features)) {
        features.value = data.features
      }
    }
    // If document doesn't exist, arrays remain empty until admin adds data
  } catch (err) {
    console.error('[useBbpSchedule] Failed to load schedule from Firestore:', err)
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
  if (field === 'features') features.value = array
  if (field === 'screenings') screenings.value = array
  if (field === 'djs') djs.value = array
  if (field === 'speakers') speakers.value = array
}

// ── Public API ───────────────────────────────────────────────────────────────
export function useBbpSchedule() {
  if (!initialized.value && !loading.value) {
    loadSchedule()
  }

  return {
    features: readonly(features),
    itinerary: readonly(itinerary),
    screenings: readonly(screenings),
    djs: readonly(djs),
    speakers: readonly(speakers),
    loading: readonly(loading),
    saveSchedule,
    loadSchedule,
  }
}
