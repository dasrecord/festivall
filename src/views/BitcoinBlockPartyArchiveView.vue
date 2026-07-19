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
          <p class="bbp-archive-venue">{{ year.venue }}</p>
          <p class="bbp-archive-summary">{{ year.summary }}</p>

          <div class="bbp-archive-columns">
            <div>
              <h3>Played</h3>
              <ul>
                <li v-for="performer in year.performers || []" :key="`${year.year}-performer-${performer.name}`">
                  <strong>{{ performer.name }}</strong>
                  <span v-if="performer.role"> — {{ performer.role }}</span>
                  <span v-if="performer.note"> ({{ performer.note }})</span>
                </li>
              </ul>
            </div>

            <div>
              <h3>Spoke</h3>
              <ul>
                <li v-for="speaker in year.speakers || []" :key="`${year.year}-speaker-${speaker.name}`">
                  <strong>{{ speaker.name }}</strong>
                  <span v-if="speaker.topic"> — {{ speaker.topic }}</span>
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
  padding: 2rem 1.5rem 4rem;
}
.bbp-archive-header h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
}
.bbp-archive-eyebrow {
  margin: 0;
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
  gap: 1rem;
  margin-top: 1.5rem;
}
.bbp-archive-card {
  border: 1px solid var(--bbp-tan);
  border-radius: 10px;
  background: rgba(255,255,255,0.72);
  padding: 1.2rem;
}
.bbp-archive-card-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}
.bbp-archive-card-head h2 {
  margin: 0;
  font-size: 1.3rem;
}
.bbp-archive-year {
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
  margin-top: 0.6rem;
}
.bbp-archive-columns h3 {
  margin: 0.2rem 0 0.5rem;
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--bbp-teal);
}
.bbp-archive-columns ul {
  margin: 0;
  padding-left: 1rem;
  display: grid;
  gap: 0.35rem;
}
.bbp-archive-columns li {
  color: #1d3238;
  font-size: 0.92rem;
}
.bbp-archive-empty {
  margin-top: 1rem;
  color: #1d3238;
}
@media (max-width: 700px) {
  .bbp-archive-columns {
    grid-template-columns: 1fr;
  }
}
</style>
