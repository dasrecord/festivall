<script setup>
import frog_image from '@/assets/images/frog.png'
import reunion_emblem from '../assets/images/reunion_emblem_white.png'
import { ref, onMounted } from 'vue'
import axios from 'axios'

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
      'https://relayproxy.vercel.app/festivall_placeholder',
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
      alert('Your application has been submitted successfully!')
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
    <img :src="reunion_emblem" alt="reunion" class="reunion-emblem" />

    <h2 class="description"></h2>

    <h3 class="application-form">
      <h2>Interested in performing at Reunion 2025?</h2>
      <h3>
        Please fill out the form below.<br />
        Selected acts will be contacted by our team directly.
      </h3>
      <br />
      <form @submit.prevent="submitForm">
        <div class="form-section">
          <label for="name">Full Name:</label>
          <input type="text" id="name" v-model="form.name" required />
        </div>
        <div class="form-section">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="form.email" required />
        </div>
        <div class="form-section">
          <label for="applicant_type">Applicant Type:</label>
          <select id="applicant_type" v-model="form.applicant_type" required>
            <option value="" disabled></option>
            <option value="individual">Individual</option>
            <option value="group">Group</option>
          </select>
        </div>
        <div class="form-section">
          <label for="act_type">Act Type:</label>
          <select id="act_type" v-model="form.act_type" required>
            <option value="" disabled></option>
            <option value="producer">Producer</option>
            <option value="dj">DJ</option>
            <option value="music">Musician</option>
            <option value="spoken_word">Spoken Word</option>
            <option value="live_band">Live Band</option>
            <option value="singer_songwriter">Singer/Songwriter</option>
            <option value="visual_art">Visual Art</option>
            <option value="dance">Dance</option>
          </select>
        </div>
        <div class="form-section">
          <label for="act_name">Act Name:</label>
          <input type="text" id="act_name" v-model="form.act_name" required />
        </div>
        <div class="form-section">
          <label for="act_description">Act Description:</label>
          <textarea id="act_description" v-model="form.act_description" required></textarea>
        </div>
        <div class="form-section">
          <label for="track_mix_url">Track/Mix URL:</label>
          <input type="url" id="track_mix_url" v-model="form.track_mix_url" />
        </div>
        <div class="form-section">
          <label for="act_website">Act Website/URL:</label>
          <input type="url" id="act_website_url" v-model="form.act_website" />
        </div>
        <div class="form-section">
          <label for="social_url">Social Media URL:</label>
          <input type="url" id="social_url" v-model="form.social_url" />
        </div>
        <div class="form-section">
          <label for="message">Message:</label>
          <textarea id="message" v-model="form.message" required></textarea>
        </div>
        <button type="submit">Submit</button>
      </form>
    </h3>
    <div class="playbills">
      <img v-for="(image, index) in imageList" :key="index" :src="image" alt="playbill" />
    </div>
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

.application-form {
  width: 100%;
  max-width: 80vw;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 15px;
}
.form-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: auto;

  font-family: Helvetica;
  width: 100%;
  border-radius: 15px;
}

label {
  width: 25%;
  text-align: left;
  padding: 5px;
}
input,
textarea,
select {
  width: 80%;
  font-family: Helvetica;
  gap: 0.5rem;
  border-radius: 15px;
  padding: 5px;
  margin: 5px;
}
button {
  background-color: white;
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 15px;
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

@media (min-width: 1024px) {
  .form {
    width: 100vw;
  }
}
</style>
