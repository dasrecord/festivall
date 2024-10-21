<script>
import fuse_image from '@/assets/images/fuse_collective/fuse_collective.jpg'
import CarouselComponent from '@/components/carousel/CarouselComponent.vue'

const images = import.meta.glob('@/assets/images/fuse_collective/playbills/*.jpg')

export default {
  components: { CarouselComponent },
  data() {
    return {
      fuse_image: fuse_image,
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
<template>
  <div class="basic">
    <h1>
      <!-- FUSE COLLECTIVE <br /> -->
      <img class="fuse" :src="fuse_image" alt="fuse" :style="{ height: '150px', width: '150px' }" />
      <br />
    </h1>
    <h2 class="description">
      Fuse Collective is a group of artists, musicians, producers, DJ's, production specialists, and
      promoters<br />
      all coming together to create and support new growth in the scene.
    </h2>
    <iframe
      width="100%"
      height="200"
      scrolling="no"
      frameborder="no"
      allow="autoplay"
      src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/68926512&color=%23000000&auto_play=true&hide_related=false&show_comments=false&show_user=false&show_reposts=false&show_teaser=true&visual=true"
    ></iframe>
  </div>
  <CarouselComponent :slides="slides" :interval="3600" controls indicators></CarouselComponent>
  <CalltoAction />
</template>

<style scoped>
.basic {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

a {
  display: inline-block;
  padding: 0.5rem 0.5rem;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  transition: box-shadow 0.4s ease-in-out;
}
a:hover {
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  color: white;
}

@media (min-width: 1024px) {
  .basic {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    justify-items: flex-start;
    align-items: center;
  }
  .fuse {
    display: flex;
    justify-self: center;
    align-items: center;
  }
}
</style>
