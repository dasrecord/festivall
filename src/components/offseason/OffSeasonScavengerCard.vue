<script setup>
import { computed } from 'vue'

const props = defineProps({
  order: { type: Object, required: true }
})

const hunt = computed(() => props.order.scavenger_hunt || null)
const link = computed(() => ({
  name: 'ScavengerHunt',
  params: { id_code: props.order.id_code },
  query: { fullName: (props.order.fullname || '').split(' ')[0] }
}))
</script>

<template>
  <section class="os-card">
    <p class="eyebrow">Scavenger hunt</p>
    <h2>Your Reunion scavenger hunt</h2>
    <p v-if="hunt" class="os-sub">
      Best score: <strong>{{ hunt.score }}<template v-if="hunt.total"> / {{ hunt.total }}</template></strong>
      <template v-if="hunt.difficulty"> · {{ hunt.difficulty }} mode</template>
    </p>
    <p v-else class="os-sub">You haven't played yet. Puzzles, riddles and a shot at the leaderboard.</p>
    <RouterLink class="cta" :to="link">{{ hunt ? 'Keep hunting' : 'Start hunting' }}</RouterLink>
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
  border-radius: 999px;
  padding: 0.4rem 1.1rem;
  font-weight: 700;
  text-decoration: none;
}
</style>
