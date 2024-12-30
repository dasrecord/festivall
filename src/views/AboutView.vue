<template>
  <div class="about">
    <h2>
      My name is Prasenjit Das,and I'm a doctor by day and a DJ and coder by night.<br />
      FESTIVALL brings together all of my music ventures under one roof and represents the best of
      the Canadian electronic music scene. <br /><br />Behind the scenes, I am the A&R for Evolved
      Music Group, an international artist management agency and music firm, that supports artists
      with A&R and publishing consultants across Canada, the US, and Europe.<br /><br />
      <RouterLink to="dasrecord">CLICK HERE TO LEARN MORE ABOUT ME</RouterLink>
    </h2>
    <div class="playbills">
      <img v-for="(image, index) in imageList" :key="index" :src="image" alt="playbill" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

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
  padding: 1rem;
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
