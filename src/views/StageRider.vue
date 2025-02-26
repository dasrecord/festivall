<template>
  <div class="basic">
    <a href="/">
      <img :src="emblem" alt="Festivall Emblem" style="width: 250px" />
    </a>
    <h1>Stage Rider Information Form</h1>
    <h3 class="application-form">
      <form @submit.prevent="submitForm">
        <div class="form-section">
          <label for="fullname">Full Name:</label>
          <input
            id="fullname"
            v-model="form.fullname"
            placeholder="Enter your full name"
            required
          />
        </div>
        <div class="form-section">
          <label for="email">Email:</label>
          <input
            id="email"
            type="email"
            v-model="form.email"
            placeholder="Enter your email"
            required
          />
        </div>
        <div class="form-section">
          <label for="phone">Phone Number:</label>
          <input
            id="phone"
            type="tel"
            v-model="form.phone"
            @input="handlePhoneInput"
            placeholder="123-456-7890"
            required
          />
        </div>
        <div class="form-section">
          <label for="act_name">Act Name:</label>
          <input id="act_name" v-model="form.act_name" placeholder="Enter your act name" required />
        </div>

        <div class="form-section">
          <label for="genre">Genre:</label>
          <input id="genre" v-model="form.genre" placeholder="Enter your genre" required />
        </div>

        <div class="form-section">
          <label for="number_of_members"># Band Members:</label>
          <input
            id="number_of_members"
            type="number"
            v-model="form.number_of_members"
            placeholder="Enter the number of members"
            required
          />
        </div>
        <div class="form-section">
          <label for="event_date">Event Date:</label>
          <input id="event_date" type="date" v-model="form.event_date" required />
        </div>
        <div class="form-section">
          <label for="load_in_time">Load-In Time:</label>
          <input id="load_in_time" type="time" v-model="form.load_in_time" required />
        </div>

        <div class="form-section">
          <label for="sound_check_time">Sound Check Time:</label>
          <input id="sound_check_time" type="time" v-model="form.sound_check_time" required />
        </div>

        <div class="form-section">
          <label for="performance_time">Performance Time:</label>
          <input id="performance_time" type="time" v-model="form.performance_time" required />
        </div>
        <div class="form-section">
          <label for="stage_plot_link">Stage Plot:</label>
          <input
            id="stage_plot_link"
            type="url"
            v-model="form.stage_plot_link"
            placeholder="Enter a link to a downloadable stage plot"
            required
          />
        </div>

        <div class="form-section">
          <label for="mic_level_inputs"># Mic Level Inputs:</label>
          <input
            id="mic_level_inputs"
            type="number"
            v-model="form.mic_level_inputs"
            placeholder="Enter the number of mic level inputs"
            required
          />
        </div>

        <div class="form-section">
          <label for="mono_line_level_inputs"># Mono Line Inputs:</label>
          <input
            id="mono_line_level_inputs"
            type="number"
            v-model="form.mono_line_level_inputs"
            placeholder="Enter the number of mono line level inputs"
            required
          />
        </div>

        <div class="form-section">
          <label for="stereo_line_level_inputs"># Stereo Line Pairs:</label>
          <input
            id="stereo_line_level_inputs"
            type="number"
            v-model="form.stereo_line_level_inputs"
            placeholder="Enter the number of stereo line level L/R input pairs"
            required
          />
        </div>

        <div class="form-section">
          <label for="guitar_cab">Bringing your own Guitar Cab?</label>
          <select id="guitar_cab" v-model="form.guitar_cab" required>
            <option value="" disabled>Select an option</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div class="form-section">
          <label for="bass_cab">Bringing your own Bass Cab?</label>
          <select id="bass_cab" v-model="form.bass_cab" required>
            <option value="" disabled>Select an option</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <div class="form-section"></div>

        <div class="form-section">
          <label for="monitors">Bringing your own Monitors?</label>
          <select id="monitors" v-model="form.monitors" required>
            <option value="" disabled>Select an option</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div class="form-section">
          <label for="additional_notes">Additional Notes:</label>
          <textarea
            id="additional_notes"
            v-model="form.additional_notes"
            placeholder="Enter any additional notes if necessary"
            maxlength="1000"
          ></textarea>
        </div>

        <button type="submit">SUBMIT</button>
      </form>
    </h3>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { collection, getDoc, doc, setDoc } from 'firebase/firestore'
