<template>
  <div class="basic">
    <HelloWorld msg="Sound Tech" />
    <h2>We Provide:</h2>
    <ul class="services">
      <li>live sound technicians</li>
      <li>sound system setup & tuning</li>
      <li>P/A system installation</li>
      <li>acoustic treatment</li>
      <li>repairs & upgrades</li>
      <li>reasonable rates</li>
      <li>positive references</li>
      <li>free consultations</li>
    </ul>
    <br />
    <h2>We Serve:</h2>
    <ul class="audience">
      <li>schools</li>
      <li>theaters</li>
      <li>clubs</li>
      <li>bars</li>
      <li>restaurants</li>
      <li>auditoriums</li>
      <li>arenas</li>
      <li>stadiums</li>
      <li>outdoor events</li>
      <li>festivals</li>
      <li>conferences</li>
      <li>convention centers</li>
      <li>hotels</li>
      <li>banquet halls</li>
      <li>conference rooms</li>
      <li>churches</li>
      <li>houses of worship</li>
    </ul>
  </div>
  <div class="contact-form">
    <h2>Contact Us</h2>
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
</template>

<script>
import axios from 'axios'
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'SoundTechView',
  components: {
    HelloWorld
  },
  data() {
    return {
      form: {
        name: '',
        email: '',
        message: ''
      }
    }
  },
  methods: {
    async submitForm() {
      try {
        const response = await axios.post(
          'https://relayproxy.vercel.app/reunion_slack',
          {
            text: `Name: ${this.form.name}\nEmail: ${this.form.email}\nMessage: ${this.form.message}`
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        if (response.status === 200) {
          alert('Form submitted successfully!')
          this.form.name = ''
          this.form.email = ''
          this.form.message = ''
        } else {
          alert('Failed to submit the form.')
        }
      } catch (error) {
        console.error('Error submitting form:', error)
        alert('An error occurred while submitting the form.')
      }
    }
  }
}
</script>

<style scoped>
.basic {
  display: flex;
  flex-direction: column;
}
.services,
.audience {
  padding: 0;
  font-weight: bold;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;

  list-style-type: none;
}
li {
  padding: 5px;
  margin: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
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
textarea {
  font-family: Helvetica;
  width: 500px;
  max-width: 80vw;
  display: block;
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
}
</style>
