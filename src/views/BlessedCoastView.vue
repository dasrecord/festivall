<script>
import BlessedCoastCalltoAction from '@/components/BlessedCoastCalltoAction.vue'
import CountdownTimer from '@/components/CountdownTimer.vue'
import { useHead } from '@vueuse/head'
import { ref, onMounted } from 'vue'
const images = import.meta.glob('@/assets/images/blessed/bc_landing_page/*.{jpg,jpeg,png}')

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

    onMounted(async () => {
      const imagePaths = Object.keys(images)
      imagePaths.sort((a, b) => b.localeCompare(a)) // Sort filenames in descending order

      for (const path of imagePaths) {
        const module = await images[path]()
        imageList.value.push(module.default)
      }
    })

    return {
      imageList
    }
  }
}
</script>

<template>
  <div class="basic">
    <h1>Blessed Coast Festival</h1>
    <!-- <video width="320" height="240" controls>
      <source src="path_to_your_video.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video> -->
    <!-- <img :src="mushroomImage" alt="mushroom" /> -->
    <p>
      Blessed Coast is a Celebration of Coastal Arts and Culture taking place in Squamish, BC on the
      traditional, ancestral and unceded territory of the Coast Salish peoples – Skwxwú7mesh
      (Squamish), Tsleil-Waututh & Musqueam First Nations.
    </p>
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
  height: 100%;
  display: flex;
  flex-direction: column;
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
  width: 100vw;
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
