import { sendVolunteerCoordinator } from '@/../scripts/notifications.js'
// ── Alert posting/editing/clearing logic ─────────────────────────────────────
import { addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
const showKitchenModal = ref(false)
const showWashroomModal = ref(false)
const showLostFoundModal = ref(false)
const editingLostFoundId = ref(null)
const alertInput = ref({ type: '', mode: '', message: '' })

// Open modal helpers
function openKitchenModal() {
  alertInput.value = { type: 'kitchen', mode: '', message: '' }
  showKitchenModal.value = true
}
function openWashroomModal() {
  alertInput.value = { type: 'washroom', status: 'low', message: '' }
  showWashroomModal.value = true
}
function openLostFoundModal(item = null) {
  if (item) {
    editingLostFoundId.value = item.id
    alertInput.value = { ...item, type: 'lostfound' }
  } else {
    editingLostFoundId.value = null
    alertInput.value = { type: 'lostfound', message: '' }
  }
  showLostFoundModal.value = true
}

// Post or edit alert
async function submitAlert() {
  const col = collection(reunion_db, 'alerts_2026')
  if (alertInput.value.type === 'lostfound' && editingLostFoundId.value) {
    // Edit existing lost & found
    await updateDoc(doc(col, editingLostFoundId.value), {
      message: alertInput.value.message,
      updated_at: new Date().toISOString()
    })
  } else {
    // New alert
    await addDoc(col, {
      ...alertInput.value,
      created_at: new Date().toISOString(),
      userId: 'CURRENT_USER_ID', // Replace with actual user ID
      userName: 'CURRENT_USER_NAME' // Replace with actual user name
    })
    // Send Slack notification
    let slackMsg = ''
    if (alertInput.value.type === 'kitchen') {
      slackMsg = alertInput.value.mode === 'share'
        ? `🍳 *Kitchen Alert*: ${alertInput.value.userName} is cooking: ${alertInput.value.message}`
        : `🍳 *Kitchen Alert*: ${alertInput.value.userName} is missing: ${alertInput.value.message}`
    } else if (alertInput.value.type === 'washroom') {
      slackMsg = `🚻 *Washroom Alert*: Supplies low reported by ${alertInput.value.userName}`
    } else if (alertInput.value.type === 'lostfound') {
      slackMsg = `🧳 *Lost & Found*: ${alertInput.value.userName} reported: ${alertInput.value.message}`
    }
    if (slackMsg) sendVolunteerCoordinator(slackMsg)
  }
  showKitchenModal.value = false
  showWashroomModal.value = false
  showLostFoundModal.value = false
  editingLostFoundId.value = null
}

// Clear/delete alert (volunteer/admin only)
async function clearAlert(alert) {
  const col = collection(reunion_db, 'alerts_2026')
  await deleteDoc(doc(col, alert.id))
}
// ── Firestore listeners for overlays ─────────────────────────────────────────
import { onSnapshot } from 'firebase/firestore'

// Reactive state for overlay data
const kitchenAlerts = ref([]) // [{...alert}]
const washroomAlerts = ref([])
const lostFoundItems = ref([])
const checkinNames = ref([])
const volunteerShifts = ref([])

// Listen to alerts_2026 for kitchen, washroom, lost & found
function listenToAlerts() {
  const alertsCol = collection(reunion_db, 'alerts_2026')
  onSnapshot(alertsCol, (snapshot) => {
    const kitchen = []
    const washroom = []
    const lostfound = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      if (data.type === 'kitchen') kitchen.push({ id: doc.id, ...data })
      else if (data.type === 'washroom') washroom.push({ id: doc.id, ...data })
      else if (data.type === 'lostfound') lostfound.push({ id: doc.id, ...data })
    })
    kitchenAlerts.value = kitchen
    washroomAlerts.value = washroom
    lostFoundItems.value = lostfound
  })
}

// Listen to participants_2026 for check-in display
function listenToCheckins() {
  const participantsCol = collection(reunion_db, 'participants_2026')
  onSnapshot(participantsCol, (snapshot) => {
    const checkedIn = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      if (data.checked_in || data.order?.checked_in) {
        checkedIn.push({
          id: doc.id,
          fullname: data.contact?.fullname || data.fullname || '',
          checked_in: true,
          checked_in_at: data.checked_in_at || data.order?.checked_in_at || null
        })
      }
    })
    checkinNames.value = checkedIn
  })
}

