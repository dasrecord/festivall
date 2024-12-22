<template>
  <!-- <CountdownTimer target-year="2025" target-month="08" target-day="01" /> -->
  <div class="basic">
    <h1>Blessed Coast Festival</h1>
    <div class="socials">
      <a
        href="https://www.facebook.com/blessedfestivalbc/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <IconFacebook class="icon" />
      </a>
      <a
        href="https://www.instagram.com/blessedcoastfestivalbc/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <IconInstagram class="icon" />
      </a>
    </div>
    <p>
      Blessed Coast is a Celebration of Coastal Arts and Culture taking place in Squamish, BC on the
      traditional, ancestral and unceded territory of the Coast Salish peoples - Skwxwú7mesh
      (Squamish), Tsleil-Waututh & Musqueam First Nations.
    </p>
    <video controls :src="videoSrc" class="responsive-video">
      Your browser does not support the video tag.
    </video>
    <div class="landing_page_images">
      <img
        v-for="(image, index) in imageList"
        :key="index"
        :src="image"
        :class="{ enlarged: enlargedImage === index }"
        @click="toggleEnlarge(index)"
        alt="playbill"
      />
    </div>
    <BlessedCoastCalltoAction />
  </div>
</template>
<script>
import BlessedCoastCalltoAction from '@/components/BlessedCoastCalltoAction.vue'
// import CountdownTimer from '@/components/CountdownTimer.vue'
import IconFacebook from '@/components/icons/IconFacebook.vue'
import IconInstagram from '@/components/icons/IconInstagram.vue'

import { useHead } from '@vueuse/head'
import { ref, onMounted } from 'vue'
const images = import.meta.glob('@/assets/images/blessed/bc_landing_page/*.{jpg,jpeg,png}')
const video = import('@/assets/videos/blessed_coast/bc_festival_trailer.mp4')

export default {
  name: 'BlessedCoastView',
  components: {
    BlessedCoastCalltoAction,
    // CountdownTimer,e
    IconFacebook,
    IconInstagram
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
    const enlargedImage = ref(null)
    const videoSrc = ref('')

    onMounted(async () => {
      try {
        const imagePaths = Object.keys(images)
        imagePaths.sort((a, b) => b.localeCompare(a)) // Sort filenames in descending order

        for (const path of imagePaths) {
          const module = await images[path]()
          imageList.value.push(module.default)
        }

        const videoModule = await video
        videoSrc.value = videoModule.default
      } catch (error) {
        console.error('Error during onMounted hook:', error)
      }
    })

    const toggleEnlarge = (index) => {
      enlargedImage.value = enlargedImage.value === index ? null : index
    }

    return {
      imageList,
      enlargedImage,
      toggleEnlarge,
      videoSrc
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  font-family: Amandine, sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 100vw !important;
}

.socials {
  display: flex;
  flex-direction: row;
  margin-top: -1rem;
}
.icon {
  width: 32px;
  height: 32px;
  fill: #531a4a;
  stroke: #531a4a;
  stroke-width: 0;
  margin: 0.5rem;
}

.basic {
  /* margin: -1rem; */
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
  border-radius: 10px;
  margin-bottom: 1rem;
}
h1 {
  font-size: 3rem;
  font-weight: 700;
  margin: 1rem;
  color: #531a4a;
}
p {
  font-family: Helvetica, sans-serif;
  font-size: 1.5rem;
  color: #531a4a;
}

.landing_page_images {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.landing_page_images img {
  border-radius: 10px;

  transition: transform 0.3s ease-in-out;
  cursor: pointer;
}

.landing_page_images img.enlarged {
  transform: scale(2);
  z-index: 10;
  position: relative;
}

a {
  border-radius: 10px;
}
a:hover {
  background-color: white;
}
@media (max-width: 768px) {
  .basic {
    font-size: 1.5rem;
  }
  .landing_page_images {
    grid-template-columns: repeat(2, 1fr);
  }
  .icon {
    width: 24px;
    height: 24px;
  }
  h1 {
    font-size: 3rem;
  }
  p {
    font-size: 1rem;
  }
}
</style>
