<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, onSnapshot, runTransaction, arrayUnion } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import { sendVolunteerCoordinator } from '@/../scripts/notifications.js'
import reunionMapUrl from '@/assets/images/reunion_map_(awesome_lathusca)_2026.svg?url'
import { useLineupState } from '@/composables/useLineupState'
import { REUNION_FESTIVAL } from '@/config/festivalConfig'
import iconCleanupCrew from '@/assets/images/icons/cleanup_crew.png'
import iconSetupCrew from '@/assets/images/icons/setup_crew.png'
import iconFrontGate from '@/assets/images/icons/front_gate.png'
import iconFoodTeam from '@/assets/images/icons/food.png'
import iconArcade from '@/assets/images/icons/arcade.png'
import iconStageCrew from '@/assets/images/icons/stage_crew.png'
import iconKitchen from '@/assets/images/icons/kitchen.png'
import iconWashroom from '@/assets/images/icons/washroom.png'
import iconLostFound from '@/assets/images/icons/location.png'
import iconMeals from '@/assets/images/icons/meals.png'

// --- Claim Shift Logic ---
const claimShiftStatus = ref('')
const claimShiftLoading = ref(false)

async function claimNextShiftForTeam() {
  claimShiftStatus.value = ''
  claimShiftLoading.value = true
  try {
    // Find the next unclaimed shift for the selected team
    const nextShift = volunteerShiftsNext.value.find(s =>
      s.team && s.team.toLowerCase().replace(/\s/g, '') === selectedShiftTeam.value.toLowerCase().replace(/\s/g, '')
    )
    if (!nextShift) throw new Error('No upcoming shift found for this team.')

    // Lookup participant info
    const idCode = effectiveIdCode.value?.toLowerCase().trim()
    if (!idCode) throw new Error('No ID code found. Please access the map with your ticket link or login.')
    const q = query(collection(reunion_db, 'participants_2026'), where('id_code', '==', idCode))
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) throw new Error('Participant not found for your ID code.')
    const p = querySnapshot.docs[0].data()
    const participant = {
      id_code: p.id_code,
      fullname: p.contact?.fullname || p.fullname || '(no name)'
    }

    // Firestore transaction to claim the slot
    const slotRef = doc(reunion_db, 'volunteer_slots_2026', nextShift.id)
    await runTransaction(reunion_db, async (tx) => {
      const snap = await tx.get(slotRef)
      if (!snap.exists()) throw new Error('Slot no longer exists.')
      const s = snap.data()
      const capacity = s.capacity || 1
      const claimed = s.claimed || []
      if (claimed.some((c) => c.id_code === participant.id_code)) throw new Error('You already claimed this slot.')
      if (claimed.length >= capacity) throw new Error('This slot is full.')
      const newClaim = {
        id_code: participant.id_code,
        fullname: participant.fullname,
        claimed_at: new Date()
      }
      tx.update(slotRef, { claimed: [...claimed, newClaim] })
    })

    // Mirror on participant document
    const claimSummary = {
      slot_id: nextShift.id,
      team: nextShift.team,
      date: nextShift.date,
      start: nextShift.start,
      end: nextShift.end,
      title: nextShift.title || '',
      created_at: new Date()
    }
    await updateDoc(
      doc(reunion_db, 'participants_2026', participant.id_code),
      { 'volunteer.claimed_slots': arrayUnion(claimSummary) }
    )

    // Audit trail
    await addDoc(collection(reunion_db, 'volunteer_signups_2026'), {
      id_code: participant.id_code,
      fullname: participant.fullname,
      team: nextShift.team,
      slot_id: nextShift.id,
      date: nextShift.date,
      start: nextShift.start,
      end: nextShift.end,
      created_at: new Date()
    })

    claimShiftStatus.value = 'success'
  } catch (e) {
    claimShiftStatus.value = e?.message || 'Sorry, claim failed. Please try again.'
  } finally {
    claimShiftLoading.value = false
  }
}
// Shift Info Modal State and Handlers
const showShiftInfoModal = ref(false)
const selectedShiftTeam = ref('')
const selectedShiftIcon = ref('')
function openShiftInfoModal(team, icon = '') {
  selectedShiftTeam.value = team
  selectedShiftIcon.value = icon
  showShiftInfoModal.value = true
  claimShiftStatus.value = ''
}
function closeShiftInfoModal() {
  showShiftInfoModal.value = false
  selectedShiftTeam.value = ''
  selectedShiftIcon.value = ''
  claimShiftStatus.value = ''
}

