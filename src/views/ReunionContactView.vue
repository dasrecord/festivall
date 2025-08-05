<script setup>
import frog_image from '@/assets/images/frog.png'
import reunion_emblem from '../assets/images/reunion_emblem_white.png'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { reunion_db } from '@/firebase'
import { setDoc, doc } from 'firebase/firestore'
import { logEvent } from 'firebase/analytics'
import { reunion_analytics } from '@/firebase'

const form = ref({
  fullname: '',
  email: '',
  phone: '',
  message: ''
})

const formatPhoneNumber = (phone) => {
  const cleaned = ('' + phone).replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]})${match[2]}-${match[3]}`
  }
  return phone
}

const handlePhoneInput = (event) => {
  form.value.phone = formatPhoneNumber(event.target.value)
}

const addtoMailingList = async () => {
  try {
    const docRef = doc(reunion_db, 'mailing_list', form.value.email)
    await setDoc(docRef, {
      name: form.value.fullname,
      email: form.value.email
    })
    alert('You have been added to our mailing list!')
  } catch (error) {
    console.error('Error adding to mailing list:', error)
    alert('Failed to add to mailing list.')
  }
}

const submitForm = async () => {
  try {
    const payload = {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:bust_in_silhouette: ${form.value.fullname}\n:email: ${form.value.email}\n:phone: ${form.value.phone}\n:memo: ${form.value.message}`
          }
        }
      ]
    }

    console.log('Sending payload:', JSON.stringify(payload)) // Add logging for debugging

    const response = await axios.post('https://relayproxy.vercel.app/reunion_slack', payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    console.log('Response status:', response.status)
    console.log('Response data:', response.data)

    if (response.status >= 200 && response.status < 300) {
      // Track successful contact form submission
      logEvent(reunion_analytics, 'form_submit', {
        form_name: 'contact_form',
        contact_method: 'slack_webhook'
      })

      alert('Your message has been sent successfully!')
      addtoMailingList()
      form.value = {
        fullname: '',
        email: '',
        phone: '',
        message: ''
      }
    } else {
      alert('Failed to send the message.')
    }
  } catch (error) {
    console.error('Error sending message:', error)
    if (error.response) {
      console.error('Response data:', error.response.data)
    }
    alert('Failed to send the message.')
  }
}

// Track page view on mount
onMounted(() => {
  logEvent(reunion_analytics, 'page_view', {
    page_title: 'Reunion Contact',
    page_location: window.location.href
  })
})
</script>

<template>
  <div class="basic">
    <h3 class="application-form">
      <img :src="reunion_emblem" alt="reunion" class="reunion-emblem" />
      <img :src="frog_image" alt="frog" class="frog-image" />
      <h2>CONTACT US</h2>
      <h3>
        We think you'll agree, there's nothing better than a message from a complete stranger.<br />
        It's an opportunity to get to know someone and make a new friend.<br />If you're interested
        in us and what we do, get in touch.<br /><br />
      </h3>
      <form @submit.prevent="submitForm">
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
          <label for="message">Message:</label>
          <textarea
            id="message"
            v-model="form.message"
            placeholder="Leave your message here."
            required
          ></textarea>
        </div>
        <button type="submit">SEND US A MESSAGE</button>
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
  width: 33%;
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
  width: 67%;
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

@media (max-width: 600px) {
  .application-form {
    width: 100%;
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
