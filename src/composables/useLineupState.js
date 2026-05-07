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
const upcomingAct = ref(null)

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
 * Scans all events and determines which act is currently live,
 * and which act is next up.
 *
 * @param {Array} allEvents - full events array from Firestore
 */
function makeActObj(event, start) {
  return {
    act_name: event.act_name || '',
    workshop_title: event.workshop_title || '',
    genre: event.genre || '',
    act_description: event.act_description || '',
    social_url: event.social_url || '',
    mix_track_url: event.mix_track_url || '',
    settime: start,
    id: event.id
  }
}

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
      live = makeActObj(event, start)
      break
    }
  }

  const nextSlot = slots.find((s) => s.start > now)

  currentAct.value = live
  upcomingAct.value = nextSlot ? makeActObj(nextSlot.event, nextSlot.start) : null
}

// ── Composable export ─────────────────────────────────────────────────────────
export function useLineupState() {
  return {
    starredActIds,
    currentAct,
    upcomingAct,
    toggleStar,
    isStarred,
    updateCurrentAct
  }
}
