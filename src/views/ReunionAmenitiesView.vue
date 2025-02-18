<script>
import CountdownTimer from '@/components/CountdownTimer.vue'
import FrogImage from '@/assets/images/frog.png'
import CalltoAction from '@/components/CalltoAction.vue'
import DetailsPanel from '@/components/DetailsPanel.vue'

import bitcoin from '@/assets/images/reunion_amenities/bitcoin.png'
import campsite_parking from '@/assets/images/reunion_amenities/campsite_parking.png'
import meals from '@/assets/images/reunion_amenities/meals.png'
import meal_ticket from '@/assets/images/reunion_amenities/meal_ticket.png'
import kitchen from '@/assets/images/reunion_amenities/kitchen.png'
import paw from '@/assets/images/reunion_amenities/paw.png'
import playground from '@/assets/images/reunion_amenities/playground.png'
import pool from '@/assets/images/reunion_amenities/pool.png'
import potable_water from '@/assets/images/reunion_amenities/potable_water.png'
import projector from '@/assets/images/reunion_amenities/projector.png'
import quiet from '@/assets/images/reunion_amenities/quiet.png'
import showers from '@/assets/images/reunion_amenities/showers.png'
import speakers from '@/assets/images/reunion_amenities/speakers.png'
import target from '@/assets/images/reunion_amenities/target.png'
import ticket_scanner from '@/assets/images/reunion_amenities/ticket_scanner.png'

export default {
  components: {
    CountdownTimer,
    CalltoAction,
    DetailsPanel
  },
  data() {
    return {
      frogImage: FrogImage,
      bitcoin: bitcoin,
      campsite_parking: campsite_parking,
      meals: meals,
      meal_ticket: meal_ticket,
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
      THE REUNION‍ <br />
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
        <img :src="meal_ticket" alt="target" class="amenity-icon" />
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
  /* background: #f9f9f9; */
  padding: 0.5rem 1rem;
  border-radius: 8px;
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); */
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
