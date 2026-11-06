<script setup>
import { computed, ref, watch } from 'vue'
import installedFonts from '@/data/fonts.json'
import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore'
import OsIcon from './OsIcon.vue'
import OffSeasonPaintPad from './OffSeasonPaintPad.vue'
import { reunion_db } from '@/firebase.js'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'

const props = defineProps({
  order: { type: Object, required: true }
})

const fullname = computed(() => (props.order.fullname || '').trim())
const firstName = computed(() => fullname.value.split(/\s+/)[0] || '')
const badgeNumber = ref(null)
const badgeStatus = ref('loading')

watch(() => props.order.id_code, (idCode, _, onCleanup) => {
  badgeNumber.value = null
  if (typeof idCode !== 'string' || !idCode.trim()) {
    badgeStatus.value = 'error'
    console.error('Cannot look up shout-out badge: ticket ID is missing')
    return
  }
  badgeStatus.value = 'loading'
  const badgeQuery = query(
    collection(reunion_db, 'participant_badges'),
    where('idCodes', 'array-contains', idCode.trim())
  )
  const unsubscribe = onSnapshot(badgeQuery, (snapshot) => {
    const active = snapshot.docs.filter((doc) => doc.data().active === true)
    if (active.length > 1) {
      console.error('Cannot display shout-out badge: multiple active matches')
      badgeStatus.value = 'error'
      return
    }
    if (!active.length) {
      badgeNumber.value = null
      badgeStatus.value = 'unmatched'
      return
    }
    const badge = active[0].data().badgeNumber
    if (!Number.isInteger(badge) || badge < 1 || badge > 6) {
      console.error('Cannot display shout-out badge: invalid badge number')
      badgeStatus.value = 'error'
      return
    }
    badgeNumber.value = badge
    badgeStatus.value = 'matched'
  }, (error) => {
    console.error('Could not load shout-out badge:', error)
    badgeStatus.value = 'error'
  })
  onCleanup(unsubscribe)
}, { immediate: true })

const channel = REUNION_FESTIVAL.offSeason.twitchChannel
// Twitch requires the embedding hostname as `parent`
const parent = window.location.hostname
const playerSrc = computed(
  () => `https://player.twitch.tv/?channel=${channel}&parent=${parent}&muted=true`
)
const chatSrc = computed(
  () => `https://www.twitch.tv/embed/${channel}/chat?parent=${parent}&darkpopout`
)

const fonts = installedFonts.length ? installedFonts : ['Arial', 'Courier New', 'Georgia', 'Impact']
const fontQuery = ref('')
const fontOpen = ref(false)
const filteredFonts = computed(() => {
  const q = fontQuery.value.trim().toLowerCase()
  return (q ? fonts.filter((f) => f.toLowerCase().includes(q)) : fonts).slice(0, 60)
})
function pickFont(f) {
  font.value = f
  fontQuery.value = ''
  fontOpen.value = false
}

const FX = [{ key: 'none', label: 'None' }, { key: 'glow', label: 'Glow' }, { key: 'pulse', label: 'Pulse' }]

const font = ref('Arial')
const color = ref('#3de0ff')
const hexInput = ref('#3de0ff')
const HEX_RE = /^#[0-9a-fA-F]{6}$/
function setColor(c) {
  color.value = c.toLowerCase()
  hexInput.value = color.value
}
function onHexInput() {
  let v = hexInput.value.trim()
  if (v && !v.startsWith('#')) v = `#${v}`
  hexInput.value = v
  if (HEX_RE.test(v)) color.value = v.toLowerCase()
}
function randomColor() {
  // Random hue, kept bright so it reads on the dark visuals
  const h = Math.random() * 360
  const l = 0.55 + Math.random() * 0.15
  const a = Math.min(l, 1 - l)
  const f = (n) => {
    const k = (n + h / 30) % 12
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))))
  }
  setColor('#' + [f(0), f(8), f(4)].map((x) => x.toString(16).padStart(2, '0')).join(''))
}
function stepFont(dir) {
  const i = fonts.indexOf(font.value)
  font.value = fonts[(i + dir + fonts.length) % fonts.length]
}
function randomFont() {
  font.value = fonts[Math.floor(Math.random() * fonts.length)]
}
const fx = ref('none')
const previewStyle = computed(() => ({
  fontFamily: `"${font.value}", Arial, sans-serif`,
  color: color.value,
  fontSize: '1.15rem',
  textShadow: fx.value === 'glow' ? `0 0 10px ${color.value}` : 'none'
}))

