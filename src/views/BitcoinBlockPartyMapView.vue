<template>
  <div class="bbpmap-page" :style="cssVars">
    <!-- ── Nav bar ─────────────────────────────────────────────────────────── -->
    <nav class="bbpmap-nav">
      <router-link :to="BBP.routes.landing" class="bbpmap-nav-back">← Bitcoin Block Party</router-link>
      <span class="bbpmap-nav-title">Venue Map</span>
      <div class="bbpmap-zoom-btns">
        <button @click="zoomToCenter(1.3)">+</button>
        <button @click="zoomToCenter(0.77)">−</button>
        <button @click="resetView">⊞</button>
      </div>
    </nav>

    <!-- ── Map container ──────────────────────────────────────────────────── -->
    <div
      ref="mapContainer"
      class="bbpmap-container"
      @wheel.prevent="onWheel"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div
        ref="mapSvgContainer"
        class="bbpmap-svg-wrapper"
        :style="zoomStyle"
        v-html="inlineSvgContent"
      />
    </div>

    <!-- ── Zone popup modal ───────────────────────────────────────────────── -->
    <transition name="bbp-modal-fade">
      <div v-if="activeZone" class="bbpmap-modal-overlay" @click.self="closeZoneModal">
        <div class="bbpmap-modal">
          <button class="bbpmap-modal-close" @click="closeZoneModal">✕</button>

          <div class="bbpmap-modal-heading">
            <img
              v-if="activeZoneIcon"
              :src="activeZoneIcon"
              :alt="`${activeZone.displayName} icon`"
              class="bbpmap-modal-icon"
            />
            <div>
              <!-- Tier badge -->
              <span v-if="activeZone.tier && activeZone.tier !== 'info'" class="bbpmap-modal-tier">
                {{ tierLabel(activeZone.tier) }}
              </span>

              <h2 class="bbpmap-modal-title">{{ activeZone.displayName }}</h2>
            </div>
          </div>
          <p class="bbpmap-modal-desc">{{ activeZone.shortDescription }}</p>

          <!-- type: admin — team bios + contact -->
          <template v-if="activeZone.type === 'admin'">
            <div class="bbpmap-modal-section">
              <h3>Organizers</h3>
              <div class="bbpmap-admin-list">
                <div v-for="admin in BBP.admins" :key="admin.name" class="bbpmap-admin-item">
                  <span class="bbpmap-admin-name">{{ admin.name }}</span>
                  <span v-if="admin.bio" class="bbpmap-admin-bio">{{ admin.bio }}</span>
                </div>
              </div>
              <p class="bbpmap-admin-email">
                <a :href="`mailto:${BBP.contactEmail}`">{{ BBP.contactEmail }}</a>
              </p>
            </div>
          </template>

          <!-- type: schedule — hours + itinerary -->
          <template v-if="activeZone.type === 'schedule'">
            <div class="bbpmap-modal-section">
              <h3>Today's Schedule</h3>
              <div class="bbpmap-schedule-list">
                <div v-for="(item, i) in BBP.itinerary" :key="i" class="bbpmap-schedule-row">
                  <span class="bbpmap-schedule-time">{{ item.time }}</span>
                  <span class="bbpmap-schedule-label">
                    {{ item.label }}<span v-if="item.note"> — {{ item.note }}</span>
                  </span>
                </div>
              </div>
            </div>
          </template>

          <!-- type: screenings — film list -->
          <template v-if="activeZone.type === 'screenings'">
            <div class="bbpmap-modal-section">
              <h3>Films</h3>
              <div v-for="film in BBP.screenings" :key="film.id" class="bbpmap-film-item">
                <span class="bbpmap-film-time">{{ film.time }}</span>
                <span class="bbpmap-film-title">{{ film.title }}</span>
                <p class="bbpmap-film-desc">{{ film.description }}</p>
                <p v-if="film.creator || film.director" class="bbpmap-film-credit">
                  Created by
                  <a
                    v-if="film.creatorUrl || film.directorUrl"
                    :href="film.creatorUrl || film.directorUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ film.creator || film.director }}
                  </a>
                  <span v-else>{{ film.creator || film.director }}</span>
                </p>
                <a
                  v-if="film.infoUrl"
                  :href="film.infoUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="bbpmap-modal-link"
                >
                  Film details →
                </a>
              </div>
            </div>
          </template>

          <!-- type: dj — DJ info -->
          <template v-if="activeZone.type === 'dj'">
            <div class="bbpmap-modal-section">
              <h3>DJs & Mixer</h3>
              <p class="bbpmap-dj-name">{{ BBP.dj.name !== 'TBA' ? BBP.dj.name : 'Lineup announced soon.' }}</p>
              <p class="bbpmap-dj-desc">{{ BBP.dj.shortDescription }}</p>
              <a v-if="BBP.dj.url" :href="BBP.dj.url" target="_blank" rel="noopener noreferrer" class="bbpmap-modal-link">
                More info →
              </a>
            </div>
          </template>

          <!-- type: sponsor / vendor / info — generic card -->
          <template v-if="['sponsor', 'vendor', 'info'].includes(activeZone.type) && activeZone.url">
            <a :href="activeZone.url" target="_blank" rel="noopener noreferrer" class="bbpmap-modal-link">
              Visit website →
            </a>
          </template>
        </div>
      </div>
    </transition>

    <!-- ── Loading placeholder ────────────────────────────────────────────── -->
    <div v-if="!inlineSvgContent" class="bbpmap-loading">Loading map…</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useHead } from '@vueuse/head'
