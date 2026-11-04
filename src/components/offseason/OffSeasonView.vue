<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import { REUNION_FESTIVAL } from '@/config/festivalConfig.js'
import { offSeasonCardsFor, PRIORITY_CARDS } from '@/config/offSeasonCards.js'
import OsIcon from './OsIcon.vue'
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

const folds = {
  reapply: { icon: 'contract', title: 'Reapply for next year' },
  volunteerHistory: { icon: 'volunteer', title: 'Volunteer history' },
  setHistory: { icon: 'dj', title: 'Your performance history' },
  saveTheDate: { icon: 'reminder', title: 'Save the date' },
  scavenger: { icon: 'quest', title: 'Scavenger hunt' }
}

const cards = computed(() =>
  offSeasonCardsFor(props.order.applicant_types).filter((key) => cardComponents[key])
)
const priorityCards = computed(() => cards.value.filter((k) => PRIORITY_CARDS.includes(k)))
const foldCards = computed(() => cards.value.filter((k) => !PRIORITY_CARDS.includes(k)))

const openKey = ref(null)
const onKeydown = (e) => { if (e.key === 'Escape') openKey.value = null }
watch(openKey, (key) => {
  document.body.style.overflow = key ? 'hidden' : ''
  if (key) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
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
    <component
      :is="cardComponents[key]"
      v-for="key in priorityCards"
      :key="key"
      :order="order"
      class="full"
    />
    <div v-if="foldCards.length" class="status-bar">
      <p v-for="key in foldCards" :key="key" class="status-btn" @click="openKey = key">
        <OsIcon :name="folds[key].icon" />
        <strong>{{ folds[key].title }}</strong>
      </p>
    </div>
    <Teleport to="body">
      <div v-if="openKey" class="os-modal" @click.self="openKey = null">
        <div class="os-modal-content" role="dialog" aria-modal="true" :aria-label="folds[openKey].title">
          <button type="button" class="os-modal-close" aria-label="Close" @click="openKey = null"></button>
          <component :is="cardComponents[openKey]" :order="order" />
        </div>
      </div>
    </Teleport>
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
.hello h2 { margin: 0; font-size: 1rem; }
.hello p { margin: 0; color: #3d5466; font-size: 0.8rem; }

.status-bar {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}
.status-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid var(--winter-ice);
  background: var(--winter-deep);
  color: white;
  text-align: center;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.15s;
}
.status-btn:hover { background: #3b7298; }
.status-btn :deep(.os-icon) { width: 32px; height: 32px; margin: 0; flex: none; }
.status-bar .status-btn:last-child:nth-child(odd) { grid-column: span 2; }

.os-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 1rem;
  background: rgba(15, 28, 38, 0.85);
  overflow-y: auto;
}
.os-modal-content {
  --winter-deep: #2f5d7c;
  --winter-ice: #9cc7e3;
  position: relative;
  width: 100%;
  max-width: 500px;
  margin-top: 2rem;
  padding: 2.5rem 0.75rem 0.75rem;
  border: 2px solid var(--winter-ice);
  border-radius: 15px;
  background: #eaf4fb;
  color: #1b2a36;
}
.os-modal-content :deep(.os-card) { background: transparent; border: 0; }
.os-modal-content :deep(.eyebrow) { display: none; }
.os-modal-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: var(--winter-deep);
  cursor: pointer;
}
.os-modal-close::before,
.os-modal-close::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 14px;
  height: 2px;
  background: white;
  transform: translate(-50%, -50%) rotate(45deg);
}
.os-modal-close::after { transform: translate(-50%, -50%) rotate(-45deg); }
</style>
