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
        <div class="iframe-container">
          <iframe
            width="100%"
            height="auto"
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
  overflow: hidden;
  position: relative;
  z-index: 1;
  margin-top: 1rem;
}
.iframe-container {
  overflow: hidden;
}
.iframe-container iframe {
  width: 100%;
  height: 300px;
  /* height: 100%; */
  border-radius: 25px;
}
</style>
