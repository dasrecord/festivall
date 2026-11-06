<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import OsIcon from './OsIcon.vue'
import { reunion_db } from '@/firebase.js'

const props = defineProps({
  order: { type: Object, required: true },
  color: { type: String, default: '#3de0ff' }
})

const W = 640
const H = 360
const FLUSH_MS = 100
const MAX_PAIRS = 30
const MIN_STEP = 0.004

const canvas = ref(null)
const painting = ref(false)
const error = ref(false)
let ctx = null
let raf = 0
let buffer = []
let flushTimer = null
let last = null

const firstName = () => (props.order.fullname || '').trim().split(/\s+/)[0] || ''

onMounted(() => {
  if (!canvas.value) return
  ctx = canvas.value.getContext('2d')
  const fade = () => {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.07)'
    ctx.fillRect(0, 0, W, H)
    ctx.globalCompositeOperation = 'source-over'
    raf = requestAnimationFrame(fade)
  }
  fade()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  clearTimeout(flushTimer)
})

// x/y are 0-1 with y pointing up, matching TouchDesigner's UV space
function toPoint(e) {
  const r = canvas.value.getBoundingClientRect()
  const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
  const y = Math.min(1, Math.max(0, 1 - (e.clientY - r.top) / r.height))
  return [Number(x.toFixed(4)), Number(y.toFixed(4))]
}

function drawSegment(a, b) {
  ctx.strokeStyle = props.color
  ctx.fillStyle = props.color
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.shadowColor = props.color
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.moveTo(a[0] * W, (1 - a[1]) * H)
  ctx.lineTo(b[0] * W, (1 - b[1]) * H)
  ctx.stroke()
  ctx.shadowBlur = 0
}

async function send(points, end) {
  try {
    await addDoc(collection(reunion_db, 'live_paint'), {
      id_code: String(props.order.id_code),
      name: firstName().slice(0, 24),
      color: props.color,
      points: points.flat(),
      end,
      createdAt: serverTimestamp()
    })
    error.value = false
  } catch (e) {
    console.error(e)
    error.value = true
  }
}

function flush(end = false) {
  clearTimeout(flushTimer)
  flushTimer = null
  while (buffer.length > MAX_PAIRS) send(buffer.splice(0, MAX_PAIRS), false)
  if (buffer.length || end) send(buffer.splice(0), end)
}

function push(p) {
  if (last && Math.hypot(p[0] - last[0], p[1] - last[1]) < MIN_STEP) return
  if (last) drawSegment(last, p)
  else drawSegment(p, p)
  last = p
  buffer.push(p)
  if (!flushTimer) flushTimer = setTimeout(() => flush(false), FLUSH_MS)
}

function down(e) {
  canvas.value.setPointerCapture(e.pointerId)
  painting.value = true
  last = null
  push(toPoint(e))
}
function move(e) {
  if (painting.value) push(toPoint(e))
}
function up() {
  if (!painting.value) return
  painting.value = false
  last = null
  flush(true)
}
</script>

<template>
  <div class="paint">
    <div class="paint-head">
      <span class="dot"></span><span>PAINT THE SCREEN</span>
      <span class="sub">supporter feature</span>
    </div>
    <div v-if="order.paint_access" class="pad-wrap">
      <canvas
        ref="canvas"
        class="pad"
        :width="W"
        :height="H"
        @pointerdown.prevent="down"
        @pointermove.prevent="move"
        @pointerup="up"
        @pointercancel="up"
      ></canvas>
      <div class="hint">
        <span v-if="error" class="err">Connection issue, keep painting.</span>
        <span v-else>Drag to paint on the live visuals. Uses your color above.</span>
      </div>
    </div>
    <div v-else class="locked">
      <OsIcon name="off_limits" />
      <div>
        <strong>Paint mode is locked</strong>
        <p>Unlocked for supporters who make a donation. Once the crew confirms yours, it appears here.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.paint {
  margin-top: 0.7rem; padding: 0.8rem; border-radius: 10px;
  background: #0b141b; border: 1px solid #1f3646; color: #dbe9f3;
}
.paint-head { display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; letter-spacing: 0.22em; font-weight: 700; margin-bottom: 0.6rem; }
.paint-head .sub { margin-left: auto; letter-spacing: 0.02em; font-weight: 400; color: #6f8ba0; }
.dot { width: 7px; height: 7px; border-radius: 50%; background: #3de0ff; box-shadow: 0 0 8px #3de0ff; }
.pad {
  display: block; width: 100%; aspect-ratio: 16 / 9; border-radius: 8px; background: #06101a;
  border: 1px solid #1f3646; touch-action: none; cursor: crosshair;
  background-image: linear-gradient(#0f2230 1px, transparent 1px), linear-gradient(90deg, #0f2230 1px, transparent 1px);
  background-size: 12.5% 16.66%;
}
.hint { margin-top: 0.35rem; font-size: 0.7rem; color: #6f8ba0; }
.err { color: #ff7a7a; }
.locked { display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; color: #9fb6c7; }
.locked :deep(.os-icon) { width: 36px; height: 36px; margin: 0; flex: none; color: #6f8ba0; }
.locked p { margin: 0.15rem 0 0; font-size: 0.78rem; color: #6f8ba0; }
</style>