// Accept user id_code as a prop (from ticket click-through or URL)
const props = defineProps({
  id_code: { type: String, required: false }
})
const route = useRoute()
const effectiveIdCode = computed(() => {
  return props.id_code || route.query.id_code || route.params.id_code || ''
})

const { currentAct, upcomingAct, updateCurrentAct } = useLineupState()

// Admin/volunteer role flag — wire up to auth when ready
const isVolunteerOrAdmin = ref(false)

const mapContainer = ref(null)
const mapObject = ref(null)
// Debug: capture SVG and container info
// svgDebugInfo.value = {
//   viewBox: `${vb.x} ${vb.y} ${vb.width} ${vb.height}`,
//   svgWidth: svgEl.width.baseVal?.value || svgEl.clientWidth || svgEl.getAttribute('width') || 'auto',
//   svgHeight: svgEl.height.baseVal?.value || svgEl.clientHeight || svgEl.getAttribute('height') || 'auto',
//   containerWidth: mapContainer.value?.clientWidth || 'n/a',
//   containerHeight: mapContainer.value?.clientHeight || 'n/a',
// }

const showKitchenModal = ref(false)
const showWashroomModal = ref(false)
const showLostFoundModal = ref(false)
const editingLostFoundId = ref(null)
const alertInput = ref({ type: '', mode: '', message: '' })

const kitchenAlerts = ref([])
const washroomAlerts = ref([])
const lostFoundItems = ref([])
const checkinNames = ref([])

