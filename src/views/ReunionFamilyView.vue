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

<script>
import CountdownTimer from '@/components/CountdownTimer.vue'
import CarouselComponent from '@/components/carousel/CarouselComponent.vue'
import DetailsPanel from '@/components/DetailsPanel.vue'
import CalltoAction from '@/components/CalltoAction.vue'
import reunion_emblem from '@/assets/images/reunion_emblem_white.png'

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
      reunion_emblem,
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

<style scoped>
.basic,
h2 {
  padding: 1rem;
  text-align: center;
}

.carousel-wrapper {
  margin: 2rem auto;
  max-width: 800px;
}
img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}
.reunion-emblem {
  width: 100%;
  height: auto;
}

@media (max-width: 600px) {
  .basic {
    padding: 0.5rem;
  }

  .carousel-wrapper {
    max-width: 100%; /* Allow the carousel to take full width on smaller screens */
  }

  h2 {
    font-size: 1.2rem; /* Adjust font size for smaller screens */
  }
}
</style>
