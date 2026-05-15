<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, onSnapshot, runTransaction, arrayUnion } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { reunion_db, festivall_auth } from '@/firebase'
import { sendVolunteerCoordinator } from '@/../scripts/notifications.js'
import reunionMapUrl from '@/assets/images/reunion_map_(awesome_lathusca)_2026.svg?url'
import { useLineupState } from '@/composables/useLineupState'
import { useInventory } from '@/composables/useInventory'
import { REUNION_FESTIVAL } from '@/config/festivalConfig'
import iconCleanupCrew from '@/assets/images/icons/cleanup_crew.png'
import iconSetupCrew from '@/assets/images/icons/setup_crew.png'
import iconFrontGate from '@/assets/images/icons/front_gate.png'
import iconFoodTeam from '@/assets/images/icons/food.png'
import iconArcade from '@/assets/images/icons/arcade.png'
import iconSoundTech from '@/assets/images/icons/soundtech.png'
import iconKitchen from '@/assets/images/icons/kitchen.png'
import iconWashroom from '@/assets/images/icons/washroom.png'
import iconLostFound from '@/assets/images/icons/lost_and_found.png'
import iconMeals from '@/assets/images/icons/meals.png'
import iconPotableWater from '@/assets/images/icons/potable_water.png'
import iconShowers from '@/assets/images/icons/showers.png'
import iconFlame from '@/assets/images/icons/flame.png'
import iconLand from '@/assets/images/icons/land.png'
import iconPlayground from '@/assets/images/icons/playground.png'
import iconPool from '@/assets/images/icons/pool.png'
import iconQuiet from '@/assets/images/icons/quiet.png'
import iconTarget from '@/assets/images/icons/target.png'
import iconCampsiteParking from '@/assets/images/icons/campsite_parking.png'
import iconTent from '@/assets/images/icons/tent.png'
import iconArtist from '@/assets/images/icons/artist.png'

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

// True when one of the 4 admin accounts is signed in via Firebase email auth
const isVolunteerOrAdmin = ref(false)
onAuthStateChanged(festivall_auth, (user) => {
  isVolunteerOrAdmin.value = !!user
})

const mapContainer = ref(null)
const mapSvgContainer = ref(null)
const inlineSvgContent = ref('')
const participantFullname = ref('')

async function fetchParticipantFullname() {
  const idCode = effectiveIdCode.value?.toLowerCase().trim()
  if (!idCode) return
  try {
    const q = query(collection(reunion_db, 'participants_2026'), where('id_code', '==', idCode))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const p = snap.docs[0].data()
      participantFullname.value = p.contact?.fullname || p.fullname || ''
    }
  } catch (e) {
    console.warn('Could not fetch participant name:', e)
  }
}
// Debug: capture SVG and container info
// svgDebugInfo.value = {
//   viewBox: `${vb.x} ${vb.y} ${vb.width} ${vb.height}`,
//   svgWidth: svgEl.width.baseVal?.value || svgEl.clientWidth || svgEl.getAttribute('width') || 'auto',
//   svgHeight: svgEl.height.baseVal?.value || svgEl.clientHeight || svgEl.getAttribute('height') || 'auto',
//   containerWidth: mapContainer.value?.clientWidth || 'n/a',
//   containerHeight: mapContainer.value?.clientHeight || 'n/a',
// }

const showKitchenModal = ref(false)
const showLostFoundModal = ref(false)
const editingLostFoundId = ref(null)
const alertInput = ref({ type: '', mode: '', message: '' })

// ── Lost & Found — map long-press / double-click to place pin ────────────────
const lostFoundPendingPos = ref(null) // { pctX, pctY } — set before modal opens
const longPressTimer = ref(null)
const longPressStartXY = ref(null)
const longPressMoved = ref(false)
const selectedLostFoundItem = ref(null)
const showLostFoundDetailCard = ref(false)

function clientToMapPct(clientX, clientY) {
  if (!mapContainer.value || !mapSvgContainer.value) return null
  const rect = mapContainer.value.getBoundingClientRect()
  const mx = (clientX - rect.left - mapTranslateX.value) / mapScale.value
  const my = (clientY - rect.top  - mapTranslateY.value) / mapScale.value
  const w = mapSvgContainer.value.clientWidth
  const h = mapSvgContainer.value.clientHeight
  if (!w || !h) return null
  return {
    pctX: Math.min(1, Math.max(0, mx / w)),
    pctY: Math.min(1, Math.max(0, my / h))
  }
}

function triggerLostFoundAt(clientX, clientY) {
  const pos = clientToMapPct(clientX, clientY)
  if (!pos) return
  lostFoundPendingPos.value = pos
  showLostFoundDetailCard.value = false
  openLostFoundModal()
}

function startLongPress(clientX, clientY) {
  longPressStartXY.value = { x: clientX, y: clientY }
  longPressMoved.value = false
  clearTimeout(longPressTimer.value)
  longPressTimer.value = setTimeout(() => {
    if (!longPressMoved.value) {
      triggerLostFoundAt(longPressStartXY.value.x, longPressStartXY.value.y)
    }
  }, 600)
}

