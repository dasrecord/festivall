<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { reunion_db } from '@/firebase'
import reunionMapUrl from '@/assets/images/reunion_map_(awesome_lathusca)_2026.svg?url'
import { useLineupState } from '@/composables/useLineupState'

const { currentAct, updateCurrentAct } = useLineupState()

const mapContainer = ref(null)
const mapObject = ref(null)

// ── Stage definitions ─────────────────────────────────────────────────────────
// Add an entry here for every stage_icon layer you add in Illustrator.
const STAGE_ICONS = [
  { svgId: 'stage_area', label: 'Main Stage', offsetX: 0, offsetY: +10 }
]

const stageOverlays = ref([]) // [{ label, style }]
const bioOpen = ref(false)

function positionOverlays() {
  const svgDoc = mapObject.value?.contentDocument
  if (!svgDoc) return

  const svgEl = svgDoc.querySelector('svg')
  if (!svgEl) return
  const vb = svgEl.viewBox.baseVal
  if (!vb || !vb.width || !vb.height) return

  stageOverlays.value = STAGE_ICONS.flatMap(({ svgId, label, offsetX = 0, offsetY = 0 }) => {
    const el = svgDoc.getElementById(svgId)
    if (!el) return []

    // getBBox() returns zeros for <use> elements referencing <symbol> in most
    // browsers — parse the transform + width/height attributes directly instead
    const transform = el.getAttribute('transform') || ''
    const m = transform.match(/translate\(\s*([\d.-]+)[\s,]+([\d.-]+)/)
    const x = m ? parseFloat(m[1]) : 0
    const y = m ? parseFloat(m[2]) : 0
    const w = parseFloat(el.getAttribute('width') || 0)
    const h = parseFloat(el.getAttribute('height') || 0)

    const xPct = ((x + w / 2 + offsetX) / vb.width)  * 100
    const yPct = ((y + h / 2 + offsetY) / vb.height) * 100
    return [{ label, style: { left: `${xPct}%`, top: `${yPct}%` } }]
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

    <!-- Now-playing overlay — positioned over #stage_area in the SVG -->
    <template v-if="currentAct">
      <div
        v-for="overlay in stageOverlays"
        :key="overlay.label"
        class="stage-overlay"
        :style="overlay.style"
        @click="bioOpen = !bioOpen"
      >
        <div class="now-badge">▶ NOW PLAYING</div>
        <div class="ticker-wrap">
          <span class="ticker-text">
            {{ currentAct.act_name || currentAct.workshop_title }}
            <template v-if="currentAct.genre">&nbsp;· {{ currentAct.genre }}</template>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {{ currentAct.act_name || currentAct.workshop_title }}
            <template v-if="currentAct.genre">&nbsp;· {{ currentAct.genre }}</template>
          </span>
        </div>
      </div>

      <!-- Bio card — shown on tap, dismissed by tapping X or outside -->
      <Transition name="bio">
        <div v-if="bioOpen" class="bio-card">
          <button class="bio-close" @click="bioOpen = false">✕</button>
          <p class="bio-act-name">{{ currentAct.act_name || currentAct.workshop_title }}</p>
          <p v-if="currentAct.genre" class="bio-genre">{{ currentAct.genre }}</p>
          <p v-if="currentAct.act_description" class="bio-text">{{ currentAct.act_description }}</p>
          <p v-else class="bio-text bio-empty">No bio available.</p>
        </div>
      </Transition>
    </template>
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

/* Text is doubled so the scroll loop is seamless */
.ticker-text {
  display: inline-block;
  padding-left: 100%;
  animation: ticker-scroll 9s linear infinite;
}

@keyframes ticker-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
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

.bio-text {
  font-size: 0.88rem;
  line-height: 1.55;
  margin: 0;
  color: rgba(255,255,255,0.88);
}

.bio-empty { font-style: italic; color: rgba(255,255,255,0.4); }

/* Transition */
.bio-enter-active, .bio-leave-active { transition: opacity 0.2s, transform 0.2s; }
.bio-enter-from, .bio-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }
</style>