import { reunion_db, festivall_db } from '@/firebase'
import festivall_emblem_white from '@/assets/images/festivall_emblem_white.png'
import axios from 'axios'

const emblem = festivall_emblem_white

const form = ref({
  id_code_long: '',
  id_code: '',
  fullname: '',
  email: '',
  phone: '',
  event_date: '',
  act_name: '',
  genre: '',
  number_of_members: '',
  mic_level_inputs: '',
  mono_line_level_inputs: '',
  stereo_line_level_inputs: '',
  guitar_cab: '',
  bass_cab: '',
  monitors: '',
  stage_plot_link: '',
  load_in_time: '',
  sound_check_time: '',
  performance_time: '',
  additional_notes: ''
})

const submitting = ref(false)

const handlePhoneInput = (event) => {
  form.value.phone = event.target.value.replace(/\D/g, '')
}

// format phone for slack (123)456-7890
const formatPhoneSlack = (phone) => {
  const cleaned = ('' + phone).replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]})${match[2]}-${match[3]}`
  }
  return phone
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

const addApplicant = async () => {
  try {
    await setDoc(doc(festivall_db, 'stage_riders', form.value.id_code), form.value)
    console.log('Document successfully written to Festivall!')
    await setDoc(doc(reunion_db, 'festivall', form.value.id_code), form.value)
    console.log('Document successfully written to Reunion!')
  } catch (error) {
    console.error('Error writing document:', error)
  }
}

const submitForm = async () => {
  if (submitting.value) return
  submitting.value = true
  try {
    if (!form.value.id_code) {
      form.value.id_code_long = uuidv4()
      form.value.id_code = form.value.id_code_long.slice(0, 5)
    }

    await addApplicant()

    const formattedPhone = formatPhoneSlack(form.value.phone)

    const response = await axios.post(
      'https://relayproxy.vercel.app/festivall_notifications',
      {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `:bust_in_silhouette: ${form.value.fullname}\n:email: ${form.value.email}\n:phone: ${formattedPhone}\n:calendar: ${form.value.event_date}\n:musical_note: ${form.value.act_name}\n:notes: ${form.value.genre}\n:hash: ${form.value.number_of_members}\n:microphone: ${form.value.mic_level_inputs}\n:one: ${form.value.mono_line_level_inputs}\n:two: ${form.value.stereo_line_level_inputs}\n:sound: ${form.value.guitar_cab}\n:loud_sound: ${form.value.bass_cab}\n:link: ${form.value.stage_plot_link}\n:clock1: ${form.value.load_in_time}\n:clock2: ${form.value.sound_check_time}\n:clock3: ${form.value.performance_time}\n:memo: ${form.value.additional_notes}\n:id: ${form.value.id_code}\n:bookmark_tabs: <https://festivall.ca/dashboard|Dashboard>`
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
        await sendMessage(form.value.phone, `Thank you for providing your stage plot information!`)
      }
    } else {
      alert('There was a problem submitting your application. Please notify the webmaster.')
    }

    form.value = {
      id_code_long: '',
      id_code: '',
      fullname: '',
      email: '',
      phone: '',
      event_date: '',
      act_name: '',
      genre: '',
      number_of_members: '',
      mic_level_inputs: '',
      mono_line_level_inputs: '',
      stereo_line_level_inputs: '',
      guitar_cab: '',
      bass_cab: '',
      stage_plot_link: '',
      load_in_time: '',
      sound_check_time: '',
      performance_time: '',
      additional_notes: ''
    }
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.basic {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  justify-items: flex-start;
  align-items: center;
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
  margin-bottom: 5px;
}

label {
  display: flex;
  flex-direction: column;
  width: 25%;
  /* height: 40px; */
  text-align: left;
  padding: 0.5rem;
  background-color: var(--festivall-baby-blue);
  color: black;
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
  background-color: var(--festivall-baby-blue);
  color: black;
}
a {
  border-radius: 15px;
}
@media (max-width: 768px) {
  .application-form {
    width: 95vw;
  }

  .form-section {
    flex-direction: column;
  }

  label {
    width: 100%;
    border-radius: 15px 15px 0 0;
    text-align: center;
  }

  input,
  textarea,
  select {
    width: 100%;
    border-radius: 0 0 15px 15px;
  }

  button {
    width: 100%;
  }
}
</style>