function openKitchenModal() {
  alertInput.value = { type: 'kitchen', mode: '', message: '' }
  showKitchenModal.value = true
}
function openWashroomModal() {
  alertInput.value = { type: 'washroom', status: 'low', message: '' }
  showWashroomModal.value = true
}
function closeWashroomModal() {
  showWashroomModal.value = false
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

async function submitAlert() {
  const col = collection(reunion_db, 'alerts_2026')
  if (alertInput.value.type === 'lostfound' && editingLostFoundId.value) {
    await updateDoc(doc(col, editingLostFoundId.value), {
      message: alertInput.value.message,
      updated_at: new Date().toISOString()
    })
  } else {
    await addDoc(col, {
      ...alertInput.value,
      created_at: new Date().toISOString(),
      userId: 'CURRENT_USER_ID',
      userName: 'CURRENT_USER_NAME'
    })
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

async function clearAlert(alert) {
  const col = collection(reunion_db, 'alerts_2026')
  await deleteDoc(doc(col, alert.id))
}

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

// Store both current and next shifts per team
const volunteerShiftsCurrent = ref([])
const volunteerShiftsNext = ref([])

function listenToVolunteerShifts() {
  const slotsCol = collection(reunion_db, 'volunteer_slots_2026')
  onSnapshot(slotsCol, (snapshot) => {
    const now = new Date()
    const allShifts = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      if (data.active !== false && data.date && data.start && data.end) {
        // Include all shifts, even if claimed is empty or missing
        allShifts.push({ id: doc.id, ...data, claimed: Array.isArray(data.claimed) ? data.claimed : [] })
      }
    })
    // Group by team for current and next
    const byTeam = {}
    allShifts.forEach(shift => {
      const team = shift.team || 'other'
      if (!byTeam[team]) byTeam[team] = []
      byTeam[team].push(shift)
    })
    // Find current and next for each team
    const current = []
    const next = []
    Object.entries(byTeam).forEach(([, shifts]) => {
      shifts.sort((a, b) => new Date(`${a.date}T${a.start}`) - new Date(`${b.date}T${b.start}`))
      let foundCurrent = false
      let foundNext = false
      for (const shift of shifts) {
        const shiftStart = new Date(`${shift.date}T${shift.start}`)
        let shiftEnd = new Date(`${shift.date}T${shift.end}`)
        if (shift.end === '24:00') shiftEnd.setHours(shiftEnd.getHours() + 1)
        if (!foundCurrent && shift.claimed && shift.claimed.length > 0 && now >= shiftStart && now <= shiftEnd) {
          current.push(shift)
          foundCurrent = true
        } else if (!foundNext && shiftStart > now) {
          next.push(shift)
          foundNext = true
        }
      }
    })
    volunteerShiftsCurrent.value = current
    volunteerShiftsNext.value = next
  })
}

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
    offsetY: 5
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

// Only show overlays for official teams, mapping to SVG icon by name
const VOLUNTEER_SHIFT_ICONS = [
  { svgId: 'cleanup_crew_icon', label: 'Cleanup Crew', icon: iconCleanupCrew, offsetX: 0, offsetY: -50 },
  { svgId: 'setup_crew_icon', label: 'Setup Crew', icon: iconSetupCrew, offsetX: 0, offsetY: -50 },
  { svgId: 'front_gate_icon', label: 'Front Gate', icon: iconFrontGate, offsetX: -50, offsetY: 12 },
  { svgId: 'meals_area_icon', label: 'Food Team', icon: iconFoodTeam, offsetX: 0, offsetY: 0 },
  { svgId: 'arcade_icon', label: 'Arcade Attendant', icon: iconArcade, offsetX: -45, offsetY: -10 },
  { svgId: 'front_of_house_icon', label: 'Stage Crew', icon: iconStageCrew, offsetX: -90, offsetY: 0 },
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
    // Prefer x/y attributes if present, else fallback to transform
    x = parseFloat(el.getAttribute('x'))
    y = parseFloat(el.getAttribute('y'))
    if (isNaN(x) || isNaN(y)) {
      const transform = el.getAttribute('transform') || ''
      const m = transform.match(/translate\(\s*([\d.-]+)[\s,]+([\d.-]+)/)
      x = m ? parseFloat(m[1]) : 0
      y = m ? parseFloat(m[2]) : 0
    }
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

  // Debug: capture SVG and container info
  // svgDebugInfo.value = {
  //   viewBox: `${vb.x} ${vb.y} ${vb.width} ${vb.height}`,
  //   svgWidth: svgEl.width.baseVal?.value || svgEl.clientWidth || svgEl.getAttribute('width') || 'auto',
  //   svgHeight: svgEl.height.baseVal?.value || svgEl.clientHeight || svgEl.getAttribute('height') || 'auto',
  //   containerWidth: mapContainer.value?.clientWidth || 'n/a',
  //   containerHeight: mapContainer.value?.clientHeight || 'n/a',
  // }

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
  // Make all *_icon elements clickable, including outhouse/portapotty
  const svgDoc = mapObject.value?.contentDocument
  if (svgDoc) {
    // Add click listeners for all icons, including outhouse/portapotty
    const iconElements = svgDoc.querySelectorAll('[id$="_icon"], #outhouse_icon, #portapotty_icon')
    iconElements.forEach((el) => {
      el.style.cursor = 'pointer'
      el.style.pointerEvents = 'auto'
      el.addEventListener('click', (event) => {
        handleSvgIconClick(el.id, event)
      })
    })

    // Forward wheel + mouse events from the inner SVG document so pan/zoom works
    // when the cursor is over the map (object creates its own browsing context)
    svgDoc.addEventListener('wheel', (e) => {
      e.preventDefault()
      const objRect = mapObject.value.getBoundingClientRect()
      onWheel({ deltaY: e.deltaY, clientX: e.clientX + objRect.left, clientY: e.clientY + objRect.top })
    }, { passive: false })

    svgDoc.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return
      const objRect = mapObject.value.getBoundingClientRect()
      isDragging.value = true
      dragLast.value = { x: e.clientX + objRect.left, y: e.clientY + objRect.top }
    })
    svgDoc.addEventListener('mousemove', (e) => {
      if (!isDragging.value) return
      const objRect = mapObject.value.getBoundingClientRect()
      const absX = e.clientX + objRect.left
      const absY = e.clientY + objRect.top
      const dx = absX - dragLast.value.x
      const dy = absY - dragLast.value.y
      dragLast.value = { x: absX, y: absY }
      const { tx, ty } = clampTranslate(mapTranslateX.value + dx, mapTranslateY.value + dy, mapScale.value)
      mapTranslateX.value = tx
      mapTranslateY.value = ty
    })
    svgDoc.addEventListener('mouseup', () => { isDragging.value = false })
  }
}
// Handler for clicking SVG icons
// Track which washroom is being reported
const washroomLocation = ref('')
function handleSvgIconClick(iconId) {
  // Check for volunteer team icons first
  const volunteerIcon = VOLUNTEER_SHIFT_ICONS.find(v => v.svgId === iconId)
  if (volunteerIcon) {
    openShiftInfoModal(volunteerIcon.label, volunteerIcon.icon)
    return
  }

  const isWashroomIcon = (
    iconId.includes('washroom') ||
    iconId.includes('washrooms') ||
    iconId.includes('portapotty') ||
    iconId.includes('outhouse')
  )

  if (isWashroomIcon) {
    if (showWashroomSupplyModal.value && activeWashroomIconId.value === iconId) {
      closeWashroomSupplyModal()
      return
    }

    let label = ''
    if (iconId === 'portapotty_icon') label = 'Porta Potty'
    else if (iconId === 'outhouse_icon') label = 'Outhouse'
    else label = iconId

    washroomLocation.value = label
    activeWashroomIconId.value = iconId
    openWashroomSupplyModal()
    return
  }

  // Stage area icon → open Now Playing / Up Next bio card
  if (iconId === 'stage_area_icon') {
    bioOpen.value = true
    return
  }

  // Handle shared kitchen icon click
  if (iconId === 'shared_kitchen_area' || iconId.includes('kitchen')) {
    openKitchenModal()
    return
  }
}

