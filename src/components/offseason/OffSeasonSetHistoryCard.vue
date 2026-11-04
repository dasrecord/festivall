<script setup>
import { computed } from 'vue'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'
import OsIcon from './OsIcon.vue'

const props = defineProps({
  order: { type: Object, required: true }
})

const actName = computed(() => props.order.roles?.act_name || props.order.application_data?.act_name || props.order.fullname)
const mixUrl = computed(() => props.order.application_data?.mix_track_url || '')
const website = computed(() => props.order.application_data?.act_website || '')

const formatSettime = (settime) => {
  if (!settime) return ''
  let date
  if (typeof settime === 'object' && typeof settime.toDate === 'function') {
    date = settime.toDate()
  } else if (typeof settime === 'string' && settime.includes('T') && !settime.includes('Z') && !settime.includes('+')) {
    const [datePart, timePart] = settime.split('T')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hour, minute] = timePart.split(':').map(Number)
    date = new Date(year, month - 1, day, hour, minute || 0)
  } else {
    date = new Date(settime)
  }
  return isNaN(date.getTime())
    ? ''
    : date.toLocaleString([], { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const sets = computed(() =>
  (props.order.settimes || [])
    .map((settime, index) => ({
      when: formatSettime(settime),
      duration: props.order.set_durations?.[index],
      type: props.order.set_types?.[index]
    }))
    .filter((set) => set.when)
)
</script>

<template>
  <section class="os-card">
    <p class="eyebrow">Your {{ REUNION_FESTIVAL.dashboardYear }} performance</p>
    <h2>{{ actName }}</h2>
    <ul v-if="sets.length" class="sets">
      <li v-for="(set, index) in sets" :key="index">
        <strong>{{ set.when }}</strong>
        <span v-if="set.type || set.duration">
          {{ [set.type, set.duration ? `${set.duration} min` : ''].filter(Boolean).join(' · ') }}
        </span>
      </li>
    </ul>
    <p v-else class="os-sub">No set times were recorded for {{ REUNION_FESTIVAL.dashboardYear }}.</p>
    <p v-if="mixUrl || website" class="links">
      <a v-if="mixUrl" :href="mixUrl" target="_blank" rel="noopener"><OsIcon name="mix_track" />Mix / track</a>
      <a v-if="website" :href="website" target="_blank" rel="noopener"><OsIcon name="link" />Website</a>
    </p>
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
.os-card h2 { margin: 0.25rem 0 0.5rem; font-size: 1.15rem; }
.os-sub { margin: 0.25rem 0; color: #3d5466; font-size: 0.9rem; }
.sets { list-style: none; padding: 0; margin: 0 0 0.5rem; display: grid; gap: 0.35rem; }
.sets li { display: flex; flex-direction: column; font-size: 0.85rem; border-left: 3px solid #9cc7e3; padding-left: 0.5rem; }
.links { display: flex; gap: 1rem; margin: 0.25rem 0 0; }
.links a { color: #2f5d7c; font-weight: 600; }
</style>
