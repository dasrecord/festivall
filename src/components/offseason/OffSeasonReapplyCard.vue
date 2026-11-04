<script setup>
import { computed } from 'vue'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'

const props = defineProps({
  order: { type: Object, required: true }
})

const types = computed(() => props.order.applicant_types || [])
const isVendor = computed(() => types.value.includes('Vendor') && !types.value.some((t) => t === 'Artist' || t === 'Workshop'))
const label = computed(() => {
  if (isVendor.value) return 'vendor'
  return types.value.includes('Workshop') && !types.value.includes('Artist') ? 'workshop' : 'artist'
})

const phases = REUNION_FESTIVAL.applicationPhases
const opensAt = phases.artistApplicationsOpen
const closesAt = isVendor.value ? phases.vendorApplicationsClose : phases.artistApplicationsClose

// 'upcoming' = before the window, 'open' = inside it, 'unannounced' = window already past (dates not yet set for next year)
const state = computed(() => {
  const now = Date.now()
  if (now < opensAt.getTime()) return 'upcoming'
  if (now <= closesAt.getTime()) return 'open'
  return 'unannounced'
})
const fmt = (date) =>
  date.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/Regina' })
</script>

<template>
  <section class="os-card">
    <p class="eyebrow">Return as {{ label === 'artist' ? 'an artist' : `a ${label}` }}</p>
    <h2>Reapply for Reunion {{ REUNION_FESTIVAL.year }}</h2>
    <template v-if="state === 'open'">
      <p class="os-sub">Applications close {{ fmt(closesAt) }}.</p>
      <RouterLink class="cta" to="/reunionapplication">Reapply now</RouterLink>
    </template>
    <p v-else-if="state === 'upcoming'" class="os-sub">Applications open {{ fmt(opensAt) }}.</p>
    <p v-else class="os-sub">{{ REUNION_FESTIVAL.year }} application dates will be announced soon.</p>
  </section>
</template>

<style scoped>
.os-card {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid #9cc7e3;
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
  color: #1b2a36;
}
.eyebrow { margin: 0; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.72rem; color: #2f5d7c; }
.os-card h2 { margin: 0.25rem 0; font-size: 1.15rem; }
.os-sub { margin: 0.2rem 0 0.4rem; color: #3d5466; font-size: 0.9rem; }
.cta {
  display: inline-block;
  background: #2f5d7c;
  color: white;
  border-radius: 5px;
  padding: 0.4rem 1.1rem;
  font-weight: 700;
  text-decoration: none;
}
</style>
