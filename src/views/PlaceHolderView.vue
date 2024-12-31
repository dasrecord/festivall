<script setup>
import placeholder_emblem from '../assets/images/placeholder_logo_white.png'
import { ref, onMounted } from 'vue'
import axios from 'axios'

const images = import.meta.glob('../assets/images/mr_fudge/playbills/*.*')
const imageList = ref([])

const form = ref({
  name: '',
  email: '',
  applicant_type: '',
  act_type: '',
  act_name: '',
  act_description: '',
  track_mix_url: '',
  act_website: '',
  social_url: '',
  message: ''
})
const currentStep = ref(2)

const submitForm = async () => {
  try {
    const response = await axios.post(
      'https://relayproxy.vercel.app/reunion_slack',
      {
        text: `Name: ${form.value.name}\nEmail: ${form.value.email}\nApplicant Type: ${form.value.applicant_type}\nAct Type: ${form.value.act_type}\nAct Name: ${form.value.act_name}\nAct Description: ${form.value.act_description}\nTrack/Mix URL: ${form.value.track_mix_url}\nAct Website: ${form.value.act_website}\nSocial Media URL: ${form.value.social_url}\nMessage: ${form.value.message}`
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    if (response.status === 200) {
      alert('Form submitted successfully!')
      form.value = {
        name: '',
        email: '',
        applicant_type: '',
        act_type: '',
        act_name: '',
        act_description: '',
        track_mix_url: '',
        act_website: '',
        social_url: '',
        message: ''
      }
      currentStep.value = 1
    } else {
      alert('Failed to submit the form.')
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    alert('An error occurred while submitting the form.')
  }
}

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
    <img class="emblem" :src="placeholder_emblem" alt="Placeholder Emblem" />
    <h2 class="description">
      PlaceHolder is a quarterly event series scheduled for 2025 - curated by Mr. Fudge and Das
      Record. Hosted at the Paved Arts in Saskatoon, the series will feature a variety of high
      quality local and domestic electronic music artists. The series also plans to showcase spoken
      word, live bands, singer/songwriters, and visual artists.
    </h2>
    <h3 class="presskits">
      <div>
        <a href="/docs/mr_fudge_presskit.pdf" target="_blank">MR. FUDGE<br />PRESSKIT</a>
      </div>
      <div>
        <RouterLink to="/das-record">DAS RECORD<br />PORTFOLIO</RouterLink>
      </div>
    </h3>
    <!-- <h3 class="upcoming-shows">
      <h2>UPCOMING SHOWS</h2>
      <div class="event">
        <h3>SPRING</h3>
        <p>T.B.A.</p>
      </div>
      <br />
      <div class="event">
        <h3>SUMMER</h3>
        <p>T.B.A.</p>
      </div>
      <br />
      <div class="event">
        <h3>FALL</h3>
        <p>T.B.A.</p>
      </div>
      <br />
      <div class="event">
        <h3>WINTER</h3>
        <p>T.B.A.</p>
      </div>
    </h3> -->
    <h3 class="contact-form">
      <h2>Interested in performing?</h2>
      <h3>Fill out the form below to apply for a spot in the PlaceHolder event series.</h3>
      <br />
      <form @submit.prevent="submitForm">
        <div v-if="currentStep >= 1">
          <label for="name">Full Name:</label>
          <input
            type="text"
            id="name"
            v-model="form.name"
            @input="currentStep = form.name ? 2 : 1"
            required
          />
        </div>
        <div v-if="currentStep >= 2">
          <label for="email">Email:</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            @input="currentStep = form.email ? 3 : 2"
            required
          />
        </div>
        <div v-if="currentStep >= 3">
          <label for="applicant_type">Applicant Type:</label>
          <select
            id="applicant_type"
            v-model="form.applicant_type"
            @change="currentStep = form.applicant_type ? 4 : 3"
            required
          >
            <option value="" disabled></option>
            <option value="individual">Individual</option>
            <option value="group">Group</option>
          </select>
        </div>
        <div v-if="currentStep >= 4">
          <label for="act_type">Act Type:</label>
          <select
            id="act_type"
            v-model="form.act_type"
            @change="currentStep = form.act_type ? 5 : 4"
            required
          >
            <option value="" disabled></option>
            <option value="music">Music</option>
            <option value="spoken_word">Spoken Word</option>
            <option value="live_band">Live Band</option>
            <option value="singer_songwriter">Singer/Songwriter</option>
            <option value="visual_art">Visual Art</option>
          </select>
        </div>
        <div v-if="currentStep >= 5">
          <label for="act_name">Act Name:</label>
          <input
            type="text"
            id="act_name"
            v-model="form.act_name"
            @input="currentStep = form.act_name ? 6 : 5"
            required
          />
        </div>
        <div v-if="currentStep >= 6">
          <label for="act_description">Act Description:</label>
          <textarea
            id="act_description"
            v-model="form.act_description"
            @input="currentStep = form.act_description ? 7 : 6"
            required
          ></textarea>
        </div>
        <div v-if="currentStep >= 7">
          <label for="track_mix_url">Track/Mix URL:</label>
          <input
            type="url"
            id="track_mix_url"
            v-model="form.track_mix_url"
            @input="currentStep = form.track_mix_url ? 8 : 7"
          />
        </div>
        <div v-if="currentStep >= 8">
          <label for="act_website">Act Website/URL:</label>
          <input
            type="url"
            id="act_website_url"
            v-model="form.act_website"
            @input="currentStep = form.act_website ? 9 : 8"
          />
        </div>
        <div v-if="currentStep >= 9">
          <label for="social_url">Social Media URL:</label>
          <input
            type="url"
            id="social_url"
            v-model="form.social_url"
            @input="currentStep = form.social_url ? 10 : 9"
          />
        </div>

        <div v-if="currentStep >= 10">
          <label for="message">Message:</label>
          <textarea id="message" v-model="form.message" required></textarea>
        </div>
        <button type="submit" v-if="currentStep >= 10">Submit</button>
      </form>
    </h3>
  </div>
</template>

<style scoped>
.emblem {
  border-radius: 0;
  width: 75%;
}
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

.upcoming-shows,
.event {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
}
.contact-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
form,
label,
input,
textarea,
select {
  font-family: Helvetica;
  width: 100%;
  max-width: 80vw;
  display: grid;
  gap: 0.5rem;
  margin-bottom: 10px;
}
button {
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
  background-color: #0080ff;
  color: white;
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