import { BITCOIN_BLOCK_PARTY as BBP } from '@/config/bitcoinBlockPartyConfig.js'
import mapSvgUrl from '@/assets/images/bitcoin_block_party/bitcoin_blockparty_map_bg.svg?url'
import barIcon from '@/assets/images/icons/bar.png'
import bitcoinIcon from '@/assets/images/icons/bitcoin.png'
import bullIcon from '@/assets/images/icons/bull.png'
import djIcon from '@/assets/images/icons/dj.png'
import frontGateIcon from '@/assets/images/icons/front_gate.png'
import mealsIcon from '@/assets/images/icons/meals.png'
import projectorIcon from '@/assets/images/icons/projector.png'
import vendorIcon from '@/assets/images/icons/vendor.png'
import whaleIcon from '@/assets/images/icons/whale.png'

useHead({
  title: `Venue Map — Bitcoin Block Party ${BBP.year}`,
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

// ── Inline SVG load ──────────────────────────────────────────────────────────
const inlineSvgContent = ref('')
const mapContainer     = ref(null)
const mapSvgContainer  = ref(null)

const zoneIcons = {
  admin: frontGateIcon,
  bar: barIcon,
  bull: bullIcon,
  dj: djIcon,
  food: mealsIcon,
  meal: mealsIcon,
  meals: mealsIcon,
  front_gate: frontGateIcon,
  movie_screening: projectorIcon,
  satoshi: bitcoinIcon,
  screenings: projectorIcon,
  sponsor: bitcoinIcon,
  tba: bitcoinIcon,
  vendor: vendorIcon,
  whale: whaleIcon,
}

const directZoneIcons = {
  bar: 'bar',
  dj: 'dj',
  food_truck_0: 'meals',
  food_truck_1: 'meals',
  front_gate: 'front_gate',
  movie_screening: 'movie_screening',
  presenting_area: 'bitcoin',
}

async function loadSvg() {
  try {
    const res = await fetch(mapSvgUrl)
    inlineSvgContent.value = await res.text()
    // Wire click handlers after DOM update
    requestAnimationFrame(setupZoneListeners)
  } catch (e) {
    console.warn('Could not load map SVG:', e)
  }
}

// ── Zone click handlers ───────────────────────────────────────────────────────
// Zones are identified by SVG element IDs that start with 'map_zone_'
// or that match a known feature ID in BBP.mapZones.
const KNOWN_ZONE_IDS = new Set([
  'front_gate', 'presenting_area', 'presentation_area', 'movie_screening', 'dj',
  'food_truck_0', 'food_truck_1', 'bar',
  ...Array.from({ length: 7 }, (_v, i) => `vendor_${i}`),
  ...Array.from({ length: 5 }, (_v, i) => `bull_${i}`),
  ...Array.from({ length: 3 }, (_v, i) => `whale_${i}`),
])

const whaleSponsors = BBP.sponsors.filter(s => s.status === 'confirmed' && s.tier === 'whale')
const bullSponsors = BBP.sponsors.filter(s => s.status === 'confirmed' && (s.tier === 'bull' || s.tier === 'tba'))

function sponsorZoneData(sponsor) {
  return {
    type: 'sponsor',
    tier: sponsor.tier,
    icon: sponsor.tier,
    displayName: sponsor.displayName,
    shortDescription: sponsor.shortDescription || '',
    url: sponsor.url || null,
  }
}

function tierLabel(tierId) {
  if (tierId === 'tba') return 'Tier TBA'
  const tier = BBP.sponsorTiers.find(t => t.id === tierId)
  return tier ? tier.name : tierId
}

function zoneDataForId(id) {
  // Strip 'map_zone_' prefix if present
  const key = id.replace(/^map_zone_/, '')
  const configKey = key === 'presentation_area' ? 'presenting_area' : key

  // Direct match in config mapZones
  if (BBP.mapZones[configKey]) {
    return {
      icon: directZoneIcons[configKey],
      ...BBP.mapZones[configKey],
    }
  }

  // Vendor slots (vendor_0..vendor_6) → look up in BBP.vendors
  const vendorMatch = key.match(/^vendor_(\d+)$/)
  if (vendorMatch) {
    const vendor = BBP.vendors[parseInt(vendorMatch[1])]
    if (vendor) {
      return {
        type: 'vendor',
        tier: vendor.tier,
        icon: 'vendor',
        displayName: vendor.displayName,
        shortDescription: vendor.shortDescription || '',
        url: vendor.url || null,
      }
    }
    return {
      type: 'info',
      tier: 'vendor',
      icon: 'vendor',
      displayName: `Vendor Booth ${parseInt(vendorMatch[1]) + 1}`,
      shortDescription: 'Available vendor booth. All vendors at the event accept Bitcoin.',
      url: null,
    }
  }

  // Sponsor bull slots (bull_0..bull_4) → look up in BBP.sponsors
  const bullMatch = key.match(/^bull_(\d+)$/)
  if (bullMatch) {
    const sponsor = bullSponsors[parseInt(bullMatch[1])]
    if (sponsor) return sponsorZoneData(sponsor)
    return {
      type: 'info',
      tier: 'sponsor',
      icon: 'bull',
      displayName: `Sponsor Zone ${parseInt(bullMatch[1]) + 1}`,
      shortDescription: 'Reserved sponsor activation area.',
      url: null,
    }
  }

  // Whale slots (whale_0..whale_2) — reserved for future use
  const whaleMatch = key.match(/^whale_(\d+)$/)
  if (whaleMatch) {
    const sponsor = whaleSponsors[parseInt(whaleMatch[1])]
    if (sponsor) return sponsorZoneData(sponsor)
    return {
      type: 'info',
      tier: 'sponsor',
      icon: 'whale',
      displayName: `Whale Sponsor Zone ${parseInt(whaleMatch[1]) + 1}`,
      shortDescription: 'Reserved premium sponsor activation area.',
      url: null,
    }
  }

  return null
}

function setupZoneListeners() {
  const svgEl = mapSvgContainer.value?.querySelector('svg')
  if (!svgEl) return

  // Listen for clicks on elements whose id starts with 'map_zone_'
  // or whose id matches a known feature key.
  const candidates = svgEl.querySelectorAll('[id]')
  candidates.forEach(el => {
    const id = el.id
    const isZone = id.startsWith('map_zone_') || KNOWN_ZONE_IDS.has(id)
    if (!isZone) return
    el.style.cursor = 'pointer'
    el.style.pointerEvents = 'auto'
    el.addEventListener('click', () => handleZoneClick(id))
  })
}

// ── Active zone modal ─────────────────────────────────────────────────────────
const activeZone = ref(null)

const activeZoneIcon = computed(() => {
  if (!activeZone.value) return null
  return zoneIcons[activeZone.value.icon]
    || zoneIcons[activeZone.value.tier]
    || zoneIcons[activeZone.value.type]
    || null
})

function handleZoneClick(id) {
  const data = zoneDataForId(id)
  if (!data) return
  activeZone.value = data
}

function closeZoneModal() {
  activeZone.value = null
}

// ── CSS vars ─────────────────────────────────────────────────────────────────
const cssVars = computed(() => ({
  '--bbp-purple': BBP.palette.purple,
  '--bbp-teal':   BBP.palette.teal,
  '--bbp-orange': BBP.palette.orange,
  '--bbp-tan':    BBP.palette.tan,
  '--bbp-cream':  BBP.palette.cream,
}))

// ── Pan & zoom ────────────────────────────────────────────────────────────────
const MIN_SCALE = 1
const MAX_SCALE = 8

const mapScale      = ref(1)
const mapTranslateX = ref(0)
const mapTranslateY = ref(0)
const isDragging    = ref(false)
const dragLast      = ref({ x: 0, y: 0 })

const zoomStyle = computed(() => ({
  transform: `translate(${mapTranslateX.value}px, ${mapTranslateY.value}px) scale(${mapScale.value})`,
  transformOrigin: '0 0',
  cursor: isDragging.value ? 'grabbing' : mapScale.value > 1 ? 'grab' : 'default',
  transition: isDragging.value ? 'none' : 'transform 0.1s',
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
  const factor = e.deltaY < 0 ? 1.12 : 0.89
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

const pinchStartDist  = ref(0)
const pinchStartScale = ref(1)
const pinchStartTx    = ref(0)
const pinchStartTy    = ref(0)
const pinchMidX       = ref(0)
const pinchMidY       = ref(0)

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
    pinchMidX.value = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left
    pinchMidY.value = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top
  } else if (e.touches.length === 1) {
    dragLast.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
}
function onTouchMove(e) {
  if (e.touches.length === 2 && pinchStartDist.value > 0) {
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, pinchStartScale.value * (getTouchDist(e.touches) / pinchStartDist.value)))
    const mx = (pinchMidX.value - pinchStartTx.value) / pinchStartScale.value
    const my = (pinchMidY.value - pinchStartTy.value) / pinchStartScale.value
    if (!mapContainer.value) return
    const rect = mapContainer.value.getBoundingClientRect()
    const curX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left
    const curY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top
    const { tx, ty } = clampTranslate(curX - mx * newScale, curY - my * newScale, newScale)
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

function resetView() {
  mapScale.value = 1
  mapTranslateX.value = 0
  mapTranslateY.value = 0
}

// Keyboard escape to close modal
function onKeydown(e) {
  if (e.key === 'Escape') closeZoneModal()
}

onMounted(() => {
  loadSvg()
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
/* ── Layout ──────────────────────────────────────────────────────────────────── */
.bbpmap-page {
  display: flex;
  flex-direction: column;
  background: var(--bbp-cream);
  color: var(--bbp-teal);
  height: 100dvh;
  overflow: hidden;
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
}

/* ── Nav ─────────────────────────────────────────────────────────────────────── */
.bbpmap-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: rgba(0,0,0,0.3);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  flex-shrink: 0;
  gap: 1rem;
  z-index: 10;
}
.bbpmap-nav-back {
  color: var(--bbp-teal);
  text-decoration: none;
  font-size: 0.85rem;
  white-space: nowrap;
  transition: color 0.1s;
}
.bbpmap-nav-back:hover { color: var(--bbp-orange); }
.bbpmap-nav-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--bbp-teal);
}
.bbpmap-zoom-btns {
  display: flex;
  gap: 0.4rem;
}
.bbpmap-zoom-btns button {
  background: rgba(255,255,255,0.08);
  color: var(--bbp-teal);
  border: 1px solid rgba(7,94,114,0.35);
  border-radius: 4px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  transition: background 0.1s;
}
.bbpmap-zoom-btns button:hover { background: rgba(7,94,114,0.14); }

/* ── Map container ───────────────────────────────────────────────────────────── */
.bbpmap-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  user-select: none;
  touch-action: none;  background: var(--bbp-dark);}
.bbpmap-svg-wrapper {
  display: inline-block;
  width: 100%;
  height: 100%;
  min-width: 100vw;
  min-height: 100vh;
}
.bbpmap-svg-wrapper :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
  /* Counter the global base.css `svg { fill/stroke/stroke-width }` rule.
     SVG initial values: fill = black, stroke = none, stroke-width = 1.
     Elements with their own inline style="..." still override these normally. */
  fill: initial;
  stroke: initial;
  stroke-width: initial;
}
.bbpmap-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: var(--bbp-tan);
}

