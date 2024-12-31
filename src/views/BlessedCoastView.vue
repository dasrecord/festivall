<template>
  <div class="basic">
    <h1>Blessed Coast Festival</h1>
    <div class="socials">
      <a
        href="https://www.facebook.com/blessedfestivalbc/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <IconFacebook class="icon" />
      </a>
      <a
        href="https://www.instagram.com/blessedcoastfestivalbc/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <IconInstagram class="icon" />
      </a>
    </div>
    <p>
      Blessed Coast is a Celebration of Coastal Arts and Culture taking place in Squamish, BC on the
      traditional, ancestral and unceded territory of the Coast Salish peoples - Skwxwú7mesh
      (Squamish), Tsleil-Waututh & Musqueam First Nations.
    </p>
    <video controls :src="videoSrc" class="responsive-video">
      Your browser does not support the video tag.
    </video>
    <div class="contact-form">
      <div class="contact-us">
        <h2>Drop Us A Line</h2>
        We'd love to hear from you.<br /><br />
      </div>
      <form @submit.prevent="submitForm">
        <div>
          <label for="name">Name:</label>
          <input type="text" id="name" v-model="form.name" required />
        </div>
        <div>
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="form.email" required />
        </div>
        <div>
          <label for="message">Message:</label>
          <textarea id="message" v-model="form.message" required></textarea>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>

    <div class="landing_page_images">
      <img
        v-for="(image, index) in imageList"
        :key="index"
        :src="image"
        :class="{ enlarged: enlargedImage === index }"
        @click="toggleEnlarge(index)"
        alt="playbill"
      />
    </div>
    <BlessedCoastCalltoAction />
  </div>
</template>

<script>
import BlessedCoastCalltoAction from '@/components/BlessedCoastCalltoAction.vue'
import IconFacebook from '@/components/icons/IconFacebook.vue'
import IconInstagram from '@/components/icons/IconInstagram.vue'
import axios from 'axios'
import { useHead } from '@vueuse/head'
import { ref, onMounted } from 'vue'

const images = import.meta.glob('@/assets/images/blessed/bc_landing_page/*.{jpg,jpeg,png}')
const video = import('@/assets/videos/blessed_coast/bc_festival_trailer.mp4')

export default {
  name: 'BlessedCoastView',
  components: {
    BlessedCoastCalltoAction,
    IconFacebook,
    IconInstagram
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

    const imageList = ref([])
    const enlargedImage = ref(null)
    const videoSrc = ref('')
    const form = ref({
      name: '',
      email: '',
      message: ''
    })

    onMounted(async () => {
      try {
        const imagePaths = Object.keys(images)
        imagePaths.sort((a, b) => b.localeCompare(a)) // Sort filenames in descending order

        for (const path of imagePaths) {
          const module = await images[path]()
          imageList.value.push(module.default)
        }

        const videoModule = await video
        videoSrc.value = videoModule.default
      } catch (error) {
        console.error('Error during onMounted hook:', error)
      }
    })

    const toggleEnlarge = (index) => {
      enlargedImage.value = enlargedImage.value === index ? null : index
    }

    const submitForm = async () => {
      try {
        const response = await axios.post(
          'https://relayproxy.vercel.app/blessed_coast_slack',
          {
            text: `Name: ${form.value.name}\nEmail: ${form.value.email}\nMessage: ${form.value.message}`
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        if (response.status === 200) {
          alert('Form submitted successfully!')
          form.value.name = ''
          form.value.email = ''
          form.value.message = ''
        } else {
          alert('Failed to submit the form.')
        }
      } catch (error) {
        console.error('Error submitting form:', error)
        alert('An error occurred while submitting the form.')
      }
    }

    return {
      imageList,
      enlargedImage,
      toggleEnlarge,
      videoSrc,
      submitForm,
      form
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  font-family: Amandine, sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 100vw !important;
}

.socials {
  display: flex;
  flex-direction: row;
  margin-top: -1rem;
}
.icon {
  width: 32px;
  height: 32px;
  fill: #531a4a;
  stroke: #531a4a;
  stroke-width: 0;
  margin: 0.5rem;
}

.basic {
  background-color: #ae9def;
  color: #531a4a;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}
.responsive-video {
  width: 100%;
  height: auto;
  border-radius: 10px;
  margin-bottom: 1rem;
}
h1,
h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 1rem;
  color: #531a4a;
}
p {
  font-family: Helvetica, sans-serif;
  font-size: 1.5rem;
  color: #531a4a;
}
.contact-form {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.contact-us {
  font-family: Helvetica;
  font-size: 1rem;
  font-weight: 700;
}
form,
label,
input,
textarea,
select {
  font-family: Helvetica;
  font-weight: 700;
  width: 500px;
  max-width: 80vw;
  display: block;
  margin-bottom: 10px;
}
button {
  font-family: Helvetica;
  background-color: white;
  width: 100%;
  max-width: 80vw;
  display: block;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}
button:hover {
}

.landing_page_images {
  margin-top: 20px;
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.landing_page_images img {
  border-radius: 10px;
  transition: transform 0.3s ease-in-out;
  cursor: pointer;
}

.landing_page_images img.enlarged {
  transform: scale(2);
  z-index: 10;
  position: relative;
}

a {
  border-radius: 10px;
}
a:hover {
  background-color: white;
}
@media (max-width: 768px) {
  .basic {
    font-size: 1.5rem;
  }
  .landing_page_images {
    grid-template-columns: repeat(2, 1fr);
  }
  .icon {
    width: 24px;
    height: 24px;
  }
  h1 {
    font-size: 3rem;
  }
  p {
    font-size: 1rem;
  }
}
</style>