// Modal state for washroom supply report
const showWashroomSupplyModal = ref(false)
const washroomSupplyType = ref('toilet_paper')
const washroomSupplySubmitting = ref(false)
const washroomSupplyError = ref('')
const activeWashroomIconId = ref('')

function openWashroomSupplyModal() {
  washroomSupplyType.value = 'toilet_paper'
  washroomSupplyError.value = ''
  showWashroomSupplyModal.value = true
}

function closeWashroomSupplyModal() {
  washroomSupplyError.value = ''
  showWashroomSupplyModal.value = false
  activeWashroomIconId.value = ''
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


// ── Pan & zoom ────────────────────────────────────────────────────────────────
const mapScale = ref(1)
const mapTranslateX = ref(0)
const mapTranslateY = ref(0)
const isDragging = ref(false)
const dragLast = ref({ x: 0, y: 0 })
const MIN_SCALE = 1
const MAX_SCALE = 5

const zoomStyle = computed(() => ({
  transform: `translate(${mapTranslateX.value}px, ${mapTranslateY.value}px) scale(${mapScale.value})`,
  transformOrigin: '0 0',
  willChange: 'transform',
  cursor: isDragging.value ? 'grabbing' : (mapScale.value > 1 ? 'grab' : 'default'),
}))

function clampTranslate(tx, ty, scale) {
  if (!mapContainer.value) return { tx, ty }
  const cw = mapContainer.value.clientWidth
  const ch = mapContainer.value.clientHeight
  return {
    tx: Math.max(cw * (1 - scale), Math.min(0, tx)),
    ty: Math.max(ch * (1 - scale), Math.min(0, ty)),
  }
}

function onWheel(e) {
  const factor = e.deltaY < 0 ? 1.1 : 0.9
  const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, mapScale.value * factor))
  if (!mapContainer.value) return
  const rect = mapContainer.value.getBoundingClientRect()
  const cx = e.clientX - rect.left
  const cy = e.clientY - rect.top
  const mx = (cx - mapTranslateX.value) / mapScale.value
  const my = (cy - mapTranslateY.value) / mapScale.value
  const { tx, ty } = clampTranslate(cx - mx * newScale, cy - my * newScale, newScale)
  mapScale.value = newScale
  mapTranslateX.value = tx
  mapTranslateY.value = ty
}

function onMouseDown(e) {
  if (e.button !== 0) return
  isDragging.value = true
  dragLast.value = { x: e.clientX, y: e.clientY }
}
function onMouseMove(e) {
  if (!isDragging.value) return
  const dx = e.clientX - dragLast.value.x
  const dy = e.clientY - dragLast.value.y
  dragLast.value = { x: e.clientX, y: e.clientY }
  const { tx, ty } = clampTranslate(mapTranslateX.value + dx, mapTranslateY.value + dy, mapScale.value)
  mapTranslateX.value = tx
  mapTranslateY.value = ty
}
function onMouseUp() { isDragging.value = false }

const pinchStartDist = ref(0)
const pinchStartScale = ref(1)
const pinchStartTx = ref(0)
const pinchStartTy = ref(0)
const pinchStartMidX = ref(0)
const pinchStartMidY = ref(0)