// Listen to volunteer_slots_2026 for live shifts
function listenToVolunteerShifts() {
  const slotsCol = collection(reunion_db, 'volunteer_slots_2026')
  onSnapshot(slotsCol, (snapshot) => {
    const now = new Date()
    const shifts = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      if (data.active !== false && data.claimed && data.date && data.start && data.end) {
        // Check if now is within shift window
        const shiftStart = new Date(`${data.date}T${data.start}`)
        let shiftEnd = new Date(`${data.date}T${data.end}`)
        // Handle 24:00 as midnight next day
        if (data.end === '24:00') shiftEnd.setHours(shiftEnd.getHours() + 1)
        if (now >= shiftStart && now <= shiftEnd) {
          shifts.push({ id: doc.id, ...data })
        }
      }
    })
    volunteerShifts.value = shifts
  })
}

onMounted(() => {
  fetchAndUpdateCurrentAct()
  listenToAlerts()
  listenToCheckins()
  listenToVolunteerShifts()
})
<script setup>
// Accept user id_code as a prop (from ticket click-through or URL)
import { sendVolunteerCoordinator } from '@/../scripts/notifications.js'
import { defineProps } from 'vue'
import { useRoute } from 'vue-router'
const props = defineProps({
  id_code: { type: String, required: false }
})
const route = useRoute()
// Use prop if provided, else fallback to query or params
const effectiveIdCode = computed(() => {
  return props.id_code || route.query.id_code || route.params.id_code || ''
})

// Modal refs for legacy overlays (needed for template)
const showKitchenModal = ref(false)
const showWashroomModal = ref(false)
const showLostFoundModal = ref(false)
import { ref, computed, onMounted } from 'vue'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import reunionMapUrl from '@/assets/images/reunion_map_(awesome_lathusca)_2026.svg?url'
import { useLineupState } from '@/composables/useLineupState'
import { REUNION_FESTIVAL } from '@/config/festivalConfig'

const { currentAct, upcomingAct, updateCurrentAct } = useLineupState()

const mapContainer = ref(null)
const mapObject = ref(null)

// ── Overlay definitions for map features (with nudge/offsets) ────────────────
// Add an entry for each feature, matching the SVG layer name and desired offset.
const STAGE_ICONS = [
  { svgId: 'stage_area_icon', label: 'Main Stage', offsetX: 0, offsetY: +10 }
]

const MEAL_ICONS = [
  {
    svgId: 'meals_area',
    fallbackSvgPos: { x: 234.3, y: 268.69, w: 16, h: -2 },
    offsetX: 10,
    offsetY: 0
  }
]

// New overlays for interactive features
const KITCHEN_ICONS = [
  {
    svgId: 'shared_kitchen_area',
    label: 'Shared Kitchen',
    offsetX: 0,
    offsetY: 0
  }
]

const WASHROOM_ICONS = [
  {
    svgId: 'washrooms_area',
    label: 'Washrooms',
    offsetX: 0,
    offsetY: 0
  }
]

const LOSTFOUND_ICONS = [
  {
    svgId: 'lostfound_area',
    label: 'Lost & Found',
    offsetX: 0,
    offsetY: 0
  }
]

const CHECKIN_ICONS = [
  {
    svgId: 'front_gate_area',
    label: 'Front Gate',
    offsetX: 0,
    offsetY: 0
  }
]

const VOLUNTEER_SHIFT_ICONS = [
  // Add one per key location if needed, or dynamically generate
  // Example:
  // { svgId: 'kitchen_area', label: 'Kitchen Shifts', offsetX: 0, offsetY: 0 }
]

// Overlay refs for rendering
const stageOverlays = ref([]) // [{ label, style }]
const mealOverlays  = ref([]) // [{ style }]
const kitchenOverlays = ref([]) // [{ style }]
const washroomOverlays = ref([]) // [{ style }]
const lostFoundOverlays = ref([]) // [{ style }]
const checkinOverlays = ref([]) // [{ style }]
const volunteerShiftOverlays = ref([]) // [{ style }]
const bioOpen      = ref(false)
const mealCardOpen = ref(false)
const settingsOpen = ref(false)
const showStageOverlay = ref(true)
const showMealOverlay  = ref(true)

