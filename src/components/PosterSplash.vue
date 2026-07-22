<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { BITCOIN_BLOCK_PARTY as BBP } from '@/config/bitcoinBlockPartyConfig.js'

const props = withDefaults(defineProps<{
  src: string
  hint?: string
  hintTitle?: string
  hintBody?: string
  showBitcoinBlockPartyInfo?: boolean
}>(), {
  hint: 'This was our 2025 poster.<br>The 2026 edition is going to be Iconic',
  hintTitle: '',
  hintBody: '',
  showBitcoinBlockPartyInfo: false,
})
const emit = defineEmits<{ dismissed: [] }>()

const visible = ref(true)
const secondsLeft = ref(30)
let countdown: ReturnType<typeof setInterval> | null = null

// ── Inline SVG ────────────────────────────────────────────────────────────────
const inlineSvgContent = ref('')
const svgLoadError = ref(false)

// ── Pan & zoom state ──────────────────────────────────────────────────────────
const posterContainer = ref<HTMLElement | null>(null)
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

const splashCssVars = computed(() => ({
  '--bbp-blue': BBP.palette.blue,
  '--bbp-teal': BBP.palette.teal,
  '--bbp-red': BBP.palette.red,
  '--bbp-yellow': BBP.palette.yellow,
  '--bbp-white': BBP.palette.white,
  '--bbp-black': BBP.palette.black,
}))

function buildSplashLabel(item: { label: string; note?: string }) {
  return item.note ? `${item.label}: ${item.note}` : item.label
}

const bbpSplashRows = computed(() => {
  const rows = (BBP.itinerary || []).filter((item) => item.label !== 'Doors Close')
  return rows.map((item) => ({
    time: item.time || 'TBA',
    label: buildSplashLabel(item),
  }))
})

function clampTranslate(tx: number, ty: number, s: number) {
  if (!posterContainer.value) return { tx, ty }
  const cw = posterContainer.value.clientWidth
  const ch = posterContainer.value.clientHeight
  return {
    tx: Math.min(0, Math.max(cw * (1 - s), tx)),
    ty: Math.min(0, Math.max(ch * (1 - s), ty)),
  }
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

function onMouseUp() {
  if (isDragging.value && !dragMoved.value) dismiss()
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
  if (e.touches.length === 0 && !touchMoved.value) dismiss()
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
  } catch {
    svgLoadError.value = true
  }
})

onBeforeUnmount(() => {
  if (countdown) clearInterval(countdown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="poster-fade">
      <div v-if="visible" class="poster-splash" :style="splashCssVars">
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
          <div
            class="poster-zoom-wrapper"
            :class="{ 'poster-zoom-wrapper--bbp': props.showBitcoinBlockPartyInfo }"
            :style="zoomStyle"
          >
            <!-- Inline SVG: crisp vector at any zoom level -->
            <div v-if="!svgLoadError" class="poster-svg-host" v-html="inlineSvgContent" />
            <!-- Fallback if fetch fails -->
            <img v-else :src="props.src" class="poster-img-fallback" alt="Reunion Festival Poster" />
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
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
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
  width: min(100vw, calc(100dvh * 11 / 17));
  height: min(100dvh, calc(100vw * 17 / 11));
  margin: auto;
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
  margin: 0 0 0.35rem;
  color: var(--bbp-yellow);
  font-size: clamp(0.5rem, 1.45vw, 0.98rem);
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.bbp-splash-date {
  margin: 0 0 0.15rem;
  color: var(--bbp-blue);
  font-size: clamp(1.1rem, 3.2vw, 2.1rem);
  font-weight: 800;
  line-height: 1.1;
}
.bbp-splash-venue {
  margin: 0 0 0.5rem;
  color: var(--bbp-yellow);
  font-size: clamp(0.72rem, 1.95vw, 1.28rem);
  font-weight: 600;
}
.bbp-splash-divider {
  width: 32%;
  height: 2px;
  background: var(--bbp-teal);
  margin-bottom: 0.45rem;
}
.bbp-splash-schedule-title {
  margin: 0 0 0.25rem;
  color: var(--bbp-teal);
  font-size: clamp(0.48rem, 1.1vw, 0.82rem);
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
  font-size: clamp(0.48rem, 1.25vw, 0.95rem);
  line-height: 1.25;
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
  margin: 0.45rem 0 0;
  color: var(--bbp-red);
  font-size: clamp(0.62rem, 1.55vw, 1.1rem);
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
  display: inline;
  min-width: 0;
  line-height: inherit;
}
.poster-hint--bbp .poster-hint-copy {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  line-height: 1.35;
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

.poster-fade-enter-active,
.poster-fade-leave-active {
  transition: opacity 0.6s ease;
}
.poster-fade-enter-from,
.poster-fade-leave-to {
  opacity: 0;
}
</style>
