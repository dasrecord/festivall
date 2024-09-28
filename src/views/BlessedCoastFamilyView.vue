<template>
  <div class="basic">
    <h1>THE BLESSED COAST</h1>
    <h3>
      Blessed Coast is a boutique family friendly festival with limited capacity, featuring local
      talent and showcasing the most inspired yoga teachers and facilitators from the Lower Mainland
      and the Sea to Sky. It is opened and closed with a ceremony lead by local Indigenous Elders
      and in its second year is a largely renewable energy powered event with a zero-waste, leave no
      trace philosophy, a no drugs and alcohol policy and even a bike and solar powered green energy
      stage in our family fair area of the festival which also hosts vendors, artisans and cuisine
      from around the world.
    </h3>
    <CarouselComponent :slides="slides" :interval="3600" controls indicators></CarouselComponent>

    <DetailsPanel>
      <template #link1>
        <router-link to="/blessedcoastfamily">Learn more</router-link>
      </template>
      <template #link2>
        <router-link to="#">Explore</router-link>
      </template>
      <template #link3>
        <router-link to="#">past accolades.</router-link>
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
const images = import.meta.glob('@/assets/images/blessed/family/*.jpg')

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

<style scoped>
.basic {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 1rem;
  text-align: center;
}
</style>