// ── Ticker text helpers ───────────────────────────────────────────────────────
// Build doubled strings in JS so there are zero stray whitespace nodes in the
// DOM — this makes the -50% animation loop land perfectly every time.
const SEP = '     ' // 5 spaces as separator between the two copies

function makeTickerText(parts) {
  const text = parts.filter(Boolean).join(' · ') + ' ·'
  return text + SEP + text
}

const nowPlayingTicker = computed(() =>
  currentAct.value
    ? makeTickerText([currentAct.value.act_name || currentAct.value.workshop_title, currentAct.value.genre])
    : ''
)

const upNextTicker = computed(() =>
  upcomingAct.value
    ? makeTickerText([
        upcomingAct.value.act_name || upcomingAct.value.workshop_title,
        formatSettime(upcomingAct.value.settime),
        upcomingAct.value.genre
      ])
    : ''
)

const mealTicker = computed(() => {
  if (!nextMeal.value) return ''
  const text = nextMeal.value.isNow
    ? nextMeal.value.label + ' ·'
    : nextMeal.value.label + ' · ' + formatMealTime(nextMeal.value.time) + ' ·'
  return text + SEP + text
})



// Shared helper: resolve CSS position from an SVG element ID or fallback coords.
// getBBox() returns zeros for <use> referencing <symbol> — parse attributes instead.
function resolveIconStyle(svgDoc, vb, { svgId, fallbackSvgPos, offsetX = 0, offsetY = 0 }) {
  let x, y, w, h
  const el = svgDoc.getElementById(svgId)
  if (el) {
    const transform = el.getAttribute('transform') || ''
    const m = transform.match(/translate\(\s*([\d.-]+)[\s,]+([\d.-]+)/)
    x = m ? parseFloat(m[1]) : 0
    y = m ? parseFloat(m[2]) : 0
    w = parseFloat(el.getAttribute('width') || 0)
    h = parseFloat(el.getAttribute('height') || 0)
  } else if (fallbackSvgPos) {
    ;({ x, y, w, h } = fallbackSvgPos)
  } else {
    return null
  }
  return {
    left: `${((x + w / 2 + offsetX) / vb.width)  * 100}%`,
    top:  `${((y + h / 2 + offsetY) / vb.height) * 100}%`
  }
}

function positionOverlays() {
  const svgDoc = mapObject.value?.contentDocument
  if (!svgDoc) return

  const svgEl = svgDoc.querySelector('svg')
  if (!svgEl) return
  const vb = svgEl.viewBox.baseVal
  if (!vb || !vb.width || !vb.height) return

  stageOverlays.value = STAGE_ICONS.flatMap((icon) => {
    const style = resolveIconStyle(svgDoc, vb, icon)
    return style ? [{ label: icon.label, style }] : []
  })

  mealOverlays.value = MEAL_ICONS.flatMap((icon) => {
    const style = resolveIconStyle(svgDoc, vb, icon)
    return style ? [{ style }] : []
  })

  kitchenOverlays.value = KITCHEN_ICONS.flatMap((icon) => {
    const style = resolveIconStyle(svgDoc, vb, icon)
    return style ? [{ label: icon.label, style }] : []
  })

  washroomOverlays.value = WASHROOM_ICONS.flatMap((icon) => {
    const style = resolveIconStyle(svgDoc, vb, icon)
    return style ? [{ label: icon.label, style }] : []
  })

  lostFoundOverlays.value = LOSTFOUND_ICONS.flatMap((icon) => {
    const style = resolveIconStyle(svgDoc, vb, icon)
    return style ? [{ label: icon.label, style }] : []
  })

  checkinOverlays.value = CHECKIN_ICONS.flatMap((icon) => {
    const style = resolveIconStyle(svgDoc, vb, icon)
    return style ? [{ label: icon.label, style }] : []
  })

  volunteerShiftOverlays.value = VOLUNTEER_SHIFT_ICONS.flatMap((icon) => {
    const style = resolveIconStyle(svgDoc, vb, icon)
    return style ? [{ label: icon.label, style }] : []
  })
}

// ── Upcoming meal logic ───────────────────────────────────────────────────────
const MEAL_WINDOW_MS = 90 * 60 * 1000  // 1.5 h serving window

const nextMeal = computed(() => {
  const meals = REUNION_FESTIVAL.meals
  if (!meals?.length) return null
  const now = new Date()
  const serving = meals.find((m) => {
    const start = new Date(m.time)
    return now >= start && now < new Date(start.getTime() + MEAL_WINDOW_MS)
  })
  if (serving) return { ...serving, isNow: true }
  const upcoming = meals
    .filter((m) => new Date(m.time) > now)
    .sort((a, b) => new Date(a.time) - new Date(b.time))[0]
  return upcoming ? { ...upcoming, isNow: false } : null
})

function formatMealTime(isoString) {
  return new Date(isoString).toLocaleTimeString('en-CA', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Edmonton'  // Mountain Time
  })
}

