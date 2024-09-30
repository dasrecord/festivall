<script>
import wolf_image from '@/assets/images/blessed/blessed_coast_festival_coming_soon.jpg'
import BlessedCoastCalltoAction from '@/components/BlessedCoastCalltoAction.vue'
import { useHead } from '@vueuse/head'
useHead({
  title: 'BLESSED COAST FESTIVAL',
  meta: [
    {
      name: 'description',
      content: 'Blessed is a Celebration of Coastal Arts and Culture taking place in Squamish, BC.'
    },
    {
      name: 'keywords',
      content: 'Festival, Festiv-All, Impact, Evolved, Blessed Coast, Reunion, festival, Das Record'
    }
  ]
})

export default {
  name: 'BlessedCoastView',
  components: {
    BlessedCoastCalltoAction
  },
  setup() {
    useHead({
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

    return {
      wolfImage: wolf_image
    }
  }
}
</script>
<template>
  <div class="basic">
    <img class="wolf" :src="wolfImage" alt="wolf" />
    <div class="video">
      <div class="video-wrapper">
        <div class="iframe-container">
          <iframe
            width="560"
            height="315"
            src="https://www.facebook.com/plugins/video.php?height=295&href=https%3A%2F%2Fwww.facebook.com%2Fblessedfestivalbc%2Fvideos%2F862716683897140%2F&show_text=false&width=560&t=0"
            title="Blessed Coast Trailer"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>
    <BlessedCoastCalltoAction />
  </div>
</template>

<style scoped>
.basic {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
img {
  border-radius: 25px;
}
.video {
  width: 100%;
  position: relative;
  z-index: 1;
}
.video-wrapper {
  position: relative;
  z-index: 1;
  margin-top: 1rem;
}
.iframe-container {
  overflow: hidden;
  margin-top: 1rem;
}
.iframe-container iframe {
  width: 100%;
  height: 500px;
  border-radius: 25px;
}
</style>
