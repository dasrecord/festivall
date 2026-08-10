<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { BITCOIN_BLOCK_PARTY as BBP } from '@/config/bitcoinBlockPartyConfig.js'
import { useBbpSchedule } from '@/composables/useBbpSchedule.js'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'
import { useReunionPosterData } from '@/composables/useReunionPosterData.js'
import { useReunionAdmin } from '@/composables/useReunionAdmin.js'

interface ScheduleItem {
  label: string
  time?: string
  note?: string
}

const props = withDefaults(defineProps<{
  src: string
  hint?: string
  hintTitle?: string
  hintBody?: string
  showBitcoinBlockPartyInfo?: boolean
  showReunionInfo?: boolean
}>(), {
  hint: 'REUNION 2026<br>This year is going to be Iconic',
  hintTitle: 'REUNION 2026',
  hintBody: 'This year is going to be Iconic',
  showBitcoinBlockPartyInfo: false,
  showReunionInfo: false,
})
const emit = defineEmits<{ dismissed: [] }>()

const visible = ref(true)
const secondsLeft = ref(60)
let countdown: ReturnType<typeof setInterval> | null = null

// ── Inline SVG ────────────────────────────────────────────────────────────────
const inlineSvgContent = ref('')
const svgLoadError = ref(false)

// ── Pan & zoom state ──────────────────────────────────────────────────────────
const posterContainer = ref<HTMLElement | null>(null)
const posterZoomWrapperEl = ref<HTMLElement | null>(null)
const mapScale = ref(1)
const mapTx = ref(0)
const mapTy = ref(0)
const isDragging = ref(false)
const dragLast = ref({ x: 0, y: 0 })
const dragMoved = ref(false)
const MIN_SCALE = 1
const MAX_SCALE = 10

const zoomStyle = computed(() => ({
  transform: `translate(${mapTx.value}px, ${mapTy.value}px) scale(${mapScale.value})`,
  transformOrigin: '0 0',
  cursor: isDragging.value ? 'grabbing' : mapScale.value > 1 ? 'grab' : 'default',
}))

function buildSplashLabel(item: ScheduleItem) {
  return item.note ? `${item.label}: ${item.note}` : item.label
}

// ── Live Firestore schedule (syncs with BBP Admin edits) ─────────────────────
const { itinerary: liveItinerary } = useBbpSchedule()

// ── Reunion Firestore data ────────────────────────────────────────────────────
const { signedArtists, signedWorkshops } = useReunionPosterData()
const { isAdmin } = useReunionAdmin()

async function exportReunionPoster() {
  if (!posterZoomWrapperEl.value) return

  // Store original transform
  const previousTransform = {
    scale: mapScale.value,
    tx: mapTx.value,
    ty: mapTy.value,
  }

  // Reset transform for export
  mapScale.value = 1
  mapTx.value = 0
  mapTy.value = 0

  await nextTick()

  try {
    // Import html2canvas dynamically
    const { default: html2canvas } = await import('html2canvas')

    // 300 DPI for print: 11×17 inches = 3300×5100 pixels
    const scale = 3300 / posterZoomWrapperEl.value.offsetWidth

    const canvas = await html2canvas(posterZoomWrapperEl.value, {
      scale,
      backgroundColor: null,
      logging: false,
      useCORS: true,
      allowTaint: true,
    })

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `reunion-2026-poster-${Date.now()}.png`
      link.click()
      URL.revokeObjectURL(url)
    }, 'image/png', 1.0)
  } catch (error) {
    console.error('Export failed:', error)
    alert('Export failed. Please try again.')
  } finally {
    // Restore original transform
    mapScale.value = previousTransform.scale
    mapTx.value = previousTransform.tx
    mapTy.value = previousTransform.ty
  }
}