function formatSettime(ms) {
  return new Date(ms).toLocaleTimeString('en-CA', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Edmonton'
  })
}

// ── Fetch events to populate currentAct if not already set ───────────────────
async function fetchAndUpdateCurrentAct() {
  if (currentAct.value !== null) return
  try {
    const q = query(
      collection(reunion_db, 'participants_2026'),
      where('contract.signed', '==', true)
    )
    const snapshot = await getDocs(q)
    const events = snapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      const roles = data.roles || {}
      const appData = (data.application && data.application.data) || {}
      return {
        id: docSnap.id,
        ...data,
        act_name: roles.act_name || data.act_name || '',
        workshop_title: appData.workshop_title || data.workshop_title || '',
        genre: appData.genre || data.genre || '',
        act_description: appData.act_description || appData.workshop_description || data.act_description || '',
        settimes: Array.isArray(data.settimes)
          ? data.settimes.map((t) => {
              if (t && typeof t.toDate === 'function') return t.toDate().toISOString()
              if (typeof t === 'string') return t.replace(/^"|"$/g, '')
              return t
            })
          : []
      }
    })
    updateCurrentAct(events)
  } catch {
    // silently fail — overlay just won't show
  }
}

function onObjectLoad() {
  positionOverlays()
  // Make all *_icon elements clickable
  const svgDoc = mapObject.value?.contentDocument
  if (svgDoc) {
    const iconElements = svgDoc.querySelectorAll('[id$="_icon"]')
    iconElements.forEach((el) => {
      el.style.cursor = 'pointer'
      el.addEventListener('click', (event) => {
        handleSvgIconClick(el.id, event)
      })
    })
  }
}
// Handler for clicking SVG icons
// Track which washroom is being reported
const washroomLocation = ref('')
function handleSvgIconClick(iconId, event) {
  // If washroom icon clicked, open supply report modal with location
  if (iconId.includes('washroom') || iconId.includes('washrooms')) {
    // Customize this mapping as needed
    let label = ''
    if (iconId === 'washroom1_icon') label = 'Washroom 1'
    else if (iconId === 'washroom2_icon') label = 'Washroom 2'
    else if (iconId === 'washrooms_area_icon') label = 'Main Washrooms'
    else label = iconId
    washroomLocation.value = label
    openWashroomSupplyModal()
  } else {
    // Default: show alert for other icons (customize as needed)
    alert(`Clicked icon: ${iconId}`)
  }
}

// Modal state for washroom supply report
const showWashroomSupplyModal = ref(false)
const washroomSupplyType = ref('toilet_paper')
const washroomSupplySubmitting = ref(false)
const washroomSupplyError = ref('')

function openWashroomSupplyModal() {
  washroomSupplyType.value = 'toilet_paper'
  washroomSupplyError.value = ''
  showWashroomSupplyModal.value = true
}

async function submitWashroomSupplyAlert() {
  washroomSupplySubmitting.value = true
  washroomSupplyError.value = ''
  try {
    const col = collection(reunion_db, 'alerts_2026')
    const userId = effectiveIdCode.value || 'ANONYMOUS'
    const userName = 'User ' + userId.slice(-5)
    const supply = washroomSupplyType.value
    const location = washroomLocation.value || 'Unknown Washroom'
    const message = `Low ${supply.replace('_', ' ')} reported at ${location}.`
    await addDoc(col, {
      type: 'washroom',
      status: 'low',
      supply,
      location,
      message,
      created_at: new Date().toISOString(),
      userId,
      userName
    })
    // Send Slack notification
    sendVolunteerCoordinator(`🚻 *Washroom Alert*: Low ${supply.replace('_', ' ')} at *${location}* reported by ${userName}`)
    showWashroomSupplyModal.value = false
  } catch (e) {
    console.error('Washroom alert Firestore error:', e)
    washroomSupplyError.value = 'Failed to submit alert: ' + (e && e.message ? e.message : e)
  } finally {
    washroomSupplySubmitting.value = false
  }
}