function getTouchDist(t) {
  const dx = t[0].clientX - t[1].clientX
  const dy = t[0].clientY - t[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}
function onTouchStart(e) {
  if (e.touches.length === 2) {
    pinchStartDist.value = getTouchDist(e.touches)
    pinchStartScale.value = mapScale.value
    pinchStartTx.value = mapTranslateX.value
    pinchStartTy.value = mapTranslateY.value
    if (!mapContainer.value) return
    const rect = mapContainer.value.getBoundingClientRect()
    pinchStartMidX.value = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left
    pinchStartMidY.value = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top
  } else if (e.touches.length === 1) {
    dragLast.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
}
function onTouchMove(e) {
  if (e.touches.length === 2 && pinchStartDist.value > 0) {
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, pinchStartScale.value * (getTouchDist(e.touches) / pinchStartDist.value)))
    const mx = (pinchStartMidX.value - pinchStartTx.value) / pinchStartScale.value
    const my = (pinchStartMidY.value - pinchStartTy.value) / pinchStartScale.value
    if (!mapContainer.value) return
    const rect = mapContainer.value.getBoundingClientRect()
    const curMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left
    const curMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top
    const { tx, ty } = clampTranslate(curMidX - mx * newScale, curMidY - my * newScale, newScale)
    mapScale.value = newScale
    mapTranslateX.value = tx
    mapTranslateY.value = ty
  } else if (e.touches.length === 1) {
    const dx = e.touches[0].clientX - dragLast.value.x
    const dy = e.touches[0].clientY - dragLast.value.y
    dragLast.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    const { tx, ty } = clampTranslate(mapTranslateX.value + dx, mapTranslateY.value + dy, mapScale.value)
    mapTranslateX.value = tx
    mapTranslateY.value = ty
  }
}
function onTouchEnd(e) {
  if (e.touches.length < 2) pinchStartDist.value = 0
  if (e.touches.length === 1) dragLast.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
}

function zoomToCenter(factor) {
  const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, mapScale.value * factor))
  if (!mapContainer.value) { mapScale.value = newScale; return }
  const cw = mapContainer.value.clientWidth
  const ch = mapContainer.value.clientHeight
  const cx = cw / 2
  const cy = ch / 2
  const mx = (cx - mapTranslateX.value) / mapScale.value
  const my = (cy - mapTranslateY.value) / mapScale.value
  const { tx, ty } = clampTranslate(cx - mx * newScale, cy - my * newScale, newScale)
  mapScale.value = newScale
  mapTranslateX.value = tx
  mapTranslateY.value = ty
}
function zoomIn() { zoomToCenter(1.4) }
function zoomOut() { zoomToCenter(1 / 1.4) }

onMounted(() => {
  fetchAndUpdateCurrentAct()
  listenToAlerts()
  listenToCheckins()
  listenToVolunteerShifts()
})
</script>