/* ── Modal ────────────────────────────────────────────────────────────────────── */
.bbpmap-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  padding: 0 0 env(safe-area-inset-bottom, 0);
}
.bbpmap-modal {
  background: var(--bbp-cream);
  border: 1px solid var(--bbp-tan);
  border-radius: 16px 16px 0 0;
  padding: 2rem 1.75rem 2.5rem;
  max-width: 480px;
  width: 100%;
  position: relative;
  max-height: 70vh;
  overflow-y: auto;
}
.bbpmap-modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(7,94,114,0.08);
  border: none;
  border-radius: 50%;
  color: var(--bbp-teal);
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bbpmap-modal-heading {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding-right: 2.5rem;
  margin-bottom: 0.5rem;
}
.bbpmap-modal-icon {
  flex: 0 0 46px;
  width: 46px;
  height: 46px;
  object-fit: contain;
  padding: 0.4rem;
  border-radius: 11px;
  background: var(--bbp-teal);
  border: 1px solid rgba(7,94,114,0.42);
}
.bbpmap-modal-tier {
  display: inline-block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--bbp-orange);
  margin-bottom: 0.4rem;
}
.bbpmap-modal-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--bbp-teal);
  margin: 0 0 0.5rem;
}
.bbpmap-modal-desc {
  font-size: 0.9rem;
  color: var(--bbp-dark);
  margin: 0 0 1.25rem;
  line-height: 1.55;
}
.bbpmap-modal-section {
  border-top: 1px solid var(--bbp-tan);
  padding-top: 1rem;
  margin-top: 0.5rem;
}
.bbpmap-modal-section h3 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--bbp-teal);
  margin: 0 0 0.85rem;
}
.bbpmap-modal-link {
  display: inline-block;
  margin-top: 1rem;
  color: var(--bbp-teal);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
}
.bbpmap-modal-link:hover { text-decoration: underline; }

