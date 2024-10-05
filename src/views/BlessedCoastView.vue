<script>
import BlessedCoastCalltoAction from '@/components/BlessedCoastCalltoAction.vue'
import { useHead } from '@vueuse/head'

export default {
  name: 'BlessedCoastView',
  components: {
    BlessedCoastCalltoAction
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

    return {}
  }
}
</script>

<template>
  <div class="background-container"></div>
  <div class="basic">
    <div class="video">
      <div class="video-wrapper">
        <div class="iframe-container">
          <iframe
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
.background-container {
  background-image: url('/src/assets/images/blessed/bc_coming_soon_wide.png');
  background-size: cover; /* Adjusts the background image to cover the entire container */
  background-position: center; /* Centers the background image */
  background-repeat: no-repeat; /* Prevents the background image from repeating */
  min-height: 100vh; /* Ensures the container covers the entire viewport height */
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
}
.basic {
  position: relative;
  top: 100vh; /* Matches the height of the background image */
}
.call-to-action {
  width: 100%;
  text-align: center;
  border: 3px solid #f0f0f0;
  border-radius: 30px;
  margin-top: 1rem;
  font-family: 'amandine', sans-serif;
  font-weight: 700;
}w
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
}
.iframe-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: 25px;
}
.iframe-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 25px; /* Apply border radius to iframe */
  box-shadow: 0 0 0 9999px rgb(0, 0, 0) inset; /* Ensure the border radius is applied */
}
h1 {
  font-size: 2rem;
  color: white;
  text-align: center;
}
img {
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  width: 100%;
  border-radius: 25px;
}

a:hover {
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  color: white;
}
</style>
