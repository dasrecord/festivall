<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'

const props = defineProps({
  order: { type: Object, required: true }
})

const router = useRouter()
const slots = computed(() => props.order.volunteer_claimed_slots || [])
const teams = computed(() => [...new Set(slots.value.map((slot) => slot.team).filter(Boolean))])

const goToSignup = () => {
  localStorage.setItem('volunteer_id_code', props.order.id_code)
  router.push('/reunion-volunteer-signup')
}
</script>

<template>
  <section class="os-card">
    <p class="eyebrow">Volunteer history</p>
    <h2>Your {{ REUNION_FESTIVAL.dashboardYear }} volunteer work</h2>
    <template v-if="slots.length">
      <p class="os-sub">
        {{ slots.length }} shift{{ slots.length === 1 ? '' : 's' }}<template v-if="teams.length"> · {{ teams.join(', ') }}</template>
      </p>
      <ul class="shifts">
        <li v-for="(slot, index) in slots" :key="index">
          <strong>{{ slot.team }}</strong>
          <span>{{ slot.date }} · {{ slot.start }}–{{ slot.end }}</span>
        </li>
      </ul>
    </template>
    <p v-else class="os-sub">No shifts were recorded for {{ REUNION_FESTIVAL.dashboardYear }}.</p>
    <p class="os-sub">Thank you for helping make it happen.</p>
    <button type="button" class="cta" @click="goToSignup">
      Sign up for {{ REUNION_FESTIVAL.year }} shifts
    </button>
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
.shifts { list-style: none; padding: 0; margin: 0 0 0.5rem; display: grid; gap: 0.35rem; }
.shifts li { display: flex; justify-content: space-between; gap: 0.5rem; font-size: 0.85rem; border-left: 3px solid #9cc7e3; padding-left: 0.5rem; }
.cta {
  background: #2f5d7c;
  color: white;
  border: 0;
  border-radius: 5px;
  padding: 0.4rem 1.1rem;
  font-weight: 700;
  cursor: pointer;
}
</style>
