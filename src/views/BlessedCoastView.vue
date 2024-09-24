<script>
import wolf_image from '@/assets/images/blessed/blessed_coast_festival_coming_soon.jpg'
import BlessedCoastCalltoAction from '@/components/BlessedCoastCalltoAction.vue'

export default {
  components: {
    BlessedCoastCalltoAction
  },
  data() {
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
        <iframe
          width="100%"
          height="300"
          src="https://www.youtube.com/embed/x7OlE-qvZms?si=zXu__l3U05-20ODD"
          title="Blessed Coast Trailer"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>
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
  border-radius: 25px;
  position: relative;
  z-index: 1;
}
.video-wrapper {
  overflow: hidden;
  border-radius: 25px;
  position: relative;
  z-index: 1;
}
.video-wrapper iframe {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  pointer-events: auto;
}
</style>