/* ── Admin section ────────────────────────────────────────────────────────────── */
.bbpmap-admin-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.bbpmap-admin-item {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
}
.bbpmap-admin-name { font-weight: 700; font-size: 0.95rem; color: var(--bbp-teal); }
.bbpmap-admin-bio  { font-size: 0.82rem; color: var(--bbp-dark); }
.bbpmap-admin-email a {
  font-size: 0.85rem;
  color: var(--bbp-teal);
  text-decoration: none;
}
.bbpmap-admin-email a:hover { text-decoration: underline; }

/* ── Schedule in modal ────────────────────────────────────────────────────────── */
.bbpmap-schedule-list {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.bbpmap-schedule-row {
  display: flex;
  gap: 0.75rem;
  align-items: baseline;
  font-size: 0.88rem;
}
.bbpmap-schedule-time {
  font-weight: 700;
  color: var(--bbp-teal);
  min-width: 120px;
  font-size: 0.8rem;
}
.bbpmap-schedule-label { color: var(--bbp-dark); }

/* ── Film items ────────────────────────────────────────────────────────────────── */
.bbpmap-film-item { margin-bottom: 1rem; }
.bbpmap-film-time {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--bbp-teal);
  margin-bottom: 0.2rem;
}
.bbpmap-film-title {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: var(--bbp-teal);
  margin-bottom: 0.25rem;
}
.bbpmap-film-desc {
  font-size: 0.85rem;
  color: var(--bbp-dark);
  margin: 0;
  line-height: 1.55;
}
.bbpmap-film-credit {
  margin: 0.45rem 0 0;
  font-size: 0.8rem;
  color: var(--bbp-purple);
}
.bbpmap-film-credit a {
  color: var(--bbp-teal);
  font-weight: 700;
  text-decoration: none;
}
.bbpmap-film-credit a:hover { text-decoration: underline; }

/* ── DJ modal ──────────────────────────────────────────────────────────────────── */
.bbpmap-dj-name { font-size: 1.1rem; font-weight: 700; color: var(--bbp-teal); margin: 0 0 0.35rem; }
.bbpmap-dj-desc  { font-size: 0.87rem; color: var(--bbp-dark); margin: 0; }

/* ── Transition ──────────────────────────────────────────────────────────────── */
.bbp-modal-fade-enter-active, .bbp-modal-fade-leave-active {
  transition: opacity 0.2s;
}
.bbp-modal-fade-enter-from, .bbp-modal-fade-leave-to {
  opacity: 0;
}
.bbp-modal-fade-enter-active .bbpmap-modal,
.bbp-modal-fade-leave-active .bbpmap-modal {
  transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}
.bbp-modal-fade-enter-from .bbpmap-modal,
.bbp-modal-fade-leave-to .bbpmap-modal {
  transform: translateY(100%);
}
</style>
