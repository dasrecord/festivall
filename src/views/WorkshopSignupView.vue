<template>
  <div class="basic">
    <form @submit.prevent="submitForm">
      <h2>Workshop Registration</h2>
      <p>
        A two-day workshop series featuring hands-on learning as well as the theoretical constructs
        which support the aforementioned hand-actions. $50 for the two days, includes all
        workshops/discussions and cover to the party after. Here's the schedule (subject to
        change)<br />
      </p>

      <p>
        FACEBOOK EVENT LINK:
        <a href="https://www.facebook.com/share/12MGQnYh1jQ/" target="_blank"
          >Workshop Series Event</a
        >
      </p>
      <p>
        LOCATION:
        <a href="https://maps.app.goo.gl/LsWD3dYCE8XniEB1A" target="_blank"
          >Saskatoon Academy of Music</a
        >
      </p>
      <div class="day">
        <span style="text-decoration: underline">📍 DAY 1: SATURDAY - HANDS ON</span><br /><br />

        <strong>9:00 AM - 12:00 PM:</strong> Foundations<br />
        Basic Sound Tech<br />
        System setup, room tuning, filters, signal flow<br />
        Instructors: Arthur, Brandon, Yvo, Prasun (or some combination thereof)<br />
        Hands-on participation<br />
        Basic DJ Techniques<br />
        Turntables/CDJs, beatmatching, intro to scratching<br />
        Bring your USBs, vinyl, or laptop<br /><br />
        <strong>12:00 - 1:00 PM:</strong> Lunch Break<br /><br />
        <strong>1:00 - 3:00 PM:</strong> Fusion Session - Collaborative Creation<br />
        Brandon & Prasun Create a Track (Live Production)<br />
        Participants co-create: bring your laptops, headphones<br />
        Discussion: From sample to statement, aesthetic to arrangement<br /><br />
        <strong>3:00 - 3:30 PM:</strong> Break<br /><br />
        <strong>3:30 - 5:00 PM:</strong> Continued Creation & Listening Session<br />
        Track development continues<br />
        Feedback & live mixdowns<br />
        Explorations into vibe, intention, and cultural storytelling<br /><br />
        Evening: <strong>OPEN DECKS (Venue TBD)</strong><br />
        Community celebration of the day's learnings<br />
        Sign-up sets for attendees<br />
        Sound system by the crew.<br /><br />
      </div>
      <div class="day">
        <span style="text-decoration: underline">
          📍 DAY 2: SUNDAY - CONVERSATIONS & CONSCIOUSNESS </span
        ><br /><br />
        <strong>9:00 - 10:00 AM:</strong> Arrival<br /><br />
        <strong>10:00 - 11:00 AM:</strong> Party as Art and a Medium of Cultural Transmission -
        Brandon Brown<br /><br />
        <strong>11:15 - 12:15 PM:</strong> Technology as a Tool to Extend Creativity - Prasun Das<br /><br />
        <strong>12:15 - 1:30 PM:</strong> Lunch Break<br /><br />
        <strong>1:30 - 2:30 PM:</strong> Natalie Dinsdale<br /><br />
        <strong>2:45 - 4:15 PM:</strong> Panel Discussion - ReImagining Our Future<br />
        A collaborative talk with all presenters<br />
        Audience Q&A<br />
        Topics: artistic legacy, cultural stewardship, technological soul<br /><br />
        <strong>4:15 - 5:00 PM:</strong> Closing Octagon<br />
      </div>

      <div>
        <label for="name">Full Name:</label>
        <input type="text" id="name" v-model="form.name" required />
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="form.email" required />
      </div>
      <div>
        <div>
          <label for="phone">Phone Number:</label>
          <input type="tel" id="phone" v-model="form.phone" required />
        </div>
      </div>
      <div>
        <label for="newsletter">
          <input type="checkbox" id="newsletter" v-model="form.newsletter" />
          I consent to receive future newsletters.
        </label>
      </div>
      <div>
        <label for="liability">
          <input type="checkbox" id="liability" v-model="form.liability" required />
          I agree to participate at my own risk.
        </label>
      </div>
      <button type="submit">Submit</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { sendEmail, sendSMS } from '/scripts/notifications.js'

const form = ref({
  name: '',
  email: '',
  phone: '',
  newsletter: false,
  liability: false
})

const submitForm = async () => {
  try {
    const response = await axios.post(
      'https://relayproxy.vercel.app/reunion_registration',
      {
        text: `Full Name: ${form.value.name}\nPhone: ${form.value.phone}\nEmail: ${form.value.email}\nNewsletter Consent: ${form.value.newsletter}\nLiability Agreement: ${form.value.liability}`
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    if (response.status === 200) {
      alert('Registration Received! Please etransfer $50 to humanoidtwo@gmail.com')
      await sendEmail(
        form.value.email,
        'Workshop Registration Confirmation',
        `Thank you for registering for the workshop! Please etransfer $50 to humanoidtwo@gmail.com`
      )
      await sendSMS(
        form.value.phone,
        `Thank you for registering for the workshop! Please etransfer $50 to humanoidtwo@gmail.com`
      )

      form.value = {
        name: '',
        email: '',
        phone: '',
        newsletter: false,
        liability: false
      }
    } else {
      alert('Failed to submit the form.')
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    alert('An error occurred while submitting the form.')
  }
}
</script>

<style scoped>
.basic {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 15px;
  max-width: 1200px;
  margin: auto;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.day {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 10px;
}

.signup-image {
  width: 100%;
  max-width: 400px;
  margin-bottom: 20px;
}

form {
  width: 100%;
  display: grid;
  gap: 1rem;
}

label {
  font-weight: bold;
}

input[type='text'],
input[type='email'],
input[type='tel'],
input[type='checkbox'] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
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
  background-color: #059bfa;
  color: white;
}

@media (min-width: 768px) {
  .basic {
    flex-direction: row;
    align-items: flex-start; /* Align items to the top */
  }

  .signup-image {
    margin-bottom: 0;
    margin-right: 20px;
  }

  form {
    width: calc(100% - 420px); /* Adjust width to account for image and margin */
  }
}
</style>
