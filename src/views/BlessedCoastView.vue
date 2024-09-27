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
        <!-- <iframe
          width="100%"
          height="300"
          src="https://www.youtube.com/embed/x7OlE-qvZms?si=zXu__l3U05-20ODD"
          title="Blessed Coast Trailer"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe> -->
        <iframe
          src="https://www.facebook.com/plugins/video.php?height=295&href=https%3A%2F%2Fwww.facebook.com%2Fblessedfestivalbc%2Fvideos%2F862716683897140%2F&show_text=false&width=560&t=0"
          style="border: none; overflow: hidden"
          scrolling="no"
          frameborder="0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
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
  width: 100%;
  border-radius: 25px;
  position: relative;
  z-index: 1;
}
.video-wrapper {
  overflow: hidden;
  border-radius: 25px;
  position: relative;
  z-index: 1;
  margin-top: 1rem;
}
.video-wrapper iframe {
  display: block;
  width: 100%;
  height: 500px;
  position: relative;
  z-index: 1;
  pointer-events: auto;
}
</style>
