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
  phone: '',
  street_address: '',
  city: '',
  province: '',
  country: '',
  postal_code: '',
  formatted_phone: '',
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
  vendor_type: '',
  statement: '',
  volunteer_availability: []
})

const submitting = ref(false)

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
    return `(${match[1]})${match[2]}-${match[3]}`
  }
  return phone
}

const handlePhoneInput = (event) => {
  form.value.phone = event.target.value
  form.value.formatted_phone = formatPhoneNumber(event.target.value)
}

const sendMessage = async (phone, message) => {
  if (!phone || !message) {
    alert('Phone number and message are required.')
    return
  }

  const payload = {
    value1: phone,
    value2: message,
    value3: 'Powered by Festivall'
  }

  console.log('Sending payload:', JSON.stringify(payload)) // Add logging for debugging

  try {
    const response = await fetch('https://relayproxy.vercel.app/sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText)
    }

    const responseData = await response.json()
    console.log('Response data:', responseData) // Log the response data for debugging
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error)
  }
}

const submitForm = async () => {
  if (submitting.value) return
  submitting.value = true
  form.value.raw_phone = form.value.phone.replace(/\D/g, '')
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
              text: `:bust_in_silhouette: ${form.value.fullname}\n:email: ${form.value.email}\n:phone: ${form.value.formatted_phone}\n:globe_with_meridians: ${form.value.city}\n:trident: ${form.value.applicant_type}\n:cd: ${form.value.track_mix_url}\n:memo: ${form.value.message}\n:id: ${form.value.id_code}\n:bookmark_tabs: <https://festivall.ca/dashboard|Dashboard>`
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
        'Your application has been submitted successfully!\nSelected applicants will be contacted by our team directly.'
      )
      if (form.value.phone) {
        await sendMessage(form.value.phone, `Thank you for applying to Reunion 2025!`)
      }

      form.value = {
        id_code_long: '',
        id_code: '',
        fullname: '',
        email: '',
        phone: '',
        street_address: '',
        city: '',
        province: '',
        country: '',
        postal_code: '',
        formatted_phone: '',
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
        vendor_type: '',
        statement: '',
        volunteer_availability: []
      }
    } else {
      alert('Failed to submit the form.')
    }
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    submitting.value = false
  }
}
</script>
<template>
  <div class="basic">
    <h3 class="application-form">
      <div class="splash">
        <img :src="reunion_emblem" alt="reunion" class="reunion-emblem" />
        <img :src="frog_image" alt="frog" class="frog-image" />
      </div>
      <h2>Interested in performing at Reunion 2025?</h2>
      <h3>
        Please fill out the form below.<br />
        If you have an existing
        <span class="highlight">Festivall ID_CODE</span> and would like us to use your existing
        information,<br />
        please enter it first.<br /><br />
      </h3>
      <h4 class="disclaimer">
        *Please note that submitting this form does not guarantee a performance slot at Reunion
        2025.<br /><br />
        <div>
          Compensenation Schedule:<br />
          <span class="highlight"> ARTISTS </span>
          - Weekend Pass + 1 Guest<br />
          <span class="highlight"> VOLUNTEERS </span>
          - Weekend Pass + 1 Meal Package per day worked<br />
          <span class="highlight"> WORKSHOPS </span>
          - Weekend Pass + 1 Meal Package
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
            placeholder="Enter your ID_CODE if you have one!"
            @blur="fetchApplicantData(form.id_code)"
          />
        </div>
        <div class="form-section">
          <label for="name">Full Name:</label>
          <input
            type="text"
            id="name"
            v-model="form.fullname"
            placeholder="Please use your legal name."
            required
          />
        </div>
        <div class="form-section">
          <label for="email">Email:</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            placeholder="What is the best email to reach you at?"
            required
          />
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
          <label for="address">Street Address:</label>
          <input
            type="text"
            id="address"
            v-model="form.address"
            placeholder="123 Main St."
            required
          />
        </div>
        <div class="form-section">
          <label for="city">City:</label>
          <input type="text" id="city" v-model="form.city" placeholder="Enter your city" required />
        </div>
        <div class="form-section">
          <label for="province">Province/Region:</label>
          <input
            type="text"
            id="region"
            v-model="form.province"
            placeholder="Province/Region"
            required
          />
        </div>
        <div class="form-section">
          <label for="country">Country:</label>
          <input type="text" id="country" v-model="form.country" placeholder="Canada" required />
        </div>
        <div class="form-section">
          <label for="postal_code">Postal Code:</label>
          <input
            type="text"
            id="postal_code"
            v-model="form.postal_code"
            placeholder="A1A 1A1"
            required
          />
        </div>
        <div class="form-section">
          <label for="applicant_type">Category:</label>
          <select id="applicant_type" v-model="form.applicant_type" required>
            <option value="" disabled>What kind of application is this?</option>
            <option value="Volunteer">Volunteer</option>
            <option value="Artist">Artist</option>
            <option value="Workshop">Workshop</option>
            <option value="Vendor">Vendor</option>
          </select>
        </div>

        <!-- Conditional Form Sections -->
        <div v-if="form.applicant_type === 'Volunteer'">
          <div class="form-section">
            <label for="volunteer_type">Volunteer Type:</label>
            <select id="volunteer_type" v-model="form.volunteer_type" required>
              <option value="" disabled>What team are you interested in?</option>
              <option value="Setup Crew">Setup Crew</option>
              <option value="Cleanup Crew">Cleanup Crew</option>
              <option value="Stage Crew">Stage Crew</option>
              <option value="Front Gate">Front Gate</option>
              <option value="Food Team">Food Team</option>
            </select>
          </div>
          <div class="form-section">
            <label for="volunteer_availability">Availability:</label>
            <div class="checkboxes">
              <span class="checkbox-label">
                <input type="checkbox" v-model="form.volunteer_availability" value="Aug 25" />
                Aug 25
              </span>

              <span class="checkbox-label">
                <input type="checkbox" v-model="form.volunteer_availability" value="Aug 26" />
                Aug 26
              </span>

              <span class="checkbox-label">
                <input type="checkbox" v-model="form.volunteer_availability" value="Aug 27" />
                Aug 27
              </span>

              <span class="checkbox-label">
                <input type="checkbox" v-model="form.volunteer_availability" value="Aug 28" />
                Aug 28
              </span>

              <span class="checkbox-label">
                <input type="checkbox" v-model="form.volunteer_availability" value="Aug 29" />
                Aug 29
              </span>

              <span class="checkbox-label">
                <input type="checkbox" v-model="form.volunteer_availability" value="Aug 30" />
                Aug 30
              </span>

              <span class="checkbox-label">
                <input type="checkbox" v-model="form.volunteer_availability" value="Aug 31" />
                Aug 31
              </span>

              <span class="checkbox-label">
                <input type="checkbox" v-model="form.volunteer_availability" value="Mon Sept 1" />
                Mon Sept 1
              </span>
            </div>
          </div>
        </div>

        <div v-else-if="form.applicant_type === 'Vendor'">
          <div class="form-section">
            <label for="vendor_type">Vendor Type:</label>
            <select id="vendor_type" v-model="form.vendor_type" required>
              <option value="" disabled>What type of vendor are you?</option>
              <option value="Food">Food</option>
              <option value="Merchandise">Merchandise</option>
              <option value="Artisan">Artisan</option>
              <option value="Service">Service</option>
            </select>
          </div>
        </div>

        <div v-else-if="form.applicant_type === 'Artist'">
          <div class="form-section">
            <label for="act_type">Act Type:</label>
            <select id="act_type" v-model="form.act_type" required>
              <option value="" disabled>What type of artist are you?</option>
              <option value="DJ">DJ</option>
              <option value="Musician">Musician</option>
              <option value="Spoken_word">Spoken Word</option>
              <option value="Live Band">Live Band</option>
              <option value="Singer/Songwriter">Singer/Songwriter</option>
              <option value="Rapper">Rapper</option>
              <option value="Dancer">Dancer</option>
            </select>
          </div>

          <div class="form-section">
            <label for="act_name">Act Name:</label>
            <input
              type="text"
              id="act_name"
              v-model="form.act_name"
              placeholder="What is your stage name?"
            />
          </div>
          <div class="form-section">
            <label for="act_description">Description:</label>
            <textarea
              id="act_description"
              v-model="form.act_description"
              placeholder="Please use third person.1000 Character Limit"
              required
              maxlength="1000"
            ></textarea>
          </div>
          <div class="form-section">
            <label for="track_mix_url">Track/Mix URL:</label>
            <input
              type="url"
              id="track_mix_url"
              v-model="form.track_mix_url"
              placeholder="We want to see and hear your act!"
              required
            />
          </div>
          <div class="form-section">
            <label for="act_website">Act/Website URL:</label>
            <input
              type="url"
              id="act_website_url"
              v-model="form.act_website"
              placeholder="Etner your artist website here if you have one."
            />
          </div>
          <div class="form-section">
            <label for="social_url">Social Media URL:</label>
            <input
              type="url"
              id="social_url"
              v-model="form.social_url"
              placeholder="X, FB, IG, TT, LI"
            />
          </div>
          <div class="form-section">
            <label for="press_kit_url">Press Kit URL:</label>
            <input
              type="url"
              id="press_kit_url"
              v-model="form.press_kit_url"
              placeholder="Please provide a link to a downloadable press kit."
            />
          </div>
          <div class="form-section">
            <label for="logo_url">Logo URL:</label>
            <input
              type="url"
              id="logo_url"
              v-model="form.logo_url"
              placeholder="We prefer .SVG vector files, or high resolution .PNG with alpha layer."
            />
          </div>
        </div>

        <div v-else-if="form.applicant_type === 'Workshop'">
          <div class="form-section">
            <label for="workshop_title">Title:</label>
            <input
              type="text"
              id="workshop_title"
              v-model="form.workshop_title"
              placeholder="What is the name of your workshop?"
            />
          </div>
          <div class="form-section">
            <label for="workshop_description">Description:</label>
            <textarea
              id="workshop_description"
              v-model="form.workshop_description"
              placeholder="Please provide a detailed description of your workshop."
              maxlength="1000"
              required
            ></textarea>
          </div>
        </div>

        <div class="form-section">
          <label for="statement">Statement:</label>
          <textarea
            id="statement"
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

.splash {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem;
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
  cursor: pointer;
}
input[type='checkbox'] {
  width: 20px;
  height: 20px;
  margin: 5px;
  cursor: pointer;
}
.checkboxes {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: 5px;
  justify-items: center;
  align-items: center;
  text-align: center;

}

.checkbox-label {
  font-size: 0.8rem;
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
    text-align: center;
  }
}
</style>