onMounted(() => {
  fetchAndUpdateCurrentAct()
})
</script>

<template>
  <div ref="mapContainer" class="map-container">
    <!-- <object> keeps the SVG in its own document so page CSS can't bleed in -->
    <object
      ref="mapObject"
      :data="reunionMapUrl"
      type="image/svg+xml"
      class="festival-map"
      @load="onObjectLoad"
    >
      Your browser does not support SVG.
    </object>

    <!-- Now-playing / Up-next overlay — positioned over #stage_area in the SVG -->
    <template v-if="showStageOverlay && (currentAct || upcomingAct)">
      <div
        v-for="overlay in stageOverlays"
        :key="overlay.label"
        class="stage-overlay"
        :style="overlay.style"
        @click="bioOpen = !bioOpen"
      >
        <!-- NOW PLAYING row -->
        <template v-if="currentAct">
          <div class="now-badge">▶ NOW PLAYING</div>
          <div class="ticker-wrap">
            <span class="ticker-text">{{ nowPlayingTicker }}</span>
          </div>
        </template>
        <!-- UP NEXT row -->
        <template v-if="upcomingAct">
          <div class="now-badge now-badge--upcoming" :class="{ 'now-badge--sep': currentAct }">▷ UP NEXT</div>
          <div class="ticker-wrap ticker-wrap--upcoming">
            <span class="ticker-text">{{ upNextTicker }}</span>
          </div>
        </template>
      </div>

      <!-- Bio card — tap overlay to open, tap X to close -->
      <Transition name="bio">
        <div v-if="bioOpen" class="bio-card">
          <button class="bio-close" @click.stop="bioOpen = false">✕</button>
          <template v-if="currentAct">
            <p class="bio-act-name">{{ currentAct.act_name || currentAct.workshop_title }}</p>
            <p class="bio-genre">▶ NOW PLAYING<template v-if="currentAct.genre">&nbsp;· {{ currentAct.genre }}</template></p>
            <p v-if="currentAct.act_description" class="bio-text">{{ currentAct.act_description }}</p>
            <p v-else class="bio-text bio-empty">No bio available.</p>
          </template>
          <template v-if="upcomingAct">
            <hr v-if="currentAct" class="bio-divider" />
            <p class="bio-act-name">{{ upcomingAct.act_name || upcomingAct.workshop_title }}</p>
            <p class="bio-genre bio-genre--upcoming">▷ UP NEXT&nbsp;· {{ formatSettime(upcomingAct.settime) }}<template v-if="upcomingAct.genre">&nbsp;· {{ upcomingAct.genre }}</template></p>
            <p v-if="upcomingAct.act_description" class="bio-text">{{ upcomingAct.act_description }}</p>
            <p v-else class="bio-text bio-empty">No bio available.</p>
          </template>
        </div>
      </Transition>
    </template>

    <!-- Meals overlay — positioned right of the meals icon, expands rightward -->
    <template v-if="showMealOverlay && nextMeal && mealOverlays.length">
      <div
        v-for="(overlay, index) in mealOverlays"
        :key="index"
        class="meal-overlay"
        :style="overlay.style"
        @click="mealCardOpen = !mealCardOpen"
      >
        <div class="meal-badge" :class="{ 'meal-badge--now': nextMeal.isNow }">
          {{ nextMeal.isNow ? '🍽 NOW SERVING' : '🍽 NEXT MEAL' }}
        </div>
        <div class="meal-info">
          <span class="meal-ticker-text">{{ mealTicker }}</span>
        </div>
      </div>

      <!-- Meal menu card -->
      <Transition name="bio">
        <div v-if="mealCardOpen" class="bio-card">
          <button class="bio-close" @click="mealCardOpen = false">✕</button>
          <p class="bio-act-name">{{ nextMeal.isNow ? '🍽 Now Serving' : '🍽 Next Meal' }}</p>
          <p class="bio-genre">
            {{ nextMeal.label }}<template v-if="!nextMeal.isNow">&nbsp;· {{ formatMealTime(nextMeal.time) }}</template>
          </p>
          <ul class="meal-menu-list">
            <li v-for="item in nextMeal.menu" :key="item">{{ item }}</li>
          </ul>
        </div>
      </Transition>
    </template>

    <!-- Kitchen overlay -->
    <template v-if="kitchenOverlays.length">
      <div
        v-for="(overlay, index) in kitchenOverlays"
        :key="overlay.label"
        class="kitchen-overlay map-feature-overlay"
        :style="overlay.style"
      >
        <div class="now-badge kitchen-badge">🍳 SHARED KITCHEN</div>
        <div class="ticker-wrap">
          <span class="ticker-text">
            <template v-if="kitchenAlerts.length">
              <span v-for="alert in kitchenAlerts" :key="alert.id">
                <span v-if="alert.mode === 'share'">🥘 {{ alert.message }}</span>
                <span v-else-if="alert.mode === 'missing'">❓Missing: {{ alert.message }}</span>
                <span v-else>{{ alert.message }}</span>
                <button class="alert-clear-btn" v-if="isVolunteerOrAdmin" @click.stop="clearAlert(alert)">✕</button>
                &nbsp;·&nbsp;
              </span>
            </template>
            <template v-else>No kitchen alerts</template>
          </span>
        </div>
        <button class="alert-post-btn" @click="openKitchenModal">Post</button>
      </div>
    </template>

    <!-- Washroom overlay -->
    <template v-if="washroomOverlays.length">
      <div
        v-for="(overlay, index) in washroomOverlays"
        :key="overlay.label"
        class="washroom-overlay map-feature-overlay"
        :style="overlay.style"
      >
        <div class="now-badge washroom-badge">🚻 WASHROOMS</div>
        <div class="ticker-wrap">
          <span class="ticker-text">
            <template v-if="washroomAlerts.length">
              <span v-for="alert in washroomAlerts" :key="alert.id">
                <span v-if="alert.status === 'low'">🧻 Supplies Low!</span>
                <span v-else>{{ alert.message }}</span>
                <button class="alert-clear-btn" v-if="isVolunteerOrAdmin" @click.stop="clearAlert(alert)">✕</button>
                &nbsp;·&nbsp;
              </span>
            </template>
            <template v-else>All good!</template>
          </span>
        </div>
        <button class="alert-post-btn" @click="openWashroomModal">Report Low</button>
      </div>
    </template>

    <!-- Lost & Found overlay -->
    <template v-if="lostFoundOverlays.length">
      <div
        v-for="(overlay, index) in lostFoundOverlays"
        :key="overlay.label"
        class="lostfound-overlay map-feature-overlay"
        :style="overlay.style"
      >
        <div class="now-badge lostfound-badge">🧳 LOST & FOUND</div>
        <div class="ticker-wrap">
          <span class="ticker-text">
            <template v-if="lostFoundItems.length">
              <span v-for="item in lostFoundItems" :key="item.id">
                {{ item.message }}
                <button class="alert-edit-btn" v-if="item.userId === 'CURRENT_USER_ID'" @click.stop="openLostFoundModal(item)">✎</button>
                <button class="alert-clear-btn" v-if="isVolunteerOrAdmin" @click.stop="clearAlert(item)">✕</button>
                &nbsp;·&nbsp;
              </span>
            </template>
            <template v-else>No items reported</template>
          </span>
        </div>
        <button class="alert-post-btn" @click="openLostFoundModal()">Report Item</button>
      </div>
    </template>
    <!-- Kitchen Alert Modal -->
    <Transition name="bio">
      <div v-if="showKitchenModal" class="bio-card">
        <button class="bio-close" @click="showKitchenModal = false">✕</button>
        <h3>Post Kitchen Alert</h3>
        <label>
          <input type="radio" value="share" v-model="alertInput.mode" /> Cooking to Share
        </label>
        <label>
          <input type="radio" value="missing" v-model="alertInput.mode" /> Missing Ingredient
        </label>
        <input v-model="alertInput.message" placeholder="What are you cooking or missing?" />
        <button @click="submitAlert">Post</button>
      </div>
    </Transition>

    <!-- Washroom Alert Modal -->
    <Transition name="bio">
      <div v-if="showWashroomModal" class="bio-card">
        <button class="bio-close" @click="showWashroomModal = false">✕</button>
        <h3>Report Low Supplies</h3>
        <p>Let volunteers know if supplies are running low.</p>
        <button @click="submitAlert">Report</button>
      </div>
    </Transition>

    <!-- Lost & Found Modal -->
    <Transition name="bio">
      <div v-if="showLostFoundModal" class="bio-card">
        <button class="bio-close" @click="showLostFoundModal = false">✕</button>
        <h3>{{ editingLostFoundId ? 'Edit' : 'Report' }} Lost & Found Item</h3>
        <input v-model="alertInput.message" placeholder="Describe the item and location..." />
        <button @click="submitAlert">{{ editingLostFoundId ? 'Save' : 'Report' }}</button>
      </div>
    </Transition>

    <!-- Check-in overlay -->
    <template v-if="checkinOverlays.length">
      <div
        v-for="(overlay, index) in checkinOverlays"
        :key="overlay.label"
        class="checkin-overlay map-feature-overlay"
        :style="overlay.style"
      >
        <div class="now-badge checkin-badge">✅ CHECKED IN</div>
        <div class="ticker-wrap">
          <span class="ticker-text">
            <template v-if="checkinNames.length">
              <span v-for="person in checkinNames" :key="person.id">
                {{ person.fullname }}
                &nbsp;·&nbsp;
              </span>
            </template>
            <template v-else>No one checked in</template>
          </span>
        </div>
      </div>
    </template>

    <!-- Volunteer shift overlay -->
    <template v-if="volunteerShiftOverlays.length">
      <div
        v-for="(overlay, index) in volunteerShiftOverlays"
        :key="overlay.label"
        class="volunteer-shift-overlay map-feature-overlay"
        :style="overlay.style"
      >
        <div class="now-badge volunteer-shift-badge">🙋 ON SHIFT</div>
        <div class="ticker-wrap">
          <span class="ticker-text">
            <template v-if="volunteerShifts.length">
              <span v-for="shift in volunteerShifts" :key="shift.id">
                <span v-for="person in shift.claimed" :key="person.id_code">
                  {{ person.fullname || person.id_code }} ({{ shift.team }})
                  &nbsp;·&nbsp;
                </span>
              </span>
            </template>
            <template v-else>No one on shift</template>
          </span>
        </div>
      </div>
    </template>

    <!-- Settings toggle -->
    <button class="settings-toggle" :class="{ 'settings-toggle--active': settingsOpen }" @click="settingsOpen = !settingsOpen" title="Map settings">⚙</button>
    <Transition name="bio">
      <div v-if="settingsOpen" class="settings-panel">
        <p class="settings-title">Map Overlays</p>
        <label class="settings-row">
          <span>Stage Info</span>
          <input type="checkbox" v-model="showStageOverlay" />
        </label>
        <label class="settings-row">
          <span>Meals</span>
          <input type="checkbox" v-model="showMealOverlay" />
        </label>
      </div>
    </Transition>
  </div>

  <!-- Washroom Supply Modal -->
  <Transition name="bio">
    <div v-if="showWashroomSupplyModal" class="bio-card">
      <button class="bio-close" @click="showWashroomSupplyModal = false">✕</button>
      <h3>Report Low Washroom Supplies</h3>
      <p v-if="washroomLocation">Reporting for: <strong>{{ washroomLocation }}</strong></p>
      <p>Select the supply that is low:</p>
      <label><input type="radio" value="toilet_paper" v-model="washroomSupplyType" /> Toilet Paper</label><br />
      <label><input type="radio" value="hand_sanitizer" v-model="washroomSupplyType" /> Hand Sanitizer</label><br />
      <label><input type="radio" value="soap" v-model="washroomSupplyType" /> Soap</label><br />
      <button :disabled="washroomSupplySubmitting" @click="submitWashroomSupplyAlert">
        {{ washroomSupplySubmitting ? 'Reporting...' : 'Report' }}
      </button>
      <p v-if="washroomSupplyError" style="color: #f88;">{{ washroomSupplyError }}</p>
    </div>
  </Transition>