const MAX = 140
const COOLDOWN_MS = 15000
const text = ref('')
const status = ref('idle') // idle | sending | sent | error
const lastSent = ref(0)

async function transmit() {
  const msg = text.value.trim()
  if (!msg || !props.order.id_code || !firstName.value || status.value === 'sending') return
  if (Date.now() - lastSent.value < COOLDOWN_MS) return
  status.value = 'sending'
  try {
    await addDoc(collection(reunion_db, 'live_inputs'), {
      text: msg.slice(0, MAX),
      name: firstName.value.slice(0, 24),
      fullname: fullname.value.slice(0, 80),
      id_code: String(props.order.id_code),
      font: font.value,
      color: color.value,
      fx: fx.value,
      createdAt: serverTimestamp()
    })
    lastSent.value = Date.now()
    text.value = ''
    status.value = 'sent'
    setTimeout(() => { if (status.value === 'sent') status.value = 'idle' }, 3000)
  } catch (e) {
    console.error(e)
    status.value = 'error'
  }
}
</script>

<template>
  <section class="os-card stream-card">
    <h2><OsIcon name="radio" />FESTIVALL LIVESTREAM</h2>
    <h1>{{ REUNION_FESTIVAL.streamTitle }}</h1>
    <div class="player">
      <iframe :src="playerSrc" allowfullscreen title="Festivall live stream"></iframe>
    </div>
    <details class="chat" open>
      <summary>Chat</summary>
      <iframe :src="chatSrc" title="Stream chat"></iframe>
    </details>
    <details class="signal">
      <summary class="signal-head">
        <span class="dot"></span><span>SEND A LIVE SHOUTOUT</span><span class="sub">appears in the livestream visuals</span>
      </summary>
      <form @submit.prevent="transmit">
      <div class="as">Sending as <strong>{{ firstName }}</strong></div>
      <div class="badge-info" aria-live="polite">
        <template v-if="badgeStatus === 'matched'">
          <strong>BADGE {{ badgeNumber }}</strong>
          <span>Your shout-out lasts {{ badgeNumber * 10 }} seconds</span>
          <small>Based on {{ badgeNumber }} {{ badgeNumber === 1 ? 'year' : 'years' }} of recorded attendance</small>
        </template>
        <span v-else-if="badgeStatus === 'unmatched'">Shout-out duration: 5 seconds</span>
        <span v-else-if="badgeStatus === 'loading'">Loading your badge…</span>
        <span v-else class="err">Couldn’t load your badge. Please try again later.</span>
      </div>
      <div class="opts">
        <div class="opt-row nowrap">
          <span class="opt-label">Font</span>
          <div class="font-stepper">
            <button type="button" class="step" aria-label="Previous font" @click="stepFont(-1)">‹</button>
            <div class="font-pick">
              <input
                v-model="fontQuery"
                class="font-input"
                :placeholder="font"
                autocomplete="off"
                @focus="fontOpen = true"
                @blur="fontOpen = false"
              />
              <ul v-if="fontOpen" class="font-list">
                <li v-for="f in filteredFonts" :key="f" :class="{ on: f === font }" @mousedown.prevent="pickFont(f)">{{ f }}</li>
                <li v-if="!filteredFonts.length" class="none">No match</li>
              </ul>
            </div>
            <button type="button" class="step" aria-label="Next font" @click="stepFont(1)">›</button>
          </div>
          <button type="button" class="chip icon" aria-label="Random font" title="Random font" @click="randomFont">⤨</button>
        </div>
        <div class="opt-row">
          <span class="opt-label">Color</span>
          <input v-model="color" type="color" class="picker" aria-label="Color picker" @input="hexInput = color" />
          <input v-model="hexInput" class="hex" maxlength="7" spellcheck="false" placeholder="#RRGGBB"
            :class="{ bad: !HEX_RE.test(hexInput) }" @input="onHexInput" />
          <button type="button" class="chip icon" aria-label="Random color" title="Random color" @click="randomColor">⤨</button>
        </div>
        <div class="opt-row">
          <span class="opt-label">Effect</span>
          <button v-for="e in FX" :key="e.key" type="button" class="chip" :class="{ on: fx === e.key }"
            @click="fx = e.key">{{ e.label }}</button>
        </div>
        <div class="preview" :class="{ pulse: fx === 'pulse' }" :style="previewStyle">
          {{ text || 'Preview' }}
        </div>
      </div>
      <div class="row">
        <input v-model="text" :maxlength="MAX" placeholder="Your message…" autocomplete="off" required />
        <button type="submit" :disabled="status === 'sending' || !text.trim()">
          {{ status === 'sending' ? '…' : status === 'sent' ? 'Sent ✓' : 'Transmit' }}
        </button>
      </div>
      <div class="meta">
        <span v-if="status === 'error'" class="err">Couldn't send. Try again.</span>
        <span v-else>&nbsp;</span>
        <span>{{ text.length }}/{{ MAX }}</span>
      </div>
      </form>
    </details>
    <OffSeasonPaintPad :order="order" :color="color" />
    <a class="os-link" :href="`https://www.twitch.tv/${channel}`" target="_blank" rel="noopener">
      Open on Twitch ↗
    </a>
  </section>
