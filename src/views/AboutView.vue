<template>
  <div class="about">
    <h2>
      The Reunion, Impact Festival, and Blessed Coast are music events that celebrate electronic
      music across Canada, featuring top Canadian talents. <br />
      Prasenjit Das, also known as Das Record, is a doctor by day and a DJ and coder by night. His
      live piano and electronic music act has been showcased at these festivals over several years.
      Behind the scenes, he is A&R for Evolved Music Group, an international artist management
      agency and music firm, that supports artists with A&R and publishing consultants across
      Canada, the US, and Europe.
    </h2>
  </div>
  <div class="playbills">
    <img v-for="(image, index) in imageList" :key="index" :src="image" alt="playbill" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const images = import.meta.glob('../assets/images/das_record/playbills/*.*')
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

<style scoped>
.about {
  padding: 2rem;
  text-align: center;
}
.playbills {
  display: grid;
  grid-template-columns: repeat(2, 2fr);
  gap: 0.5rem;
}

img {
  border-radius: 15px;
}
@media (min-width: 1024px) {
  .about {
    display: flex;
    flex-direction: column;
  }
  .playbills {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