function cancelLongPress() {
  clearTimeout(longPressTimer.value)
}

function checkLongPressMoved(clientX, clientY) {
  if (!longPressStartXY.value) return
  const dx = clientX - longPressStartXY.value.x
  const dy = clientY - longPressStartXY.value.y
  if (Math.sqrt(dx * dx + dy * dy) > 8) {
    longPressMoved.value = true
    cancelLongPress()
  }
}

function onMapDblClick(e) {
  triggerLostFoundAt(e.clientX, e.clientY)
}

function openLostFoundDetail(item) {
  selectedLostFoundItem.value = item
  showLostFoundDetailCard.value = true
}

const kitchenAlerts = ref([])
const washroomAlerts = ref([])
const lostFoundItems = ref([])
const checkinNames = ref([])

function openKitchenModal() {
  alertInput.value = { type: 'kitchen', mode: '', message: '' }
  showKitchenModal.value = true
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
    const userId = effectiveIdCode.value || 'ANONYMOUS'
    const userName = participantFullname.value || (userId !== 'ANONYMOUS' ? `User ${userId.slice(-5)}` : 'Anonymous')
    const docData = {
      ...alertInput.value,
      created_at: new Date().toISOString(),
      userId,
      userName
    }
    // Attach map pin position for lost & found items
    if (alertInput.value.type === 'lostfound' && lostFoundPendingPos.value) {
      docData.pos = lostFoundPendingPos.value
    }
    await addDoc(col, docData)
    let slackMsg = ''
    if (alertInput.value.type === 'kitchen') {
      slackMsg = alertInput.value.mode === 'share'
        ? `🍳 *Kitchen Alert*: ${userName} is cooking: ${alertInput.value.message}`
        : `🍳 *Kitchen Alert*: ${userName} is missing: ${alertInput.value.message}`
    } else if (alertInput.value.type === 'washroom') {
      slackMsg = `🚻 *Washroom Alert*: Supplies low reported by ${userName}`
    } else if (alertInput.value.type === 'lostfound') {
      slackMsg = `🧳 *Lost & Found*: ${userName} reported: ${alertInput.value.message}`
    }
    if (slackMsg) sendVolunteerCoordinator(slackMsg)
  }
  showKitchenModal.value = false
  showWashroomModal.value = false
  showLostFoundModal.value = false
  editingLostFoundId.value = null
  lostFoundPendingPos.value = null
}

async function clearAlert(alert) {
  const col = collection(reunion_db, 'alerts_2026')
  await deleteDoc(doc(col, alert.id))
}

async function claimLostFoundItem(item) {
  const col = collection(reunion_db, 'alerts_2026')
  const userId = effectiveIdCode.value || 'ANONYMOUS'
  const claimedByName = participantFullname.value || (userId !== 'ANONYMOUS' ? `User ${userId.slice(-5)}` : 'Anonymous')
  await updateDoc(doc(col, item.id), {
    claimed: true,
    claimedBy: userId,
    claimedByName,
    claimed_at: new Date().toISOString()
  })
  showLostFoundDetailCard.value = false
  sendVolunteerCoordinator(`✅ *Lost & Found claimed*: "${item.message}" claimed by ${claimedByName}`)
}

function listenToAlerts() {
  const alertsCol = collection(reunion_db, 'alerts_2026')
  onSnapshot(alertsCol, (snapshot) => {
    const kitchen = []
    const washroom = []
    const lostfound = []
    const water = []
    const firewood = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      if (data.type === 'kitchen') kitchen.push({ id: doc.id, ...data })
      else if (data.type === 'washroom') washroom.push({ id: doc.id, ...data })
      else if (data.type === 'lostfound') lostfound.push({ id: doc.id, ...data })
      else if (data.type === 'water_station') water.push({ id: doc.id, ...data })
      else if (data.type === 'firewood') firewood.push({ id: doc.id, ...data })
    })
    kitchenAlerts.value = kitchen
    washroomAlerts.value = washroom
    lostFoundItems.value = lostfound
    waterStationAlerts.value = water
    firewoodAlerts.value = firewood
  })
}

const CHECKIN_DECAY_MS = 10 * 60 * 1000
const allCheckinData = ref([])

function pruneCheckins() {
  const cutoff = Date.now() - CHECKIN_DECAY_MS
  checkinNames.value = allCheckinData.value.filter(p => {
    if (!p.last_activity) return false
    return new Date(p.last_activity).getTime() > cutoff
  })
}

