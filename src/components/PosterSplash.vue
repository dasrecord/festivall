<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps<{ src: string }>()
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
          <div class="poster-zoom-wrapper" :style="zoomStyle">
            <!-- Inline SVG: crisp vector at any zoom level -->
            <div v-if="!svgLoadError" class="poster-svg-host" v-html="inlineSvgContent" />
            <!-- Fallback if fetch fails -->
            <img v-else :src="props.src" class="poster-img-fallback" alt="Reunion Festival Poster" />
          </div>
        </div>
        <div class="poster-hint">
          <span class="countdown">{{ secondsLeft }}</span>
          <span>This was our 2025 poster.<br> 
          The 2026 edition is going to be Iconic</span>
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
  background: #000;
}

.poster-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.poster-zoom-wrapper {
  width: 100%;
  height: 100%;
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

.poster-hint {
  position: fixed;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  pointer-events: none;
  background: rgba(0, 0, 0, 1);
  padding: 0.4rem 1rem;
  border-radius: 2rem;
  white-space: nowrap;
}

.countdown {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
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
