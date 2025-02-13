<script setup>
import frog_image from '@/assets/images/frog.png'
import reunion_emblem from '../assets/images/reunion_emblem_white.png'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { reunion_db } from '@/firebase'
import { collection, getDoc, doc, setDoc } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'

const form = ref({
  id_code_long: '',
  id_code: '',
  fullname: '',
  email: '',
  city: '',
  phone: '',
  applicant_type: '',
  act_type: '',
  act_name: '',
  act_description: '',
  track_mix_url: '',
  act_website: '',
  social_url: '',
  message: ''
})
const fetchApplicantData = async (id_code) => {
  try {
    const docRef = doc(reunion_db, 'applications', id_code)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      form.value = { ...form.value, ...docSnap.data() }
    } else {
      console.log('No such document!')
    }
  } catch (error) {
    console.error('Error fetching document:', error)
  }
}

const addApplicant = async () => {
  try {
    await setDoc(doc(reunion_db, 'applications_2025', form.value.id_code), form.value)
    console.log('Document successfully written!')
  } catch (error) {
    console.error('Error writing document:', error)
  }
}

const submitForm = async () => {
  try {
    if (!form.value.id_code) {
      form.value.id_code_long = uuidv4()
      form.value.id_code = form.value.id_code.slice(0, 5)
    }
    await addApplicant()

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
      alert(
        'Your application has been submitted successfully!\nSelected acts will be contacted by our team directly.'
      )
      form.value = {
        id_code_long: '',
        id_code: '',
        fullname: '',
        email: '',
        city: '',
        phone: '',
        applicant_type: '',
        act_name: '',
        act_type: '',
        act_description: '',
        volunteer_type: '',
        workshop_title: '',
        workshop_description: '',
        track_mix_url: '',
        act_website: '',
        social_url: '',
        press_kit_url: '',
        logo_url: '',
        message: ''
      }
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
      <img :src="frog_image" alt="frog" class="frog-image" />
      <h2>Interested in performing at Reunion 2025?</h2>
      <h3>
        Please fill out the form below.<br />
        If you have an existing Festivall ID_CODE and would like us to use your existing
        information,<br />
        please enter it first and skip the rest of the form.
      </h3>
      <h4 class="disclaimer">
        *Please note that submitting this form does not guarantee a performance slot at Reunion
        2025. Compensenation Schedule: DJs - Festival Pass + 1 Volunteer - Festival Pass + Meals
        Workshops - Festival Pass
      </h4>
      <br />
      <form @submit.prevent="submitForm">
        <div class="form-section">
          <label for="id_code">ID_CODE:</label>
          <input
            type="text"
            id="id_code"
            v-model="form.id_code"
            @blur="fetchApplicantData(form.id_code)"
          />
        </div>
        <div class="form-section">
          <label for="name">Full Name:</label>
          <input type="text" id="name" v-model="form.fullname" required />
        </div>
        <div class="form-section">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="form.email" required />
        </div>
        <div class="form-section">
          <label for="phone">Phone:</label>
          <input type="tel" id="phone" v-model="form.phone" required />
        </div>
        <div class="form-section">
          <label for="city">City:</label>
          <input type="text" id="city" v-model="form.city" required />
        </div>
        <div class="form-section">
          <label for="applicant_type">Category</label>
          <select id="applicant_type" v-model="form.applicant_type" required>
            <option value="" disabled></option>
            <option value="Volunteer">Volunteer</option>
            <option value="Artist">Artist</option>
            <option value="Workshop">Workshop</option>
          </select>
        </div>

        <!-- Conditional Form Sections -->
        <div v-if="form.applicant_type === 'Volunteer'">
          <div class="form-section">
            <label for="volunteer_type">Volunteer Type:</label>
            <select id="volunteer_type" v-model="form.volunteer_type" required>
              <option value="" disabled></option>
              <option value="Setup Crew">Setup Crew</option>
              <option value="Cleanup Crew">Cleanup Crew</option>
              <option value="Stage Crew">Stage Crew</option>
              <option value="Front Gate">Front Gate</option>
              <option value="Food Team">Food Team</option>
            </select>
          </div>
        </div>

        <div v-else-if="form.applicant_type === 'Artist'">
          <div class="form-section">
            <label for="act_type">Act Type:</label>
            <select id="act_type" v-model="form.act_type" required>
              <option value="" disabled></option>
              <option value="dj">DJ</option>
              <option value="musician">Musician</option>
              <option value="spoken_word">Spoken Word</option>
              <option value="live_band">Live Band</option>
              <option value="singer_songwriter">Singer/Songwriter</option>
              <option value="rapper">Rapper</option>
              <option value="dancer">Dancer</option>
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
            <label for="press_kit_url">Press Kit URL:</label>
            <input type="url" id="press_kit_url" v-model="form.press_kit_url" />
          </div>
          <div class="form-section">
            <label for="logo_url">Logo URL:</label>
            <input type="url" id="logo_url" v-model="form.logo_url" />
          </div>
        </div>

        <div v-else-if="form.applicant_type === 'Workshop'">
          <div class="form-section">
            <label for="workshop_title">Workshop Title:</label>
            <input type="text" id="workshop_title" v-model="form.workshop_title" required />
          </div>
          <div class="form-section">
            <label for="workshop_description">Workshop Description:</label>
            <textarea
              id="workshop_description"
              v-model="form.workshop_description"
              required
            ></textarea>
          </div>
        </div>

        <div class="form-section">
          <label for="message">Message:</label>
          <textarea id="message" v-model="form.message" required></textarea>
        </div>
        <button type="submit">SUBMIT</button>
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
.frog-image {
  width: 100%;
  max-width: 250px;
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
}

label {
  display: flex;
  flex-direction: column;
  width: 23%;
  height: 40px;
  text-align: left;
  padding: 10px;
  background-color: var(--reunion-frog-green);
  color: white;
  border-radius: 15px 0 0 15px;
}
input,
textarea,
select {
  width: 80%;
  height: 42px;
  font-family: Helvetica;
  gap: 0.5rem;
  border-radius: 0 15px 15px 0;
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
  margin-top: 5px;
}
button:hover {
  background-color: var(--reunion-frog-green);
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
@media (max-width: 600px) {
  .application-form {
    padding: 0.5rem;
  }

  .form-section {
    flex-direction: column;
    align-items: flex-start;
  }

  label {
    width: 100%;
    height: auto;
    padding: 5px;
    border-radius: 15px 15px 0 0;
  }

  input,
  textarea,
  select {
    width: 100%;
    height: auto;
    padding: 5px;
    margin: 5px 0;
    border-radius: 0 0 15px 15px;
  }

  button {
    padding: 5px;
  }

  .basic {
    padding: 0.5rem;
  }

  .form-section,
  label,
  input,
  textarea,
  select,
  button {
    font-size: 0.8rem;
  }
}
</style>