function listenToCheckins() {
  const participantsCol = collection(reunion_db, 'participants_2026')
  onSnapshot(participantsCol, (snapshot) => {
    const checkedIn = []
    snapshot.forEach((docSnap) => {
      const data = docSnap.data()
      if (data.order?.checked_in) {
        checkedIn.push({
          id: docSnap.id,
          fullname: data.contact?.fullname || data.fullname || '',
          last_activity: data.order?.last_entrance_activity || null
        })
      }
    })
    allCheckinData.value = checkedIn
    pruneCheckins()
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
    offsetX: 15,
    offsetY: 25
  }
]

// New overlays for interactive features
const KITCHEN_ICONS = [
  {
    svgId: 'shared_kitchen_area',
    label: 'Shared Kitchen',
    offsetX: 0,
    offsetY: 150
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
    fallbackSvgPos: { x: 0, y: 100, w: 16, h: 16 }, // near front gate — update when SVG adds lostfound_area
    label: 'Lost & Found',
    offsetX: 0,
    offsetY: 0
  }
]

const CHECKIN_ICONS = [
  {
    svgId: 'front_gate_icon',
    label: 'Front Gate',
    offsetX: -75,
    offsetY: 25
  }
]

// Only show overlays for official teams, mapping to SVG icon by name
const VOLUNTEER_SHIFT_ICONS = [
  { svgId: 'cleanup_crew_icon', label: 'Cleanup Crew', icon: iconCleanupCrew, offsetX: 0, offsetY: -50 },
  { svgId: 'setup_crew_icon', label: 'Setup Crew', icon: iconSetupCrew, offsetX: 0, offsetY: -50 },
  { svgId: 'front_gate_icon', label: 'Front Gate', icon: iconFrontGate, offsetX: -50, offsetY: 12 },
  { svgId: 'meals_area_icon', label: 'Food Team', icon: iconFoodTeam, offsetX: 0, offsetY: 0 },
  { svgId: 'arcade_icon', label: 'Arcade Attendant', icon: iconArcade, offsetX: -45, offsetY: -10 },
  { svgId: 'front_of_house_icon', label: 'Stage Crew', icon: iconSoundTech, offsetX: -90, offsetY: 0 },
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
const showCheckinOverlay = ref(true)
const showLostFoundOverlay = ref(true)

// Festival active window — Sept 4–7, 2026
const isFestivalActive = computed(() => {
  const now = new Date()
  const festEnd = new Date('2026-09-07T23:59:59')
  return now >= REUNION_FESTIVAL.startDate && now <= festEnd
})
const festivalEnded = computed(() => new Date() > new Date('2026-09-07T23:59:59'))

// Teams currently open for sign-up based on volunteer phase dates
const currentPhaseTeams = computed(() => {
  const now = new Date()
  const { phase1End, phase2End } = REUNION_FESTIVAL.volunteerPhases
  if (now <= phase1End) return REUNION_FESTIVAL.volunteerTeamsByPhase.phase1
  if (now <= phase2End) return REUNION_FESTIVAL.volunteerTeamsByPhase.phase2
  return REUNION_FESTIVAL.volunteerTeamsByPhase.phase3
})

// Date when a given team's sign-ups open (null = already open in phase 1)
function teamPhaseOpenDate(teamLabel) {
  const { phase1End, phase2End } = REUNION_FESTIVAL.volunteerPhases
  const p2 = REUNION_FESTIVAL.volunteerTeamsByPhase.phase2
  const p1 = REUNION_FESTIVAL.volunteerTeamsByPhase.phase1
  if (p1.includes(teamLabel)) return null
  if (p2.includes(teamLabel)) return new Date(phase1End.getTime() + 86400000) // day after phase1End
  return new Date(phase2End.getTime() + 86400000) // day after phase2End
}
function formatPhaseDate(d) {
  if (!d) return ''
  return d.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })
}

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
function resolveIconStyle(vb, { svgId, fallbackSvgPos, offsetX = 0, offsetY = 0 }) {
  let x, y, w, h
  const el = document.getElementById(svgId)
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
  const svgEl = mapSvgContainer.value?.querySelector('svg')
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
    const style = resolveIconStyle(vb, icon)
    return style ? [{ label: icon.label, style }] : []
  })

  mealOverlays.value = MEAL_ICONS.flatMap((icon) => {
    const style = resolveIconStyle(vb, icon)
    return style ? [{ style }] : []
  })

  kitchenOverlays.value = KITCHEN_ICONS.flatMap((icon) => {
    const style = resolveIconStyle(vb, icon)
    return style ? [{ label: icon.label, style }] : []
  })

  washroomOverlays.value = WASHROOM_ICONS.flatMap((icon) => {
    const style = resolveIconStyle(vb, icon)
    return style ? [{ label: icon.label, style }] : []
  })

  lostFoundOverlays.value = LOSTFOUND_ICONS.flatMap((icon) => {
    const style = resolveIconStyle(vb, icon)
    return style ? [{ label: icon.label, style }] : []
  })

  checkinOverlays.value = CHECKIN_ICONS.flatMap((icon) => {
    const style = resolveIconStyle(vb, icon)
    return style ? [{ label: icon.label, style }] : []
  })

  volunteerShiftOverlays.value = VOLUNTEER_SHIFT_ICONS
    .filter(icon => currentPhaseTeams.value.includes(icon.label))
    .flatMap((icon) => {
      const style = resolveIconStyle(vb, icon)
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

function setupSvgListeners() {
  positionOverlays()
  // Attach click listeners to all icon elements in the inline SVG
  const iconElements = document.querySelectorAll('[id$="_icon"], #outhouse_icon, #portapotty_icon')
  iconElements.forEach((el) => {
    el.style.cursor = 'pointer'
    el.style.pointerEvents = 'auto'
    el.addEventListener('click', (event) => {
      handleSvgIconClick(el.id, event)
    })
  })
}
// Handler for clicking SVG icons
// Track which washroom is being reported
const washroomLocation = ref('')
function handleSvgIconClick(iconId) {
  // Check for inventory storage locations first
  if (locationIds.value.has(iconId)) {
    openInventoryLocationModal(iconId)
    return
  }

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

  // Water station
  if (iconId === 'water_station_icon') {
    openWaterStationModal()
    return
  }

  // Showers
  if (iconId === 'showers_icon') {
    showShowersModal.value = true
    return
  }

  // Fire pit
  if (iconId === 'firepit_icon') {
    openFirepitModal()
    return
  }

  // Generic info icons — supports exact IDs and prefix-matched serially-numbered IDs (e.g. camper1_icon, tent3_icon)
  const INFO_ICON_PREFIXES = [
    { prefix: 'garden',               info: { icon: iconLand,            title: 'Garden',               description: 'Community garden. Have a look around — please don\'t pick anything without asking first!' } },
    { prefix: 'playground',           info: { icon: iconPlayground,      title: 'Playground',            description: 'Kids\' play area. Parental supervision recommended.' } },
    { prefix: 'wading_pool',          info: { icon: iconPool,            title: 'Wading Pool',           description: 'All ages welcome. No solo swimming — a buddy must be present at all times.' } },
    { prefix: 'quiet_camping',        info: { icon: iconQuiet,           title: 'Quiet Camping',         description: 'Quiet hours after 11pm. Please keep noise to a minimum in this zone.' } },
    { prefix: 'cote_corral',          info: { icon: iconTarget,          title: 'Cote Corral',           description: 'Nerf gun battle arena! Grab a blaster and join the chaos. Check the schedule for organized rounds. Closed when no volunteers are present.' } },
    { prefix: 'tent',                 info: { icon: iconTent,            title: 'Tent Camping',          description: 'General camping area. Set up anywhere that isn\'t reserved. No fires in the camping zone.' } },
    { prefix: 'camper',               info: { icon: iconCampsiteParking, title: 'Camper Parking',        description: 'Designated RV/camper area. See the setup crew for your assigned spot.' } },
    { prefix: 'artist_loading_zone',  info: { icon: iconArtist,          title: 'Artist Loading Zone',   description: 'Artist access only. Please keep this area clear for performers and their gear.' } },
  ]
  const infoMatch = INFO_ICON_PREFIXES.find(({ prefix }) => iconId === `${prefix}_icon` || iconId.startsWith(`${prefix}_icon`) || new RegExp(`^${prefix}\\d+_icon$`).test(iconId))
  if (infoMatch) {
    openInfoModal(infoMatch.info)
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

// ── Generic info modal ────────────────────────────────────────────────────────
const showInfoModal = ref(false)
const infoModalContent = ref({ title: '', icon: '', description: '' })
function openInfoModal(content) {
  infoModalContent.value = content
  showInfoModal.value = true
}

// ── Water station alert modal ─────────────────────────────────────────────────
const waterStationAlerts = ref([])
const showWaterStationModal = ref(false)

// --- Inventory Location Modal ---
const { locationIds, getItemsForLocation, flagNeedsRestock: flagInventoryRestock } = useInventory()
const showInventoryLocationModal = ref(false)
const inventoryLocationItems = ref([])
const inventoryLocationIconId = ref('')
function openInventoryLocationModal(iconId) {
  inventoryLocationIconId.value = iconId
  inventoryLocationItems.value = getItemsForLocation(iconId).slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  showInventoryLocationModal.value = true
}
function closeInventoryLocationModal() {
  showInventoryLocationModal.value = false
  inventoryLocationItems.value = []
  inventoryLocationIconId.value = ''
}
const waterStationSubmitting = ref(false)
const waterStationError = ref('')
function openWaterStationModal() {
  waterStationError.value = ''
  showWaterStationModal.value = true
}
function closeWaterStationModal() {
  waterStationError.value = ''
  showWaterStationModal.value = false
}
async function submitWaterStationAlert() {
  waterStationSubmitting.value = true
  waterStationError.value = ''
  try {
    const userId = effectiveIdCode.value || 'ANONYMOUS'
    const userName = userId ? `User ${userId.slice(-5)}` : 'Anonymous'
    await addDoc(collection(reunion_db, 'alerts_2026'), {
      type: 'water_station',
      status: 'low',
      location: 'Water Station',
      message: 'Water station running low.',
      created_at: new Date().toISOString(),
      userId,
      userName
    })
    sendVolunteerCoordinator(`💧 *Water Station Alert*: Running low — reported by ${userName}`)
    showWaterStationModal.value = false
  } catch (e) {
    waterStationError.value = 'Failed to submit: ' + (e?.message || e)
  } finally {
    waterStationSubmitting.value = false
  }
}

// ── Showers instructions modal ────────────────────────────────────────────────
const showShowersModal = ref(false)

// ── Firepit firewood alert modal ──────────────────────────────────────────────
const firewoodAlerts = ref([])
const showFirepitModal = ref(false)
const firewoodSubmitting = ref(false)
const firewoodError = ref('')
function openFirepitModal() {
  firewoodError.value = ''
  showFirepitModal.value = true
}
function closeFirepitModal() {
  firewoodError.value = ''
  showFirepitModal.value = false
}
async function submitFirewoodAlert() {
  firewoodSubmitting.value = true
  firewoodError.value = ''
  try {
    const userId = effectiveIdCode.value || 'ANONYMOUS'
    const userName = userId ? `User ${userId.slice(-5)}` : 'Anonymous'
    await addDoc(collection(reunion_db, 'alerts_2026'), {
      type: 'firewood',
      status: 'needed',
      location: 'Fire Pit',
      message: 'More firewood needed at the fire pit.',
      created_at: new Date().toISOString(),
      userId,
      userName
    })
    sendVolunteerCoordinator(`🔥 *Firewood Alert*: More firewood needed at fire pit — reported by ${userName}`)
    showFirepitModal.value = false
  } catch (e) {
    firewoodError.value = 'Failed to submit: ' + (e?.message || e)
  } finally {
    firewoodSubmitting.value = false
  }
}

async function submitWashroomSupplyAlert() {
  washroomSupplySubmitting.value = true
  washroomSupplyError.value = ''
  try {
    const col = collection(reunion_db, 'alerts_2026')
    const userId = effectiveIdCode.value || 'ANONYMOUS'
    const userName = userId ? `User ${userId.slice(-5)}` : 'Anonymous'
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
  startLongPress(e.clientX, e.clientY)
}
function onMouseMove(e) {
  if (!isDragging.value) return
  const dx = e.clientX - dragLast.value.x
  const dy = e.clientY - dragLast.value.y
  dragLast.value = { x: e.clientX, y: e.clientY }
  const { tx, ty } = clampTranslate(mapTranslateX.value + dx, mapTranslateY.value + dy, mapScale.value)
  mapTranslateX.value = tx
  mapTranslateY.value = ty
  checkLongPressMoved(e.clientX, e.clientY)
}
function onMouseUp() { isDragging.value = false; cancelLongPress() }

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
    cancelLongPress()
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
    startLongPress(e.touches[0].clientX, e.touches[0].clientY)
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
    checkLongPressMoved(e.touches[0].clientX, e.touches[0].clientY)
  }
}
function onTouchEnd(e) {
  if (e.touches.length < 2) pinchStartDist.value = 0
  if (e.touches.length === 1) dragLast.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  cancelLongPress()
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

onMounted(async () => {
  fetchAndUpdateCurrentAct()
  fetchParticipantFullname()
  listenToAlerts()
  listenToCheckins()
  listenToVolunteerShifts()
  setInterval(pruneCheckins, 30_000)
  // Inline the SVG so CSS transforms stay vector-crisp (no rasterization)
  const res = await fetch(reunionMapUrl)
  const svgText = await res.text()
  inlineSvgContent.value = svgText
  await nextTick()
  setupSvgListeners()
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
       @dblclick="onMapDblClick"
       @touchstart.passive="onTouchStart"
       @touchmove.prevent="onTouchMove"
       @touchend="onTouchEnd">
    <!-- map-zoom-wrapper: transform applied here so overlays move with the map -->
    <div class="map-zoom-wrapper" :style="zoomStyle">

    <!-- Inline SVG for crisp vector rendering at any zoom level -->
    <div ref="mapSvgContainer" class="festival-map" v-html="inlineSvgContent"></div>

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
        <button class="alert-post-btn" @click="openWashroomSupplyModal">Report Low</button>
      </div>
    </template>

    <!-- Lost & Found overlay -->
    <template v-if="showLostFoundOverlay && lostFoundOverlays.length">
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
                &nbsp;·&nbsp;
              </span>
            </template>
            <template v-else>No items reported</template>
          </span>
        </div>
        <p class="lostfound-hint">Long-press map to pin an item</p>
      </div>
    </template>

    <!-- Lost & Found map pins — one per reported item that has a saved position -->
    <template v-for="item in lostFoundItems" :key="'lfpin-' + item.id">
      <div
        v-if="item.pos"
        class="lostfound-pin"
        :class="{ 'lostfound-pin--claimed': item.claimed }"
        :style="{ left: (item.pos.pctX * 100) + '%', top: (item.pos.pctY * 100) + '%' }"
        @click.stop="openLostFoundDetail(item)"
        :title="item.claimed ? '✅ Claimed: ' + item.message : item.message"
      >{{ item.claimed ? '✅' : '🧳' }}</div>
    </template>
    <!-- Check-in overlay -->
    <template v-if="showCheckinOverlay && checkinOverlays.length">
      <div
        v-for="overlay in checkinOverlays"
        :key="overlay.label"
        class="checkin-overlay map-feature-overlay"
        :style="overlay.style"
      >
        <div class="now-badge checkin-badge">✅ RECENTLY ARRIVED</div>
        <div class="ticker-wrap">
          <span class="ticker-text">
            <template v-if="checkinNames.length">
              <span v-for="person in checkinNames" :key="person.id">
                {{ person.fullname }}
                &nbsp;·&nbsp;
              </span>
            </template>
            <template v-else>No recent arrivals</template>
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

    <!-- Lost & Found Report / Edit Modal -->
    <Transition name="bio">
      <div v-if="showLostFoundModal" class="bio-card">
        <button class="bio-close" @click.stop="showLostFoundModal = false; lostFoundPendingPos = null">✕</button>
        <div class="modal-title-row"><img :src="iconLostFound" alt="" class="modal-icon" /><h3>{{ editingLostFoundId ? 'Edit' : 'Report' }} Lost &amp; Found Item</h3></div>
        <p v-if="!editingLostFoundId" class="bio-text" style="font-size:0.8rem;color:rgba(255,255,255,0.5);margin:0 0 0.5rem;">📍 Pin placed at your selected map location</p>
        <textarea class="modal-input" v-model="alertInput.message" placeholder="Describe the item — colour, size, where you found/lost it..." rows="3" style="resize:none;"></textarea>
        <div class="modal-actions">
          <button class="modal-btn modal-btn--ghost" type="button" @click.stop="showLostFoundModal = false; lostFoundPendingPos = null">Cancel</button>
          <button class="modal-btn modal-btn--primary" :disabled="!alertInput.message?.trim()" @click="submitAlert">{{ editingLostFoundId ? 'Save' : 'Report' }}</button>
        </div>
      </div>
    </Transition>

    <!-- Lost & Found Detail Card — opens when a pin is tapped -->
    <Transition name="bio">
      <div v-if="showLostFoundDetailCard && selectedLostFoundItem" class="bio-card">
        <button class="bio-close" @click.stop="showLostFoundDetailCard = false">✕</button>
        <div class="modal-title-row"><img :src="iconLostFound" alt="" class="modal-icon" /><h3>Lost &amp; Found</h3></div>
        <p class="bio-text">{{ selectedLostFoundItem.message }}</p>
        <p class="bio-text" style="font-size:0.78rem;color:rgba(255,255,255,0.4);margin-top:0.4rem;">Reported by {{ selectedLostFoundItem.userName || 'anonymous' }}</p>
        <!-- Claimed status -->
        <p v-if="selectedLostFoundItem.claimed" class="bio-text" style="font-size:0.82rem;color:#7ddb7d;margin-top:0.35rem;">✅ Claimed by {{ selectedLostFoundItem.claimedByName || 'someone' }}</p>
        <div class="modal-actions">
          <!-- Owner: edit -->
          <button
            v-if="effectiveIdCode && selectedLostFoundItem.userId === effectiveIdCode"
            class="modal-btn modal-btn--ghost"
            @click.stop="showLostFoundDetailCard = false; openLostFoundModal(selectedLostFoundItem)"
          >✎ Edit</button>
          <!-- Any other user (not owner, not claimed): claim it -->
          <button
            v-if="effectiveIdCode && selectedLostFoundItem.userId !== effectiveIdCode && !selectedLostFoundItem.claimed"
            class="modal-btn modal-btn--primary"
            @click.stop="claimLostFoundItem(selectedLostFoundItem)"
          >This is mine!</button>
          <!-- Admin: delete -->
          <button
            v-if="isVolunteerOrAdmin"
            class="modal-btn modal-btn--ghost"
            style="color:#f88"
            @click.stop="clearAlert(selectedLostFoundItem); showLostFoundDetailCard = false"
          >✕ Delete</button>
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

        <!-- ── Festival ended ── -->
        <template v-if="festivalEnded">
          <p class="bio-text" style="color:rgba(255,255,255,0.5);margin:0.75rem 0 0;">Festival has ended · Thank you for volunteering! 🙏</p>
        </template>

        <!-- ── Festival active: show live shift status ── -->
        <template v-else-if="isFestivalActive">
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
        </template>

        <!-- ── Pre-festival: team sign-ups are open for this phase ── -->
        <template v-else-if="currentPhaseTeams.includes(selectedShiftTeam)">
          <p class="bio-genre bio-genre--upcoming" style="margin-top:0.75rem;">▷ CLAIM A SHIFT</p>
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
          <p v-else class="bio-text bio-empty">No shifts scheduled yet.</p>
        </template>

        <!-- ── Pre-festival: team not yet open for sign-ups ── -->
        <template v-else>
          <p class="bio-text" style="color:rgba(255,255,255,0.5);margin:0.75rem 0 0;">
            Sign-ups for <strong>{{ selectedShiftTeam }}</strong> open on {{ formatPhaseDate(teamPhaseOpenDate(selectedShiftTeam)) }}.
          </p>
        </template>
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
        <label class="settings-row">
          <span>Recently Arrived</span>
          <input type="checkbox" v-model="showCheckinOverlay" />
        </label>
        <label class="settings-row">
          <span>Lost &amp; Found</span>
          <input type="checkbox" v-model="showLostFoundOverlay" />
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

  <!-- Water Station Alert Modal -->
  <Transition name="bio">
    <div v-if="showWaterStationModal" class="bio-card">
      <button class="bio-close" @click.stop="closeWaterStationModal">✕</button>
      <div class="modal-title-row"><img :src="iconPotableWater" alt="" class="modal-icon" /><h3>Water Station</h3></div>
      <template v-if="waterStationAlerts.length">
        <p class="bio-genre" style="margin-top:0.5rem;">Active alerts:</p>
        <div v-for="alert in waterStationAlerts" :key="alert.id" class="shift-row" style="margin-bottom:0.3rem;">
          <p class="bio-text" style="color:#ffb347;margin:0;">⚠ {{ alert.message }}</p>
          <button v-if="isVolunteerOrAdmin" class="alert-clear-btn" @click.stop="clearAlert(alert)">✕</button>
        </div>
      </template>
      <template v-else>
        <p class="bio-text" style="margin-top:0.5rem;">No active water alerts. Is it running low?</p>
      </template>
      <div class="modal-actions" style="margin-top:1rem;">
        <button class="modal-btn modal-btn--ghost" type="button" @click.stop="closeWaterStationModal">Cancel</button>
        <button class="modal-btn modal-btn--primary" :disabled="waterStationSubmitting" @click="submitWaterStationAlert">
          {{ waterStationSubmitting ? 'Reporting...' : '💧 Report running low' }}
        </button>
      </div>
      <p v-if="waterStationError" class="modal-error">{{ waterStationError }}</p>
    </div>
  </Transition>

  <!-- Showers Instructions Modal -->
  <Transition name="bio">
    <div v-if="showShowersModal" class="bio-card">
      <button class="bio-close" @click.stop="showShowersModal = false">✕</button>
      <div class="modal-title-row"><img :src="iconShowers" alt="" class="modal-icon" /><h3>Heated Shower Station</h3></div>
      <ol class="shower-steps">
        <li>Turn the <strong>propane valve</strong> on the tank counter-clockwise to open.</li>
        <li>Press the <strong>igniter button</strong> on the water heater until it lights — you'll hear a click and see a flame indicator.</li>
        <li>Wait <strong>~30 seconds</strong> for the water to heat up, then adjust the temperature knob.</li>
        <li>Turn on the shower tap and enjoy!</li>
        <li>When finished, turn the <strong>propane valve back off</strong>.</li>
      </ol>
      <p class="bio-text" style="color:rgba(255,255,255,0.5);font-size:0.8rem;margin-top:0.75rem;">If the heater won't light after 3 tries, find a volunteer.</p>
    </div>
  </Transition>

  <!-- Firepit Firewood Alert Modal -->
  <Transition name="bio">
    <div v-if="showFirepitModal" class="bio-card">
      <button class="bio-close" @click.stop="closeFirepitModal">✕</button>
      <div class="modal-title-row"><img :src="iconFlame" alt="" class="modal-icon" /><h3>Fire Pit</h3></div>
      <template v-if="firewoodAlerts.length">
        <p class="bio-genre" style="margin-top:0.5rem;">Active alerts:</p>
        <div v-for="alert in firewoodAlerts" :key="alert.id" class="shift-row" style="margin-bottom:0.3rem;">
          <p class="bio-text" style="color:#ffb347;margin:0;">⚠ {{ alert.message }}</p>
          <button v-if="isVolunteerOrAdmin" class="alert-clear-btn" @click.stop="clearAlert(alert)">✕</button>
        </div>
      </template>
      <template v-else>
        <p class="bio-text" style="margin-top:0.5rem;">Running low on firewood? Let volunteers know.</p>
      </template>
      <p class="bio-text" style="color:rgba(255,255,255,0.45);font-size:0.8rem;margin-top:0.3rem;">Community fire pit — open after dusk. Keep flammable items back and don't leave fires unattended.</p>
      <div class="modal-actions" style="margin-top:1rem;">
        <button class="modal-btn modal-btn--ghost" type="button" @click.stop="closeFirepitModal">Cancel</button>
        <button class="modal-btn modal-btn--primary" :disabled="firewoodSubmitting" @click="submitFirewoodAlert">
          {{ firewoodSubmitting ? 'Reporting...' : '🪵 Request more firewood' }}
        </button>
      </div>
      <p v-if="firewoodError" class="modal-error">{{ firewoodError }}</p>
    </div>
  </Transition>

  <!-- Generic Info Modal -->
  <Transition name="bio">
    <div v-if="showInfoModal" class="bio-card">
      <button class="bio-close" @click.stop="showInfoModal = false">✕</button>
      <div class="modal-title-row">
        <img v-if="infoModalContent.icon" :src="infoModalContent.icon" alt="" class="modal-icon" />
        <h3 style="margin:0;">{{ infoModalContent.title }}</h3>
      </div>
      <p class="bio-text" style="margin-top:0.75rem;">{{ infoModalContent.description }}</p>
    </div>
  </Transition>

  <!-- Inventory Storage Location Modal -->
  <Transition name="bio">
    <div v-if="showInventoryLocationModal" class="bio-card">
      <button class="bio-close" @click.stop="closeInventoryLocationModal">✕</button>
      <div class="modal-title-row">
        <span style="font-size:1.5rem;">📦</span>
        <h3 style="margin:0;text-transform:capitalize;">
          {{ inventoryLocationIconId.replace(/_icon$/, '').replace(/_/g, ' ') }}
        </h3>
      </div>
      <p class="bio-genre" style="margin-top:0.5rem;">Items stored here:</p>
      <div
        v-for="item in inventoryLocationItems"
        :key="item.id"
        class="inv-item-row"
      >
        <div class="inv-item-main">
          <span class="inv-item-name">{{ item.name }}</span>
          <span v-if="item.needs_restock" class="inv-needs-restock">⚠️ Restock</span>
          <button
            v-else-if="isVolunteerOrAdmin"
            class="inv-flag-btn"
            title="Flag needs restock"
            @click.stop="flagInventoryRestock(item.id, true)"
          >🚩</button>
        </div>
        <div v-if="item.sub_location || item.notes" class="inv-item-sub">
          <span v-if="item.sub_location">› {{ item.sub_location }}</span>
          <span v-if="item.notes">{{ item.notes }}</span>
        </div>
      </div>
      <div class="modal-actions" style="margin-top:1rem;">
        <button class="modal-btn modal-btn--ghost" @click.stop="closeInventoryLocationModal">Close</button>
      </div>
    </div>
  </Transition>

  </div><!-- /.map-backdrop -->
</template>

<style scoped>

.modal-emoji {
  font-size: 1.6rem;
  line-height: 1;
  margin-right: 0.4rem;
}

.shower-steps {
  margin: 0.75rem 0 0;
  padding-left: 1.4rem;
  color: rgba(255,255,255,0.85);
  font-size: 0.88rem;
  line-height: 1.6;
}
.shower-steps li {
  margin-bottom: 0.45rem;
}

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

/* Injected SVG (via v-html) bypasses scoped — :deep targets it */
.festival-map :deep(svg) {
  width: 100%;
  height: auto;
  display: block;
}

/* Cancel the global `svg { fill/stroke: white }` rule — the map SVG has its own fills */
.festival-map :deep(svg),
.festival-map :deep(svg *) {
  fill: unset;
  stroke: unset;
  stroke-width: unset;
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
  .festival-map :deep(svg) {
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
  width: 90px;
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
  width: 80px;
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

/* ── Lost & Found pins ──────────────────────────────────────────────────────── */
.lostfound-pin {
  position: absolute;
  transform: translate(-50%, -100%);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  z-index: 15;
  pointer-events: all;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.65));
  transition: transform 0.12s;
  user-select: none;
}
.lostfound-pin:hover {
  transform: translate(-50%, -110%) scale(1.2);
}
.lostfound-pin--claimed {
  opacity: 0.55;
}
/* ── Inventory location modal items ────────────────────────────────────────── */
.inv-item-row {
  padding: 0.22rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.inv-item-row:last-child {
  border-bottom: none;
}
.inv-item-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
}
.inv-item-name {
  font-size: 0.84rem;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
}
.inv-needs-restock {
  font-size: 0.7rem;
  color: #ffa726;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}
.inv-flag-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.28);
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
  transition: color 0.15s;
}
.inv-flag-btn:hover { color: #ffa726; }
.inv-item-sub {
  font-size: 0.74rem;
  color: rgba(255,255,255,0.38);
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.08rem;
}

.lostfound-hint {
  font-size: 7px;
  color: rgba(255,255,255,0.52);
  text-align: center;
  margin: 3px 0 0;
  font-style: italic;
  white-space: nowrap;
}

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
  /* no will-change: transform — that rasterizes the layer and causes pixelation */
}

</style>
