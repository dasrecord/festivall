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
  press_kit_url: '',
  logo_url: '',
  volunteer_type: '',
  workshop_title: '',
  workshop_description: '',
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
const formatPhoneNumber = (phone) => {
  const cleaned = ('' + phone).replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`
  }
  return phone
}

const handlePhoneInput = (event) => {
  form.value.phone = formatPhoneNumber(event.target.value)
}

const submitForm = async () => {
  try {
    if (!form.value.id_code) {
      form.value.id_code_long = uuidv4()
      form.value.id_code = form.value.id_code_long.slice(0, 5)
    }
    await addApplicant()

    const response = await axios.post(
      'https://relayproxy.vercel.app/reunion_applications',
      {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:bust_in_silhouette: ${form.value.fullname}\n:email: ${form.value.email}\n:phone: ${form.value.phone}\n:globe_with_meridians: ${form.value.city}\n:trident: ${form.value.applicant_type}\n:cd: ${form.value.track_mix_url}\n:id: ${form.value.id_code}\n:bookmark_tabs: <https://festivall.ca/dashboard|Dashboard>`
            }
          }
        ]
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
        act_type: '',
        act_name: '',
        act_description: '',
        track_mix_url: '',
        act_website: '',
        social_url: '',
        press_kit_url: '',
        logo_url: '',
        volunteer_type: '',
        workshop_title: '',
        workshop_description: '',
        message: ''
      }
    } else {
      alert('Failed to submit the form.')
    }
  } catch (error) {
    console.error('Error submitting form:', error)
  }
}
</script>
<template>
  <div class="basic">
    <h3 class="application-form">
      <img :src="reunion_emblem" alt="reunion" class="reunion-emblem" />
      <img :src="frog_image" alt="frog" class="frog-image" />
      <h2>Interested in performing at Reunion 2025?</h2>
      <h3>
        Please fill out the form below.<br />
        If you have an existing
        <span class="highlight">Festivall ID_CODE</span> and would like us to use your existing
        information,<br />
        please enter it first and skip the rest of the form.<br /><br />
      </h3>
      <h4 class="disclaimer">
        *Please note that submitting this form does not guarantee a performance slot at Reunion
        2025.<br /><br />
        <div>
          Compensenation Schedule:<br />
          <span class="highlight"> ARTISTS </span>
          - Festival Pass + 1 Guest<br />
          <span class="highlight"> VOLUNTEERS </span>
          - Festival Pass + 1 Meal Package per day worked<br />
          <span class="highlight"> WORKSHOPS </span>
          - Festival Pass + 1 Meal Package
        </div>
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
          <input
            type="tel"
            id="phone"
            v-model="form.phone"
            @input="handlePhoneInput"
            placeholder="123-456-7890"
            required
          />
        </div>
        <div class="form-section">
          <label for="city">City:</label>
          <input type="text" id="city" v-model="form.city" required />
        </div>
        <div class="form-section">
          <label for="applicant_type">Category:</label>
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
            <label for="act_description">Description:</label>
            <textarea id="act_description" v-model="form.act_description" required></textarea>
          </div>
          <div class="form-section">
            <label for="track_mix_url">Track/Mix URL:</label>
            <input type="url" id="track_mix_url" v-model="form.track_mix_url" />
          </div>
          <div class="form-section">
            <label for="act_website">Act/Website URL:</label>
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
            <label for="workshop_title">Title:</label>
            <input type="text" id="workshop_title" v-model="form.workshop_title" required />
          </div>
          <div class="form-section">
            <label for="workshop_description">Description:</label>
            <textarea
              id="workshop_description"
              v-model="form.workshop_description"
              required
            ></textarea>
          </div>
        </div>

        <div class="form-section">
          <label for="message">Message:</label>
          <textarea
            id="message"
            v-model="form.message"
            placeholder="Leave a personal statement to the festival team. Tell us what sets you apart from other applicants."
          ></textarea>
        </div>
        <button type="submit">SUBMIT</button>
      </form>
    </h3>
  </div>
</template>

<style scoped>
#app {
  padding: 0;
}

.reunion-emblem {
  border-radius: 0%;
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
  width: 80vw;
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
  width: 25%;
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
  width: 75%;
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
.highlight {
  color: var(--reunion-frog-green);
  text-shadow: 0px 0px 5px rgba(255, 255, 255, 0.5);
}

table {
  display: flex;
  flex-direction: column;

  border-collapse: collapse;
  margin: 1rem;
  border: 1px solid white;
  td {
    padding: 10px;
    border: 1px solid white;
    text-align: center;
  }
}

@media (max-width: 600px) {
  .application-form {
    width: 100%;
    padding: 0.5rem;
  }

  .form-section {
    flex-direction: column;
    align-items: center;
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
