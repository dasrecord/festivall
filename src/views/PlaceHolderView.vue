<script setup>
import { ref, onMounted } from 'vue'

const images = import.meta.glob('../assets/images/mr_fudge/playbills/*.*')
const imageList = ref([])

onMounted(async () => {
  const imagePaths = Object.keys(images)
  imagePaths.sort((a, b) => b.localeCompare(a)) // Sort filenames in descending order

  for (const path of imagePaths) {
    const module = await images[path]()
    imageList.value.push(module.default)
  }
})
</script>
<template>
  <div class="basic">
    <h1>PLACEHOLDER</h1>
    <h2 class="description">
      "PLACHOLDER" is a quarterly event series curated by Mr. Fudge and Das Record. The events are
      held at Paved Arts in Saskatoon and feature a variety of high quality local and domestic
      electronic music artists. The series also showcases spoken word, live bands,
      singer/songwriters, and visual artists.
    </h2>
    <h3 class="presskits">
      <div>
        <a href="/docs/mr_fudge_presskit.pdf" target="_blank">MR. FUDGE<br />PRESSKIT</a>
      </div>
      <div>
        <RouterLink to="/das-record">DAS RECORD<br />PORTFOLIO</RouterLink>
      </div>
    </h3>
    <h3 class="upcoming-shows">
      <h2>UPCOMING SHOWS</h2>
      <div class="event">
        <h3>SPRING FLING</h3>
        <p>DATE</p>
      </div>
      <br />
      <div class="event">
        <h3>SUMMER JAM</h3>
        <p>DATE</p>
      </div>
      <br />
      <div class="event">
        <h3>FALL MIXER</h3>
        <p>DATE</p>
      </div>
      <br />
      <div class="event">
        <h3>WINTER FORMAL</h3>
        <p>DATE</p>
      </div>
    </h3>
    <div class="playbills">
      <img v-for="(image, index) in imageList" :key="index" :src="image" alt="playbill" />
    </div>
  </div>
</template>

<style scoped>
.basic {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  justify-items: flex-start;
  align-items: center;
}

.presskits {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
.playbills {
  display: grid;
  grid-template-columns: repeat(3, 2fr);
  gap: 0.5rem;
}

img {
  border-radius: 15px;
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
.fuse {
  width: 50%;
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
