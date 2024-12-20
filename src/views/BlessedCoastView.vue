<script>
import BlessedCoastCalltoAction from '@/components/BlessedCoastCalltoAction.vue'
import CountdownTimer from '@/components/CountdownTimer.vue'
import { useHead } from '@vueuse/head'
import { ref, onMounted } from 'vue'
const images = import.meta.glob('@/assets/images/blessed/bc_landing_page/*.{jpg,jpeg,png}')
const video = import('@/assets/videos/blessed_coast/bc_festival_trailer.mp4')

export default {
  name: 'BlessedCoastView',
  components: {
    BlessedCoastCalltoAction,
    CountdownTimer
  },
  setup() {
    useHead({
      title: 'BLESSED COAST FESTIVAL',
      meta: [
        {
          name: 'description',
          content:
            'Blessed is a Celebration of Coastal Arts and Culture taking place in Squamish, BC.'
        },
        {
          name: 'keywords',
          content:
            'Festival, Festiv-All, Impact, Evolved, Blessed Coast, Reunion, festival, Das Record'
        }
      ]
    })

    const imageList = ref([])
    const videoSrc = ref('')

    onMounted(async () => {
      const imagePaths = Object.keys(images)
      imagePaths.sort((a, b) => b.localeCompare(a)) // Sort filenames in descending order

      for (const path of imagePaths) {
        const module = await images[path]()
        imageList.value.push(module.default)
      }
      const videoModule = await video
      videoSrc.value = videoModule.default
    })

    return {
      imageList,
      videoSrc
    }
  }
}
</script>

<template>
  <div class="basic">
    <h1>Blessed Coast Festival</h1>
    <p>
      Blessed Coast is a Celebration of Coastal Arts and Culture taking place in Squamish, BC on the
      traditional, ancestral and unceded territory of the Coast Salish peoples – Skwxwú7mesh
      (Squamish), Tsleil-Waututh & Musqueam First Nations.
    </p>
    <video controls :src="videoSrc" class="responsive-video">
      Your browser does not support the video tag.
    </video>
    <div class="landing_page_images">
      <img v-for="(image, index) in imageList" :key="index" :src="image" alt="playbill" />
    </div>
    <BlessedCoastCalltoAction />
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
  font-family: Amandine, sans-serif;
  display: flex;
  flex-direction: column;
  padding: 0 !important;
  max-width: 100vw !important;
}

.basic {
  padding: -1rem;
  margin: -1rem;
  background-color: #ae9def;
  color: #531a4a;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}
.responsive-video {
  width: 100%;
  height: auto;
}
h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 1rem;
  color: #531a4a;
}
p {
  font-family: Helvetica, sans-serif;
  font-size: 1rem;
  color: #531a4a;
}

.landing_page_images {
  display: grid;
  gap: 5px;
  padding: 1rem;
  grid-template-columns: repeat(3, 1fr);
}
img {
  border-radius: 5px;
}
</style>
