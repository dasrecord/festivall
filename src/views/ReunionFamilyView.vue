<template>
  <div class="basic">
    <CountdownTimer :targetYear="2025" :targetMonth="8" :targetDay="29" />
    <h1>THE REUNION‍</h1>
    <h2>About Our Festival</h2>
    <h3>
      The Reunion is an independent electronic music festival located just outside Saskatoon. We
      prioritize high quality local acts and support them with a cohesive and multitalented
      volunteer team. Our custom built sound system and in-house projection mapping team create a
      premium audio-visual experience for the most discerning of electronic music lovers. We are a
      family friendly event with an interest in growth, community, and sustainability.<br /><br />
    </h3>

    <CarouselComponent :slides="slides" :interval="3600" controls indicators></CarouselComponent>
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

<script>
import CountdownTimer from '@/components/CountdownTimer.vue'
import CarouselComponent from '@/components/carousel/CarouselComponent.vue'
import DetailsPanel from '@/components/DetailsPanel.vue'
import CalltoAction from '@/components/CalltoAction.vue'

// Dynamically import all images from the @/assets/images directory
const images = import.meta.glob('@/assets/images/reunion_about/*.jpg')

export default {
  components: {
    CountdownTimer,
    CarouselComponent,
    DetailsPanel,
    CalltoAction
  },
  data() {
    return {
      slides: []
    }
  },
  async created() {
    // Load all images
    for (const path in images) {
      const image = await images[path]()
      this.slides.push(image.default)
    }
  }
}
</script>

<style>
.basic,
h2 {
  padding: 1rem;
  text-align: center;
}
</style>
