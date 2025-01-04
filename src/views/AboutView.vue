<template>
  <div class="about">
    <h2>
      My name is Prasenjit Das, and I'm a doctor by day and a DJ and coder by night.<br />
      FESTIVALL brings together all of my music ventures under one roof and represents the best of
      the Canadian electronic music scene. <br /><br />Behind the scenes, I am the A&R for Evolved
      Music Group, an international artist management agency and music firm, that supports artists
      with A&R and publishing consultants across Canada, the US, and Europe.<br /><br />
      <div class="links">
        <div class="link">
          <RouterLink to="dasrecord">CLICK HERE TO LEARN MORE ABOUT ME</RouterLink>
        </div>
        <div class="link">
          <RouterLink to="testimonials"
            >CLICK HERE TO<br />
            READ WHAT OTHERS HAVE TO SAY
          </RouterLink>
        </div>
      </div>
    </h2>

    <iframe
      class="spotify"
      style="border-radius: 12px"
      src="https://open.spotify.com/embed/playlist/2RXN8qyLntleaVvFNxQsQs?utm_source=generator&theme=0"
      width="100%"
      height="152"
      frameBorder="0"
      allowfullscreen=""
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    ></iframe>
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
.links {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
.link {
  width: 40%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 15px;
}
.spotify {
  margin-bottom: 0.5rem;
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
