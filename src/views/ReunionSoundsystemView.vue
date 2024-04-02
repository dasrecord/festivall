<script>
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
import CalltoAction from '@/components/CalltoAction.vue'

export default {
  components: {
    CarouselComponent,
    CalltoAction
  },
  data: () => ({
    slides: [image1, image2, image3, image4, image5, image6, image7, image8, image9]
  })
}
</script>
<template>
  <div class="basic">
    <h1>THE REUNION‍ <br /></h1>
    <h2>Soundsystem <br /><br /></h2>
    <h3>
      Our festival is proud to present a bespoke soundsystem with custom imported hardware and a
      meticulously crafted design. Assembled by our in-house team, the rig consists of a pair of
      horn loaded subwoofers that produce an unparalleled low end. Both the front of house and stage
      booth monitors are equipped with mid range drivers that yield a smooth and clear upper
      register. For artists and listeners alike, the Reunion rig is a truly special sound system.<br /><br />
    </h3>
    <CarouselComponent :slides="slides" :interval="3000" controls indicators />
    <CalltoAction />
  </div>
</template>

<style>
.basic {
  padding: 2rem;
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
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
</style>
