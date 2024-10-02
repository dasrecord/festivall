<template>
  <div class="basic">
    <h1>THE BLESSED COAST</h1>
    <h3>
      Blessed Coast is a boutique family friendly festival with limited capacity, featuring local
      talent and showcasing the most inspired yoga teachers and facilitators from the Lower Mainland
      and the Sea to Sky. It is opened and closed with a ceremony lead by local indigenous elders
      powered mainly by renewable energy - with a leave no trace philosophy, a no drugs and alcohol
      policy and even a bike and solar powered green energy stage in our family fair area of the
      festival which also hosts vendors, artisans and cuisine from around the world.
    </h3>
    <CarouselComponent :slides="slides" :interval="3600" controls indicators></CarouselComponent>

    <DetailsPanel>
      <template #link1>
        <router-link to="/blessedcoastfamily">Learn more</router-link>
      </template>
      <template #link2>
        <router-link to="/synergistic">Explore</router-link>
      </template>
      <template #link3
        >our performers from: <br /><br />
        <router-link to="/blessedcoast2015performers">2015</router-link><br />

        <router-link to="/blessed2016performers">2016</router-link><br. /><br />

        <router-link to="/blessed2017performers">2017</router-link><br. /><br />

        <router-link to="/blessed2018performers">2018</router-link><br. />
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
const images = import.meta.glob('@/assets/images/blessed/bc_the_early_years/*.jpg')

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
h1 {
  font-size: 2rem;
  color: white;
  text-align: center;
}
img {
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  width: 100%;
  border-radius: 25px;
}

a:hover {
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  color: white;
}
</style>