const reunionDateStr = computed(() => {
  const { year, month, day, endDay } = REUNION_FESTIVAL
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[month - 1]} ${day}–${endDay}, ${year}`
})

const reunionPricingRows = computed(() => [
  { label: 'Weekend Pass', value: `$${REUNION_FESTIVAL.pricing.weekendPass}` },
  { label: 'Day Pass', value: `$${REUNION_FESTIVAL.pricing.dayPass}` },
  { label: 'Meal Package', value: `$${REUNION_FESTIVAL.pricing.mealPackage}` },
])

const reunionAgesRows = computed(() =>
  Object.entries(REUNION_FESTIVAL.ages).map(([label, value]) => ({ label, value }))
)

const bbpSplashRows = computed(() => {
  // Use live Firestore schedule instead of static config so admin edits propagate
  const rows = ((liveItinerary.value || []) as unknown as ScheduleItem[]).filter((item) => item.label !== 'Doors Close')
  return rows.map((item) => ({
    time: item.time || 'TBA',
    label: buildSplashLabel(item),
  }))
})

function clampTranslate(tx: number, ty: number, s: number) {
  if (!posterContainer.value || !posterZoomWrapperEl.value) return { tx, ty }
  const cw = posterContainer.value.clientWidth
  const ch = posterContainer.value.clientHeight
  const ww = posterZoomWrapperEl.value.clientWidth
  const wh = posterZoomWrapperEl.value.clientHeight
  // When scaled wrapper fits inside container, keep it centered; otherwise clamp to edges
  const minTx = cw - ww * s
  const clampedTx = minTx > 0 ? (cw - ww * s) / 2 : Math.min(0, Math.max(minTx, tx))
  const minTy = ch - wh * s
  const clampedTy = minTy > 0 ? (ch - wh * s) / 2 : Math.min(0, Math.max(minTy, ty))
  return { tx: clampedTx, ty: clampedTy }
}

function resetTransform() {
  if (!posterContainer.value || !posterZoomWrapperEl.value) return
  mapScale.value = 1
  mapTx.value = (posterContainer.value.clientWidth - posterZoomWrapperEl.value.clientWidth) / 2
  mapTy.value = (posterContainer.value.clientHeight - posterZoomWrapperEl.value.clientHeight) / 2
}

function applyZoom(newScale: number, pivotX: number, pivotY: number) {
  const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale))
  const mx = (pivotX - mapTx.value) / mapScale.value
  const my = (pivotY - mapTy.value) / mapScale.value
  const { tx, ty } = clampTranslate(pivotX - mx * s, pivotY - my * s, s)
  mapScale.value = s
  mapTx.value = tx
  mapTy.value = ty
}

// ── Mouse ─────────────────────────────────────────────────────────────────────
function onWheel(e: WheelEvent) {
  if (!posterContainer.value) return
  const rect = posterContainer.value.getBoundingClientRect()
  applyZoom(mapScale.value * (e.deltaY < 0 ? 1.1 : 0.9), e.clientX - rect.left, e.clientY - rect.top)
}

function onMouseDown(e: MouseEvent) {
  if (e.button !== 0) return
  isDragging.value = true
  dragMoved.value = false
  dragLast.value = { x: e.clientX, y: e.clientY }
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  const dx = e.clientX - dragLast.value.x
  const dy = e.clientY - dragLast.value.y
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved.value = true
  dragLast.value = { x: e.clientX, y: e.clientY }
  const { tx, ty } = clampTranslate(mapTx.value + dx, mapTy.value + dy, mapScale.value)
  mapTx.value = tx
  mapTy.value = ty
}

function onMouseUp(e: MouseEvent) {
  if (isDragging.value && !dragMoved.value) {
    e.preventDefault()
    e.stopPropagation()
    dismiss()
  }
  isDragging.value = false
}

// ── Touch ─────────────────────────────────────────────────────────────────────
const pinch = ref({ dist: 0, scale: 1, tx: 0, ty: 0, midX: 0, midY: 0 })
const touchMoved = ref(false)

function getTouchDist(touches: TouchList) {
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 2) {
    touchMoved.value = true // 2-finger = definitely not a tap
    if (!posterContainer.value) return
    const rect = posterContainer.value.getBoundingClientRect()
    pinch.value = {
      dist: getTouchDist(e.touches),
      scale: mapScale.value,
      tx: mapTx.value,
      ty: mapTy.value,
      midX: (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left,
      midY: (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top,
    }
  } else if (e.touches.length === 1) {
    touchMoved.value = false
    dragLast.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length === 2 && pinch.value.dist > 0) {
    const p = pinch.value
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, p.scale * (getTouchDist(e.touches) / p.dist)))
    if (!posterContainer.value) return
    const rect = posterContainer.value.getBoundingClientRect()
    const curMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left
    const curMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top
    const mx = (p.midX - p.tx) / p.scale
    const my = (p.midY - p.ty) / p.scale
    const { tx, ty } = clampTranslate(curMidX - mx * newScale, curMidY - my * newScale, newScale)
    mapScale.value = newScale
    mapTx.value = tx
    mapTy.value = ty
  } else if (e.touches.length === 1) {
    const dx = e.touches[0].clientX - dragLast.value.x
    const dy = e.touches[0].clientY - dragLast.value.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) touchMoved.value = true
    dragLast.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    const { tx, ty } = clampTranslate(mapTx.value + dx, mapTy.value + dy, mapScale.value)
    mapTx.value = tx
    mapTy.value = ty
  }
}

function onTouchEnd(e: TouchEvent) {
  if (e.touches.length < 2) pinch.value.dist = 0
  if (e.touches.length === 0 && !touchMoved.value) {
    e.preventDefault()
    e.stopPropagation()
    dismiss()
  }
  if (e.touches.length === 1) dragLast.value = { x: e.touches[0].clientX, y: e.touches[0].clientY }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
const dismiss = () => {
  visible.value = false
  emit('dismissed')
}

onMounted(async () => {
  countdown = setInterval(() => {
    secondsLeft.value--
    if (secondsLeft.value <= 0) {
      clearInterval(countdown!)
      dismiss()
    }
  }, 1000)

  try {
    if (!props.src.endsWith('.svg')) throw new Error('not svg')
    const res = await fetch(props.src)
    if (!res.ok) throw new Error('fetch failed')
    inlineSvgContent.value = await res.text()
    await nextTick()
    resetTransform()
  } catch {
    svgLoadError.value = true
    await nextTick()
    resetTransform()
  }
})

onBeforeUnmount(() => {
  if (countdown) clearInterval(countdown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="poster-fade">
      <div v-if="visible" class="poster-splash">
        <div
          ref="posterContainer"
          class="poster-container"
          @wheel.prevent="onWheel"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp"
          @touchstart.passive="onTouchStart"
          @touchmove.prevent="onTouchMove"
          @touchend="onTouchEnd"
        >
          <div            ref="posterZoomWrapperEl"            class="poster-zoom-wrapper"
            :class="{
              'poster-zoom-wrapper--bbp': props.showBitcoinBlockPartyInfo,
              'poster-zoom-wrapper--reunion': props.showReunionInfo,
            }"
            :style="zoomStyle"
          >
            <!-- Inline SVG: crisp vector at any zoom level -->
            <div v-if="!svgLoadError" class="poster-svg-host" v-html="inlineSvgContent" />
            <!-- Fallback if fetch fails -->
            <img v-else :src="props.src" class="poster-img-fallback" alt="Reunion Festival Poster" />
            <div v-if="props.showReunionInfo" class="reunion-splash-info" :style="{
              '--r-primary':     REUNION_FESTIVAL.poster.colorPrimary,
              '--r-accent':      REUNION_FESTIVAL.poster.colorAccent,
              '--r-fs-date':     REUNION_FESTIVAL.poster.fontSizes.date,
              '--r-fs-year':     REUNION_FESTIVAL.poster.fontSizes.year,
              '--r-fs-artists':  REUNION_FESTIVAL.poster.fontSizes.artists,
              '--r-fs-workshops':REUNION_FESTIVAL.poster.fontSizes.workshops,
              '--r-fs-pricing':  REUNION_FESTIVAL.poster.fontSizes.pricing,
              '--r-fs-ages':     REUNION_FESTIVAL.poster.fontSizes.ages,
            }">
              <!-- <div class="reunion-date">{{ reunionDateStr }}</div> -->
              <!-- <div class="reunion-year">{{ REUNION_FESTIVAL.year }}</div> -->
              <div class="reunion-artists">
                <span v-for="artist in signedArtists" :key="artist.id" class="reunion-artist-chip">{{ artist.act_name }}</span>
                <span v-if="!signedArtists.length" class="reunion-placeholder">Artists to be announced</span>
              </div>
              <div class="reunion-workshops">
                <span v-for="ws in signedWorkshops" :key="ws.id" class="reunion-workshop-chip">{{ ws.workshop_title }}</span>
                <span v-if="!signedWorkshops.length" class="reunion-placeholder">Workshops to be announced</span>
              </div>

              <!-- <div class="reunion-pricing">
                <div v-for="row in reunionPricingRows" :key="row.label" class="reunion-pricing-row">
                  <span class="reunion-pricing-label">{{ row.label }}</span>
                  <span class="reunion-pricing-value">{{ row.value }}</span>
                </div>
              </div> -->
              <!-- <div class="reunion-ages">
                <div v-for="row in reunionAgesRows" :key="row.label" class="reunion-ages-row">
                  <span class="reunion-ages-label">{{ row.label }}</span>
                  <span class="reunion-ages-value">{{ row.value }}</span>
                </div>
              </div> -->
            </div>
            <div v-if="props.showBitcoinBlockPartyInfo" class="bbp-splash-info">
              <p class="bbp-splash-eyebrow">{{ BBP.splash?.eyebrow || `${BBP.city} · Free Admission` }}</p>
              <p class="bbp-splash-date">{{ BBP.date }}</p>
              <p class="bbp-splash-venue">{{ BBP.venue }} · {{ BBP.startTime }} - {{ BBP.endTime }}</p>
              <div class="bbp-splash-divider"></div>
              <p class="bbp-splash-schedule-title">Day Schedule</p>
              <div class="bbp-splash-schedule">
                <div v-for="(row, idx) in bbpSplashRows" :key="`bbp-splash-${idx}`">
                  <span>{{ row.time }}</span><span>{{ row.label }}</span>
                </div>
              </div>
              <p class="bbp-splash-url">{{ BBP.splash?.ctaUrlLabel || 'bitcoinblockparty.festivall.ca' }}</p>
            </div>
          </div>
        </div>
        <div class="poster-hint" :class="{ 'poster-hint--bbp': props.showBitcoinBlockPartyInfo }">
          <span class="countdown">{{ secondsLeft }}</span>
          <span class="poster-hint-copy">
            <strong v-if="props.hintTitle">{{ props.hintTitle }}</strong>
            <span v-if="props.hintBody">{{ props.hintBody }}</span>
            <span v-else v-html="props.hint"></span>
          </span>
        </div>
        <button
          v-if="isAdmin && props.showReunionInfo"
          type="button"
          class="poster-export-button"
          title="Export poster as high-resolution PNG (300 DPI, 11×17 inches)"
          @click.stop="exportReunionPoster"
        >
          Export PNG
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* @font-face declarations are global even in scoped blocks */
@font-face {
  font-family: 'Organda MN';
  src: url('/fonts/Organda-MN-Regular.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Organda MN';
  src: url('/fonts/Organda-MN-Bold.otf') format('opentype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
.poster-splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: var(--bbp-black);
}

.poster-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.poster-zoom-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}
.poster-zoom-wrapper--bbp {
  position: absolute;
  left: 0;
  top: 0;
  width: min(100vw, calc(100dvh * 11 / 17));
  height: min(100dvh, calc(100vw * 17 / 11));
  container-type: inline-size;
}
/* Reunion 2026 poster: 792 × 1224 viewBox (11×17 at 72dpi) */
.poster-zoom-wrapper--reunion {
  position: absolute;
  left: 0;
  top: 0;
  width: min(100vw, calc(100dvh * 792 / 1224));
  height: min(100dvh, calc(100vw * 1224 / 792));
  container-type: inline-size;
}

/* ── Reunion HTML overlay ──────────────────────────────────────────────────── */
.reunion-splash-info {
  position: absolute;
  inset: 0;
  pointer-events: none;
  color: var(--r-primary);
  font-family: 'Organda MN', sans-serif;
}

/* Date — rect x=260.266 y=179.585 w=432.216 h=62.641 (viewBox 948×1698) */
.reunion-date {
  position: absolute;
  left: 27.45%; top: 10.57%; width: 45.59%; height: 3.69%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--r-fs-date);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--r-primary);
  overflow: hidden;
}

/* Year — polygon bounds x=365–583 y=242–316 */
.reunion-year {
  position: absolute;
  left: 38.51%; top: 14.26%; width: 22.97%; height: 4.34%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--r-fs-year);
  font-weight: 900;
  letter-spacing: 0.06em;
  color: var(--r-primary);
  overflow: hidden;
}

/* Artists — x=64.594 y=232.308 w=662.811 h=182.176 (viewBox 792×1224) */
.reunion-artists {
  position: absolute;
  left: 8.16%; top: 18.98%; width: 83.69%; height: 14.89%;
  display: flex;
  flex-wrap: wrap;
  align-content: space-between;
  justify-content: center;
  gap: 0rem 0rem;
  overflow: hidden;
  padding: 0.25rem 0;
}
.reunion-artist-chip {
  font-size: var(--r-fs-artists);
  font-weight: 700;
  line-height: 0.8;
  letter-spacing: 0.1em;
  font-kerning: normal;
  text-transform: uppercase;
  color: var(--r-primary);
  white-space: nowrap;
}
.reunion-artist-chip + .reunion-artist-chip::before {
  content: '·';
  margin-right: 0.25rem;
  opacity: 0.75;
}

/* Workshops — x=64.594 y=414.484 w=662.811 h=72.528 (viewBox 792×1224) */
.reunion-workshops {
  position: absolute;
  left: 8.16%; top: 33.86%; width: 83.69%; height: 5.93%;
  display: flex;
  flex-wrap: wrap;
  align-content: space-evenly;
  justify-content: center;
  gap: 0.1rem 0.6rem;
  overflow: hidden;
  padding: 0rem 0;
}
.reunion-workshop-chip {
  font-size: var(--r-fs-workshops);
  font-weight: 700;
  line-height: 0.75;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--r-accent);
  white-space: nowrap;
}
.reunion-workshop-chip + .reunion-workshop-chip::before {
  content: '·';
  margin-right: 0.35rem;
  opacity: 0.45;
}

.reunion-placeholder {
  font-size: var(--r-fs-workshops);
  opacity: 0.45;
  font-style: italic;
}

/* Pricing — rect x=127 y=931 w=276 h=149 */
.reunion-pricing {
  position: absolute;
  left: 13.42%; top: 54.84%; width: 29.09%; height: 8.77%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.1rem;
  overflow: hidden;
  padding: 0 0.25rem;
}
.reunion-pricing-row {
  display: flex;
  justify-content: space-between;
  gap: 0.4rem;
  font-size: var(--r-fs-pricing);
  line-height: 1.25;
}
.reunion-pricing-label { color: var(--r-accent); }
.reunion-pricing-value { font-weight: 700; white-space: nowrap; color: var(--r-primary); }

/* Ages — polygon bounds x=552–817 y=930–1082 */
.reunion-ages {
  position: absolute;
  left: 58.22%; top: 54.79%; width: 28.02%; height: 8.91%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.1rem;
  overflow: hidden;
  padding: 0 0.25rem;
}
.reunion-ages-row {
  display: flex;
  justify-content: space-between;
  gap: 0.3rem;
  font-size: var(--r-fs-ages);
  line-height: 1.25;
}
.reunion-ages-label {
  color: var(--r-accent);
  text-transform: capitalize;
}
.reunion-ages-value {
  font-weight: 700;
  white-space: nowrap;
  text-transform: capitalize;
  color: var(--r-primary);
}

.poster-svg-host {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.poster-svg-host :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* Cancel the global `svg { fill/stroke: white }` rule — poster SVG has its own fills */
.poster-svg-host :deep(svg),
.poster-svg-host :deep(svg *) {
  fill: unset;
  stroke: unset;
  stroke-width: unset;
}

.poster-img-fallback {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.bbp-splash-info {
  position: absolute;
  left: 15%;
  top: 31.3%;
  width: 70%;
  height: 37.3%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  overflow: hidden;
  color: var(--bbp-white);
  font-family: var(--bbp-font-family);
  pointer-events: none;

}
.bbp-splash-eyebrow {
  margin: 0 0 0.25rem;
  color: var(--bbp-yellow);
  font-size: clamp(0.5rem, 1.45cqw, 0.98rem);
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.bbp-splash-date {
  margin: 0 0 0.1rem;
  color: var(--bbp-blue);
  font-size: clamp(1.1rem, 3.2cqw, 2.1rem);
  font-weight: 800;
  line-height: 1.1;
}
.bbp-splash-venue {
  margin: 0 0 0.35rem;
  color: var(--bbp-yellow);
  font-size: clamp(0.72rem, 1.95cqw, 1.28rem);
  font-weight: 600;
}
.bbp-splash-divider {
  width: 32%;
  height: 2px;
  background: var(--bbp-teal);
  margin-bottom: 0.3rem;
}
.bbp-splash-schedule-title {
  margin: 0 0 0.18rem;
  color: var(--bbp-teal);
  font-size: clamp(0.48rem, 1.1cqw, 0.82rem);
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.bbp-splash-schedule {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.bbp-splash-schedule div {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.08rem 0;
  border-bottom: 1px solid color-mix(in srgb, var(--bbp-white) 10%, transparent);
  font-size: clamp(0.42rem, 1.5cqw, 1rem);
  line-height: 1.2;
}
.bbp-splash-schedule span:first-child {
  color: var(--bbp-teal);
  font-weight: 900;
  white-space: nowrap;
}
.bbp-splash-schedule span:last-child {
  color: var(--bbp-teal);
  text-align: right;
  font-weight: 700;
}
.bbp-splash-url {
  margin: 0.3rem 0 0;
  color: var(--bbp-red);
  font-size: clamp(0.62rem, 1.55cqw, 1.1rem);
  font-weight: 900;
  letter-spacing: 0.03em;
}

.poster-hint {
  position: fixed;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: color-mix(in srgb, var(--bbp-white) 75%, transparent);
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  pointer-events: none;
  background: var(--bbp-black);
  padding: 0.4rem 1rem;
  border-radius: 2rem;
  white-space: nowrap;
}
.poster-hint--bbp {
  bottom: max(2rem, env(safe-area-inset-bottom, 0px));
  align-items: flex-start;
  background: color-mix(in srgb, var(--bbp-black) 92%, transparent);
  border: 1px solid color-mix(in srgb, var(--bbp-white) 18%, transparent);
  padding: 0.75rem 1rem;
  border-radius: 0.85rem;
  width: min(92vw, 480px);
  white-space: normal;
  box-shadow: 0 12px 40px color-mix(in srgb, var(--bbp-black) 45%, transparent);
}

.poster-hint-copy {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
  line-height: 1.35;
}
.poster-hint--bbp .poster-hint-copy {
  align-items: flex-start;
}
.poster-hint-copy strong {
  color: var(--bbp-white);
  font-size: 0.95rem;
}
.poster-hint-copy span {
  color: color-mix(in srgb, var(--bbp-white) 72%, transparent);
  font-size: 0.78rem;
}

.countdown {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--bbp-white);
  min-width: 1.25ch;
  text-align: center;
}

.poster-export-button {
  position: fixed;
  top: max(1rem, env(safe-area-inset-top, 0px));
  right: max(1rem, env(safe-area-inset-right, 0px));
  z-index: 10001;
  border: 1px solid color-mix(in srgb, var(--bbp-white) 35%, transparent);
  border-radius: 6px;
  padding: 0.65rem 1rem;
  background: var(--bbp-black);
  color: var(--bbp-white);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.poster-fade-enter-active,
.poster-fade-leave-active {
  transition: opacity 0.6s ease;
}
.poster-fade-enter-from,
.poster-fade-leave-to {
  opacity: 0;
}
</style>
