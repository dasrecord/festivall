<template>
  <div class="basic">
    <h1>THE BLESSED COAST</h1>
    <h3>
      Welcome to the Blessed Coast Performers showcase.<br />
      Here, we celebrate the incredible talent that has graced our stages over the years. From
      emerging artists to established acts, our festival has been a platform for a diverse range of
      performers who have left an indelible mark on our community. Join us in honoring their
      contributions and reliving the magic they brought to our festival. We look forward to many
      more years of unforgettable performances.
    </h3>
    <CarouselComponent :slides="slides" :interval="3600" controls indicators></CarouselComponent>
    <DetailsPanel>
      <template #link1>
        <router-link to="/blessedcoastfamily">Learn more</router-link>
      </template>
      <template #link2>
        <router-link to="#">Explore</router-link>
      </template>
      <template #link3
        >our performers from: <br /><br />
        <router-link to="/blessedcoast2015performers">2015</router-link><br />

        <router-link to="/blessedcoast2016performers">2016</router-link><br. /><br />

        <router-link to="/blessedcoast2017performers">2017</router-link><br. /><br />

        <router-link to="/blessedcoast2018performers">2018</router-link><br. />
      </template>
      <template #link4>
        <router-link to="#">amenities.</router-link>
      </template>
    </DetailsPanel>
    <BlessedCoastCalltoAction />
  </div>
</template>

<script>
// import CountdownTimer from '@/components/CountdownTimer.vue'
import CarouselComponent from '@/components/carousel/CarouselComponent.vue'
import DetailsPanel from '@/components/DetailsPanel.vue'
import BlessedCoastCalltoAction from '@/components/BlessedCoastCalltoAction.vue'

// Dynamically import all images from the @/assets/images directory
const images = import.meta.glob('@/assets/images/blessed/bc_past_performers/2018/*.jpg')

export default {
  components: {
    CarouselComponent,
    DetailsPanel,
    BlessedCoastCalltoAction
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
.basic {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 1rem;
  text-align: center;
}
.carousel {
  margin-top: 1rem;
}

.carousel-item {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 0.5rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.2);
}

.carousel-item img {
  background-color: black;
  object-fit: scale-down;
  transition: transform 0.5s ease;
}

.carousel-indicators {
  display: none;
}
</style>