<template>
  <div class="map-backdrop">
  <div ref="mapContainer" class="map-container"
       @wheel.prevent="onWheel"
       @mousedown="onMouseDown"
       @mousemove="onMouseMove"
       @mouseup="onMouseUp"
       @mouseleave="onMouseUp"
       @touchstart.passive="onTouchStart"
       @touchmove.prevent="onTouchMove"
       @touchend="onTouchEnd">
    <!-- map-zoom-wrapper: transform applied here so overlays move with the map -->
    <div class="map-zoom-wrapper" :style="zoomStyle">

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
      <Teleport to="body">
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
      </Teleport>
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
      <Teleport to="body">
      <Transition name="bio">
        <div v-if="mealCardOpen" class="bio-card">
          <button class="bio-close" @click="mealCardOpen = false">✕</button>
          <div class="modal-title-row"><img :src="iconMeals" alt="" class="modal-icon" /><p class="bio-act-name" style="margin:0;">{{ nextMeal.isNow ? 'Now Serving' : 'Next Meal' }}</p></div>
          <p class="bio-genre">
            {{ nextMeal.label }}<template v-if="!nextMeal.isNow">&nbsp;· {{ formatMealTime(nextMeal.time) }}</template>
          </p>
          <ul class="meal-menu-list">
            <li v-for="item in nextMeal.menu" :key="item">{{ item }}</li>
          </ul>
        </div>
      </Transition>
      </Teleport>
    </template>

    <!-- Kitchen overlay -->
    <template v-if="kitchenOverlays.length">
      <div
        v-for="overlay in kitchenOverlays"
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
        v-for="overlay in washroomOverlays"
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
        v-for="overlay in lostFoundOverlays"
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
    <!-- Check-in overlay -->
    <template v-if="checkinOverlays.length">
      <div
        v-for="overlay in checkinOverlays"
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

    </div><!-- /.map-zoom-wrapper -->

    <!-- Kitchen Alert Modal -->
    <Transition name="bio">
      <div v-if="showKitchenModal" class="bio-card">
        <button class="bio-close" @click.stop="showKitchenModal = false">✕</button>
        <div class="modal-title-row"><img :src="iconKitchen" alt="" class="modal-icon" /><h3>Post Kitchen Alert</h3></div>
        <div class="modal-radio-group">
          <label class="modal-radio-label"><input type="radio" value="share" v-model="alertInput.mode" /> Cooking to Share</label>
          <label class="modal-radio-label"><input type="radio" value="missing" v-model="alertInput.mode" /> Missing Ingredient</label>
        </div>
        <input class="modal-input" v-model="alertInput.message" placeholder="What are you cooking or missing?" />
        <div class="modal-actions">
          <button class="modal-btn modal-btn--primary" @click="submitAlert">Post</button>
        </div>
      </div>
    </Transition>

    <!-- Washroom Alert Modal -->
    <Transition name="bio">
      <div v-if="showWashroomModal" class="bio-card">
        <button class="bio-close" @click.stop="closeWashroomModal">✕</button>
        <div class="modal-title-row"><img :src="iconWashroom" alt="" class="modal-icon" /><h3>Report Low Supplies</h3></div>
        <p class="bio-text" style="margin-bottom:0.75rem;">Let volunteers know if supplies are running low.</p>
        <div class="modal-actions">
          <button class="modal-btn modal-btn--ghost" type="button" @click.stop="closeWashroomModal">Cancel</button>
          <button class="modal-btn modal-btn--primary" @click="submitAlert">Submit alert</button>
        </div>
      </div>
    </Transition>

    <!-- Lost & Found Modal -->
    <Transition name="bio">
      <div v-if="showLostFoundModal" class="bio-card">
        <button class="bio-close" @click.stop="showLostFoundModal = false">✕</button>
        <div class="modal-title-row"><img :src="iconLostFound" alt="" class="modal-icon" /><h3>{{ editingLostFoundId ? 'Edit' : 'Report' }} Lost & Found Item</h3></div>
        <input class="modal-input" v-model="alertInput.message" placeholder="Describe the item and location..." />
        <div class="modal-actions">
          <button class="modal-btn modal-btn--ghost" type="button" @click.stop="showLostFoundModal = false">Cancel</button>
          <button class="modal-btn modal-btn--primary" @click="submitAlert">{{ editingLostFoundId ? 'Save' : 'Report' }}</button>
        </div>
      </div>
    </Transition>


    <!-- Shift Info Modal — opens when a volunteer team icon is tapped on the map -->
    <Transition name="bio">
      <div v-if="showShiftInfoModal" class="bio-card">
        <button class="bio-close" @click.stop="closeShiftInfoModal">✕</button>
        <div class="modal-title-row">
          <img v-if="selectedShiftIcon" :src="selectedShiftIcon" alt="" class="modal-icon" />
          <h3 style="margin:0;">{{ selectedShiftTeam }}</h3>
        </div>

        <p class="bio-genre" style="margin-top:0.75rem;">▶ ON SHIFT NOW</p>
        <template v-if="volunteerShiftsCurrent.filter(s => s.team && s.team.toLowerCase().replace(/\s/g,'') === selectedShiftTeam.toLowerCase().replace(/\s/g,'')).length">
          <div v-for="shift in volunteerShiftsCurrent.filter(s => s.team && s.team.toLowerCase().replace(/\s/g,'') === selectedShiftTeam.toLowerCase().replace(/\s/g,''))" :key="shift.id">
            <p v-for="person in shift.claimed" :key="person.id_code" class="bio-text" style="margin:0.2rem 0;">{{ person.fullname || person.id_code }}</p>
            <p class="bio-text" style="color:rgba(255,255,255,0.4);font-size:0.78rem;margin:0.2rem 0;">{{ shift.date }} · {{ shift.start }}–{{ shift.end }}</p>
          </div>
        </template>
        <template v-else>
          <div class="shift-row">
            <p class="bio-text" style="color:#ffb347;margin:0;">This shift needs to be filled.</p>
            <button class="claim-btn" :disabled="claimShiftLoading" @click="claimNextShiftForTeam">
              {{ claimShiftLoading ? 'Claiming...' : 'Claim this shift' }}
            </button>
          </div>
          <div v-if="claimShiftStatus && claimShiftStatus !== 'success'" class="modal-error" style="margin-top:4px;">{{ claimShiftStatus }}</div>
          <div v-if="claimShiftStatus === 'success'" style="color:#4c8;font-size:0.85rem;margin-top:4px;">Shift claimed! Thank you.</div>
        </template>

        <hr class="bio-divider" />

        <p class="bio-genre bio-genre--upcoming" style="margin-top:0.6rem;">▷ NEXT SHIFT</p>
        <template v-if="volunteerShiftsNext.filter(s => s.team && s.team.toLowerCase().replace(/\s/g,'') === selectedShiftTeam.toLowerCase().replace(/\s/g,'')).length">
          <div v-for="shift in volunteerShiftsNext.filter(s => s.team && s.team.toLowerCase().replace(/\s/g,'') === selectedShiftTeam.toLowerCase().replace(/\s/g,''))" :key="shift.id">
            <p class="bio-text" style="color:rgba(255,255,255,0.4);font-size:0.78rem;margin:0 0 0.4rem;">{{ shift.date }} · {{ shift.start }}–{{ shift.end }}</p>
            <template v-if="shift.claimed && shift.claimed.length > 0">
              <p v-for="person in shift.claimed" :key="person.id_code" class="bio-text" style="margin:0.2rem 0;">{{ person.fullname || person.id_code }}</p>
            </template>
            <template v-else>
              <div class="shift-row">
                <p class="bio-text" style="color:#ffb347;margin:0;">This shift needs to be filled.</p>
                <button class="claim-btn" :disabled="claimShiftLoading" @click="claimNextShiftForTeam">
                  {{ claimShiftLoading ? 'Claiming...' : 'Claim this shift' }}
                </button>
              </div>
              <div v-if="claimShiftStatus && claimShiftStatus !== 'success'" class="modal-error" style="margin-top:4px;">{{ claimShiftStatus }}</div>
              <div v-if="claimShiftStatus === 'success'" style="color:#4c8;font-size:0.85rem;margin-top:4px;">Shift claimed! Thank you.</div>
            </template>
          </div>
        </template>
        <p v-else class="bio-text bio-empty">No upcoming shifts scheduled.</p>
      </div>
    </Transition>

    <!-- Zoom buttons -->
    <div class="zoom-controls">
      <button class="zoom-btn" @click="zoomIn" :disabled="mapScale >= 5" title="Zoom in">+</button>
      <button class="zoom-btn" @click="zoomOut" :disabled="mapScale <= 1" title="Zoom out">−</button>
    </div>

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
      <button class="bio-close" @click.stop="closeWashroomSupplyModal">✕</button>
      <div class="modal-title-row"><img :src="iconWashroom" alt="" class="modal-icon" /><h3>Report Low Washroom Supplies</h3></div>
      <p v-if="washroomLocation" class="bio-text" style="margin-bottom:0.5rem;">Reporting for: <strong>{{ washroomLocation }}</strong></p>
      <p class="bio-text" style="margin-bottom:0.5rem;">Select the supply that is low:</p>
      <div class="modal-radio-group">
        <label class="modal-radio-label"><input type="radio" value="toilet_paper" v-model="washroomSupplyType" /> Toilet Paper</label>
        <label class="modal-radio-label"><input type="radio" value="hand_sanitizer" v-model="washroomSupplyType" /> Hand Sanitizer</label>
        <label class="modal-radio-label"><input type="radio" value="soap" v-model="washroomSupplyType" /> Soap</label>
      </div>
      <div class="modal-actions">
        <button class="modal-btn modal-btn--ghost" type="button" @click.stop="closeWashroomSupplyModal">Cancel</button>
        <button class="modal-btn modal-btn--primary" :disabled="washroomSupplySubmitting" @click="submitWashroomSupplyAlert">
          {{ washroomSupplySubmitting ? 'Reporting...' : 'Report low supply' }}
        </button>
      </div>
      <p v-if="washroomSupplyError" class="modal-error">{{ washroomSupplyError }}</p>
    </div>
  </Transition>
  </div><!-- /.map-backdrop -->
