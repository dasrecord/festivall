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
    <div ref="videoContainer" class="video-container">
      <video
        v-if="shouldLoad && videoSrc"
        controls
        :src="videoSrc"
        class="responsive-video"
        allowfullscreen
        preload="metadata"
        @loadeddata="onVideoLoaded"
      >
        Your browser does not support the video tag.
      </video>
      <div v-else class="video-placeholder">
        <div class="loading-spinner">Loading Blessed Coast...</div>
      </div>
    </div>
    <div class="contact-form">
      <div class="contact-us">
        <h2>Drop Us A Line</h2>
        We'd love to hear from you.<br /><br />
      </div>
      <form @submit.prevent="submitForm">
        <div class="form-section">
          <label for="name">NAME</label>
          <input type="text" id="name" v-model="form.name" required />
        </div>
        <div class="form-section">
          <label for="email">EMAIL</label>
          <input type="email" id="email" v-model="form.email" required />
        </div>
        <div class="form-section">
          <label for="message">MESSAGE</label>
          <textarea id="message" v-model="form.message" required></textarea>
        </div>
        <button type="submit">SUBMIT</button>
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
import { logEvent } from 'firebase/analytics'
import { festivall_analytics } from '@/firebase'
import { useLazyVideo } from '@/composables/useLazyVideo.js'

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
    const { videoRef, shouldLoad, isLoaded, onVideoLoaded } = useLazyVideo()

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
        // Track page view
        logEvent(festivall_analytics, 'page_view', {
          page_title: 'Blessed Coast Festival',
          page_location: window.location.href
        })

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
      form,
      videoRef,
      shouldLoad,
      isLoaded,
      onVideoLoaded
    }
  }
}
</script>

<style scoped>
/* General Reset */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: Amandine, sans-serif;
}

/* Basic Layout */
.basic {
  background-color: #ae9def;
  color: #531a4a;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 1rem;
}

h1,
h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 1rem 0;
  color: #531a4a;
  text-align: center;
}

p {
  font-family: Helvetica, sans-serif;
  font-size: 1.2rem;
  color: #531a4a;
  text-align: center;
  margin: 1rem 0;
}

/* Social Icons */
.socials {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}

.icon {
  width: 32px;
  height: 32px;
  fill: #531a4a;
  stroke: #531a4a;
  stroke-width: 0.5px;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
}

.icon:hover {
  transform: scale(1.2);
}

/* Responsive Video */
.responsive-video {
  width: 100%;
  max-width: 800px;
  height: auto;
  border-radius: 10px;
  margin: 1rem 0;
}

/* Contact Form */
.contact-form {
  width: 100%;
  max-width: 600px;
  padding: 1.5rem;
  border: 1px solid #531a4a;
  border-radius: 15px;
  background-color: white;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;
}

.contact-us {
  font-family: Helvetica, sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  text-align: center;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-section label {
  font-size: 1rem;
  font-weight: 700;
  color: #531a4a;
}

input,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #531a4a;
  border-radius: 10px;
  font-family: Helvetica, sans-serif;
  font-size: 1rem;
}

textarea {
  resize: vertical;
}

button {
  width: 100%;

  padding: 0.75rem;
  background-color: #531a4a;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  align-self: center;
  transition: background-color 0.3s ease-in-out;
}

button:hover {
  background-color: #ae9def;
  color: #531a4a;
}

/* Landing Page Images */
.landing_page_images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 2rem 0;
  width: 100%;
  max-width: 800px;
}

.landing_page_images img {
  width: 100%;
  border-radius: 10px;
  transition: transform 0.3s ease-in-out;
  cursor: pointer;
}

.landing_page_images img.enlarged {
  transform: scale(1.5);
  z-index: 10;
  position: relative;
}

/* Links */
a {
  text-decoration: none;
  color: inherit;
  border-radius: 10px;
  transition: background-color 0.3s ease-in-out;
}

a:hover {
  background-color: white;
}

/* Media Queries */
@media (max-width: 768px) {
  .basic {
    font-size: 1rem;
  }

  .icon {
    width: 24px;
    height: 24px;
  }

  h1 {
    font-size: 1.8rem;
  }

  p {
    font-size: 1rem;
  }

  .landing_page_images {
    grid-template-columns: repeat(2, 1fr);
  }

  .contact-form {
    padding: 1rem;
  }
}

/* Video lazy loading styles */
.video-container {
  width: 100%;
  margin: 2rem 0;
  position: relative;
}

.video-placeholder {
  width: 100%;
  height: 300px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.loading-spinner {
  color: white;
  font-size: 1.2rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
