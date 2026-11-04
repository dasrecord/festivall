<script setup>
import { computed } from 'vue'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'
import { offSeasonCardsFor, PRIORITY_CARDS } from '@/config/offSeasonCards.js'
import OffSeasonPromoCard from './OffSeasonPromoCard.vue'
import OffSeasonStreamCard from './OffSeasonStreamCard.vue'
import OffSeasonReapplyCard from './OffSeasonReapplyCard.vue'
import OffSeasonVolunteerCard from './OffSeasonVolunteerCard.vue'
import OffSeasonSetHistoryCard from './OffSeasonSetHistoryCard.vue'
import OffSeasonSaveTheDateCard from './OffSeasonSaveTheDateCard.vue'
import OffSeasonScavengerCard from './OffSeasonScavengerCard.vue'

const props = defineProps({
  order: { type: Object, required: true }
})

const cardComponents = {
  promo: OffSeasonPromoCard,
  reapply: OffSeasonReapplyCard,
  volunteerHistory: OffSeasonVolunteerCard,
  setHistory: OffSeasonSetHistoryCard,
  saveTheDate: OffSeasonSaveTheDateCard,
  scavenger: OffSeasonScavengerCard,
  stream: OffSeasonStreamCard
}

const foldTitles = {
  reapply: '📝 Reapply for next year',
  volunteerHistory: '🙌 Volunteer history',
  setHistory: '🎧 Your performance history',
  saveTheDate: '📅 Save the date',
  scavenger: '🧩 Scavenger hunt'
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
    <template v-for="key in cards" :key="key">
      <component :is="cardComponents[key]" v-if="PRIORITY_CARDS.includes(key)" :order="order" />
      <details v-else class="fold">
        <summary>{{ foldTitles[key] }}</summary>
        <component :is="cardComponents[key]" :order="order" />
      </details>
    </template>
  </div>
</template>

<style scoped>
.off-season {
  --winter-deep: #2f5d7c;
  --winter-ice: #9cc7e3;
  display: grid;
  gap: 0.5rem;
  width: 100%;
}
.hello {
  border: 1px solid var(--winter-ice);
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.7);
  color: #1b2a36;
  text-align: center;
}
.fold {
  border: 1px solid var(--winter-ice);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.7);
  color: #1b2a36;
}
.fold summary {
  cursor: pointer;
  padding: 0.55rem 0.75rem;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--winter-deep);
}
.fold :deep(.os-card) {
  border: 0;
  background: transparent;
  padding: 0 0.75rem 0.6rem;
}
.fold :deep(.eyebrow) { display: none; }
.fold :deep(.os-card h2) { font-size: 0.95rem; }
.hello h2 { margin: 0; font-size: 1rem; }
.hello p { margin: 0; color: #3d5466; font-size: 0.8rem; }
</style>