</template>

<style scoped>

.map-backdrop {
  width: 100vw;
  background-color: #000;
}

.map-container {
  position: relative;
  width: 100%;
  --overlay-font-size: 8px;
}

/* Ensure overlays are absolutely positioned over the SVG map */
.map-feature-overlay {
  position: absolute;
  pointer-events: all;
  z-index: 10;
}

/* Volunteer shift overlay styling (inherits from map-feature-overlay) */
.volunteer-shift-overlay {
  /* Optionally adjust alignment for volunteer overlays */
  display: flex;
  flex-direction: column;
  align-items: center;
  /* If you want to nudge overlays, use transform or offsetX/Y in JS */
  pointer-events: auto;
  z-index: 10;
  /* border removed: no debug border for overlays */
}

.festival-map {
  width: 100%;
  height: auto;
  display: block;
  border: none;
  pointer-events: auto; /* Allow SVG icons to be clickable */
}

/* Desktop: map fills viewport height; container shrink-wraps the map so
   overlay % positions stay accurate; backdrop provides the full-screen black bg */
@media (min-width: 768px) {
  .map-backdrop {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .map-container {
    height: 100vh;
    width: auto;
    flex-shrink: 0;
  }
  .festival-map {
    width: auto;
    height: 100vh;
  }
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
  font-size: var(--overlay-font-size);
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
  font-size: var(--overlay-font-size);
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
  pointer-events: auto;
}

/* Only ticker overlays (now playing, up next, next meal) should scroll */
.stage-overlay .ticker-text {
  animation: ticker-scroll 5s linear infinite;
}
.meal-overlay .meal-ticker-text {
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
  width: min(95vw, 420px);
  max-width: 95vw;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  box-sizing: border-box;
  background: rgba(30, 5, 60, 0.96);
  color: #fff;
  border-radius: 12px;
  padding: 1.2rem 1.4rem 1rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  z-index: 10000;
  pointer-events: all;
  touch-action: manipulation;
}

.bio-card input,
.bio-card button,
.bio-card label,
.bio-card textarea,
.bio-card select {
  font-size: 16px;
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
  font-size: var(--overlay-font-size);
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
  font-size: 8px;
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
}

.meal-menu-list {
  margin: 0.5rem 0 0;
  padding: 0 0 0 1.1rem;
  font-size: 0.88rem;
  color: rgba(255,255,255,0.88);
  line-height: 1.7;
}

/* ── Zoom controls ───────────────────────────────────────────────────────────── */
.zoom-controls {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  z-index: 20;
}

.zoom-btn {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 8px;
  border: none;
  background: rgba(30, 5, 60, 0.80);
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  transition: background 0.15s, color 0.15s;
  user-select: none;
}

.zoom-btn:hover:not(:disabled) {
  background: rgba(67, 7, 137, 0.92);
  color: #fff;
}

.zoom-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

/* ── Settings toggle ───────────────────────────────────────────────────────────── */
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

/* ── Modal title row (icon + heading) ────────────────────────────────────────── */
.modal-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.modal-title-row h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.modal-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  flex-shrink: 0;
  opacity: 0.9;
}
/* ── Modal shared interactive elements ──────────────────────────────────────── */
.modal-input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 8px;
  color: #fff;
  font-size: 0.95rem;
  padding: 0.55rem 0.8rem;
  margin: 0.6rem 0 0.85rem;
  outline: none;
  transition: border-color 0.15s;
}
.modal-input:focus { border-color: rgba(201,160,240,0.6); }
.modal-input::placeholder { color: rgba(255,255,255,0.35); }

