<script setup>
import { computed } from 'vue'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'

const channel = REUNION_FESTIVAL.offSeason.twitchChannel
// Twitch requires the embedding hostname as `parent`
const parent = window.location.hostname
const playerSrc = computed(
  () => `https://player.twitch.tv/?channel=${channel}&parent=${parent}&muted=true`
)
const chatSrc = computed(
  () => `https://www.twitch.tv/embed/${channel}/chat?parent=${parent}&darkpopout`
)
</script>

<template>
  <section class="os-card stream-card">
    <h2>❄️ Live from Festivall</h2>
    <p class="os-sub">Tune in to the {{ channel }} stream. Offline? The player shows the latest broadcast.</p>
    <div class="player">
      <iframe :src="playerSrc" allowfullscreen title="Festivall live stream"></iframe>
    </div>
    <details class="chat">
      <summary>Chat</summary>
      <iframe :src="chatSrc" title="Stream chat"></iframe>
    </details>
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
  padding: 0.9rem;
  color: #1b2a36;
}
.os-card h2 { margin: 0 0 0.25rem; font-size: 1.15rem; }
.os-sub { margin: 0 0 0.75rem; color: #3d5466; font-size: 0.9rem; }
.player { position: relative; aspect-ratio: 16 / 9; background: #0f1c26; border-radius: 10px; }
.player iframe, .chat iframe { width: 100%; height: 100%; border: 0; border-radius: 10px; }
.chat { margin-top: 0.75rem; }
.chat summary { cursor: pointer; font-weight: 600; color: #2f5d7c; }
.chat iframe { height: 420px; margin-top: 0.5rem; }
.os-link { display: inline-block; margin-top: 0.75rem; color: #2f5d7c; font-weight: 600; }
</style>