</template>

<style scoped>
.map-container {
  position: relative;
  width: 100vw;
  background-color: white;
}

.festival-map {
  width: 100%;
  height: auto;
  display: block;
  border: none;
}

/* ── Stage overlay ─────────────────────────────────────────────────────────── */
.stage-overlay {
  position: absolute;
  transform: translateX(-50%);
  pointer-events: all;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  z-index: 10;
}

.now-badge {
  background: #430789;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  padding: 2px 5px;
  border-radius: 3px 3px 0 0;
  white-space: nowrap;
}

.now-badge--upcoming {
  background: #0a5a8a;
}

.now-badge--sep {
  margin-top: 3px;
}

.ticker-wrap--upcoming {
  background: rgba(10, 90, 138, 0.88);
}

.ticker-wrap {
  background: rgba(67, 7, 137, 0.88);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  border-radius: 0 0 4px 4px;
  overflow: hidden;
  width: 110px;
  white-space: nowrap;
  padding: 4px 0;
}

/* Text is doubled so the scroll loop is seamless — no padding-left so
   -50% lands exactly on the second copy, creating a gapless loop */
.ticker-text {
  display: inline-block;
  will-change: transform;
  animation: ticker-scroll 12s linear infinite;
}

@keyframes ticker-scroll {
  0%   { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-50%, 0, 0); }
}