</template>

<style scoped>
.os-card {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid #9cc7e3;
  border-radius: 10px;
  padding: 0.7rem 0.8rem;
  color: #1b2a36;
}
.os-card h2 { margin: 0 0 0.4rem; font-size: 1.05rem; }
.os-sub { margin: 0 0 0.75rem; color: #3d5466; font-size: 0.9rem; }
.player { position: relative; aspect-ratio: 16 / 9; background: #0f1c26; border-radius: 10px; }
.player iframe, .chat iframe { width: 100%; height: 100%; border: 0; border-radius: 10px; }
.chat { margin-top: 0.5rem; }
.chat summary { cursor: pointer; font-weight: 600; color: #2f5d7c; }
.chat iframe { height: 420px; margin-top: 0.5rem; }
.os-link { display: inline-block; margin-top: 0.5rem; font-size: 0.85rem; color: #2f5d7c; font-weight: 600; }
.signal {
  margin-top: 0.7rem; padding: 0.8rem; border-radius: 10px;
  background: #0b141b; border: 1px solid #1f3646; color: #dbe9f3;
}
.signal-head { display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; letter-spacing: 0.22em; font-weight: 700; cursor: pointer; list-style: none; }
.signal-head::-webkit-details-marker { display: none; }
.signal-head::after { content: '+'; margin-left: auto; font-size: 1.1rem; letter-spacing: 0; color: #3de0ff; }
.signal[open] .signal-head { margin-bottom: 0.6rem; }
.signal[open] .signal-head::after { content: '−'; }
.signal-head .sub { margin-left: auto; letter-spacing: 0.02em; font-weight: 400; color: #6f8ba0; }
.dot { width: 7px; height: 7px; border-radius: 50%; background: #3de0ff; box-shadow: 0 0 8px #3de0ff; }
.signal input {
  width: 100%; box-sizing: border-box; background: #101e28; border: 1px solid #1f3646;
  border-radius: 8px; padding: 0.55rem 0.7rem; color: #fff; font-size: 0.9rem; outline: none;
}
.signal input:focus { border-color: #3de0ff; }
.signal .as { font-size: 0.8rem; color: #6f8ba0; }
.signal .as strong { color: #3de0ff; }
.badge-info { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.25rem 0.65rem; margin-top: 0.6rem; color: #dbe9f3; font-size: 0.8rem; }
.badge-info strong { color: #3de0ff; letter-spacing: 0.1em; }
.badge-info small { flex-basis: 100%; color: #9fb6c7; }
.signal .picker { width: 34px; height: 30px; padding: 0; border: 1px solid #1f3646; border-radius: 6px; background: none; cursor: pointer; }
.signal .hex { width: 6.2rem; padding: 0.3rem 0.5rem; font-family: ui-monospace, monospace; font-size: 0.8rem; }
.signal .hex.bad { border-color: #ff7a7a; }
.signal .chip.icon { padding: 0.25rem 0.55rem; font-size: 0.9rem; line-height: 1; }
.opt-row.nowrap { flex-wrap: nowrap; }
.font-stepper { display: flex; flex: 1; min-width: 0; border: 1px solid #1f3646; border-radius: 8px; background: #101e28; }
.font-stepper:focus-within { border-color: #3de0ff; }
.signal .step {
  flex: none; width: 30px; padding: 0; border: 0; background: transparent; color: #dbe9f3;
  font-size: 1.1rem; line-height: 1; border-radius: 0; text-transform: none; font-weight: 400;
}
.signal .step:first-child { border-right: 1px solid #1f3646; border-radius: 7px 0 0 7px; }
.signal .step:last-child { border-left: 1px solid #1f3646; border-radius: 0 7px 7px 0; }
.signal .step:hover { color: #3de0ff; background: #12303d; }
.font-pick { position: relative; flex: 1; min-width: 0; }
.signal .font-input { padding: 0.3rem 0.6rem; font-size: 0.8rem; border: 0; background: transparent; text-align: center; text-overflow: ellipsis; }
.signal .font-input:focus { border: 0; }
.font-list {
  position: absolute; z-index: 5; left: 0; right: 0; top: calc(100% + 4px); margin: 0; padding: 0.25rem;
  list-style: none; max-height: 200px; overflow-y: auto; background: #0b141b;
  border: 1px solid #3de0ff; border-radius: 8px;
}
.font-list li { padding: 0.3rem 0.5rem; font-size: 0.8rem; border-radius: 5px; cursor: pointer; color: #dbe9f3; }
.font-list li:hover, .font-list li.on { background: #12303d; color: #3de0ff; }
.font-list li.none { color: #6f8ba0; cursor: default; }
.opts { margin-top: 0.6rem; display: grid; gap: 0.45rem; }
.opt-row { display: flex; align-items: center; flex-wrap: wrap; gap: 0.35rem; }
.opt-label { width: 3rem; font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; color: #6f8ba0; }
.signal .chip {
  background: #101e28; color: #dbe9f3; border: 1px solid #1f3646; border-radius: 6px;
  padding: 0.25rem 0.6rem; font-size: 0.75rem; letter-spacing: 0.04em; text-transform: none; font-weight: 500;
}
.signal .chip.on { border-color: #3de0ff; color: #3de0ff; }
.preview {
  padding: 0.6rem; border-radius: 8px; background: #06101a; border: 1px dashed #1f3646;
  text-align: center; min-height: 2.2rem; word-break: break-word;
}
.preview.pulse { animation: sig-pulse 1.6s ease-in-out infinite; }
@keyframes sig-pulse { 50% { opacity: 0.45; } }
.signal .row { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.signal button {
  background: #3de0ff; color: #06131a; border: 0; border-radius: 8px; padding: 0 1rem;
  font-weight: 700; letter-spacing: 0.06em; cursor: pointer; text-transform: uppercase; font-size: 0.75rem;
}
.signal button:disabled { opacity: 0.4; cursor: default; }
.meta { display: flex; justify-content: space-between; margin-top: 0.35rem; font-size: 0.7rem; color: #6f8ba0; }
.err { color: #ff7a7a; }
</style>
