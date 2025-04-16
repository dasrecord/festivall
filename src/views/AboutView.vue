<template>
  <div class="about">
    <img class="headshot" src="@/assets/images/reunion_team/Prasenjit.jpg" alt="Prasenjit Das" />
    <h1>Prasenjit Das M.D. B.Sc.</h1>
    Doctor by day and DJ by night.<br />
    <h2>
      FESTIVALL brings together all of my music ventures under one roof and represents the best of
      the Canadian electronic music circuit. <br /><br />
      <div class="label">Current Activities<br /></div>
      <ul class="current-activities">
        <li>
          <img :src="devops_icon" alt="devops icon" class="icon" />
          software developer for small businesses and entrepreneurs
        </li>
        <li>
          <img :src="headphones_icon" alt="headphones icon" class="icon" />
          resident DJ at Finn's @ The Parktown Hotel
        </li>
        <li>
          <img :src="headphones_icon" alt="headphones icon" class="icon" />
          rotation DJ @ Bokeh on the Plaza
        </li>
        <li>
          <img :src="music_icon" alt="music icon" class="icon" />
          composer and producer for the internationally acclaimed Mike Saint-Jules
        </li>
        <li>
          <img :src="devops_icon" alt="devops icon" class="icon" />
          devops engineer for independent electronic music festivals
        </li>
        <li>
          <img :src="vector_icon" alt="vector icon" class="icon" />
          freelance graphic designer for brands and startups
          <br />
        </li>
      </ul>
      Behind the scenes, I am the A&R for Evolved Music Group, an international artist management
      agency and music firm, that supports artists with A&R and publishing consultants across
      Canada, the US, and Europe.<br /><br />
      <div class="links">
        <div class="link">
          <RouterLink to="dasrecord">LEARN MORE ABOUT ME</RouterLink>
        </div>
        <div class="link">
          <RouterLink to="testimonials">READ WHAT OTHERS HAVE TO SAY</RouterLink>
        </div>
      </div>
    </h2>
    <iframe
      class="spotify"
      style="border-radius: 12px"
      src="https://open.spotify.com/embed/playlist/2RXN8qyLntleaVvFNxQsQs?utm_source=generator&theme=0"
      width="100%"
      height="352"
      frameBorder="0"
      allowfullscreen=""
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    ></iframe>
    <div class="playbills">
      <img
        v-for="(image, index) in imageList"
        :key="index"
        :src="image"
        alt="playbill"
        class="playbill-img"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import music_icon from '@/assets/images/icons/artist.png'
import devops_icon from '@/assets/images/icons/devops.png'
import headphones_icon from '@/assets/images/icons/headphones.png'
import vector_icon from '@/assets/images/icons/vectors.png'

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
  align-items: center;
  text-align: center;
}

.headshot {
  width: 300px;
  max-width: 50vw;
  border-radius: 50%;
  object-fit: cover; /* Ensure the image scales properly */
}

ul {
  padding: 0;
  margin: 0;
}

li {
  list-style: none;
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 10px;
}

li img.icon {
  margin-right: 10px;
  width: 24px;
  height: 24px;
  object-fit: contain; /* Ensure icons are not distorted */
}

h1,
.label {
  color: var(--festivall-baby-blue);
}

.current-activities {
  font-size: smaller;
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
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.playbills img.playbill-img {
  border-radius: 15px;
  width: 100%;
  height: auto;
  object-fit: cover; /* Ensure playbill images scale properly */
}

@media (min-width: 1024px) {
  .about {
    display: flex;
    flex-direction: column;
  }
  .playbills {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