.modal-radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin: 0.5rem 0 0.85rem;
}
.modal-radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.92rem;
  color: rgba(255,255,255,0.88);
  cursor: pointer;
}
.modal-radio-label input[type="radio"] {
  accent-color: #c9a0f0;
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.modal-actions {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.85rem;
}
.modal-btn {
  -webkit-appearance: none;
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: none;
  border-radius: 7px;
  padding: 0.45rem 1rem;
  font-size: 0.88rem !important;
  font-weight: 700;
  line-height: 1.2;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.modal-btn.modal-btn--primary { background: #430789 !important; color: #fff !important; }
.modal-btn.modal-btn--primary:hover:not(:disabled) { background: #6012b8 !important; }
.modal-btn.modal-btn--primary:disabled { opacity: 0.5; cursor: default; }
.modal-btn.modal-btn--ghost { background: rgba(255,255,255,0.08) !important; color: rgba(255,255,255,0.6) !important; }
.modal-btn.modal-btn--ghost:hover { background: rgba(255,255,255,0.14) !important; color: #fff !important; }

.modal-error { color: #f88; font-size: 0.85rem; margin-top: 0.5rem; }

/* ── Pan & zoom ─────────────────────────────────────────────────────────────── */
.map-container {
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.map-zoom-wrapper {
  position: relative;
  width: 100%;
  transform-origin: 0 0;
}

</style>
