<script>
import CountdownTimer from '@/components/CountdownTimer.vue'
import FrogImage from '@/assets/images/frog.png'
import CalltoAction from '@/components/CalltoAction.vue'
import DetailsPanel from '@/components/DetailsPanel.vue'

import bitcoin from '@/assets/images/icons/bitcoin.png'
import campsite_parking from '@/assets/images/icons/campsite_parking.png'
import meals from '@/assets/images/icons/meals.png'
import ticket from '@/assets/images/icons/ticket.png'
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

export default {
  components: {
    CountdownTimer,
    CalltoAction,
    DetailsPanel
  },
  data() {
    return {
      reunion_emblem: reunion_emblem,
      frogImage: FrogImage,
      bitcoin: bitcoin,
      campsite_parking: campsite_parking,
      meals: meals,
      ticket: ticket,
      kitchen: kitchen,
      paw: paw,
      playground: playground,
      pool: pool,
      potable_water: potable_water,
      projector: projector,
      quiet: quiet,
      showers: showers,
      speakers: speakers,
      target: target,
      ticket_scanner: ticket_scanner
    }
  }
}
</script>

<template>
  <div class="basic">
    <CountdownTimer :targetYear="2025" :targetMonth="8" :targetDay="29" />
    <h1>
      <img
        :src="reunion_emblem"
        alt="reunion"
        class="reunion-emblem"
        style="cursor: pointer' max-width:600px"
        @click="$router.push('/reunion')"
      />
      <img :src="frogImage" alt="frog" class="frog-image" />
      <br />
    </h1>
    <h2>AMENITIES & INFO:</h2>
    <div class="amenities">
      <div class="amenity">
        <img :src="ticket_scanner" alt="ticket_scanner" class="amenity-icon" />
        <span>In house ticketing system‍</span>
      </div>
      <div class="amenity">
        <img :src="campsite_parking" alt="campsite_parking" class="amenity-icon" />
        <span>Campsite‍ parking</span>
      </div>
      <div class="amenity">
        <img :src="meals" alt="meals" class="amenity-icon" />
        <span>Meals available on site‍</span>
      </div>
      <div class="amenity">
        <img :src="potable_water" alt="potable_water" class="amenity-icon" />
        <span>Potable water available on site‍</span>
      </div>
      <div class="amenity">
        <img :src="ticket" alt="target" class="amenity-icon" />
        <span>Scannable meal tickets</span>
      </div>
      <div class="amenity">
        <img :src="bitcoin" alt="bitcoin" class="amenity-icon" />
        <span>Bitcoin and Lightning accepted</span>
      </div>
      <div class="amenity">
        <img :src="kitchen" alt="kitchen" class="amenity-icon" />
        <span>Shared kitchen available‍</span>
      </div>
      <div class="amenity">
        <img :src="quiet" alt="quiet" class="amenity-icon" />
        <span>Quiet family camping area‍</span>
      </div>
      <div class="amenity">
        <img :src="showers" alt="showers" class="amenity-icon" />
        <span>Warm showers available‍</span>
      </div>
      <div class="amenity">
        <img :src="speakers" alt="speakers" class="amenity-icon" />
        <span>Custom sound system‍</span>
      </div>
      <div class="amenity">
        <img :src="projector" alt="projector" class="amenity-icon" />
        <span>Projection mapped visuals‍</span>
      </div>
      <div class="amenity">
        <img :src="pool" alt="pool" class="amenity-icon" />
        <span>Wading pool‍ to cool off</span>
      </div>
      <div class="amenity">
        <img :src="playground" alt="playground" class="amenity-icon" />
        <span>Children's Playground‍</span>
      </div>
      <div class="amenity">
        <img :src="target" alt="target" class="amenity-icon" />
        <span>Nerf gun battle arena‍</span>
      </div>
      <div class="amenity">
        <img :src="paw" alt="paw" class="amenity-icon" />
        <span>Leave pets at home.</span>
      </div>
    </div>
    <DetailsPanel>
      <template #link1>
        <router-link to="/reunionfamily">Learn more</router-link>
      </template>
      <template #link2>
        <router-link to="/reunionteam">Meet the team</router-link>
      </template>
      <template #link3>
        <router-link to="/reunionsoundsystem"> our custom soundsystem.</router-link>
      </template>
      <template #link4>
        <router-link to="/reunionamenities">amenities.</router-link>
      </template>
    </DetailsPanel>
    <CalltoAction />
  </div>
</template>

<style scoped>
.basic {
  text-align: center;
  padding: 1rem;
}

.frog-image {
  width: 300px;
}

.amenities {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
}

.amenity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.amenity-icon {
  height: auto;
  width: 50px;
  padding: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
@media (min-width: 1024px) {
  .basic {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
}
</style>
