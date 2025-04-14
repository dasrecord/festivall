<script>
import CountdownTimer from '@/components/CountdownTimer.vue'
import CarouselComponent from '@/components/carousel/CarouselComponent.vue'
import {
  image1,
  image2,
  image3,
  image4,
  image5,
  image6,
  image7,
  image8,
  image9
} from '@/assets/images/soundsystem'
import DetailsPanel from '@/components/DetailsPanel.vue'
import CalltoAction from '@/components/CalltoAction.vue'
import reunion_emblem from '@/assets/images/reunion_emblem_white.png'

export default {
  components: {
    CountdownTimer,
    CarouselComponent,
    DetailsPanel,
    CalltoAction
  },
  data: () => ({
    reunion_emblem,
    slides: [image1, image2, image3, image4, image5, image6, image7, image8, image9]
  })
}
</script>
<template>
  <div class="basic">
    <CountdownTimer :targetYear="2025" :targetMonth="8" :targetDay="29" />
    <img
      :src="reunion_emblem"
      alt="reunion"
      class="reunion-emblem"
      style="max-width: 600px; height: auto; cursor: pointer"
      @click="$router.push('/reunion')"
    />
    <h2>Soundsystem <br /></h2>
    <h3>
      Our festival is proud to present a bespoke soundsystem built with highest quality components
      produced in the United States. Assembled by our in-house team, the rig consists of a pair of
      horn-loaded subwoofers housed in fridge-sized enclosures resulting in an unparalleled low end.
      Both the front of house and stage booth monitors are equipped with diffusion horn-loaded
      compression drivers that yield a smooth and clear upper register. For artists and listeners
      alike, the Reunion rig is a truly special sound system that delivers crystal clear audio at
      every frequency. We're thrilled to share this labor of love with you, and can't wait for you
      to experience the power and precision of our sound system at our festival.<br /><br />
    </h3>
    <CarouselComponent :slides="slides" :interval="3600" controls indicators />
    <DetailsPanel>
      <template #link1>
        <router-link to="/reunionfamily">Learn more</router-link>
      </template>
      <template #link2>
        <router-link to="/reunionteam">Meet the team</router-link>
      </template>
      <template #link3>
        <router-link to="/reunionsoundsystem">our custom soundsystem.</router-link>
      </template>
      <template #link4>
        <router-link to="/reunionamenities">amenities.</router-link>
      </template>
    </DetailsPanel>
    <CalltoAction />
  </div>
</template>

<style scoped>
.basic h2 {
  padding: 1rem;
  text-align: center;
  align-items: center;
  justify-content: center;
}
img {
  display: inline;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (min-width: 1024px) {
  .basic {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
</style>
