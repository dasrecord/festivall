<script setup>
import { computed, ref } from 'vue'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import OsIcon from './OsIcon.vue'
import { reunion_db } from '@/firebase.js'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'

const props = defineProps({
  order: { type: Object, required: true }
})

const fullname = computed(() => (props.order.fullname || '').trim())
const firstName = computed(() => fullname.value.split(/\s+/)[0] || '')

const channel = REUNION_FESTIVAL.offSeason.twitchChannel
// Twitch requires the embedding hostname as `parent`
const parent = window.location.hostname
const playerSrc = computed(
  () => `https://player.twitch.tv/?channel=${channel}&parent=${parent}&muted=true`
)
const chatSrc = computed(
  () => `https://www.twitch.tv/embed/${channel}/chat?parent=${parent}&darkpopout`
)

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
    <h2><OsIcon name="radio" />Live from Festivall</h2>
    <div class="player">
      <iframe :src="playerSrc" allowfullscreen title="Festivall live stream"></iframe>
    </div>
    <details class="chat">
      <summary>Chat</summary>
      <iframe :src="chatSrc" title="Stream chat"></iframe>
    </details>
    <form class="signal" @submit.prevent="transmit">
      <div class="signal-head">
        <span class="dot"></span><span>SEND A LIVE SHOUTOUT</span><span class="sub">appears in the livestream visuals</span>
      </div>
      <div class="as">Sending as <strong>{{ firstName }}</strong></div>
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
.signal-head { display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; letter-spacing: 0.22em; font-weight: 700; margin-bottom: 0.6rem; }
.signal-head .sub { margin-left: auto; letter-spacing: 0.02em; font-weight: 400; color: #6f8ba0; }
.dot { width: 7px; height: 7px; border-radius: 50%; background: #3de0ff; box-shadow: 0 0 8px #3de0ff; }
.signal input {
  width: 100%; box-sizing: border-box; background: #101e28; border: 1px solid #1f3646;
  border-radius: 8px; padding: 0.55rem 0.7rem; color: #fff; font-size: 0.9rem; outline: none;
}
.signal input:focus { border-color: #3de0ff; }
.signal .as { font-size: 0.8rem; color: #6f8ba0; }
.signal .as strong { color: #3de0ff; }
.signal .row { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.signal button {
  background: #3de0ff; color: #06131a; border: 0; border-radius: 8px; padding: 0 1rem;
  font-weight: 700; letter-spacing: 0.06em; cursor: pointer; text-transform: uppercase; font-size: 0.75rem;
}
.signal button:disabled { opacity: 0.4; cursor: default; }
.meta { display: flex; justify-content: space-between; margin-top: 0.35rem; font-size: 0.7rem; color: #6f8ba0; }
.err { color: #ff7a7a; }
</style>
