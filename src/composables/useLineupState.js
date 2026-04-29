import { ref } from 'vue'

// ── Persistence helpers ───────────────────────────────────────────────────────
const STORAGE_KEY = 'reunion_starred_acts'

function loadStarred() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function persistStarred(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
  } catch {
    // storage unavailable — silently ignore
  }
}

// ── Module-level singletons (shared across all imports) ───────────────────────
const starredActIds = ref(loadStarred())
const currentAct = ref(null)

// ── Star helpers ──────────────────────────────────────────────────────────────
function toggleStar(eventId) {
  const next = new Set(starredActIds.value)
  if (next.has(eventId)) {
    next.delete(eventId)
  } else {
    next.add(eventId)
  }
  starredActIds.value = next
  persistStarred(next)
}

function isStarred(eventId) {
  return starredActIds.value.has(eventId)
}

// ── Now-playing logic ─────────────────────────────────────────────────────────
/**
 * Scans all events and determines which act is currently live.
 * Slot end = next event's first settime, or +90 min for the last act of the day.
 *
 * @param {Array} allEvents - full events array from Firestore
 */
function updateCurrentAct(allEvents) {
  const now = Date.now()

  // Flatten all events into individual time-sorted slots
  const slots = []
  for (const event of allEvents) {
    for (const settime of event.settimes || []) {
      slots.push({ event, start: new Date(settime).getTime() })
    }
  }
  slots.sort((a, b) => a.start - b.start)

  let live = null
  for (let i = 0; i < slots.length; i++) {
    const { event, start } = slots[i]
    if (start > now) break // too early for this slot
    const end = i + 1 < slots.length ? slots[i + 1].start : start + 90 * 60 * 1000
    if (now < end) {
      live = {
        act_name: event.act_name || '',
        workshop_title: event.workshop_title || '',
        genre: event.genre || '',
        social_url: event.social_url || '',
        mix_track_url: event.mix_track_url || '',
        settime: start,
        id: event.id
      }
      break
    }
  }

  currentAct.value = live
}

// ── Composable export ─────────────────────────────────────────────────────────
export function useLineupState() {
  return {
    starredActIds,
    currentAct,
    toggleStar,
    isStarred,
    updateCurrentAct
  }
}
