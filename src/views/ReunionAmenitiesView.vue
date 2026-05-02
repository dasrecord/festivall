<script>
import CountdownTimer from '@/components/CountdownTimer.vue'
import FrogImage from '@/assets/images/frog.png'
import CalltoAction from '@/components/CalltoAction.vue'
import DetailsPanel from '@/components/DetailsPanel.vue'

import bitcoin from '@/assets/images/icons/bitcoin.png'
import campsite_parking from '@/assets/images/icons/campsite_parking.png'
import meals from '@/assets/images/icons/meals.png'
import kitchen from '@/assets/images/icons/kitchen.png'
import paw from '@/assets/images/icons/paw.png'
import playground from '@/assets/images/icons/playground.png'
import pool from '@/assets/images/icons/pool.png'
import potable_water from '@/assets/images/icons/potable_water.png'
import projector from '@/assets/images/icons/projector.png'
import quiet from '@/assets/images/icons/quiet.png'
import showers from '@/assets/images/icons/showers.png'
import speakers from '@/assets/images/icons/speakers.png'
import target from '@/assets/images/icons/target.png'
import ticket_scanner from '@/assets/images/icons/ticket_scanner.png'
import reunion_emblem from '@/assets/images/reunion_emblem_white.png'
import arcade from '@/assets/images/icons/arcade.png'
import quiz from '@/assets/images/icons/quiz.png'
import grounds_map from '@/assets/images/icons/grounds_map.png'
import lineup from '@/assets/images/icons/lineup.png'
import front_gate from '@/assets/images/icons/front_gate.png'
import radio from '@/assets/images/icons/radio.png'
import workshop from '@/assets/images/icons/workshop.png'
import art_installation from '@/assets/images/icons/art_installation.png'
import sms from '@/assets/images/icons/sms.png'
import photography from '@/assets/images/icons/photography.png'
import { analyticsMixin } from '@/mixins/analytics.js'

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
      amenities: [
        // Arrival & tech
        { icon: ticket_scanner, label: 'In house ticketing system' },
        { icon: front_gate, label: 'Self check-in kiosk' },
        { icon: lineup, label: 'Customize schedule' },
        { icon: grounds_map, label: 'Detailed grounds map' },
        { icon: sms, label: 'Text notifications' },
        // Music & vibes
        { icon: speakers, label: 'Custom sound system' },
        { icon: radio, label: 'Festival FM radio broadcast' },
        { icon: projector, label: 'Projection mapped visuals' },
        // Food
        { icon: meals, label: 'Self-serve meal kiosk' },
        { icon: kitchen, label: 'Shared kitchen available' },
        { icon: potable_water, label: 'Potable water on site' },
        { icon: bitcoin, label: 'Bitcoin and Lightning accepted' },
        // Activities
        { icon: quiz, label: 'Scavenger hunt' },
        { icon: photography, label: 'Interactive photo booth' },
        { icon: workshop, label: 'Live workshops' },
        { icon: art_installation, label: 'Art installations' },
        { icon: arcade, label: 'Retro video game arcade' },
        { icon: target, label: 'Nerf gun battle arena' },
        // Site & comfort
        { icon: campsite_parking, label: 'Campsite parking' },
        { icon: showers, label: 'Warm showers available' },
        { icon: pool, label: 'Wading pool to cool off' },
        { icon: playground, label: "Children's playground" },
        { icon: quiet, label: 'Quiet family camping area' },
        // Rules
        { icon: paw, label: 'Leave pets at home' },
      ]
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
      <img
        :src="reunion_emblem"
        alt="reunion"
        class="reunion-emblem"
        style="cursor: pointer; max-width: 600px"
        @click="$router.push('/reunion')"
      />
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
