<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import reunionMapUrl from '@/assets/images/reunion_map_(awesome_lathusca)_2026.svg?url'
import { useLineupState } from '@/composables/useLineupState'
import { REUNION_FESTIVAL } from '@/config/festivalConfig'

const { currentAct, upcomingAct, updateCurrentAct } = useLineupState()

const mapContainer = ref(null)
const mapObject = ref(null)

// ── Stage definitions ─────────────────────────────────────────────────────────
// Add an entry here for every stage_icon layer you add in Illustrator.
const STAGE_ICONS = [
  { svgId: 'stage_area', label: 'Main Stage', offsetX: 0, offsetY: +10 }
]

// ── Meals icon definition ─────────────────────────────────────────────────────
// svgId: name this layer 'meals_area' in Illustrator for live positioning.
// fallbackSvgPos: raw SVG coords used until the layer is named.
const MEAL_ICONS = [
  {
    svgId: 'meals_area',
    fallbackSvgPos: { x: 234.3, y: 268.69, w: 16, h: -2},
    offsetX: 10,
    offsetY: 0
  }
]

const stageOverlays = ref([]) // [{ label, style }]
const mealOverlays  = ref([]) // [{ style }]
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
