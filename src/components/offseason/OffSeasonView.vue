<script setup>
import { computed } from 'vue'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'
import { offSeasonCardsFor } from '@/config/offSeasonCards.js'
import OffSeasonPromoCard from './OffSeasonPromoCard.vue'
import OffSeasonStreamCard from './OffSeasonStreamCard.vue'

const props = defineProps({
  order: { type: Object, required: true }
})

const cardComponents = {
  promo: OffSeasonPromoCard,
  stream: OffSeasonStreamCard
}

const cards = computed(() =>
  offSeasonCardsFor(props.order.applicant_types).filter((key) => cardComponents[key])
)
const firstName = computed(() => (props.order.fullname || '').split(' ')[0])
</script>

<template>
  <div class="off-season">
    <div class="hello">
      <h2>Thanks for joining us{{ firstName ? `, ${firstName}` : '' }}!</h2>
      <p>
        Your {{ REUNION_FESTIVAL.dashboardYear }} ticket is safe here. See you at Reunion
        {{ REUNION_FESTIVAL.year }} · {{ REUNION_FESTIVAL.dateRangeLabel }}.
      </p>
    </div>
    <component :is="cardComponents[key]" v-for="key in cards" :key="key" :order="order" />
  </div>
</template>

<style scoped>
.off-season {
  --winter-deep: #2f5d7c;
  --winter-ice: #9cc7e3;
  display: grid;
  gap: 0.75rem;
  width: 100%;
}
.hello {
  border: 1px solid var(--winter-ice);
  border-radius: 10px;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.7);
  color: #1b2a36;
  text-align: center;
}
.hello h2 { margin: 0 0 0.25rem; font-size: 1.15rem; }
.hello p { margin: 0; color: #3d5466; font-size: 0.9rem; }
</style>