/* ── Bio card ────────────────────────────────────────────────────────────────── */
.bio-card {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: min(90vw, 420px);
  background: rgba(30, 5, 60, 0.96);
  color: #fff;
  border-radius: 12px;
  padding: 1.2rem 1.4rem 1rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  z-index: 100;
  pointer-events: all;
}

.bio-close {
  position: absolute;
  top: 0.6rem;
  right: 0.8rem;
  background: none;
  border: none;
  color: rgba(255,255,255,0.6);
  font-size: 1rem;
  cursor: pointer;
  line-height: 1;
}

.bio-close:hover { color: #fff; }

.bio-act-name {
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  margin: 0 0 0.2rem;
}

.bio-genre {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: #c9a0f0;
  margin: 0 0 0.75rem;
  text-transform: uppercase;
}

.bio-genre--upcoming {
  color: #6ab8e8;
}

.bio-text {
  font-size: 0.88rem;
  line-height: 1.55;
  margin: 0;
  color: rgba(255,255,255,0.88);
}

.bio-divider {
  border: none;
  border-top: 1px solid rgba(255,255,255,0.15);
  margin: 0.85rem 0;
}

.bio-empty { font-style: italic; color: rgba(255,255,255,0.4); }

/* Transition */
.bio-enter-active, .bio-leave-active { transition: opacity 0.2s, transform 0.2s; }
.bio-enter-from, .bio-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }

/* ── Meals overlay ─────────────────────────────────────────────────────────── */
.meal-overlay {
  position: absolute;
  transform: translateX(0);  /* extends rightward from the anchor point */
  pointer-events: all;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 10;
}

.meal-badge {
  background: #1a6b2f;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 2px 5px;
  border-radius: 3px 3px 0 0;
  white-space: nowrap;
}

.meal-badge--now {
  background: #c47d0a;
}

.meal-info {
  background: rgba(26, 107, 47, 0.88);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  border-radius: 0 0 3px 3px;
  overflow: hidden;
  width: 110px;
  white-space: nowrap;
  padding: 4px 0;
}

.meal-ticker-text {
  display: inline-block;
  will-change: transform;
  animation: ticker-scroll 12s linear infinite;
}

.meal-menu-list {
  margin: 0.5rem 0 0;
  padding: 0 0 0 1.1rem;
  font-size: 0.88rem;
  color: rgba(255,255,255,0.88);
  line-height: 1.7;
}

/* ── Settings toggle ─────────────────────────────────────────────────────────── */
.settings-toggle {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: none;
  background: rgba(30, 5, 60, 0.72);
  color: rgba(255, 255, 255, 0.65);
  font-size: 1rem;
  cursor: pointer;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  transition: background 0.15s, color 0.15s;
}

.settings-toggle:hover,
.settings-toggle--active {
  background: rgba(67, 7, 137, 0.92);
  color: #fff;
}

.settings-panel {
  position: absolute;
  top: 3rem;
  right: 0.5rem;
  background: rgba(30, 5, 60, 0.96);
  color: #fff;
  border-radius: 10px;
  padding: 0.8rem 1rem;
  min-width: 155px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  z-index: 20;
}

.settings-title {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c9a0f0;
  margin: 0 0 0.55rem;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.3rem 0;
}

.settings-row + .settings-row {
  border-top: 1px solid rgba(255,255,255,0.1);
  margin-top: 0.2rem;
  padding-top: 0.45rem;
}
</style>
