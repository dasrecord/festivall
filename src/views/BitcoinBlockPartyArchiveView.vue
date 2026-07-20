<template>
  <div class="bbp-archive" :style="cssVars">
    <nav class="bbp-archive-nav">
      <router-link :to="BBP.routes.landing" class="bbp-archive-back">← Bitcoin Block Party</router-link>
    </nav>

    <main class="bbp-archive-inner">
      <header class="bbp-archive-header">
        <p class="bbp-archive-eyebrow">Archive</p>
        <h1>Previous Years</h1>
        <p>See who played and who spoke at past Bitcoin Block Party editions.</p>
      </header>

      <section v-if="archiveYears.length" class="bbp-archive-years">
        <article v-for="year in archiveYears" :key="year.year" class="bbp-archive-card">
          <div class="bbp-archive-card-head">
            <h2>{{ year.title }}</h2>
            <span class="bbp-archive-year">{{ year.year }}</span>
          </div>
          <p class="bbp-archive-date">{{ year.date }}</p>
          <p class="bbp-archive-venue">{{ year.venue }}</p>
          <p class="bbp-archive-summary">{{ year.summary }}</p>

          <div class="bbp-archive-columns">
            <div class="bbp-archive-list-panel bbp-archive-list-panel--played">
              <h3>Played</h3>
              <ul>
                <li
                  v-for="performer in year.performers || []"
                  :key="`${year.year}-performer-${performer.name}`"
                  :class="{ 'bbp-archive-entry--untimed': !performer.time }"
                >
                  <span v-if="performer.time" class="bbp-archive-time">{{ performer.time }}</span>
                  <span class="bbp-archive-entry-copy">
                    <strong>{{ performer.name }}</strong>
                    <span v-if="formatPerformerDetails(performer)" class="bbp-archive-entry-meta">{{ formatPerformerDetails(performer) }}</span>
                  </span>
                </li>
              </ul>
            </div>

            <div class="bbp-archive-list-panel bbp-archive-list-panel--spoke">
              <h3>Spoke</h3>
              <ul>
                <li
                  v-for="speaker in year.speakers || []"
                  :key="`${year.year}-speaker-${speaker.name}`"
                  :class="{ 'bbp-archive-entry--untimed': !speaker.time }"
                >
                  <span v-if="speaker.time" class="bbp-archive-time">{{ speaker.time }}</span>
                  <span class="bbp-archive-entry-copy">
                    <strong>{{ speaker.name }}</strong>
                    <span v-if="formatSpeakerDetails(speaker)" class="bbp-archive-entry-meta">{{ formatSpeakerDetails(speaker) }}</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </article>
      </section>

      <p v-else class="bbp-archive-empty">Archive data is being prepared.</p>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHead } from '@vueuse/head'
import { BITCOIN_BLOCK_PARTY as BBP } from '@/config/bitcoinBlockPartyConfig.js'

useHead({
  title: `Bitcoin Block Party Archive — ${BBP.city}`,
  meta: [
    {
      name: 'description',
      content: 'Explore previous Bitcoin Block Party years and see who played and who spoke.',
    },
  ],
})

const archiveYears = computed(() => [...(BBP.archive || [])].sort((a, b) => b.year - a.year))

function formatPerformerDetails(performer) {
  return [performer.role, performer.note].filter(Boolean).join(' · ')
}

function formatSpeakerDetails(speaker) {
  return [speaker.company, speaker.topic].filter(Boolean).join(' · ')
}

const cssVars = computed(() => ({
  '--bbp-purple': BBP.palette.purple,
  '--bbp-teal': BBP.palette.teal,
  '--bbp-orange': BBP.palette.orange,
  '--bbp-tan': BBP.palette.tan,
  '--bbp-cream': BBP.palette.cream,
}))
</script>

<style scoped>
.bbp-archive {
  min-height: 100dvh;
  background: var(--bbp-cream);
  color: var(--bbp-teal);
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
}
.bbp-archive-nav {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(188,186,165,0.5);
  background: rgba(244,242,230,0.96);
}
.bbp-archive-back {
  color: var(--bbp-teal);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 700;
}
.bbp-archive-inner {
  max-width: 980px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
}
.bbp-archive-header {
  max-width: 680px;
}
.bbp-archive-header h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 0.98;
  color: var(--bbp-teal);
}
.bbp-archive-eyebrow {
  margin: 0 0 0.35rem;
  color: var(--bbp-purple);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.8rem;
}
.bbp-archive-header p {
  color: #1d3238;
}
.bbp-archive-years {
  display: grid;
  gap: 1.25rem;
  margin-top: 2rem;
}
.bbp-archive-card {
  border: 1px solid rgba(188,186,165,0.85);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(255,255,255,0.86), rgba(244,242,230,0.62));
  padding: 1.35rem;
  box-shadow: 0 14px 36px rgba(26,11,30,0.08);
}
.bbp-archive-card-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}
.bbp-archive-card-head h2 {
  margin: 0;
  font-size: clamp(1.2rem, 3vw, 1.55rem);
  color: var(--bbp-teal);
}
.bbp-archive-year {
  flex: 0 0 auto;
  border: 1px solid rgba(200,63,15,0.32);
  border-radius: 999px;
  padding: 0.2rem 0.65rem;
  background: rgba(200,63,15,0.08);
  font-weight: 800;
  color: var(--bbp-orange);
}
.bbp-archive-venue,
.bbp-archive-summary {
  margin: 0.45rem 0;
  color: #1d3238;
}
.bbp-archive-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
.bbp-archive-list-panel {
  min-width: 0;
  border: 1px solid rgba(188,186,165,0.55);
  border-radius: 8px;
  background: rgba(255,255,255,0.54);
  padding: 0.95rem;
}
.bbp-archive-columns h3 {
  margin: 0 0 0.7rem;
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--bbp-teal);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.bbp-archive-columns h3::before {
  content: '';
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: var(--bbp-orange);
}
.bbp-archive-columns ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.5rem;
}
.bbp-archive-columns li {
  color: #1d3238;
  font-size: 0.92rem;
  display: grid;
  grid-template-columns: minmax(5.8rem, auto) minmax(0, 1fr);
  gap: 0.55rem;
  align-items: start;
  padding: 0.55rem 0;
  border-top: 1px solid rgba(188,186,165,0.4);
}
.bbp-archive-columns li:first-child {
  border-top: 0;
  padding-top: 0;
}
.bbp-archive-entry--untimed .bbp-archive-entry-copy {
  grid-column: 1 / -1;
}
.bbp-archive-time {
  color: var(--bbp-orange);
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
  letter-spacing: 0.02em;
}
.bbp-archive-entry-copy {
  min-width: 0;
  display: grid;
  gap: 0.15rem;
  line-height: 1.35;
}
.bbp-archive-entry-copy strong {
  color: var(--bbp-teal);
}
.bbp-archive-entry-meta {
  color: #466268;
  font-size: 0.84rem;
}
.bbp-archive-empty {
  margin-top: 1rem;
  color: #1d3238;
}
@media (max-width: 700px) {
  .bbp-archive-columns {
    grid-template-columns: 1fr;
  }
  .bbp-archive-columns li {
    grid-template-columns: 1fr;
    gap: 0.1rem;
  }
}
</style>
