<script>
import CountdownTimer from '@/components/CountdownTimer.vue'
import FrogImage from '@/assets/images/frog.png'
import CalltoAction from '@/components/CalltoAction.vue'
import DetailsPanel from '@/components/DetailsPanel.vue'

import reunion_emblem from '@/assets/images/reunion_emblem_white.png'
import { analyticsMixin } from '@/mixins/analytics.js'
import { REUNION_AMENITIES } from '@/data/reunionAmenities.js'

export default {
  mixins: [analyticsMixin],
  components: {
    CountdownTimer,
    CalltoAction,
    DetailsPanel
  },
  data() {
    return {
      reunion_emblem: reunion_emblem,
      frogImage: FrogImage,
      amenities: REUNION_AMENITIES
    }
  },
  mounted() {
    // Track page view
    this.trackPageView('Reunion Amenities', 'reunion')
  }
}
</script>

<template>
  <div class="basic">
    <CountdownTimer />
    <h1>
      <RouterLink to="/reunion" aria-label="Reunion festival home">
        <img
          :src="reunion_emblem"
          alt="Reunion"
          class="reunion-emblem"
          style="max-width: 600px"
        />
      </RouterLink>
      <br />
      <img :src="frogImage" alt="frog" class="frog-image" />
    </h1>
    <h2>AMENITIES & INFO:</h2>
    <div class="amenities">
      <div v-for="item in amenities" :key="item.label" class="amenity">
        <img :src="item.icon" :alt="item.label" class="amenity-icon" />
        <span>{{ item.label }}</span>
      </div>
    </div>
    <DetailsPanel>
      <template #link1>
        <RouterLink to="/reunionfamily">Learn more</RouterLink>
      </template>
      <template #link2>
        <RouterLink to="/reunionteam">Meet the team</RouterLink>
      </template>
      <template #link3>
        <RouterLink to="/reunionsoundsystem">our custom soundsystem.</RouterLink>
      </template>
      <template #link4>
        <RouterLink to="/reunionamenities">amenities.</RouterLink>
      </template>
    </DetailsPanel>
    <CalltoAction />
  </div>
</template>

<style scoped>
.basic {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  text-align: center;
}
.reunion-emblem {
  width: 90%;
  max-width: 600px;
  cursor: pointer;
}

.frog-image {
  width: 300px;
}
img {
  max-width: 100%;
  height: auto;
}

.amenities {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 2rem 0;
  width: 100%;
  max-width: 900px;
}

@media (min-width: 480px) {
  .amenities {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) {
  .amenities {
    grid-template-columns: repeat(4, 1fr);
  }
}

.amenity {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0.6rem;
  padding: 1.2rem 0.75rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  transition: background 0.2s, transform 0.2s;
}

.amenity:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

.amenity span {
  font-size: 0.8rem;
  line-height: 1.3;
  opacity: 0.9;
}

.amenity-icon {
  width: 56px;
  height: 56px;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
}
@media (min-width: 1024px) {
  .basic {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
}
</style>
